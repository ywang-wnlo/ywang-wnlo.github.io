# 利用 RocksDB + ZenFS 测试 ZNS 的环境搭建和使用


本文主要记录自己在利用 [RocksDB](https://github.com/facebook/rocksdb) + [ZenFS](https://github.com/westerndigitalcorporation/zenfs) 测试 [ZNS](https://zonedstorage.io/docs/introduction/zns) 过程中遇到的一些问题以及相应的解决办法

## 配置 ZNS 环境

ZNS 全称 Zoned Namespaces，中文一般译为分区命名空间，当今最常见的 ZNS 设备类型是基于闪存的 SSD。但是 ZNS SSD 目前还没有在消费级市场出货，只能通过软件模拟来搭建环境

### 配置 FEMU

官网给了 [null_blk](https://zonedstorage.io/docs/getting-started/zbd-emulation#zoned-block-device-emulation-with-null_blk) 以及 [QEMU](https://zonedstorage.io/docs/getting-started/zbd-emulation#nvme-zoned-namespace-device-emulation-with-qemu) 的配置方法，但是个人对 [FEMU](https://github.com/vtess/FEMU) 比较熟悉，可以理解成 QEMU 的 fork，支持模拟固态盘内部固件逻辑，于是采用 FEMU 模拟 ZNS 搭建环境

FEMU 的环境搭建比较简单，参考其 [官方仓库 README](https://github.com/vtess/FEMU#installation) 操作即可

**容易踩坑：**但是需要注意 ZNS 对 Linux 内核版本有要求，**必须在 5.10 以上**，因此推荐安装 Ubuntu 22.04 LTS。
不建议手动更新内核，过程复杂耗时，而且（`sudo make headers_install` 安装内核用户头文件过程中）存在一定的风险性

### QEMU 制作和安装系统镜像

```bash
# 下载 Ubuntu 镜像
wget https://releases.ubuntu.com/22.04.1/ubuntu-22.04.1-live-server-amd64.iso

# 制作磁盘镜像
qemu-img create -f qcow2 u22s.qcow2 80G

# ubuntu 镜像挂在 cdrom 上启动
# 安装过程需要通过 vnc 连接操作，端口号 5901
qemu-system-x86_64 -m 2G -cdrom ubuntu-22.04.1-live-server-amd64.iso -hda u22s.qcow2 -boot d -vnc :1

# 安装完成后重启，再 vnc 连接一次，修改内核启动参数
qemu-system-x86_64 -m 2G -hda u22s.qcow2 -vnc :1
```

然后在虚拟内将内核启动时输出改为打印到串口

```bash
# 在虚拟机内
sudo vim /etc/default/grub
```

保证按照下面的配置

```ini
# 用于保证 grub 界面能输出到屏幕
#GRUB_TIMEOUT_STYLE=hidden
GRUB_TIMEOUT=3
GRUB_TERMINAL=serial

# 用于保证内核启动时能输出到屏幕
GRUB_CMDLINE_LINUX="ip=dhcp console=ttyS0,115200"

# (可选)屏蔽子菜单和 recovery 内核，方便快速切换内核
GRUB_DISABLE_SUBMENU=y
GRUB_DISABLE_RECOVERY="true"
```

然后更新重启即可

```bash
# 更新 grub
sudo update-grub
# sudo update-grub2
sudo poweroff
```

之后就可以不需要 vnc 连接了，可以加上 `-nographic` 使用了，例如

```bash
# 举例
qemu-system-x86_64 -enable-kvm -cpu host -smp=16 -m 4G -hda u22s.qcow2 -nographic
```

## 配置 RocksDB 环境

[RocksDB 官方仓库的 Wiki](https://github.com/facebook/rocksdb/blob/main/INSTALL.md) 有较为详细的安装指导

### 环境以及依赖安装

以 Ubuntu 为例：

**容易踩坑：**一定要记得按照顺序来，先安装好所有依赖再编译

```bash
# 基本的编译工具等不过多介绍
# sudo apt install build-essential
# sudo apt install pkg-config

# gflags
sudo apt install libgflags-dev

# 压缩库，选一个就行
sudo apt install libsnappy-dev
# sudo apt install zlib1g-dev
# sudo apt install libbz2-dev
# sudo apt install liblz4-dev
# sudo apt install libzstd-dev
```

### 编译 RocksDB 库以及测试工具

如果要在 ZNS 上测试，可以暂时跳过该小节，等配置好 ZenFS 后再进行

如果要用 YCSB 来测试，就需要编译 Java 版本的 jar 包，具体过程可以参考 [这篇博文](/posts/4bc1e607/)

用 `db_bench` 测试就直接 `make db_bench` 即可，可以加上 `DEBUG_LEVEL=0` 保证编译成 release 版本

```bash
# 编译测试工具
DEBUG_LEVEL=0 make -j db_bench

# 安装编译好的 RocksDB 库
sudo make install
```

**容易踩坑：**如果 `-j` 会全核一起编译，在核多内存少的情况下可能会报内存资源不足的错误，可以参考 [这篇博客](https://blog.csdn.net/weixin_44796670/article/details/121234446) 利用 swap “增加”可用内存大小，或者限制下编译的并发度，例如 `-j8`

利用 `db_bench` 测试可以参考 [官方测试](https://github.com/facebook/rocksdb/wiki/Performance-Benchmarks) 的方式，利用 [`benchmark.sh`](https://github.com/facebook/rocksdb/blob/main/tools/benchmark.sh) 来测试，当然也可以直接运行 `db_bench`

## 配置 ZenFS 环境

[ZenFS 官方仓库](https://github.com/westerndigitalcorporation/zenfs/blob/master/README.md)其实给了相应的指导，这里重新梳理下

### 安装 libzbd

```bash
# 安装编译工具
sudo apt install m4
sudo apt install autoconf
sudo apt install automake
sudo apt install libtool

# 拉取源码
# git clone https://github.com/westerndigitalcorporation/libzbd.git
git clone git@github.com:westerndigitalcorporation/libzbd.git

# 编译
cd libzbd
sh ./autogen.sh
./configure
make

# 安装
sudo make install
```

### ZenFS 插件编译

然后需要切换回 RocksDB 的目录，将 ZenFS 加入其中进行编译

```bash
# 拉取源码
# git clone https://github.com/facebook/rocksdb.git
# git clone git@github.com:facebook/rocksdb.git
cd rocksdb
# git clone https://github.com/westerndigitalcorporation/zenfs plugin/zenfs
git clone git@github.com:westerndigitalcorporation/zenfs plugin/zenfs

# 编译测试工具
DEBUG_LEVEL=0 ROCKSDB_PLUGINS=zenfs make -j db_bench

# 安装编译好的 RocksDB 库
sudo DEBUG_LEVEL=0 ROCKSDB_PLUGINS=zenfs make install

# 确保 RocksDB 库能被找到
sudo ldconfig

# 编译必要的 ZenFS 工具
cd plugin/zenfs/util
make -j
```

至此所有测试需要的环境已经基本搭建好了

## 测试

接下来简单介绍下测试过程，假设 ZNS 固态盘的设备名为 `nvme1n1`

### 利用 zenfs 的测试脚本测试

zenfs 内置了一个测试脚本，只需指定设备名。脚本会设置 IO 调度器，制作文件系统以及自动配置 RocksDB 参数，但是参数配置的不够合理，需要自行修改

```bash
cd rocksdb
sudo ./plugin/zenfs/tests/zenfs_base_performance.sh nvme1n1
```

该脚本会运行多个测试，而且每个测试会运行多个不同的 value 大小，运行时间较长，最后的测试结果汇总在 `results/zenfs-nvme1n1-baseline_performance` 目录下

### 直接 db_bench 测试

首先配置底层 IO 调度器为 `mq-deadline` 用户保持有序性（因为 ZNS 只支持追加写

```bash
echo mq-deadline | sudo tee /sys/block/nvme1n1/queue/scheduler
```

**容易踩坑：**利用 `zenfs` 创建 ZenFS 文件系统，其中 **`zbd` 后直接给出设备名**即可，不需要给出设备路径；而且需要指定 `aux_path` 用于存放 LOG 和 LOCK 文件，推荐放在非 ZNS 设备上，并且使用**绝对路径**

```bash
cd ~
mkdir zenfs-aux

cd rocksdb
sudo ./plugin/zenfs/util/zenfs mkfs --zbd=nvme1n1 --aux-path=/home/femu/zenfs-aux
```

制作好文件系统后，就可以用 `db_bench` 进行测试了

```bash
cd rocksdb
sudo ./db_bench --fs_uri=zenfs://dev:nvme1n1 --benchmarks=fillrandom --use_direct_io_for_flush_and_compaction
```

## 参考资料

- [【GitHub】RocksDB](https://github.com/facebook/rocksdb)
- [【GitHub】ZenFS](https://github.com/westerndigitalcorporation/zenfs)
- [【zonedstorage】ZNS](https://zonedstorage.io/docs/introduction/zns)
- [【GitHub】FEMU](https://github.com/vtess/FEMU)
- [【QEMU】QEMU User Documentation](https://www.qemu.org/docs/master/system/qemu-manpage.html)
- [【Wikibooks】QEMU/Images](https://en.wikibooks.org/wiki/QEMU/Images#Creating_an_image)
- [【QEMU】Direct Linux Boot](https://www.qemu.org/docs/master/system/linuxboot.html)
- [【ask ubuntu】How to get to the GRUB menu at boot-time using serial console?](https://askubuntu.com/questions/924913/how-to-get-to-the-grub-menu-at-boot-time-using-serial-console)
- [【CSDN】问题解决 C++: fatal error: Killed signal terminated program cc1plus](https://blog.csdn.net/weixin_44796670/article/details/121234446)
- [【GitHub】libzbd](https://github.com/westerndigitalcorporation/libzbd)


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/b8506868/  

