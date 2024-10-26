# rm -r 与 rmdir 区别


## 背景

今天学弟在使用 NVMe-over-TCP 时发现无法卸载 `nvmet` 驱动，显示使用中

在一起探讨和测试中发现最终的原因竟然在于 `rm -r` 和 `rmdir` 这两个命令上

## 二者区别

| 命令    | 主要系统调用                                | 操作对象               |
| ------- | ------------------------------------------- | ---------------------- |
| `rmdir` | `rmdir`                                     | 仅目录                 |
| `rm -r` | `openat`, `getdents64`, `close`, `unlinkat` | 目录，以及目录所有文件 |

### `rmdir`

`rmdir` 直接调用 `rmdir` 来删除目录，如果目录非空，则会删除失败

### `rm -r`

1. 会先用 `openat` 打开目录，通过 `getdents64` 获取目录中的内容，然后 `close` 目录
2. 再第二次加上 `O_CLOEXEC` 标记`openat` 打开目录，表明当前目录即将删除，再次通过 `getdents64` 获取目录中的内容，然后 `close` 目录
3. 然后依次通过 `unlinkat` 删除目录中的内容
4. 最后通过 `unlinkat` 删除目录

### `rm -rf`

但是如果使用的是 `rm -rf`，并且在第 3 步删除目录内文件失败时，则会跳过第 4 步，也就是说不会再对目录做任何操作

## 测试过程

### 配置环境

首先建立一个非空目录，并且给目录中的文件配置权限，禁止删除文件

```bash
mkdir dir
touch dir/file
sudo chattr &#43;i dir/file
```

此时目录树如下

```bash
$ tree dir
dir
└── file

0 directories, 1 file
```

### `rmdir`

```bash
$ strace -o rmdir rmdir dir/
rmdir: failed to remove &#39;dir/&#39;: Directory not empty
```

`strace` 抓到的内容如下，主要内容在第 37 行

```strace
execve(&#34;/usr/bin/rmdir&#34;, [&#34;rmdir&#34;, &#34;dir/&#34;], 0x7ffe38ddae38 /* 26 vars */) = 0
brk(NULL)                               = 0x561e92b83000
arch_prctl(0x3001 /* ARCH_??? */, 0x7fff06684960) = -1 EINVAL (Invalid argument)
access(&#34;/etc/ld.so.preload&#34;, R_OK)      = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/etc/ld.so.cache&#34;, O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=46019, ...}) = 0
mmap(NULL, 46019, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f51af80c000
close(3)                                = 0
openat(AT_FDCWD, &#34;/lib/x86_64-linux-gnu/libc.so.6&#34;, O_RDONLY|O_CLOEXEC) = 3
read(3, &#34;\177ELF\2\1\1\3\0\0\0\0\0\0\0\0\3\0&gt;\0\1\0\0\0\360q\2\0\0\0\0\0&#34;..., 832) = 832
pread64(3, &#34;\6\0\0\0\4\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0&#34;..., 784, 64) = 784
pread64(3, &#34;\4\0\0\0\20\0\0\0\5\0\0\0GNU\0\2\0\0\300\4\0\0\0\3\0\0\0\0\0\0\0&#34;, 32, 848) = 32
pread64(3, &#34;\4\0\0\0\24\0\0\0\3\0\0\0GNU\0\t\233\222%\274\260\320\31\331\326\10\204\276X&gt;\263&#34;..., 68, 880) = 68
fstat(3, {st_mode=S_IFREG|0755, st_size=2029224, ...}) = 0
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f51af80a000
pread64(3, &#34;\6\0\0\0\4\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0&#34;..., 784, 64) = 784
pread64(3, &#34;\4\0\0\0\20\0\0\0\5\0\0\0GNU\0\2\0\0\300\4\0\0\0\3\0\0\0\0\0\0\0&#34;, 32, 848) = 32
pread64(3, &#34;\4\0\0\0\24\0\0\0\3\0\0\0GNU\0\t\233\222%\274\260\320\31\331\326\10\204\276X&gt;\263&#34;..., 68, 880) = 68
mmap(NULL, 2036952, PROT_READ, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f51af618000
mprotect(0x7f51af63d000, 1847296, PROT_NONE) = 0
mmap(0x7f51af63d000, 1540096, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x25000) = 0x7f51af63d000
mmap(0x7f51af7b5000, 303104, PROT_READ, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x19d000) = 0x7f51af7b5000
mmap(0x7f51af800000, 24576, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x1e7000) = 0x7f51af800000
mmap(0x7f51af806000, 13528, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f51af806000
close(3)                                = 0
arch_prctl(ARCH_SET_FS, 0x7f51af80b580) = 0
mprotect(0x7f51af800000, 12288, PROT_READ) = 0
mprotect(0x561e91688000, 4096, PROT_READ) = 0
mprotect(0x7f51af845000, 4096, PROT_READ) = 0
munmap(0x7f51af80c000, 46019)           = 0
brk(NULL)                               = 0x561e92b83000
brk(0x561e92ba4000)                     = 0x561e92ba4000
openat(AT_FDCWD, &#34;/usr/lib/locale/locale-archive&#34;, O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=3035952, ...}) = 0
mmap(NULL, 3035952, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f51af332000
close(3)                                = 0
rmdir(&#34;dir/&#34;)                           = -1 ENOTEMPTY (Directory not empty)
openat(AT_FDCWD, &#34;/usr/share/locale/locale.alias&#34;, O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=2996, ...}) = 0
read(3, &#34;# Locale name alias data base.\n#&#34;..., 4096) = 2996
read(3, &#34;&#34;, 4096)                       = 0
close(3)                                = 0
openat(AT_FDCWD, &#34;/usr/share/locale/en_US.UTF-8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en_US.utf8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en_US/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en.UTF-8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en.utf8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US.UTF-8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US.utf8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en.UTF-8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en.utf8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
write(2, &#34;rmdir: &#34;, 7)                  = 7
write(2, &#34;failed to remove &#39;dir/&#39;&#34;, 23) = 23
openat(AT_FDCWD, &#34;/usr/share/locale/en_US.UTF-8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en_US.utf8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en_US/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en.UTF-8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en.utf8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US.UTF-8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US.utf8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en.UTF-8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en.utf8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
write(2, &#34;: Directory not empty&#34;, 21)   = 21
write(2, &#34;\n&#34;, 1)                       = 1
close(1)                                = 0
close(2)                                = 0
exit_group(1)                           = ?
&#43;&#43;&#43; exited with 1 &#43;&#43;&#43;
```

