# 电信光猫中兴 F7010C 折腾记录


## 问题描述

近期家里更新了千兆宽带，电信光猫换成了中兴 F7010C，默认光猫拨号，安装人员不给改桥接，而且路由器还获取不到 IPv6 地址

尝试过对路由器的 IPv6 进行配置，但是发现无论怎么配置，都无法获取到 IPv6 地址，并且也尝试了设备直连光猫，也无法获取到 IPv6 地址，因此怀疑是光猫的问题，所以才有了这一段折腾

主要参考了网上的一些资料，个人根据自己的情况和理解做了一些修改

## 解锁超管密码

网上给出的解锁 F7010C 的解锁方式都是通过对电信的官方 APP《小翼管家》进行抓包，然后借助抓包软件的断点和重写功能，来修改请求的内容，从而获取超管密码

### 前言

现在对安卓的 APP 进行抓包，其实还是比较困难的。
首先当前的网络包基本都是 HTTPS 加密的，为了能够抓到 HTTPS 的包，需要通过中间人攻击的方式来查看 HTTPS 的明文内容

当客户端与抓包软件的代理服务器进行通信时，抓包软件需要重签远程服务器的 SSL 证书。
为了保证客户端与抓包软件成功进行 SSL 握手通信，需要将抓包软件的 CA 根证书安装到客户端本地的证书管理中心

但是安卓 7.0 之后，由于 Google 的安全策略，用户自行安装的用户证书不再被信任，因此需要进行额外的配置

### 配置安卓抓包环境

由于自行安装的用户证书不再被信任，但是系统证书还是可以被信任的，因此需要将抓包软件的 CA 根证书导入到系统证书中

但是系统证书通常在 `/system` 目录下，而 `/system` 目录是只读的，因此需要先将 `/system` 目录挂载为可读写的目录，然后再将证书导入到系统证书中

这意味着需要 root 权限，所以个人改用安卓模拟器来进行抓包。
安装模拟器的过程就不再赘述了，个人选择了 MuMu 模拟器

首先在设置中开启 root 权限和 system 读写权限

