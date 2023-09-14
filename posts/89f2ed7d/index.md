# Debug 从入门到入土


写代码难免遇到 bug，调试解决 bug 的快慢很影响开发的效率。本文主要是梳理并记录下个人经常用的调试方法（主要以 C/C++ 的 segment fault 为例）

## 分类

根据调试时机与 bug 产生的时间的前后关系，主要分为“事后”、“事中”、“事先”三类：

- “事后” 主要是通过 addr2line 或者 objdump 等工具，定位报错时的程序运行位置
- “事中” 主要是通过 GDB 来观察程序运行时的状态，实时的捕捉 bug
- “事先” 主要是通过在源代码中插入打印语句，来观察程序运行时各个变量的状态

## 事后

通常为了快速的定位 bug，会根据出错时的程序输出，来判断重新出错的位置

然而一般的程序输出可能不足以提供足够信息的情况，此时可以根据 `segmentation fault (core dumped)` 信息并且借助一些工具来定位出错的位置

### `addr2line`

`addr2line` 在程序**含有 debug 信息**时可以快速的将地址转换为文件名和行号

具体的使用方法可以通过 `man addr2line` 查看，这里简单介绍一下常用的用法

以下面的代码为例：

```c
#include <stdio.h>

int main() {
    int *p = NULL;
    *p = 2;
    return 0;
}
```

```bash
# 编译时加上 -g 选项，生成 debug 信息
# -no-pie 选项是为了避免 ASLR 的影响（高版本的 gcc 默认开启 ASLR）
$ gcc -g -no-pie test.c -o test

# 运行程序，会出现 segmentation fault
$ ./test
[1]    7533 segmentation fault (core dumped)  ./test

# dmesg 查看内核日志，可以看到 segmentation fault 的详细信息
$ dmesg | tail -n 2
[46592.916853] test[7533]: segfault at 0 ip 000000000040111a sp 00007ffce6095a70 error 6 in test[401000+1000]
[46592.916875] Code: c3 66 66 2e 0f 1f 84 00 00 00 00 00 0f 1f 40 00 f3 0f 1e fa eb 8a f3 0f 1e fa 55 48 89 e5 48 c7 45 f8 00 00 00 00 48 8b 45 f8 <c7> 00 02 00 00 00 b8 00 00 00 00 5d c3 66 0f 1f 84 00 00 00 00 00
```

此时可以根据 `ip 000000000040111a` 来定位出错的位置，`ip` 后面跟着的数字就是 IP 寄存器的值，也就是出错时的程序运行位置，可以通过 `addr2line` 来将其转换为文件名和行号

```bash
# 将地址转换为文件名和行号
# -f 选项表示输出函数名
# -e 选项表示指定可执行文件
$ addr2line -f -e ./test 0x000000000040111a
main
/home/ywang/test.c:5
```

然而 `addr2line` 也有两个较为明显的局限：

- 需要提前在编译时加上 `-g` 选项，生成 debug 信息
- 对于高版本的 gcc，需要加上 `-no-pie` 选项，避免 ASLR 的影响

### `objdump` 反汇编

通过 `objdump` 进行反汇编也是一种比较常用的定位 segmentation fault 的方法，这种方法能够精确的定位到执行的汇编指令，并且没有 `addr2line` 的上述限制，但是需要一定的汇编基础，否则看不懂汇编指令也是没用的