### `rm -r`

```bash
$ strace -o rm_r_fail.strace rm -r dir/
rm: cannot remove &#39;dir/file&#39;: Operation not permitted
rm: cannot remove &#39;dir/&#39;: Directory not empty
```

`strace` 抓到的内容如下，主要内容在第 39-59 以及 94-96 行

```strace
execve(&#34;/usr/bin/rm&#34;, [&#34;rm&#34;, &#34;-r&#34;, &#34;dir/&#34;], 0x7ffc2c0fb640 /* 26 vars */) = 0
brk(NULL)                               = 0x56082871e000
arch_prctl(0x3001 /* ARCH_??? */, 0x7ffd0d910cf0) = -1 EINVAL (Invalid argument)
access(&#34;/etc/ld.so.preload&#34;, R_OK)      = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/etc/ld.so.cache&#34;, O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=46019, ...}) = 0
mmap(NULL, 46019, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f65c441d000
close(3)                                = 0
openat(AT_FDCWD, &#34;/lib/x86_64-linux-gnu/libc.so.6&#34;, O_RDONLY|O_CLOEXEC) = 3
read(3, &#34;\177ELF\2\1\1\3\0\0\0\0\0\0\0\0\3\0&gt;\0\1\0\0\0\360q\2\0\0\0\0\0&#34;..., 832) = 832
pread64(3, &#34;\6\0\0\0\4\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0&#34;..., 784, 64) = 784
pread64(3, &#34;\4\0\0\0\20\0\0\0\5\0\0\0GNU\0\2\0\0\300\4\0\0\0\3\0\0\0\0\0\0\0&#34;, 32, 848) = 32
pread64(3, &#34;\4\0\0\0\24\0\0\0\3\0\0\0GNU\0\t\233\222%\274\260\320\31\331\326\10\204\276X&gt;\263&#34;..., 68, 880) = 68
fstat(3, {st_mode=S_IFREG|0755, st_size=2029224, ...}) = 0
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f65c441b000
pread64(3, &#34;\6\0\0\0\4\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0&#34;..., 784, 64) = 784
pread64(3, &#34;\4\0\0\0\20\0\0\0\5\0\0\0GNU\0\2\0\0\300\4\0\0\0\3\0\0\0\0\0\0\0&#34;, 32, 848) = 32
pread64(3, &#34;\4\0\0\0\24\0\0\0\3\0\0\0GNU\0\t\233\222%\274\260\320\31\331\326\10\204\276X&gt;\263&#34;..., 68, 880) = 68
mmap(NULL, 2036952, PROT_READ, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f65c4229000
mprotect(0x7f65c424e000, 1847296, PROT_NONE) = 0
mmap(0x7f65c424e000, 1540096, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x25000) = 0x7f65c424e000
mmap(0x7f65c43c6000, 303104, PROT_READ, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x19d000) = 0x7f65c43c6000
mmap(0x7f65c4411000, 24576, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x1e7000) = 0x7f65c4411000
mmap(0x7f65c4417000, 13528, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f65c4417000
close(3)                                = 0
arch_prctl(ARCH_SET_FS, 0x7f65c441c580) = 0
mprotect(0x7f65c4411000, 12288, PROT_READ) = 0
mprotect(0x560827bb0000, 4096, PROT_READ) = 0
mprotect(0x7f65c4456000, 4096, PROT_READ) = 0
munmap(0x7f65c441d000, 46019)           = 0
brk(NULL)                               = 0x56082871e000
brk(0x56082873f000)                     = 0x56082873f000
openat(AT_FDCWD, &#34;/usr/lib/locale/locale-archive&#34;, O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=3035952, ...}) = 0
mmap(NULL, 3035952, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f65c3f43000
close(3)                                = 0
ioctl(0, TCGETS, {B38400 opost isig icanon echo ...}) = 0
lstat(&#34;/&#34;, {st_mode=S_IFDIR|0755, st_size=4096, ...}) = 0
newfstatat(AT_FDCWD, &#34;dir/&#34;, {st_mode=S_IFDIR|0775, st_size=4096, ...}, AT_SYMLINK_NOFOLLOW) = 0
openat(AT_FDCWD, &#34;dir/&#34;, O_RDONLY|O_NOCTTY|O_NONBLOCK|O_NOFOLLOW|O_DIRECTORY) = 3
fstat(3, {st_mode=S_IFDIR|0775, st_size=4096, ...}) = 0
fcntl(3, F_GETFL)                       = 0x38800 (flags O_RDONLY|O_NONBLOCK|O_LARGEFILE|O_NOFOLLOW|O_DIRECTORY)
fcntl(3, F_SETFD, FD_CLOEXEC)           = 0
getdents64(3, /* 3 entries */, 32768)   = 72
close(3)                                = 0
geteuid()                               = 1000
newfstatat(AT_FDCWD, &#34;dir/&#34;, {st_mode=S_IFDIR|0775, st_size=4096, ...}, AT_SYMLINK_NOFOLLOW) = 0
faccessat(AT_FDCWD, &#34;dir/&#34;, W_OK)       = 0
openat(AT_FDCWD, &#34;dir/&#34;, O_RDONLY|O_NOCTTY|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC|O_DIRECTORY) = 3
fstat(3, {st_mode=S_IFDIR|0775, st_size=4096, ...}) = 0
fcntl(3, F_GETFL)                       = 0x38800 (flags O_RDONLY|O_NONBLOCK|O_LARGEFILE|O_NOFOLLOW|O_DIRECTORY)
fcntl(3, F_SETFD, FD_CLOEXEC)           = 0
fstatfs(3, {f_type=EXT2_SUPER_MAGIC, f_bsize=4096, f_blocks=20510566, f_bfree=15993067, f_bavail=14940434, f_files=5242880, f_ffree=5074130, f_fsid={val=[3258576323, 2412010735]}, f_namelen=255, f_frsize=4096, f_flags=ST_VALID|ST_RELATIME}) = 0
fcntl(3, F_DUPFD_CLOEXEC, 3)            = 4
getdents64(3, /* 3 entries */, 32768)   = 72
getdents64(3, /* 0 entries */, 32768)   = 0
close(3)                                = 0
newfstatat(4, &#34;file&#34;, {st_mode=S_IFREG|0664, st_size=0, ...}, AT_SYMLINK_NOFOLLOW) = 0
faccessat(4, &#34;file&#34;, W_OK)              = -1 EPERM (Operation not permitted)
openat(AT_FDCWD, &#34;/usr/share/locale/locale.alias&#34;, O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=2996, ...}) = 0
read(3, &#34;# Locale name alias data base.\n#&#34;..., 4096) = 2996
read(3, &#34;&#34;, 4096)                       = 0
close(3)                                = 0
openat(AT_FDCWD, &#34;/usr/share/locale/en_US.UTF-8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en_US.utf8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en_US/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en.UTF-8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en.utf8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US.UTF-8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US.utf8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en.UTF-8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en.utf8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
write(2, &#34;rm: &#34;, 4)                     = 4
write(2, &#34;cannot remove &#39;dir/file&#39;&#34;, 24) = 24
openat(AT_FDCWD, &#34;/usr/share/locale/en_US.UTF-8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en_US.utf8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en_US/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en.UTF-8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en.utf8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US.UTF-8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US.utf8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en.UTF-8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en.utf8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
write(2, &#34;: Operation not permitted&#34;, 25) = 25
write(2, &#34;\n&#34;, 1)                       = 1
close(4)                                = 0
newfstatat(AT_FDCWD, &#34;dir/&#34;, {st_mode=S_IFDIR|0775, st_size=4096, ...}, AT_SYMLINK_NOFOLLOW) = 0
faccessat(AT_FDCWD, &#34;dir/&#34;, W_OK)       = 0
unlinkat(AT_FDCWD, &#34;dir/&#34;, AT_REMOVEDIR) = -1 ENOTEMPTY (Directory not empty)
write(2, &#34;rm: &#34;, 4)                     = 4
write(2, &#34;cannot remove &#39;dir/&#39;&#34;, 20)    = 20
write(2, &#34;: Directory not empty&#34;, 21)   = 21
write(2, &#34;\n&#34;, 1)                       = 1
lseek(0, 0, SEEK_CUR)                   = -1 ESPIPE (Illegal seek)
close(0)                                = 0
close(1)                                = 0
close(2)                                = 0
exit_group(1)                           = ?
&#43;&#43;&#43; exited with 1 &#43;&#43;&#43;
```

