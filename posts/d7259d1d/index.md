# io_uring 用户库源码分析


当前内容基于 [liburing 2.1](https://github.com/axboe/liburing/releases/tag/liburing-2.1) 版本

## 整体流程

之前在 [io_uring 简介和使用](/posts/c142853f/#代码流程) 有过总结，使用 io_uring 的一般流程如下：
<!-- more -->

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

## `io_uring_queue_init`

- 函数调用逻辑

  ```mermaid
  graph TD
  io_uring_queue_init --> io_uring_queue_init_params --> __sys_io_uring_setup --> syscall -->|陷入内核|io_uring_setup
  io_uring_queue_init_params --> io_uring_queue_mmap --> io_uring_mmap --> mmap
  ```

- 函数功能

  该函数主要将队列深度以及额外的 `flags` 参数传递到内核，让内核的 `io_uring_setup` 来初始化 `io_uring` 结构体，同时使用 `mmap` 将在内核中初始化的 `SQ`、`CQ` 以及 `SQEs` 映射到用户态

  初始化时传递的 `flags` 将影响 `io_uring` 的运行方式：

  - `IORING_SETUP_IOPOLL`：开启此选项必须保证后续只用 `O_DIRECT` 打开文件并且文件系统的 `file_operations` 中注册了 `iopoll` 函数，否则 IO 将下发失败。开启后内核将调用注册的 `iopoll` 函数来主动轮询设备驱动确认 IO 是否完成<!-- ，`iopoll` 的触发时机可以参看 [io_uring 内核源码分析](/io_uring/内核源码分析) -->
  - `IORING_SETUP_SQPOLL`：将启动一个单独的内核线程 `io_sq_thread`，内核将主动轮询 SQ，然后将 IO 下发至驱动设备，能大大减少提交 IO 时的系统调用开销（内核线程工作时，提交 IO 将无需系统调用；但是该线程可能会休眠，休眠时需要系统调用来唤醒该线程）
  - `IORING_SETUP_SQ_AFF`：当 `IORING_SETUP_SQPOLL` 已经配置后，启用 `sq_thread_cpu` 字段，用于配置内核线程 `io_sq_thread` 的跑在哪个 CPU 上

## `io_uring_get_sqe`

由于 SQ 已经通过 `mmap` 映射到用户态，该函数只需在读取 `sq->khead` 时通过 `io_uring_smp_load_acquire` 保证一致性，而 `sq->sqe_tail` 只用于用户态，直接读取即可，根据 `sq->khead` 以及 `sq->sqe_tail` 判断 SQ 是否已满，未满则给出 `sq->sqe_tail` 处的 `sqe` 即可，然后更新 `sq->sqe_tail`

## `io_uring_prep_#OP`

通过调用 `io_uring_prep_rw` 对 `sqe` 填充命令 OP、`fd`、buffer 指针以及 offset 信息等

## `io_uring_sqe_set_data`

直接对 `sqe->user_data` 进行赋值

## `io_uring_submit`

- 函数调用逻辑

    ```mermaid
    graph TD
    io_uring_submit --> __io_uring_submit_and_wait --> __io_uring_flush_sq
    __io_uring_submit_and_wait --> __io_uring_submit --> sq_ring_needs_enter
    __io_uring_submit --> __sys_io_uring_enter --> __sys_io_uring_enter2 --> syscall -->|陷入内核|io_uring_enter
    ```

- 函数功能

  - `__io_uring_flush_sq`

    根据 `sq->sqe_tail`、`sq->sqe_head` 差值依次填充 `sq->array`，然后一次性更新 `sq->ktail`，并返回内核中仍未处理 `sqe` 数量（`sq->ktail - sq->khead`）

  - `sq_ring_needs_enter`

    判断内核线程 `io_sq_thread` 是否启用以及正常工作（没有休眠）:

    - 首先要判断用户态 `ring->flags` 是否配置了 `IORING_SETUP_SQPOLL` 标志位，判断是否启用了内核线程 `io_sq_thread`
    - 然后再判断内核态 `ring->sq.kflags` 是否配置了 `IORING_SQ_NEED_WAKEUP` 标志位，判断内核线程 `io_sq_thread` 是否需要唤醒

    当内核线程 `io_sq_thread` 启用并且正常工作时，则整个 `io_uring_submit` 到此结束，无需后续的 `__sys_io_uring_enter` 系统调用，减少了 IO 下发的系统调用的开销

  - `__sys_io_uring_enter`

    系统调用陷入内核态，将参数传递给内核的 `io_uring_setup` 函数，主要用于提交 IO 和获取 IO 完成情况，具体功能和初始化时配置的 `ring->flags` 相关<!-- ，详细分析可以参看 [io_uring 内核源码分析](/io_uring/内核源码分析) -->

## `io_uring_wait_cqe`

在用户态轮询判断是否有一个新的 `cqe`，无需系统调用陷入内核，但是会阻塞当前线程直到有一个新的 `cqe` 或者出错

## `io_uring_peek_cqe`

仅在用户态判断一次是否有新的 `cqe`，无需系统调用陷入内核，如果没有新的 `cqe`，会返回失败信息 `-errno`

## `io_uring_cqe_get_data`

`cqe->user_data` 会在 IO 完成后，从 `sqe` 复制到对应的 `cqe` 中，该函数只用直接对 `cqe->user_data` 进行读取

## `io_uring_cqe_seen`

更新 `cq->khead`，避免当前 `cqe` 被重复获取

## `io_uring_queue_exit`

首先通过 `munmap` 将初始化时 `mmap` 的 `SQ`、`CQ` 以及 `SQEs` 解除映射，然后通过 `close` 关闭 `io_uring` 对应的 `fd`，`close` 会调用到该 `fd` 注册的 `io_uring_release` 来释放 `io_uring`

## 参考资料

- [【Kernel】io_uring IOSQE_IO_LINK](https://lore.kernel.org/linux-block/20190517214131.5925-1-axboe@kernel.dk/)
- [【个人博客】io_uring 的接口与实现](https://www.skyzh.dev/posts/articles/2021-06-14-deep-dive-io-uring/)

