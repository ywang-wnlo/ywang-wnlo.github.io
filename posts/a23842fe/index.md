# 解决 kex_exchange_identification 报错


## 踩坑

最近在使用 `git` 时，发现 `git pull` 时经常会出现下面的报错 `kex_exchange_identification: Connection closed by remote host`，导致无法正常拉取代码

```bash
$ git pull
kex_exchange_identification: Connection closed by remote host
Connection closed by 192.30.255.113 port 22
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

## 原因分析

和之前的 [解决 pip 安装第三方包时因 SSL 报错](/posts/2e7aa01a/) 原因类似，都是因为网络代理导致的

主要是代理服务商为了安全考虑，避免被人当作跳板，会主动拒绝 22 端口的连接，导致无法正常连接到 Github 的服务器

## 解决办法

知道原因之后，解决办法就很简单了，主要有三种

### 1. 临时关闭代理

虽然关闭代理最简单，但是可能会导致下载速度过慢

### 2. 修改代理软件配置，22 端口走直连

最安全的办法是修改代理软件的配置，将 22 端口走直连，不同的代理软件配置方式不同，这里就不详细介绍了

### 3. 改用 HTTPS 协议，走 443 端口

个人最推荐的办法是改用 HTTPS 协议，走 443 端口，因为这样不仅可以解决上面的问题，还可以通过代理提高下载速度

这里主要参考了 [Github 官方的教程](https://docs.github.com/zh/authentication/troubleshooting-ssh/using-ssh-over-the-https-port)

在 `~/.ssh/config` 文件中添加下面的配置即可，之后就可以正常使用 `git pull` 等操作了

```bash
Host github.com
    Hostname ssh.github.com
    Port 443
    User git
```

## 参考资料

- [【Github】开启OpenClash之后，无法使用 git clone/push，kex ssh 密钥错误](https://github.com/vernesong/OpenClash/issues/1960)
- [【Github】在 HTTPS 端口使用 SSH](https://docs.github.com/zh/authentication/troubleshooting-ssh/using-ssh-over-the-https-port)


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/a23842fe/  