### `rm -rf`

```bash
$ strace -o rm_fail.strace rm -rf dir/
rm: cannot remove &#39;dir/file&#39;: Operation not permitted
```

`strace` 抓到的内容如下，主要内容在第 39-55 行

```strace
execve(&#34;/usr/bin/rm&#34;, [&#34;rm&#34;, &#34;-rf&#34;, &#34;dir/&#34;], 0x7fff7bc99c20 /* 26 vars */) = 0
brk(NULL)                               = 0x5566570fe000
arch_prctl(0x3001 /* ARCH_??? */, 0x7ffde2720670) = -1 EINVAL (Invalid argument)
access(&#34;/etc/ld.so.preload&#34;, R_OK)      = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/etc/ld.so.cache&#34;, O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=46019, ...}) = 0
mmap(NULL, 46019, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7fcb89d87000
close(3)                                = 0
openat(AT_FDCWD, &#34;/lib/x86_64-linux-gnu/libc.so.6&#34;, O_RDONLY|O_CLOEXEC) = 3
read(3, &#34;\177ELF\2\1\1\3\0\0\0\0\0\0\0\0\3\0&gt;\0\1\0\0\0\360q\2\0\0\0\0\0&#34;..., 832) = 832
pread64(3, &#34;\6\0\0\0\4\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0&#34;..., 784, 64) = 784
pread64(3, &#34;\4\0\0\0\20\0\0\0\5\0\0\0GNU\0\2\0\0\300\4\0\0\0\3\0\0\0\0\0\0\0&#34;, 32, 848) = 32
pread64(3, &#34;\4\0\0\0\24\0\0\0\3\0\0\0GNU\0\t\233\222%\274\260\320\31\331\326\10\204\276X&gt;\263&#34;..., 68, 880) = 68
fstat(3, {st_mode=S_IFREG|0755, st_size=2029224, ...}) = 0
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7fcb89d85000
pread64(3, &#34;\6\0\0\0\4\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0&#34;..., 784, 64) = 784
pread64(3, &#34;\4\0\0\0\20\0\0\0\5\0\0\0GNU\0\2\0\0\300\4\0\0\0\3\0\0\0\0\0\0\0&#34;, 32, 848) = 32
pread64(3, &#34;\4\0\0\0\24\0\0\0\3\0\0\0GNU\0\t\233\222%\274\260\320\31\331\326\10\204\276X&gt;\263&#34;..., 68, 880) = 68
mmap(NULL, 2036952, PROT_READ, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7fcb89b93000
mprotect(0x7fcb89bb8000, 1847296, PROT_NONE) = 0
mmap(0x7fcb89bb8000, 1540096, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x25000) = 0x7fcb89bb8000
mmap(0x7fcb89d30000, 303104, PROT_READ, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x19d000) = 0x7fcb89d30000
mmap(0x7fcb89d7b000, 24576, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x1e7000) = 0x7fcb89d7b000
mmap(0x7fcb89d81000, 13528, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7fcb89d81000
close(3)                                = 0
arch_prctl(ARCH_SET_FS, 0x7fcb89d86580) = 0
mprotect(0x7fcb89d7b000, 12288, PROT_READ) = 0
mprotect(0x5566566dd000, 4096, PROT_READ) = 0
mprotect(0x7fcb89dc0000, 4096, PROT_READ) = 0
munmap(0x7fcb89d87000, 46019)           = 0
brk(NULL)                               = 0x5566570fe000
brk(0x55665711f000)                     = 0x55665711f000
openat(AT_FDCWD, &#34;/usr/lib/locale/locale-archive&#34;, O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=3035952, ...}) = 0
mmap(NULL, 3035952, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7fcb898ad000
close(3)                                = 0
ioctl(0, TCGETS, {B38400 opost isig icanon echo ...}) = 0
lstat(&#34;/&#34;, {st_mode=S_IFDIR|0755, st_size=4096, ...}) = 0
newfstatat(AT_FDCWD, &#34;dir/&#34;, {st_mode=S_IFDIR|0775, st_size=4096, ...}, AT_SYMLINK_NOFOLLOW) = 0
openat(AT_FDCWD, &#34;dir/&#34;, O_RDONLY|O_NOCTTY|O_NONBLOCK|O_NOFOLLOW|O_DIRECTORY) = 3
fstat(3, {st_mode=S_IFDIR|0775, st_size=4096, ...}) = 0
fcntl(3, F_GETFL)                       = 0x38800 (flags O_RDONLY|O_NONBLOCK|O_LARGEFILE|O_NOFOLLOW|O_DIRECTORY)
fcntl(3, F_SETFD, FD_CLOEXEC)           = 0
getdents64(3, /* 3 entries */, 32768)   = 72
close(3)                                = 0
openat(AT_FDCWD, &#34;dir/&#34;, O_RDONLY|O_NOCTTY|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC|O_DIRECTORY) = 3
fstat(3, {st_mode=S_IFDIR|0775, st_size=4096, ...}) = 0
fcntl(3, F_GETFL)                       = 0x38800 (flags O_RDONLY|O_NONBLOCK|O_LARGEFILE|O_NOFOLLOW|O_DIRECTORY)
fcntl(3, F_SETFD, FD_CLOEXEC)           = 0
fstatfs(3, {f_type=EXT2_SUPER_MAGIC, f_bsize=4096, f_blocks=20510566, f_bfree=15993067, f_bavail=14940434, f_files=5242880, f_ffree=5074130, f_fsid={val=[3258576323, 2412010735]}, f_namelen=255, f_frsize=4096, f_flags=ST_VALID|ST_RELATIME}) = 0
fcntl(3, F_DUPFD_CLOEXEC, 3)            = 4
getdents64(3, /* 3 entries */, 32768)   = 72
getdents64(3, /* 0 entries */, 32768)   = 0
close(3)                                = 0
unlinkat(4, &#34;file&#34;, 0)                  = -1 EPERM (Operation not permitted)
openat(AT_FDCWD, &#34;/usr/share/locale/locale.alias&#34;, O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=2996, ...}) = 0
read(3, &#34;# Locale name alias data base.\n#&#34;..., 4096) = 2996
read(3, &#34;&#34;, 4096)                       = 0
close(3)                                = 0
openat(AT_FDCWD, &#34;/usr/share/locale/en_US.UTF-8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en_US.utf8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en_US/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en.UTF-8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en.utf8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US.UTF-8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US.utf8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en.UTF-8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en.utf8/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en/LC_MESSAGES/coreutils.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
write(2, &#34;rm: &#34;, 4)                     = 4
write(2, &#34;cannot remove &#39;dir/file&#39;&#34;, 24) = 24
openat(AT_FDCWD, &#34;/usr/share/locale/en_US.UTF-8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en_US.utf8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en_US/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en.UTF-8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en.utf8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale/en/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US.UTF-8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US.utf8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en_US/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en.UTF-8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en.utf8/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/usr/share/locale-langpack/en/LC_MESSAGES/libc.mo&#34;, O_RDONLY) = -1 ENOENT (No such file or directory)
write(2, &#34;: Operation not permitted&#34;, 25) = 25
write(2, &#34;\n&#34;, 1)                       = 1
close(4)                                = 0
lseek(0, 0, SEEK_CUR)                   = -1 ESPIPE (Illegal seek)
close(0)                                = 0
close(1)                                = 0
close(2)                                = 0
exit_group(1)                           = ?
&#43;&#43;&#43; exited with 1 &#43;&#43;&#43;
```

