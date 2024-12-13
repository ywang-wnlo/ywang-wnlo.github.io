# LaTeX 基础介绍


## TeX 和 LaTeX

Tex 是一个排版软件，而 LaTeX 是基于 TeX 开发的排版系统，可以理解成 LaTeX 通过对 TeX 进行封装，使用 TeX 作为它的格式化引擎，使得排版文字变得更加方便。

LaTeX 利用 TeX 对 `.tex` 后缀的文件进行编译，生成 `.dvi` 文件

## pdfTeX、XeTeX 和 LuaTeX

### 三者的介绍

pdfTeX、XeTeX 和 LuaTeX 都是在原有的 TeX 停止更新后进行修改增强的 TeX 引擎，提供一些额外的附加功能，例如可以直接输出成 pdf 文件等。

- pdfLaTeX 表示将 LaTeX 宏包与 pdfTeX 引擎一起使用
- XeLaTeX 表示将 LaTeX 宏包与 XeTeX 引擎一起使用
- LuaLaTeX 表示将 LaTeX 宏包与 LuaTeX 引擎一起使用

### 各自的特性

- pdfTeX 的主要特性是能直接生成 pdf
- XeLaTeX 的主要特性是支持 UTF-8 编码，因此理论上原生支持中文字符
- LuaLaTeX 的主要特性除了支持 UTF-8 编外之外，主要是增加了 Lua 脚本

## 参考资料

- [【Overleaf】pdfTeX, XeTeX and LuaTeX](https://www.overleaf.com/learn/latex/Articles/What%27s_in_a_Name%3A_A_Guide_to_the_Many_Flavours_of_TeX#And_finally:_from_TeX_to_pdfTeX.2C_XeTeX_and_LuaTeX)


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/a4752f87/  

