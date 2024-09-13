# 修复 Chrome 打不开微信或者部分第三方应用内链接


最近电脑有个问题持续了好久：**当默认浏览器设置为 chrome 时，并且 chrome 已经打开的情况下**，在微信内通过默认浏览器打开总是没有反应
~~（如果 chrome 没有打开时，则会正常跳出 chrome 以及相应的网页，好气哦）~~

![微信-用默认浏览器打开](wechat_default_browser.png &#34;微信-用默认浏览器打开&#34;)

## 修复问题：卸载 KGChromePlugin

经过各种查询资料，最后发现原因是 chrome 的启动参数被 KGChromePlugin 金格插件篡改了，从而导致部分第三方应用（实测，微信、vscode、cmd 都不行，但是 QQ 可以）无法调用 chrome 打开超链接

1. 可通过 chrome://version/ 查看命令行中是否含有 `--register-pepper-plugins=XXX`

    ![被篡改的 Chrome 启动命令行](chrome_version_before.png &#34;被篡改的 Chrome 启动命令行&#34;)

2. 根据 XXX 中的路径信息，找到 KGChromePlugin 所在的文件路径，通常是 `C:\Program Files (x86)\KGChromePlugin`，然后在文件夹中找到卸载程序 `KGPMUninstall.exe`，双击进行卸载即可

3. 卸载之后，重启一下 chrome，命令行应该就恢复正常了，此时也能在已打开 chrome 的情况下在第三方应用中顺利打开超链接了

    ![卸载干净之后的 Chrome 启动命令行](chrome_version_after.png &#34;卸载干净之后的 Chrome 启动命令行&#34;)

## 参考资料

- [【知乎】chrome 浏览器 每次打开提示：“--no-sandbox.” 怎么去除？](https://www.zhihu.com/question/367848804)


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/29e0b18c/  

