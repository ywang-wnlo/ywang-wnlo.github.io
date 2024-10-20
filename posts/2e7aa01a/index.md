# 解决 Pip 安装第三方包时因 SSL 报错


## 踩坑

好久没用 `python`，最近重新下载安装好 `python` 后发现用 `pip` 安装第三方包一直失败。经过一番折腾发现，如果报错信息符合下面两种，一般都是因为网络连接时 SSL 认证失败导致的

1. check_hostname requires server_hostname

    &gt; `raise ValueError(&#34;check_hostname requires server_hostname&#34;)`
    &gt; `ValueError: check_hostname requires server_hostname`

2. EOF occurred in violation of protocol

    &gt; `Could not fetch URL https://pypi.org/simple/xxx/: There was a problem confirming the ssl certificate: HTTPSConnectionPool(host=&#39;pypi.org&#39;, port=443): Max retries exceeded with url: /simple/xxx/ (Caused by SSLError(SSLEOFError(8, &#39;EOF occurred in violation of protocol (_ssl.c:997)&#39;))) - skipping`

## 什么是 SSL ？

传输层安全性协议（英语：Transport Layer Security，TLS）及其前身安全套接层（英语：Secure Sockets Layer，SSL）是现在的 HTTPS 协议中的一种安全协议，目的是为互联网通信提供安全及数据完整性保障

而较新版本的 `python` 内置的 `pip` 以及用于网络请求的 `requests`、`urllib3` 包也较新，并且会使用 HTTPS 协议来下载新的软件包

## 为什么会报错

根据报错信息可以发现错误的根源就在于 SSL，也就是没有通过该安全协议的认证，通常是由于开启了网络代理、VPN 或者网络抓包等软件的导致的

## 解决办法

### 1. 临时关闭代理、VPN 或者网络抓包等软件

最推荐的办法是临时关闭代理、VPN 或者网络抓包等软件，但是如果关闭后下载速度过慢可以尝试后面两种解决办法

### 2. 通过镜像的 HTTP 源来避免 SSL 认证问题

由于是 SSL 是 HTTPS 协议需要的，因此我们可以切换至 HTTP 的镜像站来进行安装下载

HTTPS 现在已经比较普及，有不少镜像源也早已经切换至 HTTPS 协议，但部分镜像源在支持 HTTPS 协议的而同时也还支持 HTTP 协议，下面简单罗列几个 `pip` 镜像源

```bash
# 清华，仅支持 HTTPS
https://pypi.tuna.tsinghua.edu.cn/simple/

# 阿里，HTTP 和 HTTPS 均支持
http://mirrors.aliyun.com/pypi/simple/
https://mirrors.aliyun.com/pypi/simple/

# 豆瓣，HTTP 和 HTTPS 均支持
http://pypi.doubanio.com/simple/
https://pypi.doubanio.com/simple/
```

安装时第三方包时可以参考如下命令：

```bash
pip install xxx-package -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com
pip install xxx-package -i http://pypi.doubanio.com/simple/ --trusted-host pypi.doubanio.com
```

如果想永久使用镜像站，则需要修改配置文件，以 Linux 为例：

```bash
vim ~/.pip/pip.conf
```

修改文件内容如下

```ini
[global]
index-url = http://mirrors.aliyun.com/pypi/simple/

[install]
trusted-host = mirrors.aliyun.com
```

### 3. 切换至低版本 `pip`

经过测试，当 `pip` 版本高于 [20.3](https://pypi.org/project/pip/20.3/#history) 后才会出现此错误，因此我们可以手动将 pip 版本降级至 `20.2.4` 或者 `20.3b1` 等较低版本即可

```bash
python -m pip install pip==20.2.4 -i http://mirrors.aliyun.com/pypi/simple/ --trusted-host mirrors.aliyun.com
python -m pip install pip==20.2.4 -i http://pypi.doubanio.com/simple/ --trusted-host pypi.doubanio.com
```

## 参考资料

- [【阿里云】PyPI 镜像](https://developer.aliyun.com/mirror/pypi)
- [【CSDN】python pip 的安装、更新、卸载、降级、和使用 pip 管理包](https://blog.csdn.net/tz_zs/article/details/87939977)
- [【CSDN】修改 pip 配置文件路径、更改 pip 源、使用 pip 安装已经下载的 whl 文件](https://blog.csdn.net/ykun089/article/details/106057952)


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/2e7aa01a/  

