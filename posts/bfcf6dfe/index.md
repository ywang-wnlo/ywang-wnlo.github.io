# FeelIt 主题的配置以及魔改记录


{{< admonition abstract >}}
本文主要记录了使用 Hugo 的 FeelIt 主题的配置过程，以及对主题的一些修改
{{< /admonition >}}

## 简介

Hugo 的主题虽然在 [官网](https://themes.gohugo.io/) 上看起来不少，但是大部分主题在 [GitHub](https://github.com/topics/hugo-theme) 上的活跃度和 Star 数量普遍都不高

经过一番挑选选择了 [FeelIt](https://github.com/khusika/FeelIt)，他是基于 [LoveIt](https://github.com/dillonzq/LoveIt) 主题的一个变体，LoveIt 主题的作者已经不再维护，而 FeelIt 主题的作者在 LoveIt 的基础上进行了一些改进，同时也还在维护中

## 安装

更换主题非常简单，只需要将主题的仓库克隆到 `themes` 目录下即可

为了后面自己修改主题方便，先在 GitHub 对原主题进行了 fork，然后再以 `submodule` 的方式添加到项目中，同时添加一个 `upstream` 的远程仓库，方便后面同步原主题的更新

```bash
# 添加主题
git submodule add git@github.com:ywang-wnlo/FeelIt.git
git submodule init
git submodule update

# 添加 upstream 远程仓库
cd themes/FeelIt
git remote add upstream https://github.com/khusika/FeelIt
```

为了方便配置主题的参数，可以将主题的配置文件复制到项目的根目录下

```bash
# 复制配置文件
cd hugo-blog
cp -r themes/FeelIt/exampleSite/hugo.toml .
```

主题的配置文件中有很多参数，并且有说明，可以根据自己的需要进行修改，这里就不一一介绍了，具体的可以参考 [官方教程](https://feelit.khusika.dev/theme-documentation-basics/)

## 删除每篇文章的作者信息

由于是个人博客，没有多作者的需求，而且作者头像是默认的 `fa-solid fa-user-circle fa-fw` 图标，不能自定义，所以个人直接选择删除每篇文章的作者信息，主要是修改了 `layouts/_default/summary.html` 以及 `layouts/posts/single.html`

```Diff
diff --git a/layouts/_default/summary.html b/layouts/_default/summary.html
index d782d495..c44ca583 100644
--- a/layouts/_default/summary.html
+++ b/layouts/_default/summary.html
@@ -26,15 +26,8 @@

     {{- /* Meta */ -}}
     <div class="post-meta">
-        {{- $author := $params.author | default .Site.Author.name | default (T "author") -}}
-        {{- $authorLink := $params.authorlink | default .Site.Author.link | default .Site.Home.RelPermalink -}}
-        <span class="post-author">
-            {{- $options := dict "Class" "author" "Destination" $authorLink "Title" "Author" "Rel" "author" "Icon" (dict "Class" "fa-solid fa-user-circle fa-fw") "Content" $author -}}
-            {{- partial "plugin/link.html" $options -}}
-        </span>
-
         {{- with .Site.Params.dateFormat | default "2006-01-02" | .PublishDate.Format -}}
-            &nbsp;<span class="post-publish">
+            <span class="post-publish">
                 {{- printf `<time datetime="%v">%v</time>` . . | dict "Date" | T "publishedOnDate" | safeHTML -}}
             </span>
         {{- end -}}

diff --git a/layouts/posts/single.html b/layouts/posts/single.html
index 1a6e66c9..07c34eba 100644
--- a/layouts/posts/single.html
+++ b/layouts/posts/single.html
@@ -43,20 +43,13 @@
             {{- /* Meta */ -}}
             <div class="post-meta">
                 <div class="post-meta-line">
-                    {{- $author := $params.author | default .Site.Author.name | default (T "author") -}}
-                    {{- $authorLink := $params.authorlink | default .Site.Author.link | default .Site.Home.RelPermalink -}}
-                    <span class="post-author">
-                        {{- $options := dict "Class" "author" "Destination" $authorLink "Title" "Author" "Rel" "author" "Icon" (dict "Class" "fa-solid fa-user-circle fa-fw") "Content" $author -}}
-                        {{- partial "plugin/link.html" $options -}}
-                    </span>
-
                     {{- $categories := slice -}}
                     {{- range .Params.categories -}}
                         {{- $category := partialCached "function/path.html" . . | printf "/categories/%v" | $.Site.GetPage -}}
                         {{- $categories = $categories | append (printf `<a href="%v"><i class="fa-regular fa-folder fa-fw"></i>%v</a>` $category.RelPermalink $category.Title) -}}
                     {{- end -}}
                     {{- with delimit $categories "&nbsp;" -}}
-                        &nbsp;<span class="post-category">
+                        <span class="post-category">
                             {{- dict "Categories" . | T "publishedInCategories" | safeHTML -}}
                         </span>
                     {{- end -}}
```

## 新增文章打赏以及版权说明

之前使用的 [NexT](https://theme-next.js.org) 的文章打赏以及版权说明感觉很好用，所以个人也想在这个主题中加入，具体的修改可以参考这个 [commit：新增文章打赏以及版权说明](https://github.com/ywang-wnlo/FeelIt/commit/8e09237e0f9e7b533dda6f3b8b27bade8ea9f15e)

```diff
diff --git a/assets/css/_custom.scss b/assets/css/_custom.scss
index 37edf904..539f920c 100644
--- a/assets/css/_custom.scss
+++ b/assets/css/_custom.scss
@@ -2,3 +2,90 @@
 // Custom style
 // 自定义样式
 // ==============================
+
+// reward
+article .reward-container {
+    margin: 1em 0 0;
+    padding: 1em 0;
+    text-align: center;
+    border-top: 1px solid #f0f0f0;
+
+    button {
+        margin: .5em;
+        background: transparent;
+        color: #fc6423;
+        cursor: pointer;
+        line-height: 2;
+        padding: 0 15px;
+        border: 2px solid #fc6423;
+        border-radius: 2px;
+        outline: 0;
+        transition: all 0.2s ease-in-out;
+        vertical-align: text-top;
+    }
+
+    button:hover {
+        color: #fefefe;
+        background-color: #fc6423;
+        transition: .5s
+    }
+
+    .post-reward {
+        display: none;
+        padding-top: 20px;
+
+        &.active {
+            display: block;
+        }
+
+        div {
+            display: inline-block;
+
+            span {
+            display: block;
+            }
+        }
+
+        img {
+            display: inline-block;
+            margin: .5em 2em 0;
+            max-width: 100%;
+            width: 180px;
+        }
+    }
+}
+
+// copyright
+article .post-copyright ul {
+    list-style: none;
+    overflow: hidden;
+    padding: 0.5em 1em;
+    position: relative;
+    border-left: 3px solid #ff2a2a;
+    margin: 1em 0 0;
+
+    background-color: rgba(#ddd, .2);
+
+    [theme=dark] & {
+        background-color: rgba(#666, .2);
+    }
+
+    a, a::before, a::after {
+        text-decoration: none;
+
+        color: $single-link-color;
+
+        [theme=dark] & {
+            color: $single-link-color-dark;
+        }
+    }
+
+    a:active,
+    a:hover {
+        color: $single-link-hover-color;
+
+        [theme=dark] & {
+            color: $single-link-hover-color-dark;
+        }
+    }
+}

diff --git a/layouts/partials/single/copyright.html b/layouts/partials/single/copyright.html
new file mode 100644
index 00000000..b5130edb
--- /dev/null
+++ b/layouts/partials/single/copyright.html
@@ -0,0 +1,20 @@
+{{- $params := .Scratch.Get "params" -}}
+
+{{ if or .Params.copyright (and .Site.Params.footer.copyright (ne .Params.copyright false)) -}}
+<div class="post-copyright">
+    <ul>
+        <li class="post-copyright-author">
+            <strong>本文作者：</strong>
+            {{ $params.author | default .Site.Author.name }}
+        </li>
+        <li class="post-copyright-link">
+            <strong>本文链接：</strong>
+            <a href="{{ .Permalink }}" title="{{ $params.title }}">{{ .Permalink }}</a>
+        </li>
+        <li class="post-copyright-license">
+            <strong>版权声明：</strong>
+            本博客所有文章除特别声明外，均采用 {{ .Site.Params.footer.license | safeHTML }} 许可协议。转载请注明出处！
+        </li>
+    </ul>
+</div>

diff --git a/layouts/partials/single/footer.html b/layouts/partials/single/footer.html
index 9f02be9b..d9abf429 100644
--- a/layouts/partials/single/footer.html
+++ b/layouts/partials/single/footer.html
@@ -1,6 +1,10 @@
 {{- $params := .Scratch.Get "params" -}}

 <div class="post-footer" id="post-footer">
+    {{- partial "single/reward.html" . -}}
+
+    {{- partial "single/copyright.html" . -}}
+
     <div class="post-info">
         {{- with .Params.tags -}}
         <div class="post-info-tag">

diff --git a/layouts/partials/single/reward.html b/layouts/partials/single/reward.html
new file mode 100644
index 00000000..84f25d39
--- /dev/null
+++ b/layouts/partials/single/reward.html
@@ -0,0 +1,34 @@
+{{- $params := .Scratch.Get "params" -}} {{ if or .Params.reward (and
+.Site.Params.footer.reward.enable (ne .Params.reward false)) -}}
+<div class="reward-container">
+    {{ $Reward := .Site.Params.footer.reward}}
+    <div>{{ $Reward.comment | default "请我一杯咖啡吧！" }}</div>
+    <button>{{ $Reward.donate | default "赞赏" }}</button>
+    <div class="post-reward">
+        {{ if $Reward.wechatpay -}}
+        <div>
+            {{ $WechatpayName := $Reward.wechatpayname | default "微信" }}
+            <img src="{{ $Reward.wechatpay }}" alt="{{ $WechatpayName }}" />
+            <span>{{ $WechatpayName }}</span>
+        </div>
+        {{- end }} {{ if $Reward.alipay -}}
+        <div>
+            {{ $AlipayName := $Reward.alipayname | default "支付宝" }}
+            <img src="{{ $Reward.alipay }}" alt="{{ $AlipayName }}" />
+            <span>{{ $AlipayName }}</span>
+        </div>
+        {{- end }}
+    </div>
+</div>
+
+<script type="text/javascript">
+    function registerPostReward() {
+        const button = document.querySelector(".reward-container button");
+        if (!button) return;
+        button.addEventListener("click", () => {
+            document.querySelector(".post-reward").classList.toggle("active");
+        });
+    }
+    registerPostReward();
+</script>
+{{- end }}
```

由于是个人自用，所以就直接写中文了，没有按照 `i18n` 的方式进行修改

## 文章内图片居中显示

默认情况下，图片是左对齐的，个人比较喜欢图片居中显示，所以个人选择修改了 `assets/css/_page/_single.scss` 中 `img` 的默认样式

```diff
    img {
+       display: block;
        max-width: 100%;
        min-height: 1em;
+       margin: 1em auto;
    }
```

## 修改页面以及 utterances 宽度

选择 FeelIt 的一个原因就是它相比 LoveIt 的文章页面更宽，这样看起来更舒服，但是有点过于宽了，好在自己调整也不难，直接在 `assets/css/_core/_media.scss` 中修改即可

```diff
    .single {
-       width: 70%;
+       width: 50%;
    }

    .archive {
-       width: 60%;
+       width: 50%;
    }
```

另外个人选择的评论系统是 `utterances`，其默认最大宽度是 `760px`，有点略窄，所以个人也对其进行了修改，直接在 `assets/css/_custom.scss` 中覆盖即可

```diff
+.utterances {
+    max-width: 95%;
+}
```

## 文章头部增加标签

个人比较喜欢文章头部有标签，所以个人选择在 `layouts/posts/single.html` 中增加了标签的显示

```diff
diff --git a/layouts/posts/single.html b/layouts/posts/single.html
index 07c34eba..dac28fdb 100644
--- a/layouts/posts/single.html
+++ b/layouts/posts/single.html
@@ -53,6 +53,15 @@
                             {{- dict "Categories" . | T "publishedInCategories" | safeHTML -}}
                         </span>
                     {{- end -}}
+                    {{- with .Params.tags -}}
+                    &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;{{ T "tags" }}:&nbsp;
+                    {{- range $index, $value := . -}}
+                        <span>
+                        {{- $tag := partialCached "function/path.html" $value $value | printf "/tags/%v" | $.Site.GetPage -}}
+                        <a href="{{ $tag.RelPermalink }}"><i class="fa fa-tag fa-fw"></i>{{ $tag.Title }}</a>&nbsp;
+                        </span>
+                    {{- end -}}
+                    {{- end -}}
                 </div>
                 <div class="post-meta-line">
                     {{- with .Site.Params.dateformat | default "2006-01-02" | .PublishDate.Format -}}
```

## 改用 `highlight.js`

Hugo 的默认语法高亮是使用的 `Chroma`，但是 `Chroma` 的语法高亮效果不是很好，而且 FeetIt 的代码配色也不太好看（尤其是 Diff），所以个人选择改用 `highlight.js`

{{< admonition failure "废弃方案" false >}}
~~首先在 `layouts/partials/assets.html` 添加 `hisghlight.js` 的样式和脚本，这里选了 `github-dark` 的样式~~

```diff
diff --git a/layouts/partials/assets.html b/layouts/partials/assets.html
index 15ae2653..da783b30 100644
--- a/layouts/partials/assets.html
+++ b/layouts/partials/assets.html
@@ -90,6 +90,12 @@
     {{- $config = T "copyToClipboard" | dict "copyTitle" | dict "code" | merge $config -}}
 {{- end -}}

+{{- /* highlight.js */ -}}
+{{- $source := "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/styles/github-dark.min.css" -}}
+{{- dict "Source" $source "Fingerprint" $fingerprint | dict "Scratch" .Scratch "Data" | partial "scratch/style.html" -}}
+{{- $source := "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/highlight.min.js" -}}
+{{- dict "Source" $source "Fingerprint" $fingerprint | dict "Scratch" .Scratch "Data" | partial "scratch/script.html" -}}
+
 {{- /* Sharer.js */ -}}
 {{- if $params.share.enable -}}
     {{- $source := $cdn.sharerJS | default "lib/sharer/sharer.min.js" -}}
```

{{< /admonition >}}

首先在主题配置里面添加 `hisghlight.js` 的样式和脚本，这里选了 `github-dark` 的样式

```toml
[params.page.library]
    [params.page.library.css]
        highlightCSS = "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/styles/github-dark.min.css"
    [params.page.library.js]
        highlightJS = "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/highlight.min.js"
```

然后还得在 `assets/js/theme.js` 中调用 `highlightAll` 方法

```diff
diff --git a/assets/js/theme.js b/assets/js/theme.js
index f57a8f11..1686f376 100644
--- a/assets/js/theme.js
+++ b/assets/js/theme.js
@@ -373,6 +373,7 @@ class Theme {
                 $chroma.insertBefore($header, $chroma.firstChild);
             }
         });
+        hljs.highlightAll();
     }

     initTable() {
```

为了保留主题的代码复制等功能，没有直接关闭 `Chroma`，所以还是会先加载 FeelIt 的配置，可能会闪烁一下才会加载 `highlight.js` 的配置，不过个人觉得影响不大，就没有再去管了

如有还有什么更优雅的方式，欢迎评论区指正~

## 文章底部增加相关推荐

相关推荐可以让读者更好的阅读，所以个人选择在文章底部增加相关推荐，正好学习了一下 Hugo 的语法

主要是根据相同标签的数量进行推荐，算法其实比较简单hhhhh

不过只按照标签数量进行排序的话，会导致每次生成的顺序都不一样，所以个人选择了按照标题先进行了一次排序

修改的方法和之前添加打赏以及版权说明的方法类似

```diff
diff --git a/layouts/partials/single/footer.html b/layouts/partials/single/footer.html
index 1b553dc5..77bca6b4 100644
--- a/layouts/partials/single/footer.html
+++ b/layouts/partials/single/footer.html
@@ -1,6 +1,8 @@
 {{- $params := .Scratch.Get "params" -}}

 <div class="post-footer" id="post-footer">
+    {{- partial "single/related.html" . -}}
+
     {{- partial "single/reward.html" . -}}

     {{- partial "single/copyright.html" . -}}

diff --git a/layouts/partials/single/related.html b/layouts/partials/single/related.html
new file mode 100644
index 00000000..d209e33a
--- /dev/null
+++ b/layouts/partials/single/related.html
@@ -0,0 +1,49 @@
+{{- $params := .Scratch.Get "params" -}}
+
+{{- $excludePageUrl := .RelPermalink -}}
+
+{{- $relatedposts := dict -}}
+
+{{- with .Params.tags }}
+    {{- range $value := . }}
+        {{- $curTag := (lower $value) }}
+        {{- if ne $curTag "todo" }}
+            {{- $posts := index $.Site.Taxonomies.tags $curTag }}
+            {{- if gt (len $posts.Pages) 1 }}
+                {{- range $posts.Pages }}
+                {{- if ne .RelPermalink $excludePageUrl }}
+                    {{- if not (isset $relatedposts .RelPermalink) }}
+                        {{- $relatedPoints := (len (intersect .Params.tags $.Params.tags)) }}
+                        {{- $dictValue := (dict "Title" .Title "Points" $relatedPoints "Tags" .Params.tags "Href" .RelPermalink ) }}
+                        {{- $relatedposts = $relatedposts | merge (dict .RelPermalink $dictValue) }}
+                    {{- end }}
+                {{- end }}
+                {{- end }}
+            {{- end }}
+        {{- end }}
+    {{- end }}
+{{ end }}
+
+{{- $relatedposts = (sort $relatedposts "Title" "desc") -}}
+{{- $relatedposts = (sort $relatedposts "Points" "desc") -}}
+
+{{- if gt (len $relatedposts) 0 }}
+<div class="related-posts">
+    <h2 id="related-posts-head">相关文章推荐</h2>
+    <ul>
+        {{- range $value := first 5 $relatedposts }}
+        <li class="related-post-item">
+            <a class="related-post-link" href="{{ $value.Href }}" title="{{ $value.Title }}">{{ $value.Title }}</a>&nbsp;&nbsp;
+            {{- range $tag := $value.Tags -}}
+            {{- $tag := partialCached "function/path.html" $tag $tag | printf "/tags/%v" | $.Site.GetPage -}}
+            {{ if in $.Params.tags $tag.Title }}
+            <a class="tag-same" href="{{ $tag.RelPermalink }}"><i class="fa fa-tag fa-fw"></i>{{ $tag.Title }}</a>&nbsp;
+            {{- else }}
+            <a class="tag-diff" href="{{ $tag.RelPermalink }}"><i class="fa fa-tag fa-fw"></i>{{ $tag.Title }}</a>&nbsp;
+            {{- end }}
+            {{- end }}
+        </li>
+        {{- end }}
+    </ul>
+</div>
+{{ end }}
```

`css` 样式改得不太好看，有兴趣的可以自己修改一下，具体的可以参考这个 [commit：文章底部增加相关推荐](https://github.com/ywang-wnlo/FeelIt/commit/4933bceb09358f9ac1ae249c78ebb34dae6be3ed)

## 参考资料

- [【GitHub】FeelIt](https://github.com/khusika/FeelIt)
- [【FeelIt】基础配置](https://feelit.khusika.dev/theme-documentation-basics/)
- [【个人博客】Hexo NexT 魔改系列之三 ── 评论篇](https://wangjiezhe.com/posts/2018-10-29-Hexo-NexT-3/#1-%E6%B7%BB%E5%8A%A0utterances%E8%AF%84%E8%AE%BA%E7%B3%BB%E7%BB%9F)
- [【个人博客】hugo 集成 Highlight.js](https://dawnarc.com/2018/01/hugo%E9%9B%86%E6%88%90highlight.js/)


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/bfcf6dfe/  