最后取消文件的权限，看一下 `rm -rf` 成功时的系统调用

```bash
sudo chattr -i dir/file
strace -o rm_rf_succ.strace rm -rf dir/
```

`strace` 抓到的内容如下，主要内容在第 39-57 行

```strace
execve(&#34;/usr/bin/rm&#34;, [&#34;rm&#34;, &#34;-rf&#34;, &#34;dir/&#34;], 0x7ffee56569a0 /* 26 vars */) = 0
brk(NULL)                               = 0x55cc9fc1d000
arch_prctl(0x3001 /* ARCH_??? */, 0x7ffec41c6210) = -1 EINVAL (Invalid argument)
access(&#34;/etc/ld.so.preload&#34;, R_OK)      = -1 ENOENT (No such file or directory)
openat(AT_FDCWD, &#34;/etc/ld.so.cache&#34;, O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=46019, ...}) = 0
mmap(NULL, 46019, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f771df9d000
close(3)                                = 0
openat(AT_FDCWD, &#34;/lib/x86_64-linux-gnu/libc.so.6&#34;, O_RDONLY|O_CLOEXEC) = 3
read(3, &#34;\177ELF\2\1\1\3\0\0\0\0\0\0\0\0\3\0&gt;\0\1\0\0\0\360q\2\0\0\0\0\0&#34;..., 832) = 832
pread64(3, &#34;\6\0\0\0\4\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0&#34;..., 784, 64) = 784
pread64(3, &#34;\4\0\0\0\20\0\0\0\5\0\0\0GNU\0\2\0\0\300\4\0\0\0\3\0\0\0\0\0\0\0&#34;, 32, 848) = 32
pread64(3, &#34;\4\0\0\0\24\0\0\0\3\0\0\0GNU\0\t\233\222%\274\260\320\31\331\326\10\204\276X&gt;\263&#34;..., 68, 880) = 68
fstat(3, {st_mode=S_IFREG|0755, st_size=2029224, ...}) = 0
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f771df9b000
pread64(3, &#34;\6\0\0\0\4\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0@\0\0\0\0\0\0\0&#34;..., 784, 64) = 784
pread64(3, &#34;\4\0\0\0\20\0\0\0\5\0\0\0GNU\0\2\0\0\300\4\0\0\0\3\0\0\0\0\0\0\0&#34;, 32, 848) = 32
pread64(3, &#34;\4\0\0\0\24\0\0\0\3\0\0\0GNU\0\t\233\222%\274\260\320\31\331\326\10\204\276X&gt;\263&#34;..., 68, 880) = 68
mmap(NULL, 2036952, PROT_READ, MAP_PRIVATE|MAP_DENYWRITE, 3, 0) = 0x7f771dda9000
mprotect(0x7f771ddce000, 1847296, PROT_NONE) = 0
mmap(0x7f771ddce000, 1540096, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x25000) = 0x7f771ddce000
mmap(0x7f771df46000, 303104, PROT_READ, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x19d000) = 0x7f771df46000
mmap(0x7f771df91000, 24576, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_DENYWRITE, 3, 0x1e7000) = 0x7f771df91000
mmap(0x7f771df97000, 13528, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_FIXED|MAP_ANONYMOUS, -1, 0) = 0x7f771df97000
close(3)                                = 0
arch_prctl(ARCH_SET_FS, 0x7f771df9c580) = 0
mprotect(0x7f771df91000, 12288, PROT_READ) = 0
mprotect(0x55cc9ec06000, 4096, PROT_READ) = 0
mprotect(0x7f771dfd6000, 4096, PROT_READ) = 0
munmap(0x7f771df9d000, 46019)           = 0
brk(NULL)                               = 0x55cc9fc1d000
brk(0x55cc9fc3e000)                     = 0x55cc9fc3e000
openat(AT_FDCWD, &#34;/usr/lib/locale/locale-archive&#34;, O_RDONLY|O_CLOEXEC) = 3
fstat(3, {st_mode=S_IFREG|0644, st_size=3035952, ...}) = 0
mmap(NULL, 3035952, PROT_READ, MAP_PRIVATE, 3, 0) = 0x7f771dac3000
close(3)                                = 0
ioctl(0, TCGETS, {B38400 opost isig icanon echo ...}) = 0
lstat(&#34;/&#34;, {st_mode=S_IFDIR|0755, st_size=4096, ...}) = 0
newfstatat(AT_FDCWD, &#34;dir/&#34;, {st_mode=S_IFDIR|0775, st_size=4096, ...}, AT_SYMLINK_NOFOLLOW) = 0
openat(AT_FDCWD, &#34;dir/&#34;, O_RDONLY|O_NOCTTY|O_NONBLOCK|O_NOFOLLOW|O_DIRECTORY) = 3
fstat(3, {st_mode=S_IFDIR|0775, st_size=4096, ...}) = 0
fcntl(3, F_GETFL)                       = 0x38800 (flags O_RDONLY|O_NONBLOCK|O_LARGEFILE|O_NOFOLLOW|O_DIRECTORY)
fcntl(3, F_SETFD, FD_CLOEXEC)           = 0
getdents64(3, /* 3 entries */, 32768)   = 72
close(3)                                = 0
openat(AT_FDCWD, &#34;dir/&#34;, O_RDONLY|O_NOCTTY|O_NONBLOCK|O_NOFOLLOW|O_CLOEXEC|O_DIRECTORY) = 3
fstat(3, {st_mode=S_IFDIR|0775, st_size=4096, ...}) = 0
fcntl(3, F_GETFL)                       = 0x38800 (flags O_RDONLY|O_NONBLOCK|O_LARGEFILE|O_NOFOLLOW|O_DIRECTORY)
fcntl(3, F_SETFD, FD_CLOEXEC)           = 0
fstatfs(3, {f_type=EXT2_SUPER_MAGIC, f_bsize=4096, f_blocks=20510566, f_bfree=15993064, f_bavail=14940431, f_files=5242880, f_ffree=5074129, f_fsid={val=[3258576323, 2412010735]}, f_namelen=255, f_frsize=4096, f_flags=ST_VALID|ST_RELATIME}) = 0
fcntl(3, F_DUPFD_CLOEXEC, 3)            = 4
getdents64(3, /* 3 entries */, 32768)   = 72
getdents64(3, /* 0 entries */, 32768)   = 0
close(3)                                = 0
unlinkat(4, &#34;file&#34;, 0)                  = 0
close(4)                                = 0
unlinkat(AT_FDCWD, &#34;dir/&#34;, AT_REMOVEDIR) = 0
lseek(0, 0, SEEK_CUR)                   = -1 ESPIPE (Illegal seek)
close(0)                                = 0
close(1)                                = 0
close(2)                                = 0
exit_group(0)                           = ?
&#43;&#43;&#43; exited with 0 &#43;&#43;&#43;
```

## 参考资料

- [【mellanox 社区】HowTo Configure NVMe over Fabrics](https://community.mellanox.com/s/article/howto-configure-nvme-over-fabrics)
- [【硬见】NVMe-oF 不只是 RDMA，还有 TCP](https://open.tech2real.com/info_detail_page?id=18441)
- [【CSDN】Linux 防止文件和目录被意外删除或修改](https://blog.csdn.net/codedancing/article/details/103835085)
- [【man】open](https://man7.org/linux/man-pages/man2/open.2.html)
- [【stackexchange】Why are rmdir and unlink two separate system calls?](https://unix.stackexchange.com/questions/150960/why-are-rmdir-and-unlink-two-separate-system-calls)


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/935ae1f0/  

