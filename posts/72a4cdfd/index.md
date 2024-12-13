# Ubuntu 环境配置大合集


本文主要记录个人使用 Ubuntu 中遇到的各种琐碎问题的解决方法，以及环境配置

## 修改默认编辑器为 vim

一般 Ubuntu 的默认编辑器是 nano，用起来非常不顺手，可以通过下面命令修改

```bash
sudo update-alternatives --config editor
# 然后选择为 vim.basic 即可
```

## 解决报错 perl: warning: Setting locale failed

```bash
vim .bashrc
# vim .zshrc

# 新增以下内容
export LC_ALL=&#34;en_US.UTF-8&#34;
```

然后重新登录 shell 或者手动执行一下 `export LC_ALL=&#34;en_US.UTF-8&#34;`

然后再执行

```bash
sudo locale-gen en_US.UTF-8
sudo dpkg-reconfigure locales
# 配置过程中选择 en_US.UTF-8 一路确定即可
```

## 配置时区

Ubuntu 默认时间是 UTC 时间，可以通过修改时区来显示本地的时间

```bash
# 查看当前时区
timedatectl

# 不知道时区名可以通过 tzselect 获取
tzselect

# 配置当前时区为 Asia/Shanghai
sudo timedatectl set-timezone Asia/Shanghai
```

## 远程 VNC

- 服务器

```bash
# Ubuntu 22.04
sudo apt install tigervnc-standalone-server tigervnc-common

# 初次启动并配置
vncserver

# 关闭已开启的第一个实例
vncserver -kill :1

# 可能需要开启相应端口
sudo ufw allow 5901

# 取消只能本地连接的限制
vncserver -localhost no
```

- 客户端

在 Windows 直接下载 [VNC Viewer](https://www.realvnc.com/en/connect/download/viewer/) 配置好相应的 IP 以及端口即可

## 找不到库文件

有时候编译出来的程序会找不到库文件，形如 `error while loading shared libraries: xxx.so.x: cannot open shared object file: No such file or directory` 的错误，可以通过下面的方法解决

```bash
sudo ldconfig
```

之后再执行程序就可以了

## 参考资料

- [【man】update-alternatives](https://man7.org/linux/man-pages/man1/update-alternatives.1.html)
- [【stackoverflow】How to fix a locale setting warning from Perl](https://stackoverflow.com/questions/2499794/how-to-fix-a-locale-setting-warning-from-perl)
- [【linuxhint】timedatectl](https://linuxhint.com/how-to-use-timedatectl-ubuntu/)
- [【myfreax】如何在 Ubuntu 22.04 安装 VNC](https://www.myfreax.com/how-to-install-and-configure-vnc-on-ubuntu-22-04/)
- [【stackoverflow】Linux error while loading shared libraries: cannot open shared object file: No such file or directory](https://stackoverflow.com/questions/480764)


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/72a4cdfd/  

