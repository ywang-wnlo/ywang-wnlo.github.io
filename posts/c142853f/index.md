# io_uring 简介和使用


## 简介

io_uring 是 Linux 在 5.1 版本引入的一套新的异步 IO 实现。相比 Linux 在 2.6 版本引入的 AIO，io_uring 性能强很多，接近 SPDK[[1]](https://lore.kernel.org/linux-block/20190116175003.17880-1-axboe@kernel.dk/)，同时支持 buffer IO
<!-- more -->

io_uring 的作者 [Jens Axboe](https://en.wikipedia.org/wiki/Jens_Axboe) 是 Linux 内核块层和其他块设备的维护者，同时也是 CFQ、Noop、Deadline 调度器、blktrace 以及 FIO 的作者，对内核块层非常熟悉

## 使用

### 系统调用

io_uring 只增加了三个 Linux 系统调用分别是 `io_uring_setup`，`io_uring_enter` 和 `io_uring_register`

他们的入口都在 Linux 内核源码的 `fs/io_uring.c` 文件中

用户程序可以直接使用 `syscall(__NR_xxx, ……)` 的方式直接调用，使用起来很麻烦

### liburing

由于直接使用系统调用较为复杂，Jens Axboe 还提供了封装好的用户态库 liburing，简化了 io_uring 的使用，代码位置在 [github](https://github.com/axboe/liburing) 上

#### 样例

liburing 仓库的 `examples/` 目录下提供了几个简单的样例程序：

| 文件              | 功能                             | 其他                                                                                                                                   |
| ----------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `io_uring-test.c` | 读取一个文件的全部内容           | -                                                                                                                                      |
| `io_uring-cp.c`   | 复制一个文件的内容到另一个文件   | 使用 `user_data` 手动处理读写 IO 之间的依赖，读 IO 返回之后才下发写 IO                                                                 |
| `link-cp.c`       | 复制一个文件的内容到另一个文件   | 同时下发读写，使用 `IOSQE_IO_LINK` 保证读写之间的依赖[[2]](https://lore.kernel.org/linux-block/20190517214131.5925-1-axboe@kernel.dk/) |
| `ucontext-cp.c`   | 复制 n 个文件的内容到另 n 个文件 | 使用 `ucontext` 进行上下文切换，模拟 [协程](https://blog.csdn.net/qq910894904/article/details/41911175)                                 |

#### 代码流程

仔细阅读前三个用例，可以看出使用 io_uring 的一般流程如下：

- 使用 `open`、`fstat` 等函数来打开文件以及元数据查看等操作
  - 因为 io_uring 替换的是读写接口，后续 io_uring 操作的对象是 `fd`（由 `open` 函数执行返回的）
- 使用 `io_uring_queue_init` 初始化 `struct io_uring ring` 结构体
- 初始化 `struct iovec *iovecs` 结构体用于存放用户态 buffer 指针和长度
- 通过 `io_uring_get_sqe` 获取 `sqe`
- 通过 `io_uring_prep_#OP` 对 `sqe` 填充命令，buffer 以及 offset 信息
  - 【可选】 通过 `io_uring_sqe_set_data` 对 `sqe` 附加 `user_data` 信息（该信息会在 `cqe` 中进行返回）
- 通过 `io_uring_submit` 对整个 `ring` 的所有 `sqe` 进行下发
- 通过 `io_uring_wait_cqe` 或者 `io_uring_peek_cqe` 来获取 `cqe`
  - `io_uring_wait_cqe` 会阻塞当前线程直到有一个 `cqe` 返回
  - `io_uring_peek_cqe` 不会阻塞，如果当前没有 `cqe`，就会返回错误
  - `io_uring_cqe_get_data` 可以从 `cqe` 中获取 `user_data`
- 通过 `io_uring_cqe_seen` 对当前 `cqe` 进行清除，避免被二次处理
- 所有 IO 完成后，通过 `io_uring_queue_exit` 将 `ring` 销毁

## 编译

根据官方 `Makefile` 可以看出编译时有额外的三个条件

- 定义 `_GNU_SOURCE` 宏，`-D` 宏定义
- 指定额外的头文件目录，`-I` 指定头文件目录位置
- 使用 `liburing` 库，`-L` 指定库位置，`-l` 指定库名

即 `gcc -D_GNU_SOURCE -I../src/include/ -L../src/ -o test test.c -luring`

其中头文件目录下主要有三个头文件：

```bash
$ tree src/include/
src/include/
├── liburing
│   ├── barrier.h
│   └── io_uring.h
└── liburing.h

1 directory, 3 files
```

而 `liburing` 库也需要编译生成，推荐直接在 `liburing` 的顶层目录直接 `make all`

## 参考资料

- [【PDF】官方 pdf](io_uring.pdf)
- [【Kernel】io_uring 性能测试](https://lore.kernel.org/linux-block/20190116175003.17880-1-axboe@kernel.dk/)
- [【维基百科】Jens Axboe](https://en.wikipedia.org/wiki/Jens_Axboe)
- [【Kernel】io_uring IOSQE_IO_LINK](https://lore.kernel.org/linux-block/20190517214131.5925-1-axboe@kernel.dk/)
- [【阿里云技术博客】Linux 异步 IO 新时代：io_uring](https://kernel.taobao.org/2019/06/io_uring-a-new-linux-asynchronous-io-API/)
- [【GitHub】《操作系统与存储：解析 Linux 内核全新异步 IO 引擎 —— io_uring 设计与实现》](https://github.com/Linkerist/blog/issues/25)
- [【个人博客】[译] Linux 异步 I/O 框架 io_uring：基本原理、程序示例与性能压测（2020）](https://arthurchiao.art/blog/intro-to-io-uring-zh/)

