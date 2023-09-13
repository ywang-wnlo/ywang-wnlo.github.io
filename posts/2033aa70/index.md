# LaTeX 语法


中文支持参考环境配置中的 [内容](/posts/4f94956/#中文支持)，在这里不做重复
<!-- more -->

## 长度

常用的长度单位

| 单位 | 含义                  | 换算成 pt | 换成算成 mm |
| ---- | --------------------- | --------- | ----------- |
| pt   | 基本单位              | 1 pt      | 0.35146 mm  |
| mm   | 毫米                  | 2.84 pt   | 1 mm        |
| cm   | 厘米                  | 28.4 pt   | 10 mm       |
| in   | 英寸                  | 72.27 pt  | 0.35146 mm  |
| ex   | 当前字体的 x 字母高度 | -         | -           |
| em   | 当前字体的 m 字母宽度 | -         | -           |

## 空行

```tex
\vspace{length}
```

## 空格

```tex
\hspace{length}
```

## 超链接

```tex
% 开启链接颜色配置，并配置为蓝色
\usepackage[colorlinks=true, allcolors=blue]{hyperref}

\url{https://ywang-wnlo.github.io/posts/2033aa70.html}
\href{https://ywang-wnlo.github.io/posts/2033aa70.html}{LaTeX 语法}
```

## 数学公式

### 段落中（隐式）

三种均可，任意选择，以 E=mc<sup>2</sup> 为例

```tex
\(E=mc^2\)
$E=mc^2$
\begin{math}E=mc^2\end{math}
```

### 单独成段（显式）

三种均可，任意选择

```tex
\[E=mc^2\]
\begin{displaymath}E=mc^2\end{displaymath}
\begin{equation}E=mc^2\end{equation}
```

## 居中，左对齐，右对齐

### 居中

```tex
\begin{center}
  balabala
\end{center}
```

### 左对齐

```tex
\begin{flushleft}
  balabala
\end{flushleft}
```

### 右对齐

```tex
\begin{flushright}
  balabala
\end{flushright}
```

## 参考文献配置

```tex
\bibliographystyle{stylename}
\bibliography{bibfile}
```

其中 `bibfile` 为 `.bib` 文件的名，而 `stylename` 是风格名称，以 overleaf 为例，有如下选项

| stylename | output |
| ---- | --- |
| abbrc | ![BibtexStylesAbbrc](/posts/2033aa70/BibtexStylesAbbrc.png) |
| acm | ![BibtexStylesAcm](/posts/2033aa70/BibtexStylesAcm.png) |
| alpha | ![BibtexStylesAlpha](/posts/2033aa70/BibtexStylesAlpha.png) |
| apalike | ![BibtexStylesApalike](/posts/2033aa70/BibtexStylesApalike.png) |
| ieeetr | ![BibtexStylesIeeetr](/posts/2033aa70/BibtexStylesIeeetr.png) |
| plain | ![BibtexStylesPlain](/posts/2033aa70/BibtexStylesPlain.png) |
| siam | ![BibtexStylesSiam](/posts/2033aa70/BibtexStylesSiam.png) |
| unsrt | ![BibtexStylesUnsrt](/posts/2033aa70/BibtexStylesUnsrt.png) |

## TODO

## 参考资料

- [【维基百科】LaTeX Lengths](https://en.wikibooks.org/wiki/LaTeX/Lengths)
- [【维基百科】LaTeX Hyperlinks](https://en.wikibooks.org/wiki/LaTeX/Hyperlinks)
- [【overleaf】Mathematical expressions](https://www.overleaf.com/learn/latex/Mathematical_expressions)
- [【overleaf】Bibtex bibliography styles](https://www.overleaf.com/learn/latex/Bibtex_bibliography_styles)