![开启 root 权限](./MuMu-开启root权限.png &#34;开启 root 权限&#34;)

![开启 system 读写权限](./MuMu-开启system读写权限.png &#34;开启 system 读写权限&#34;)

抓包工具选择了 [Reqable](https://reqable.com/zh-CN/)，这是一款国人开发的抓包工具，有中文界面，并且支持断点和重写功能，而且免费的社区版功能也足够使用了

安装证书的方式，Reqable 给了非常详细的图文教程，主要的不同在于需要对 `/system` 重新挂载，然后再通过 `adb` 将证书导入到系统证书中

```powershell
# 下载证书 reqable-ca.crt

# 通过 adb 连接模拟器，端口号可以在模拟器的【问题诊断】中查看
adb connect 127.0.0.1:xxxxx

adb shell
# 切换到 root 用户，注意需要在模拟器中确认
su
# 重新挂载 /system 目录
mount -o remount,rw /system
# 退出 root 用户
exit
# 退出 adb shell
exit

# 将证书导入到系统证书中
adb push reqable-ca.crt /system/etc/security/cacerts/xxxxx.0
```

### 抓包获取超管密码

配置好 CA 证书之后，就可以开始尝试抓包了，流程如下：

1. 先打开《小翼管家》APP，绑定好电信光猫，先点进去【网关设置】界面
   ![小翼管家-网关设置](./小翼管家-网关设置.jpg &#34;小翼管家-网关设置&#34;)

2. 配置 WiFi 的代理后，在抓包软件中启动抓包，然后在《小翼管家》中切换【指示灯】

3. 查看抓到的包中，找到形如 `https://xxxx.189cube.com/device/api?token=xxxx` 的请求，并配置断点
   ![Reqable-找请求](./Reqable-找请求.png &#34;Reqable-找请求&#34;)
   ![Reqable-配置断点](./Reqable-配置断点.png &#34;Reqable-配置断点&#34;)

4. 再次切换【指示灯】，请求就会在断点停下，复制下面的请求内容，并执行（如果手速慢了，可能会导致请求超时，再次切换【指示灯】即可）
   ![Reqable-替换请求内容](./Reqable-替换请求内容.png &#34;Reqable-替换请求内容&#34;)

   ```json
   {
      &#34;Params&#34;: [],
      &#34;MethodName&#34;: &#34;GetTAPasswd&#34;,
      &#34;RPCMethod&#34;: &#34;CallMethod&#34;,
      &#34;ObjectPath&#34;: &#34;/com/ctc/igd1/Telecom/System&#34;,
      &#34;InterfaceName&#34;: &#34;com.ctc.igd1.SysCmd&#34;,
      &#34;ServiceName&#34;: &#34;com.ctc.igd1&#34;
   }
   ```

5. 查看返回的结果，其中一段看似随机的字符串就是超管密码
   ![Reqable-获取超管密码](./Reqable-获取超管密码.png &#34;Reqable-获取超管密码&#34;)

## IPv6 配置

由于设备直连都无法获取 IPv6 地址，但是光猫自身又有 IPv6 地址，并且可以访问 IPv6 网络，因此怀疑是光猫的 IPv6 分配有问题

### 光猫拨号

在【网络-网络设置-网络连接】中没有做任何修改，维持了光猫拨号的方案，如图

![光猫-网络-网络设置-网络连接](./光猫-网络-网络设置-网络连接.png &#34;光猫-网络-网络设置-网络连接&#34;)

```yaml
IP模式: IPv4&amp;IPv6

IPv6信息: 
   地址获取方式: AutoConfigured
   获取前缀: √
   前缀获取方式: PrefixDelegation
   DNS获取方式: DHCPv6
```

### 改用 SLAAC

在【网络-用户侧管理-IPv6设置】中，关闭 DHCPv6，改用 SLAAC 方式，如图

![光猫-网络-用户侧管理-IPv6设置](./光猫-网络-用户侧管理-IPv6设置.png &#34;光猫-网络-用户侧管理-IPv6设置&#34;)

```yaml
启动DHCPv6服务器: X

slaac前缀使能: √
```

二者都是 IPv6 网络中用于为主机分配 IPv6 地址的协议，但它们的工作方式、类型和功能略有不同。具体差别就不再赘述了，可以参考 [slaac vs dhcpv6](https://juejin.cn/s/slaac%20vs%20dhcpv6)

### 路由器配置

路由器型号还是之前的红米 AC2100，不过刷了 ImmortalWrt 的最新版（23.05.1），仅作参考
#### wan6 配置

首先要在配置下 wan6 接口，没有的话就添加一个，如图

![ImmortalWRT-接口-wan6-常规](./ImmortalWRT-接口-wan6-常规.png &#34;ImmortalWRT-接口-wan6-常规&#34;)

```yaml
接口: wan6
协议: DHCPv6 客户端
设备: wan
```

【高级设置】中，保持默认配置

![ImmortalWRT-接口-wan6-高级](./ImmortalWRT-接口-wan6-高级.png &#34;ImmortalWRT-接口-wan6-高级&#34;)

```yaml
委托 IPv6 前缀: √
IPv6 分配长度: 已禁用
```

【防火墙设置】选择和 wan 接口一样的防火墙，如图

![ImmortalWRT-接口-wan6-防火墙](./ImmortalWRT-接口-wan6-防火墙.png &#34;ImmortalWRT-接口-wan6-防火墙&#34;)

【DHCP 服务器】中，默认关闭

![ImmortalWRT-接口-wan6 - DHCP](./ImmortalWRT-接口-wan6-DHCP.png &#34;ImmortalWRT-接口-wan6-DHCP&#34;)

#### wan 配置

wan 接口的【高级设置】中，保持默认配置

![ImmortalWRT-接口-wan-高级](./ImmortalWRT-接口-wan-高级.png &#34;ImmortalWRT-接口-wan-高级&#34;)

```yaml
委托 IPv6 前缀: √
IPv6 分配长度: 已禁用
```

【DHCP 服务器 - 常规设置】选中 `忽略此接口`

![ImmortalWRT-接口-wan - DHCP-常规](./ImmortalWRT-接口-wan-DHCP-常规.png &#34;ImmortalWRT-接口-wan-DHCP-常规&#34;)

【DHCP 服务器 - IPv6 设置】中，勾上 `指定的主接口`，并且全部选择 `中继模式`

![ImmortalWRT-接口-wan - DHCP - IPv6](./ImmortalWRT-接口-wan-DHCP-IPv6.png &#34;ImmortalWRT-接口-wan-DHCP-IPv6&#34;)

#### lan 配置

最后在 lan 接口的【DHCP 服务器 - IPv6 设置】中，也全部选择 `中继模式`，就完事了，之后重启路由器就 ok 了

![ImmortalWRT-接口-lan - DHCP - IPv6](./ImmortalWRT-接口-lan-DHCP-IPv6.png &#34;ImmortalWRT-接口-lan-DHCP-IPv6&#34;)

## 验证

可以在下面的网站中验证 IPv6 是否配置成功

- [IP查询](https://ipw.cn/)
- [IPv6 连接测试](http://test-ipv6.com/)

## 参考资料

- [【个人博客】破解天翼网关4.0 ZXHN F7010C超级管理员密码](https://blog.bbskali.cn/3644.html)
- [【个人博客】使用Fiddler抓包软件获取电信天翼网关4.0超级管理员密码的方法](https://www.dledu.cn/340.html)
- [【MuMu 模拟器】MuMu模拟器X版本如何安装证书？](https://mumu.163.com/help/20221018/35047_1047210.html)
- [【MuMu 模拟器】MuMu模拟器12如何连接adb？](https://mumu.163.com/help/20230214/35047_1073151.html)
- [【掘金】slaac vs dhcpv6](https://juejin.cn/s/slaac%20vs%20dhcpv6)
- [【CSDN】OpenWrt IPv6配置](https://blog.csdn.net/Cx2008Lxl/article/details/127483568)


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/6f8b7b82/  

