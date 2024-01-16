# FeelIt 主题的配置以及魔改记录


{{&lt; admonition warning &#34;写在最前&#34; &gt;}}
以下大部分修改在 [FixIt](https://github.com/hugo-fixit/FixIt) 主题中已经得到了解决，所以个人已经切换到了 FixIt 主题
{{&lt; /admonition &gt;}}

{{&lt; admonition abstract &gt;}}
本文主要记录了使用 Hugo 的 FeelIt 主题的配置过程，以及对主题的一些修改
{{&lt; /admonition &gt;}}

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
&#43;&#43;&#43; b/layouts/_default/summary.html
@@ -26,15 &#43;26,8 @@

     {{- /* Meta */ -}}
     &lt;div class=&#34;post-meta&#34;&gt;
-        {{- $author := $params.author | default .Site.Author.name | default (T &#34;author&#34;) -}}
-        {{- $authorLink := $params.authorlink | default .Site.Author.link | default .Site.Home.RelPermalink -}}
-        &lt;span class=&#34;post-author&#34;&gt;
-            {{- $options := dict &#34;Class&#34; &#34;author&#34; &#34;Destination&#34; $authorLink &#34;Title&#34; &#34;Author&#34; &#34;Rel&#34; &#34;author&#34; &#34;Icon&#34; (dict &#34;Class&#34; &#34;fa-solid fa-user-circle fa-fw&#34;) &#34;Content&#34; $author -}}
-            {{- partial &#34;plugin/link.html&#34; $options -}}
-        &lt;/span&gt;
-
         {{- with .Site.Params.dateFormat | default &#34;2006-01-02&#34; | .PublishDate.Format -}}
-            &amp;nbsp;&lt;span class=&#34;post-publish&#34;&gt;
&#43;            &lt;span class=&#34;post-publish&#34;&gt;
                 {{- printf `&lt;time datetime=&#34;%v&#34;&gt;%v&lt;/time&gt;` . . | dict &#34;Date&#34; | T &#34;publishedOnDate&#34; | safeHTML -}}
             &lt;/span&gt;
         {{- end -}}

diff --git a/layouts/posts/single.html b/layouts/posts/single.html
index 1a6e66c9..07c34eba 100644
--- a/layouts/posts/single.html
&#43;&#43;&#43; b/layouts/posts/single.html
@@ -43,20 &#43;43,13 @@
             {{- /* Meta */ -}}
             &lt;div class=&#34;post-meta&#34;&gt;
                 &lt;div class=&#34;post-meta-line&#34;&gt;
-                    {{- $author := $params.author | default .Site.Author.name | default (T &#34;author&#34;) -}}
-                    {{- $authorLink := $params.authorlink | default .Site.Author.link | default .Site.Home.RelPermalink -}}
-                    &lt;span class=&#34;post-author&#34;&gt;
-                        {{- $options := dict &#34;Class&#34; &#34;author&#34; &#34;Destination&#34; $authorLink &#34;Title&#34; &#34;Author&#34; &#34;Rel&#34; &#34;author&#34; &#34;Icon&#34; (dict &#34;Class&#34; &#34;fa-solid fa-user-circle fa-fw&#34;) &#34;Content&#34; $author -}}
-                        {{- partial &#34;plugin/link.html&#34; $options -}}
-                    &lt;/span&gt;
-
                     {{- $categories := slice -}}
                     {{- range .Params.categories -}}
                         {{- $category := partialCached &#34;function/path.html&#34; . . | printf &#34;/categories/%v&#34; | $.Site.GetPage -}}
                         {{- $categories = $categories | append (printf `&lt;a href=&#34;%v&#34;&gt;&lt;i class=&#34;fa-regular fa-folder fa-fw&#34;&gt;&lt;/i&gt;%v&lt;/a&gt;` $category.RelPermalink $category.Title) -}}
                     {{- end -}}
                     {{- with delimit $categories &#34;&amp;nbsp;&#34; -}}
-                        &amp;nbsp;&lt;span class=&#34;post-category&#34;&gt;
&#43;                        &lt;span class=&#34;post-category&#34;&gt;
                             {{- dict &#34;Categories&#34; . | T &#34;publishedInCategories&#34; | safeHTML -}}
                         &lt;/span&gt;
                     {{- end -}}
```

## 新增文章打赏以及版权说明

之前使用的 [NexT](https://theme-next.js.org) 的文章打赏以及版权说明感觉很好用，所以个人也想在这个主题中加入，具体的修改可以参考这个 [commit：新增文章打赏以及版权说明](https://github.com/ywang-wnlo/FeelIt/commit/8e09237e0f9e7b533dda6f3b8b27bade8ea9f15e)

```diff
diff --git a/assets/css/_custom.scss b/assets/css/_custom.scss
index 37edf904..539f920c 100644
--- a/assets/css/_custom.scss
&#43;&#43;&#43; b/assets/css/_custom.scss
@@ -2,3 &#43;2,90 @@
 // Custom style
 // 自定义样式
 // ==============================
&#43;
&#43;// reward
&#43;article .reward-container {
&#43;    margin: 1em 0 0;
&#43;    padding: 1em 0;
&#43;    text-align: center;
&#43;    border-top: 1px solid #f0f0f0;
&#43;
&#43;    button {
&#43;        margin: .5em;
&#43;        background: transparent;
&#43;        color: #fc6423;
&#43;        cursor: pointer;
&#43;        line-height: 2;
&#43;        padding: 0 15px;
&#43;        border: 2px solid #fc6423;
&#43;        border-radius: 2px;
&#43;        outline: 0;
&#43;        transition: all 0.2s ease-in-out;
&#43;        vertical-align: text-top;
&#43;    }
&#43;
&#43;    button:hover {
&#43;        color: #fefefe;
&#43;        background-color: #fc6423;
&#43;        transition: .5s
&#43;    }
&#43;
&#43;    .post-reward {
&#43;        display: none;
&#43;        padding-top: 20px;
&#43;
&#43;        &amp;.active {
&#43;            display: block;
&#43;        }
&#43;
&#43;        div {
&#43;            display: inline-block;
&#43;
&#43;            span {
&#43;            display: block;
&#43;            }
&#43;        }
&#43;
&#43;        img {
&#43;            display: inline-block;
&#43;            margin: .5em 2em 0;
&#43;            max-width: 100%;
&#43;            width: 180px;
&#43;        }
&#43;    }
&#43;}
&#43;
&#43;// copyright
&#43;article .post-copyright ul {
&#43;    list-style: none;
&#43;    overflow: hidden;
&#43;    padding: 0.5em 1em;
&#43;    position: relative;
&#43;    border-left: 3px solid #ff2a2a;
&#43;    margin: 1em 0 0;
&#43;
&#43;    background-color: rgba(#ddd, .2);
&#43;
&#43;    [theme=dark] &amp; {
&#43;        background-color: rgba(#666, .2);
&#43;    }
&#43;
&#43;    a, a::before, a::after {
&#43;        text-decoration: none;
&#43;
&#43;        color: $single-link-color;
&#43;
&#43;        [theme=dark] &amp; {
&#43;            color: $single-link-color-dark;
&#43;        }
&#43;    }
&#43;
&#43;    a:active,
&#43;    a:hover {
&#43;        color: $single-link-hover-color;
&#43;
&#43;        [theme=dark] &amp; {
&#43;            color: $single-link-hover-color-dark;
&#43;        }
&#43;    }
&#43;}

diff --git a/layouts/partials/single/copyright.html b/layouts/partials/single/copyright.html
new file mode 100644
index 00000000..b5130edb
--- /dev/null
&#43;&#43;&#43; b/layouts/partials/single/copyright.html
@@ -0,0 &#43;1,20 @@
&#43;{{- $params := .Scratch.Get &#34;params&#34; -}}
&#43;
&#43;{{ if or .Params.copyright (and .Site.Params.footer.copyright (ne .Params.copyright false)) -}}
&#43;&lt;div class=&#34;post-copyright&#34;&gt;
&#43;    &lt;ul&gt;
&#43;        &lt;li class=&#34;post-copyright-author&#34;&gt;
&#43;            &lt;strong&gt;本文作者：&lt;/strong&gt;
&#43;            {{ $params.author | default .Site.Author.name }}
&#43;        &lt;/li&gt;
&#43;        &lt;li class=&#34;post-copyright-link&#34;&gt;
&#43;            &lt;strong&gt;本文链接：&lt;/strong&gt;
&#43;            &lt;a href=&#34;{{ .Permalink }}&#34; title=&#34;{{ $params.title }}&#34;&gt;{{ .Permalink }}&lt;/a&gt;
&#43;        &lt;/li&gt;
&#43;        &lt;li class=&#34;post-copyright-license&#34;&gt;
&#43;            &lt;strong&gt;版权声明：&lt;/strong&gt;
&#43;            本博客所有文章除特别声明外，均采用 {{ .Site.Params.footer.license | safeHTML }} 许可协议。转载请注明出处！
&#43;        &lt;/li&gt;
&#43;    &lt;/ul&gt;
&#43;&lt;/div&gt;
&#43;{{- end }}

diff --git a/layouts/partials/single/footer.html b/layouts/partials/single/footer.html
index 9f02be9b..d9abf429 100644
--- a/layouts/partials/single/footer.html
&#43;&#43;&#43; b/layouts/partials/single/footer.html
@@ -1,6 &#43;1,10 @@
 {{- $params := .Scratch.Get &#34;params&#34; -}}

 &lt;div class=&#34;post-footer&#34; id=&#34;post-footer&#34;&gt;
&#43;    {{- partial &#34;single/reward.html&#34; . -}}
&#43;
&#43;    {{- partial &#34;single/copyright.html&#34; . -}}
&#43;
     &lt;div class=&#34;post-info&#34;&gt;
         {{- with .Params.tags -}}
         &lt;div class=&#34;post-info-tag&#34;&gt;

diff --git a/layouts/partials/single/reward.html b/layouts/partials/single/reward.html
new file mode 100644
index 00000000..84f25d39
--- /dev/null
&#43;&#43;&#43; b/layouts/partials/single/reward.html
@@ -0,0 &#43;1,34 @@
&#43;{{- $params := .Scratch.Get &#34;params&#34; -}} {{ if or .Params.reward (and
&#43;.Site.Params.footer.reward.enable (ne .Params.reward false)) -}}
&#43;&lt;div class=&#34;reward-container&#34;&gt;
&#43;    {{ $Reward := .Site.Params.footer.reward}}
&#43;    &lt;div&gt;{{ $Reward.comment | default &#34;请我一杯咖啡吧！&#34; }}&lt;/div&gt;
&#43;    &lt;button&gt;{{ $Reward.donate | default &#34;赞赏&#34; }}&lt;/button&gt;
&#43;    &lt;div class=&#34;post-reward&#34;&gt;
&#43;        {{ if $Reward.wechatpay -}}
&#43;        &lt;div&gt;
&#43;            {{ $WechatpayName := $Reward.wechatpayname | default &#34;微信&#34; }}
&#43;            &lt;img src=&#34;{{ $Reward.wechatpay }}&#34; alt=&#34;{{ $WechatpayName }}&#34; /&gt;
&#43;            &lt;span&gt;{{ $WechatpayName }}&lt;/span&gt;
&#43;        &lt;/div&gt;
&#43;        {{- end }} {{ if $Reward.alipay -}}
&#43;        &lt;div&gt;
&#43;            {{ $AlipayName := $Reward.alipayname | default &#34;支付宝&#34; }}
&#43;            &lt;img src=&#34;{{ $Reward.alipay }}&#34; alt=&#34;{{ $AlipayName }}&#34; /&gt;
&#43;            &lt;span&gt;{{ $AlipayName }}&lt;/span&gt;
&#43;        &lt;/div&gt;
&#43;        {{- end }}
&#43;    &lt;/div&gt;
&#43;&lt;/div&gt;
&#43;
&#43;&lt;script type=&#34;text/javascript&#34;&gt;
&#43;    function registerPostReward() {
&#43;        const button = document.querySelector(&#34;.reward-container button&#34;);
&#43;        if (!button) return;
&#43;        button.addEventListener(&#34;click&#34;, () =&gt; {
&#43;            document.querySelector(&#34;.post-reward&#34;).classList.toggle(&#34;active&#34;);
&#43;        });
&#43;    }
&#43;    registerPostReward();
&#43;&lt;/script&gt;
&#43;{{- end }}
```

由于是个人自用，所以就直接写中文了，没有按照 `i18n` 的方式进行修改

## 文章内图片居中显示

默认情况下，图片是左对齐的，个人比较喜欢图片居中显示，所以个人选择修改了 `assets/css/_page/_single.scss` 中 `img` 的默认样式

```diff
    img {
&#43;       display: block;
        max-width: 100%;
        min-height: 1em;
&#43;       margin: 1em auto;
    }
```

## 修改页面以及 utterances 宽度

选择 FeelIt 的一个原因就是它相比 LoveIt 的文章页面更宽，这样看起来更舒服，但是有点过于宽了，好在自己调整也不难，直接在 `assets/css/_core/_media.scss` 中修改即可

```diff
    .single {
-       width: 70%;
&#43;       width: 50%;
    }

    .archive {
-       width: 60%;
&#43;       width: 50%;
    }
```

另外个人选择的评论系统是 `utterances`，其默认最大宽度是 `760px`，有点略窄，所以个人也对其进行了修改，直接在 `assets/css/_custom.scss` 中覆盖即可

```diff
&#43;.utterances {
&#43;    max-width: 95%;
&#43;}
```

## 文章头部增加标签

个人比较喜欢文章头部有标签，所以个人选择在 `layouts/posts/single.html` 中增加了标签的显示

```diff
diff --git a/layouts/posts/single.html b/layouts/posts/single.html
index 07c34eba..dac28fdb 100644
--- a/layouts/posts/single.html
&#43;&#43;&#43; b/layouts/posts/single.html
@@ -53,6 &#43;53,15 @@
                             {{- dict &#34;Categories&#34; . | T &#34;publishedInCategories&#34; | safeHTML -}}
                         &lt;/span&gt;
                     {{- end -}}
&#43;                    {{- with .Params.tags -}}
&#43;                    &amp;nbsp;&amp;nbsp;&amp;nbsp;|&amp;nbsp;&amp;nbsp;&amp;nbsp;{{ T &#34;tags&#34; }}:&amp;nbsp;
&#43;                    {{- range $index, $value := . -}}
&#43;                        &lt;span&gt;
&#43;                        {{- $tag := partialCached &#34;function/path.html&#34; $value $value | printf &#34;/tags/%v&#34; | $.Site.GetPage -}}
&#43;                        &lt;a href=&#34;{{ $tag.RelPermalink }}&#34;&gt;&lt;i class=&#34;fa fa-tag fa-fw&#34;&gt;&lt;/i&gt;{{ $tag.Title }}&lt;/a&gt;&amp;nbsp;
&#43;                        &lt;/span&gt;
&#43;                    {{- end -}}
&#43;                    {{- end -}}
                 &lt;/div&gt;
                 &lt;div class=&#34;post-meta-line&#34;&gt;
                     {{- with .Site.Params.dateformat | default &#34;2006-01-02&#34; | .PublishDate.Format -}}
```

## 改用 `highlight.js`

Hugo 的默认语法高亮是使用的 `Chroma`，但是 `Chroma` 的语法高亮效果不是很好，而且 FeetIt 的代码配色也不太好看（尤其是 Diff），所以个人选择改用 `highlight.js`

{{&lt; admonition failure &#34;废弃方案&#34; false &gt;}}
~~首先在 `layouts/partials/assets.html` 添加 `hisghlight.js` 的样式和脚本，这里选了 `github-dark` 的样式~~

```diff
diff --git a/layouts/partials/assets.html b/layouts/partials/assets.html
index 15ae2653..da783b30 100644
--- a/layouts/partials/assets.html
&#43;&#43;&#43; b/layouts/partials/assets.html
@@ -90,6 &#43;90,12 @@
     {{- $config = T &#34;copyToClipboard&#34; | dict &#34;copyTitle&#34; | dict &#34;code&#34; | merge $config -}}
 {{- end -}}

&#43;{{- /* highlight.js */ -}}
&#43;{{- $source := &#34;https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/styles/github-dark.min.css&#34; -}}
&#43;{{- dict &#34;Source&#34; $source &#34;Fingerprint&#34; $fingerprint | dict &#34;Scratch&#34; .Scratch &#34;Data&#34; | partial &#34;scratch/style.html&#34; -}}
&#43;{{- $source := &#34;https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/highlight.min.js&#34; -}}
&#43;{{- dict &#34;Source&#34; $source &#34;Fingerprint&#34; $fingerprint | dict &#34;Scratch&#34; .Scratch &#34;Data&#34; | partial &#34;scratch/script.html&#34; -}}
&#43;
 {{- /* Sharer.js */ -}}
 {{- if $params.share.enable -}}
     {{- $source := $cdn.sharerJS | default &#34;lib/sharer/sharer.min.js&#34; -}}
```

{{&lt; /admonition &gt;}}

首先在主题配置里面添加 `hisghlight.js` 的样式和脚本，这里选了 `github-dark` 的样式

```toml
[params.page.library]
    [params.page.library.css]
        highlightCSS = &#34;https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/styles/github-dark.min.css&#34;
    [params.page.library.js]
        highlightJS = &#34;https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.8.0/build/highlight.min.js&#34;
```

然后还得在 `assets/js/theme.js` 中调用 `highlightAll` 方法

```diff
diff --git a/assets/js/theme.js b/assets/js/theme.js
index f57a8f11..1686f376 100644
--- a/assets/js/theme.js
&#43;&#43;&#43; b/assets/js/theme.js
@@ -373,6 &#43;373,7 @@ class Theme {
                 $chroma.insertBefore($header, $chroma.firstChild);
             }
         });
&#43;        hljs.highlightAll();
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
&#43;&#43;&#43; b/layouts/partials/single/footer.html
@@ -1,6 &#43;1,8 @@
 {{- $params := .Scratch.Get &#34;params&#34; -}}

 &lt;div class=&#34;post-footer&#34; id=&#34;post-footer&#34;&gt;
&#43;    {{- partial &#34;single/related.html&#34; . -}}
&#43;
     {{- partial &#34;single/reward.html&#34; . -}}

     {{- partial &#34;single/copyright.html&#34; . -}}

diff --git a/layouts/partials/single/related.html b/layouts/partials/single/related.html
new file mode 100644
index 00000000..d209e33a
--- /dev/null
&#43;&#43;&#43; b/layouts/partials/single/related.html
@@ -0,0 &#43;1,49 @@
&#43;{{- $params := .Scratch.Get &#34;params&#34; -}}
&#43;
&#43;{{- $excludePageUrl := .RelPermalink -}}
&#43;
&#43;{{- $relatedposts := dict -}}
&#43;
&#43;{{- with .Params.tags }}
&#43;    {{- range $value := . }}
&#43;        {{- $curTag := (lower $value) }}
&#43;        {{- if ne $curTag &#34;todo&#34; }}
&#43;            {{- $posts := index $.Site.Taxonomies.tags $curTag }}
&#43;            {{- if gt (len $posts.Pages) 1 }}
&#43;                {{- range $posts.Pages }}
&#43;                {{- if ne .RelPermalink $excludePageUrl }}
&#43;                    {{- if not (isset $relatedposts .RelPermalink) }}
&#43;                        {{- $relatedPoints := (len (intersect .Params.tags $.Params.tags)) }}
&#43;                        {{- $dictValue := (dict &#34;Title&#34; .Title &#34;Points&#34; $relatedPoints &#34;Tags&#34; .Params.tags &#34;Href&#34; .RelPermalink ) }}
&#43;                        {{- $relatedposts = $relatedposts | merge (dict .RelPermalink $dictValue) }}
&#43;                    {{- end }}
&#43;                {{- end }}
&#43;                {{- end }}
&#43;            {{- end }}
&#43;        {{- end }}
&#43;    {{- end }}
&#43;{{ end }}
&#43;
&#43;{{- $relatedposts = (sort $relatedposts &#34;Title&#34; &#34;desc&#34;) -}}
&#43;{{- $relatedposts = (sort $relatedposts &#34;Points&#34; &#34;desc&#34;) -}}
&#43;
&#43;{{- if gt (len $relatedposts) 0 }}
&#43;&lt;div class=&#34;related-posts&#34;&gt;
&#43;    &lt;h2 id=&#34;related-posts-head&#34;&gt;相关文章推荐&lt;/h2&gt;
&#43;    &lt;ul&gt;
&#43;        {{- range $value := first 5 $relatedposts }}
&#43;        &lt;li class=&#34;related-post-item&#34;&gt;
&#43;            &lt;a class=&#34;related-post-link&#34; href=&#34;{{ $value.Href }}&#34; title=&#34;{{ $value.Title }}&#34;&gt;{{ $value.Title }}&lt;/a&gt;&amp;nbsp;&amp;nbsp;
&#43;            {{- range $tag := $value.Tags -}}
&#43;            {{- $tag := partialCached &#34;function/path.html&#34; $tag $tag | printf &#34;/tags/%v&#34; | $.Site.GetPage -}}
&#43;            {{ if in $.Params.tags $tag.Title }}
&#43;            &lt;a class=&#34;tag-same&#34; href=&#34;{{ $tag.RelPermalink }}&#34;&gt;&lt;i class=&#34;fa fa-tag fa-fw&#34;&gt;&lt;/i&gt;{{ $tag.Title }}&lt;/a&gt;&amp;nbsp;
&#43;            {{- else }}
&#43;            &lt;a class=&#34;tag-diff&#34; href=&#34;{{ $tag.RelPermalink }}&#34;&gt;&lt;i class=&#34;fa fa-tag fa-fw&#34;&gt;&lt;/i&gt;{{ $tag.Title }}&lt;/a&gt;&amp;nbsp;
&#43;            {{- end }}
&#43;            {{- end }}
&#43;        &lt;/li&gt;
&#43;        {{- end }}
&#43;    &lt;/ul&gt;
&#43;&lt;/div&gt;
&#43;{{ end }}
```

`css` 样式改得不太好看，有兴趣的可以自己修改一下，具体的可以参考这个 [commit：文章底部增加相关推荐](https://github.com/ywang-wnlo/FeelIt/commit/4933bceb09358f9ac1ae249c78ebb34dae6be3ed)

## 参考资料

- [【GitHub】FixIt](https://github.com/hugo-fixit/FixIt)
- [【GitHub】FeelIt](https://github.com/khusika/FeelIt)
- [【FeelIt】基础配置](https://feelit.khusika.dev/theme-documentation-basics/)
- [【个人博客】Hexo NexT 魔改系列之三 ── 评论篇](https://wangjiezhe.com/posts/2018-10-29-Hexo-NexT-3/#1-%E6%B7%BB%E5%8A%A0utterances%E8%AF%84%E8%AE%BA%E7%B3%BB%E7%BB%9F)
- [【个人博客】hugo 集成 Highlight.js](https://dawnarc.com/2018/01/hugo%E9%9B%86%E6%88%90highlight.js/)


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/bfcf6dfe/  

