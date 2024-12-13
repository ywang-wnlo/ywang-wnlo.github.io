# Hexo 插件推荐以及使用小技巧


[Hexo](https://hexo.io/zh-cn/) 是一个快速、简洁且高效的博客框架，个人只需用 Markdown 来写文档，并且拥有丰富的插件和主题。当前曾经博客就是使用 Hexo 配合 NexT 主题搭建的

因为笔者个人在 Windows 环境下写博客，后续命令均以 [PowerShell](https://docs.microsoft.com/zh-cn/powershell/scripting/install/installing-powershell?view=powershell-7.2) 为例

## 插件推荐

### [hexo-deployer-git](https://github.com/hexojs/hexo-deployer-git)

Hexo 支持一键部署网站到 git 仓库上，其他的一键部署方式参考 [官网介绍](https://hexo.io/zh-cn/docs/one-command-deployment)

- 安装

```ps
npm install hexo-deployer-git --save
```

- 配置

```yml
deploy:
  type: git
  repo: &lt;仓库链接&gt; # 可以是 https 链接也可以是 git 链接
  branch: [分支] # GitHub 的网站分支为 gh-pages，其他网站可能有所不同
  message: [message] # 默认是 Site updated: {{ now(&#39;YYYY-MM-DD HH:mm:ss&#39;) }}
```

默认的提交信息只有时间信息，没有过多的参考价值推荐使用自定义提交信息，具体参考 [后续小节](#自定义提交信息)

### [hexo-word-counter](https://github.com/next-theme/hexo-word-counter)

显示每篇文章的字数统计以及大致阅读时长，需要主题支持

- 安装

```ps
npm install hexo-word-counter --save
```

- 配置

```yml
# hexo-word-counter
## https://github.com/next-theme/hexo-word-counter
symbols_count_time:
  symbols: true
  time: true
  total_symbols: false
  total_time: false
  exclude_codeblock: false
  awl: 4
  wpm: 275
  suffix: &#34;mins.&#34;
```

具体配置可以参考官方给出的说明：

&gt; Note for Chinese users: because in Chinese language average word length about ~1.5 and if you at most cases write posts in Chinese (without mixed English), recommended to set awl to 2 and wpm to 300.
&gt; But if you usualy mix your posts with English, awl to 4 and wpm to 275 will be nice.

也就是说纯中文时推荐 `awl` 设为 2，`wpm` 设为 300；而中英文混合时推荐 `awl` 设为 4，`wpm` 设为 275

### [hexo-abbrlink](https://github.com/rozbo/hexo-abbrlink)

Hexo 默认的文章链接是以时间以及文件名命名的，如果文件名为中文时转译之后会很长，并且不美观。而该插件可以利用 hash 值替换原有的文章链接

- 安装

```ps
npm install hexo-abbrlink --save
```

- 配置

首先修改 `_config.yml` 文件中的 `permalink` 的配置

```yml
permalink: posts/:abbrlink.html
```

再增加以下配置

```yml
# abbrlink config
## https://github.com/rozbo/hexo-abbrlink
abbrlink:
  alg: crc32 # support crc16(default) and crc32
  rep: hex # support dec(default) and hex
  drafts: true # (true)Process draft,(false)Do not process draft. false(default)
  # Generate categories from directory-tree
  # depth: the max_depth of directory-tree you want to generate, should &gt; 0
  auto_category:
     enable: true # true(default)
     depth: 3 # 3(default)
     over_write: false
  auto_title: false # enable auto title, it can auto fill the title by path
  auto_date: false # enable auto date, it can auto fill the date by time today
  force: false # enable force mode, in this mode, the plugin will ignore the cache, and calc the abbrlink for every post even it already had abbrlink.
```

### [hexo-generator-sitemap](https://github.com/hexojs/hexo-generator-sitemap)

为了使博客能被谷歌、bing、百度收录，最好生成 `sitemap` 方便爬取，整体流程可以参考 [这篇博文](/posts/abac0c46/)

- 安装

```ps
npm install hexo-generator-sitemap --save
```

- 配置

```yml
# hexo-generator-sitemap
## https://github.com/hexojs/hexo-generator-sitemap
sitemap:
  path: sitemap.xml
  # template: ./sitemap_template.xml
  rel: true
  tags: false
  categories: false
```

## 小技巧

### 自定义提交信息

```ps
hexo deploy -m &#34;自定义提交信息&#34;
```

例如使用 `hexo` 仓库的提交信息来提交到 `deploy` 仓库

```ps
hexo deploy -m (git log -1 --pretty=format:%s)
```

如果中文乱码，可以参考 [这篇博客](https://blog.csdn.net/weixin_43426860/article/details/83348284) 修改 UTF-8 编码

## 参考资料

- [【Hexo】一键部署](https://hexo.io/zh-cn/docs/one-command-deployment)
- [【GitHub】hexo-deployer-git](https://github.com/hexojs/hexo-deployer-git)
- [【GitHub】hexo-word-counter](https://github.com/next-theme/hexo-word-counter)
- [【GitHub】hexo-abbrlink](https://github.com/rozbo/hexo-abbrlink)
- [【GitHub】hexo-generator-sitemap](https://github.com/hexojs/hexo-generator-sitemap)
- [【Git】git log 自定义输出格式](https://git-scm.com/docs/git-log#_pretty_formats)
- [【CSDN】解决 Windows PowerShell 乱码](https://blog.csdn.net/weixin_43426860/article/details/83348284)


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/4143201a/  