汇编指令的快速查询可以直接 Google 或者在一些工具站，例如 [【felixcloutier】](https://www.felixcloutier.com/x86/) 或者 [【University of Virginia Computer Science】x86 Assembly Guide](https://www.cs.virginia.edu/~evans/cs216/guides/x86.html#instructions) 上进行速查

以下面的代码为例：

```c
#include <stdio.h>

void func_bug() {
    int *p = NULL;
    *p = 2;
}

int main() {
    int a = 1;
    func_bug();
    return 0;
}
```

```bash
# 无需任何选项，直接编译
$ gcc test.c -o test

# 运行程序，会出现 segmentation fault
$ ./test
[1]    8173 segmentation fault (core dumped)  ./test

# dmesg 查看内核日志，可以看到 segmentation fault 的详细信息
$ dmesg | tail -n 2
[49630.541707] test[8173]: segfault at 0 ip 000055bce6f6c13d sp 00007fffad5149b0 error 6 in test[55bce6f6c000+1000]
[49630.541732] Code: 5d c3 0f 1f 00 c3 0f 1f 80 00 00 00 00 f3 0f 1e fa e9 77 ff ff ff f3 0f 1e fa 55 48 89 e5 48 c7 45 f8 00 00 00 00 48 8b 45 f8 <c7> 00 02 00 00 00 90 5d c3 f3 0f 1e fa 55 48 89 e5 48 83 ec 10 c7
```

由于没有关闭 ASLR，所以每次运行程序时，`ip` 的值都会不一样，但是可以简单的换算获取到实际偏移量

首先需要通过 `objdump` 获取 `.init` 段的起始地址，如下所示：

```bash
# 获取 init 段的起始地址
$ objdump -h ./test -j .init

./test:     file format elf64-x86-64

Sections:
Idx Name          Size      VMA               LMA               File off  Algn
 10 .init         0000001b  0000000000001000  0000000000001000  00001000  2**2
                  CONTENTS, ALLOC, LOAD, READONLY, CODE
```

我们查看 `VMA` 列，可以看到 `.init` 段的起始地址为 `0x1000`（个人经验，如果不对，欢迎 dalao 指正）

#### 计算偏移量

然后根据 `dmesg` 中的 `ip` 以及程序被映射的 `VMA` 首地址计算代码偏移量，也就是 `ip 000055bce6f6c13d …… in test[55bce6f6c000+xxx]`，计算出 `0x55bce6f6c13d - 0x55bce6f6c000 = 0x13d`，然后在加上 `.init` 段的起始地址 `0x1000`，就可以得到实际的偏移量 `0x113d`

```bash
# 反汇编原程序
$ objdump -d ./test

./test:     file format elf64-x86-64


Disassembly of section .init:

0000000000001000 <_init>:
    1000:       f3 0f 1e fa             endbr64
    1004:       48 83 ec 08             sub    $0x8,%rsp
    1008:       48 8b 05 d9 2f 00 00    mov    0x2fd9(%rip),%rax        # 3fe8 <__gmon_start__>
    100f:       48 85 c0                test   %rax,%rax
    1012:       74 02                   je     1016 <_init+0x16>
    1014:       ff d0                   callq  *%rax
    1016:       48 83 c4 08             add    $0x8,%rsp
    101a:       c3                      retq

Disassembly of section .plt:

0000000000001020 <.plt>:
    1020:       ff 35 a2 2f 00 00       pushq  0x2fa2(%rip)        # 3fc8 <_GLOBAL_OFFSET_TABLE_+0x8>
    1026:       f2 ff 25 a3 2f 00 00    bnd jmpq *0x2fa3(%rip)        # 3fd0 <_GLOBAL_OFFSET_TABLE_+0x10>
    102d:       0f 1f 00                nopl   (%rax)

Disassembly of section .plt.got:

0000000000001030 <__cxa_finalize@plt>:
    1030:       f3 0f 1e fa             endbr64
    1034:       f2 ff 25 bd 2f 00 00    bnd jmpq *0x2fbd(%rip)        # 3ff8 <__cxa_finalize@GLIBC_2.2.5>
    103b:       0f 1f 44 00 00          nopl   0x0(%rax,%rax,1)

Disassembly of section .text:

0000000000001040 <_start>:
    1040:       f3 0f 1e fa             endbr64
    1044:       31 ed                   xor    %ebp,%ebp
    1046:       49 89 d1                mov    %rdx,%r9
    1049:       5e                      pop    %rsi
    104a:       48 89 e2                mov    %rsp,%rdx
    104d:       48 83 e4 f0             and    $0xfffffffffffffff0,%rsp
    1051:       50                      push   %rax
    1052:       54                      push   %rsp
    1053:       4c 8d 05 86 01 00 00    lea    0x186(%rip),%r8        # 11e0 <__libc_csu_fini>
    105a:       48 8d 0d 0f 01 00 00    lea    0x10f(%rip),%rcx        # 1170 <__libc_csu_init>
    1061:       48 8d 3d de 00 00 00    lea    0xde(%rip),%rdi        # 1146 <main>
    1068:       ff 15 72 2f 00 00       callq  *0x2f72(%rip)        # 3fe0 <__libc_start_main@GLIBC_2.2.5>
    106e:       f4                      hlt
    106f:       90                      nop

0000000000001070 <deregister_tm_clones>:
    1070:       48 8d 3d 99 2f 00 00    lea    0x2f99(%rip),%rdi        # 4010 <__TMC_END__>
    1077:       48 8d 05 92 2f 00 00    lea    0x2f92(%rip),%rax        # 4010 <__TMC_END__>
    107e:       48 39 f8                cmp    %rdi,%rax
    1081:       74 15                   je     1098 <deregister_tm_clones+0x28>
    1083:       48 8b 05 4e 2f 00 00    mov    0x2f4e(%rip),%rax        # 3fd8 <_ITM_deregisterTMCloneTable>
    108a:       48 85 c0                test   %rax,%rax
    108d:       74 09                   je     1098 <deregister_tm_clones+0x28>
    108f:       ff e0                   jmpq   *%rax
    1091:       0f 1f 80 00 00 00 00    nopl   0x0(%rax)
    1098:       c3                      retq
    1099:       0f 1f 80 00 00 00 00    nopl   0x0(%rax)

00000000000010a0 <register_tm_clones>:
    10a0:       48 8d 3d 69 2f 00 00    lea    0x2f69(%rip),%rdi        # 4010 <__TMC_END__>
    10a7:       48 8d 35 62 2f 00 00    lea    0x2f62(%rip),%rsi        # 4010 <__TMC_END__>
    10ae:       48 29 fe                sub    %rdi,%rsi
    10b1:       48 89 f0                mov    %rsi,%rax
    10b4:       48 c1 ee 3f             shr    $0x3f,%rsi
    10b8:       48 c1 f8 03             sar    $0x3,%rax
    10bc:       48 01 c6                add    %rax,%rsi
    10bf:       48 d1 fe                sar    %rsi
    10c2:       74 14                   je     10d8 <register_tm_clones+0x38>
    10c4:       48 8b 05 25 2f 00 00    mov    0x2f25(%rip),%rax        # 3ff0 <_ITM_registerTMCloneTable>
    10cb:       48 85 c0                test   %rax,%rax
    10ce:       74 08                   je     10d8 <register_tm_clones+0x38>
    10d0:       ff e0                   jmpq   *%rax
    10d2:       66 0f 1f 44 00 00       nopw   0x0(%rax,%rax,1)
    10d8:       c3                      retq
    10d9:       0f 1f 80 00 00 00 00    nopl   0x0(%rax)

00000000000010e0 <__do_global_dtors_aux>:
    10e0:       f3 0f 1e fa             endbr64
    10e4:       80 3d 25 2f 00 00 00    cmpb   $0x0,0x2f25(%rip)        # 4010 <__TMC_END__>
    10eb:       75 2b                   jne    1118 <__do_global_dtors_aux+0x38>
    10ed:       55                      push   %rbp
    10ee:       48 83 3d 02 2f 00 00    cmpq   $0x0,0x2f02(%rip)        # 3ff8 <__cxa_finalize@GLIBC_2.2.5>
    10f5:       00
    10f6:       48 89 e5                mov    %rsp,%rbp
    10f9:       74 0c                   je     1107 <__do_global_dtors_aux+0x27>
    10fb:       48 8b 3d 06 2f 00 00    mov    0x2f06(%rip),%rdi        # 4008 <__dso_handle>
    1102:       e8 29 ff ff ff          callq  1030 <__cxa_finalize@plt>
    1107:       e8 64 ff ff ff          callq  1070 <deregister_tm_clones>
    110c:       c6 05 fd 2e 00 00 01    movb   $0x1,0x2efd(%rip)        # 4010 <__TMC_END__>
    1113:       5d                      pop    %rbp
    1114:       c3                      retq
    1115:       0f 1f 00                nopl   (%rax)
    1118:       c3                      retq
    1119:       0f 1f 80 00 00 00 00    nopl   0x0(%rax)

0000000000001120 <frame_dummy>:
    1120:       f3 0f 1e fa             endbr64
    1124:       e9 77 ff ff ff          jmpq   10a0 <register_tm_clones>

0000000000001129 <func_bug>:
    1129:       f3 0f 1e fa             endbr64
    112d:       55                      push   %rbp
    112e:       48 89 e5                mov    %rsp,%rbp
    1131:       48 c7 45 f8 00 00 00    movq   $0x0,-0x8(%rbp)
    1138:       00
    1139:       48 8b 45 f8             mov    -0x8(%rbp),%rax
    113d:       c7 00 02 00 00 00       movl   $0x2,(%rax)
    1143:       90                      nop
    1144:       5d                      pop    %rbp
    1145:       c3                      retq

0000000000001146 <main>:
    1146:       f3 0f 1e fa             endbr64
    114a:       55                      push   %rbp
    114b:       48 89 e5                mov    %rsp,%rbp
    114e:       48 83 ec 10             sub    $0x10,%rsp
    1152:       c7 45 fc 01 00 00 00    movl   $0x1,-0x4(%rbp)
    1159:       b8 00 00 00 00          mov    $0x0,%eax
    115e:       e8 c6 ff ff ff          callq  1129 <func_bug>
    1163:       b8 00 00 00 00          mov    $0x0,%eax
    1168:       c9                      leaveq
    1169:       c3                      retq
    116a:       66 0f 1f 44 00 00       nopw   0x0(%rax,%rax,1)

0000000000001170 <__libc_csu_init>:
    1170:       f3 0f 1e fa             endbr64
    1174:       41 57                   push   %r15
    1176:       4c 8d 3d 73 2c 00 00    lea    0x2c73(%rip),%r15        # 3df0 <__frame_dummy_init_array_entry>
    117d:       41 56                   push   %r14
    117f:       49 89 d6                mov    %rdx,%r14
    1182:       41 55                   push   %r13
    1184:       49 89 f5                mov    %rsi,%r13
    1187:       41 54                   push   %r12
    1189:       41 89 fc                mov    %edi,%r12d
    118c:       55                      push   %rbp
    118d:       48 8d 2d 64 2c 00 00    lea    0x2c64(%rip),%rbp        # 3df8 <__do_global_dtors_aux_fini_array_entry>
    1194:       53                      push   %rbx
    1195:       4c 29 fd                sub    %r15,%rbp
    1198:       48 83 ec 08             sub    $0x8,%rsp
    119c:       e8 5f fe ff ff          callq  1000 <_init>
    11a1:       48 c1 fd 03             sar    $0x3,%rbp
    11a5:       74 1f                   je     11c6 <__libc_csu_init+0x56>
    11a7:       31 db                   xor    %ebx,%ebx
    11a9:       0f 1f 80 00 00 00 00    nopl   0x0(%rax)
    11b0:       4c 89 f2                mov    %r14,%rdx
    11b3:       4c 89 ee                mov    %r13,%rsi
    11b6:       44 89 e7                mov    %r12d,%edi
    11b9:       41 ff 14 df             callq  *(%r15,%rbx,8)
    11bd:       48 83 c3 01             add    $0x1,%rbx
    11c1:       48 39 dd                cmp    %rbx,%rbp
    11c4:       75 ea                   jne    11b0 <__libc_csu_init+0x40>
    11c6:       48 83 c4 08             add    $0x8,%rsp
    11ca:       5b                      pop    %rbx
    11cb:       5d                      pop    %rbp
    11cc:       41 5c                   pop    %r12
    11ce:       41 5d                   pop    %r13
    11d0:       41 5e                   pop    %r14
    11d2:       41 5f                   pop    %r15
    11d4:       c3                      retq
    11d5:       66 66 2e 0f 1f 84 00    data16 nopw %cs:0x0(%rax,%rax,1)
    11dc:       00 00 00 00

00000000000011e0 <__libc_csu_fini>:
    11e0:       f3 0f 1e fa             endbr64
    11e4:       c3                      retq

Disassembly of section .fini:

00000000000011e8 <_fini>:
    11e8:       f3 0f 1e fa             endbr64
    11ec:       48 83 ec 08             sub    $0x8,%rsp
    11f0:       48 83 c4 08             add    $0x8,%rsp
    11f4:       c3                      retq
```

查看 `0x113d` 附近的代码段

```x86asm
0000000000001129 <func_bug>:
    1129:       f3 0f 1e fa             endbr64
    112d:       55                      push   %rbp
    112e:       48 89 e5                mov    %rsp,%rbp
    1131:       48 c7 45 f8 00 00 00    movq   $0x0,-0x8(%rbp)
    1138:       00
    1139:       48 8b 45 f8             mov    -0x8(%rbp),%rax
    113d:       c7 00 02 00 00 00       movl   $0x2,(%rax)
    1143:       90                      nop
    1144:       5d                      pop    %rbp
    1145:       c3                      retq
```

结合源码以及汇编的前后内容不难分析出 `movl $0x2,(%rax)` 与源代码 `*p = 2;` 对应
而 `movq $0x0,-0x8(%rbp)` 以及 `mov -0x8(%rbp),%rax` 与源代码中的 `int *p = NULL;` 对应

因此不难判断出实际的出错原因为对空指针的进行了写操作

#### 优化

- 起始地址

通常出错的程序可能会比较大，反汇编整个程序会非常耗时，此时可以通过 `objdump` 的 `--start-address=xxx --stop-address=xxx` 选项来指定反汇编的开始地址和结束地址

例如：

```bash
$ objdump -d --start-address=0x1129 --stop-address=0x1146 ./test

./test:     file format elf64-x86-64


Disassembly of section .text:

0000000000001129 <func_bug>:
    1129:       f3 0f 1e fa             endbr64
    112d:       55                      push   %rbp
    112e:       48 89 e5                mov    %rsp,%rbp
    1131:       48 c7 45 f8 00 00 00    movq   $0x0,-0x8(%rbp)
    1138:       00
    1139:       48 8b 45 f8             mov    -0x8(%rbp),%rax
    113d:       c7 00 02 00 00 00       movl   $0x2,(%rax)
    1143:       90                      nop
    1144:       5d                      pop    %rbp
    1145:       c3                      retq
```

- 源代码参照

如果编译时指定的 `-g` 也就是有 debug 信息的话，可以通过 `objdump` 的 `-S -l` 选项来将汇编指令与源代码进行对照

```bash
$ gcc -g test.c -o test

# -S 隐含 -d
$ objdump -S -l --start-address=0x1129 --stop-address=0x1146 ./test

./test:     file format elf64-x86-64


Disassembly of section .text:

0000000000001129 <func_bug>:
func_bug():
/home/wangyu/test.c:3
#include <stdio.h>

void func_bug() {
    1129:       f3 0f 1e fa             endbr64
    112d:       55                      push   %rbp
    112e:       48 89 e5                mov    %rsp,%rbp
/home/wangyu/test.c:4
    int *p = NULL;
    1131:       48 c7 45 f8 00 00 00    movq   $0x0,-0x8(%rbp)
    1138:       00
/home/wangyu/test.c:5
    *p = 2;
    1139:       48 8b 45 f8             mov    -0x8(%rbp),%rax
    113d:       c7 00 02 00 00 00       movl   $0x2,(%rax)
/home/wangyu/test.c:6
}
    1143:       90                      nop
    1144:       5d                      pop    %rbp
    1145:       c3                      retq
```

## 事中

为了更好的查看出错时的程序的各个变量值，可以借助最强工具 `gdb` 来进行调试运行

### 最强工具 `gdb`

`gdb` 是 GNU 出品的一个强大的调试工具，可以用来调试多种语言的程序，例如 C/C++、Go、Rust 等

`gdb` 的使用方法非常多，这里只介绍一些常用的用法，更多的用法可以通过 `man gdb` 查看

同样需要在编译时加上 `-g` 选项，生成 debug 信息

以下面的代码为例：

```c
#include <stdio.h>

void func_bug() {
    int *p = NULL;
    *p = 2;
}

int main(int argc, char *argv[]) {
    if (argc == 1) {
        printf("usage: %s arg1\n", argv[0]);
        return 0;
    }
    func_bug();
    return 0;
}
```

#### 启动

```bash
# 通过 gdb 启动程序，只需将程序名作为参数传入即可
$ gdb ./test
GNU gdb (Ubuntu 9.2-0ubuntu1~20.04.1) 9.2
Copyright (C) 2020 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <http://gnu.org/licenses/gpl.html>
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.
Type "show copying" and "show warranty" for details.
This GDB was configured as "x86_64-linux-gnu".
Type "show configuration" for configuration details.
For bug reporting instructions, please see:
<http://www.gnu.org/software/gdb/bugs/>.
Find the GDB manual and other documentation resources online at:
    <http://www.gnu.org/software/gdb/documentation/>.

For help, type "help".
Type "apropos word" to search for commands related to "word"...
Reading symbols from ./test...
(gdb)
```

此时就成功通过 `gdb` 启动了程序，如果被调试的程序需要参数，可以通过 `set args` 命令来设置参数，用法如下：

```bash
# 设置参数
(gdb) set args arg1 arg2 ...
```

#### 运行

`gdb` 启动程序后，并不会直接运行程序，而是需要手动输入 `run` 命令来运行程序

```bash
# 配置参数后运行程序
(gdb) set args a1 b2 c3
(gdb) run
Starting program: /home/wangyu/test a1 b2 c3

Program received signal SIGSEGV, Segmentation fault.
0x000055555555515d in func_bug () at test.c:5
5           *p = 2;
(gdb)
```

这时能非常清晰的看出出错的位置

#### 查看变量

`print` 命令来查看变量的值，用法如下：

```bash
# 查看变量
(gdb) print p
$1 = (int *) 0x0
```

#### 查看堆栈

`bt` 命令来查看堆栈，用法如下：

```bash
# 查看堆栈
(gdb) bt
#0  0x000055555555515d in func_bug () at test.c:5
#1  0x00005555555551ab in main (argc=4, argv=0x7fffffffe388) at test.c:13
```

#### 配置断点

`break` 或者 `b` 命令来配置断点，用法如下：

```bash
# 配置断点
(gdb) break func_bug
Breakpoint 1 at 0x555555555149: file test.c, line 3.
(gdb) break test.c:5
Breakpoint 2 at 0x555555555159: file test.c, line 5.
```

#### 查看断点

`info breakpoints` 或者 `info b` 命令来查看断点，用法如下：

```bash
# 查看断点
(gdb) info b
Num     Type           Disp Enb Address            What
1       breakpoint     keep y   0x0000555555555149 in func_bug at test.c:3
2       breakpoint     keep y   0x0000555555555159 in func_bug at test.c:5
```

#### 删除断点

`delete` 或者 `d` 命令来删除断点，用法如下：

```bash
# 删除断点
(gdb) d 2
(gdb) info b
Num     Type           Disp Enb Address            What
1       breakpoint     keep y   0x0000555555555149 in func_bug at test.c:3
```

#### 单步执行

`next` 或者 `n` 命令来单步执行，如果遇到函数调用，则不会进入函数内部

`step` 或者 `s` 命令来单步执行，如果遇到函数调用，则会进入函数内部

#### 继续执行

`continue` 或者 `c` 命令来继续执行，直到遇到断点或者程序结束

#### 打印源代码

`list` 或者 `l` 命令来打印源代码，用法如下：

```bash
# 打印源代码
(gdb) l
1       #include <stdio.h>
2
3       void func_bug() {
4           int *p = NULL;
5           *p = 2;
6       }
7
8       int main(int argc, char *argv[]) {
9           if (argc == 1) {
10              printf("usage: %s arg1\n", argv[0]);
```

直接输入 `l` 命令会打印出当前断点所在的代码，也可以通过 `l xxx` 来打印指定的代码，xxx 可以是行号，也可以是函数名

## 事先

### `printf`

虽然 `printf` 是最简单的调试方法，但是也是最常用的调试方法，基本上没有 `printf` 调试不出来的 bug

**一般流程如下：**

1. 通常对于一般的 bug，可以先根据出错时的程序输出，大致估计出错的位置
2. 然后在源代码中插入打印语句，重新编译，再次运行程序
3. 继续观察打印的输出，一步步的缩小出错的范围，最终定位到出错的位置
4. 然后就可以打印出错位置的相应变量的值，进而分析出错原因

**缺点：**

但是然而 `printf` 本身会造成程序的运行效率降低，有时会出现**加了 `printf` 之后 bug 复现不了，去掉 `printf` 之后 bug 又复现了**的情况

这种情况下就需要优化 `printf` 的方式，例如**改用 `sprintf` 将内容输出到内存中，然后通过单独的线程 `fprintf` 转储到文件中**，这样就会减少对程序的运行效率的影响

当然也可以换用后续的其他的调试方法

### `assert`

`assert` 是 C/C++ 中的一个宏，用于判断一个表达式是否为真，如果为假，则输出错误信息，并终止程序的运行

```c
#include <assert.h>

int main() {
    int a = 1;
    assert(a == 2);
    return 0;
}
```

例如上述代码会输出如下错误信息，并终止程序的运行：

```bash
test: test.c:5: main: Assertion `a == 2' failed.
[1]    3563773 abort (core dumped)  ./test
```

因此我们可以提前在一些可能出错的地方插入 `assert` 语句，当程序运行到这里时，如果 `assert` 语句不成立，则会输出错误信息，并终止程序的运行，从而快速定位到出错的原因

**缺点：**

与 `printf` 一样，`assert` 也会造成程序的运行效率稍微降低，但是一般不会影响到 bug 的复现

但是为了程序的运行效率，程序 `release` 版本的时候应该将 `assert` 语句去掉，或者利用宏定义，在 `release` 的时候将 `assert` 语句替换成空语句

例如：

```c
// #define DEBUG

#ifdef DEBUG
#define ASSERT(x) assert(x)
#else
#define ASSERT(x)
#endif
```

## 小节

通常情况下，我个人会在出错后根据程序的编译耗时来进行选择 debug 的方式

- 当程序编译耗时较短时，我会优先选择 `printf` 的方式来进行调试
- 而当程序编译耗时较长时，我会优先选择 `objdump` 的方式来进行判断，如果 `objdump` 无法快速定位到出错的位置，我会再选择 `gdb` 的方式来进行调试

## 参考资料

- [【man】addr2line](https://man7.org/linux/man-pages/man1/addr2line.1.html)
- [【man】objdump](https://man7.org/linux/man-pages/man1/objdump.1.html)
- [【felixcloutier】](https://www.felixcloutier.com/x86/)
- [【University of Virginia Computer Science】x86 Assembly Guide](https://www.cs.virginia.edu/~evans/cs216/guides/x86.html#instructions)
- [【个人博客】GDB调试指南](https://www.yanbinghu.com/2019/04/20/41283.html)

