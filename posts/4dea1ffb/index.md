# 更换博客框架至 Hugo


{{< admonition abstract >}}
本文主要记录了自己迁移博客至 Hugo 的过程中遇到的问题，以及一些小技巧
{{< /admonition >}}

## 前言

由于 Hexo 的环境配置较为复杂，而且个人又有多个电脑写博客的需求。另外 Hexo 的实时预览不能满足个人的需求，此外还有其他小问题，所以决定迁移博客至 Hugo

以下是两个框架之间的简单对比，相同的部分就不列入对比了

|          |                Hexo                |                   Hugo                   |
| :------: | :--------------------------------: | :--------------------------------------: |
| 环境配置 |          nodejs，配置复杂          |         二进制文件，下载即可使用         |
|   主题   | 好看，并且一直在维护（例如：NexT） |   选择较少，并且大多过于简洁并停止维护   |
| 实时预览 |        主题修改需要重新编译        |           基本上都可以实时预览           |
|   文档   |                丰富                |                 相对较少                 |
| 图片路径 |  绝对路径，不能在 VSCode 实时预览  | 可以使用相对路径，方便在 VSCode 实时预览 |

## 安装 Hugo

Hugo 的 [官网文档](https://gohugo.io/documentation/) 虽然只有英文的，但是内容很全面

### 安装

#### Windows

可以直接下载 [二进制文件](https://github.com/gohugoio/hugo/releases/latest)，然后手动将其添加到环境变量中

或者直接借助 Windows 的包管理工具 Winget 安装，就不用管环境变量了

```bash
winget install Hugo.Hugo.Extended

# 更新
winget upgrade Hugo.Hugo.Extended
```

#### Linux

以 Ubuntu 为例，直接 `apt` 安装即可

```bash
sudo apt install hugo
```

### 快速上手

这里简单记录下部署的命令，具体的流程可以参考 [官方教程](https://gohugo.io/getting-started/quick-start/)

```bash
# 生成项目
hugo new site hugo-blog
cd hugo-blog
git init
git remote add origin xxx

# 以 FeelIt 主题为例
git submodule add git@github.com:khusika/FeelIt.git
git submodule init
git submodule update

# 覆盖配置文件
cp -r themes/FeelIt/exampleSite/hugo.toml .

# 生成空白文章
hugo new posts/Hello-World.md

# 本地预览
hugo server --disableFastRender
# 或者以 production 环境启动，方便调试评论系统等功能
hugo server --disableFastRender -e production

# 生成静态文件
hugo
```

## 迁移博文

接下来就是将 Hexo 的博文迁移到 Hugo 中，有几点要注意的

### Front matter

hugo 的 Front matter 的部分变量名和 Hexo 的不一样，需要做一些转换

例如：`update` --> `lastmod`

### 永久链接

之前 hexo 用 hexo-abbrlink 插件生成的永久链接，现在需要将其转换为 Hugo 的格式

首先要将每篇博客中的 `abbrlink` 修改为 `slug`，然后在 `hugo.toml` 中修改如下配置

```toml
[permalinks]
    posts = "/posts/:slug"
```

### 图片路径

之前 hexo 的图片是需要放在同名的文件夹内的，而且路径是绝对路径，这样在 VSCode 中实时预览不了

而 hugo 可以直接放在同一目录下，然后使用相对路径即可，不过此时 Markdown 文件名需要改为 `index.md`，例如下面这样

```bash
$ tree
.
├── Hexo
│   ├── Hexo.md
│   ├── NexT
│   │   ├── NexT_Schemes.png
│   │   ├── OAuth_APP_ID_Secrets.png
│   │   ├── OAuth_APP_Register.png
│   │   └── index.md
│   └── SEO
│       ├── bing_add_sitemap.png
│       ├── bing_add_website.png
│       ├── bing_verify_ownership.png
│       ├── google_add_sitemap.png
│       ├── google_add_website.png
│       ├── google_check_website.png
│       ├── google_manual_submit.png
│       ├── google_site.png
│       ├── google_verify_ownership_1.png
│       ├── google_verify_ownership_2.png
│       └── index.md
└── Hugo.md

3 directories, 17 files
```

## 发布博客

{{< admonition >}}
在发布之前需要将之前 hexo 占用的 `gh-pages` 分支名改掉，例如改为 `hexo`

然后新建一个分支，例如 `gh-pages`，然后重新将 `gh-pages` 的分支设置为 GitHub Pages 的分支
{{< /admonition >}}

接下来发布就比较简单了，个人选择手动 `git push` publish 文件夹到 GitHub 的对应仓库即可

```bash
cd public
git init
git remote add origin xxx
git checkout -b gh-pages

git add .
git commit -m "first publish"
git push -u origin gh-pages
```

## 加快部署

{{< admonition tip >}}
GitHub Pages 的部署会尝试用 Jekyll 编译，但是 Hugo 的博客是不需要编译的，所以可以在仓库的根目录下添加一个 `.nojekyll` 文件，这样就可以加快部署速度
{{< /admonition >}}

## 参考资料

- [【Hugo】官方文档](https://gohugo.io/documentation/)
- [【个人博客】Hugo 系列(4) - 从 Hexo 迁移至 Hugo 以及使用 LoveIt 主题的踩坑记录](https://lewky.cn/posts/hugo-4.html/#hugo%E6%97%A0%E6%B3%95%E4%BD%BF%E7%94%A8abbrlink%E5%AF%BC%E8%87%B4%E7%9A%84url%E4%B8%8E%E5%8E%9F%E6%9C%AChexo%E7%9A%84url%E4%B8%8D%E5%90%8C%E6%AD%A5)

