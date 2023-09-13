# OpenWrt 简介和安装


## 简介

### 来源

2002 年底 Linksys 公司推出 WRT-54G，采用了 Linux 取代了原来的 vXworks 系统。迫于 Linux 的开源协议要求，Linksys 开源了路由器的固件代码，后续逐渐发展成了 OpenWrt 这样一个项目
<!-- more -->

### 介绍

OpenWrt 是一个针对嵌入式设备（通常是路由器或者软路由）的 Linux 操作系统项目，提供了具有软件包管理功能的完全可写的文件系统，因此拥有了完全定制的能力，可以榨干设备的全部性能

## 安装

初次安装推荐在 [支持设备列表](https://openwrt.org/toh/start) 中找到对应设备所在的 [设备专属页面](https://openwrt.org/toh/start?datasrt=%5Edevice%20page)，然后根据页面介绍进行安装

### 一般安装流程

通常的安装步骤主要通过以下流程：

1. 获取原厂固件的 SSH 登录权限（可能是通过原厂固件漏洞等方式）
2. 在原厂固件上利用 `cat /proc/mtd` 获取 ROM 分区的布局
3. [可选] 备份原有的所有 ROM 分区数据
4. 利用 `mtd` 等命令直接对相应的 ROM 区域进行写入镜像
    - [可选] bootloader 镜像（设备运行的情况下，个人更倾向于刷入 [Breed](/posts/53d6c2d9/)）
    - kernel 镜像
    - rootfs 镜像
5. 重启设备

### 固件搜索下载

官网也对老手提供了快捷的 [固件搜索](https://firmware-selector.openwrt.org/) 页面，能够更加快捷的找到 ROM 镜像的下载界面

## 参考资料

- [【维基百科】OpenWrt](https://zh.wikipedia.org/wiki/OpenWrt)
- [【OpenWrt】官网](https://openwrt.org/)
- [【OpenWrt】支持设备列表](https://openwrt.org/toh/start)
- [【OpenWrt】固件搜索](https://firmware-selector.openwrt.org/)

