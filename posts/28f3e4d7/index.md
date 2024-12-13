# Python 环境隔离


Python 作为最常用的脚本语言，有着非常丰富的第三方库，但是这也导致了 Python 的环境管理非常必要。本文将介绍 Python 的几个常用环境管理工具，以及如何使用它们。

## 前言

由于 Python 的第三方库非常丰富，因此在开发过程中，我们可能会使用到很多第三方库。
但是，这些第三方库可能会有不同的版本，而且不同的项目可能会使用不同的版本。
如果我们先在 A 项目中使用了老版本的第三方库，而后续在 B 项目中需要使用新版本的第三方库，覆盖了老版本的第三方库，那么 A 项目就可能会出现问题。

当前，个人使用过的 Python 的环境管理工具主要有 `venv`、`virtualenv`、`virtualenvwrapper` 和 `conda`。

## `venv`

Python 3.3 之后，Python 自带了 `venv` 工具，是内置的一个模块，用于创建虚拟环境。

### `venv` 环境管理

```bash
# 创建环境
python -m venv &lt;env_dir&gt;
# 通常在当前目录下创建 .venv 目录作为虚拟环境
python -m venv .venv

# 激活环境，直接调用相应的脚本即可
# Windows CMD
.venv\Scripts\activate.bat
# Windows PowerShell
.venv\Scripts\Activate.ps1
# Linux
.venv\Scripts\activate

# 退出环境
deactivate

# 删除环境，只需要删除相应的目录即可
# Windows
rmdir .venv
# Linux
rm -rf .venv
```

### `venv` 包管理

激活环境后，直接用 `pip` 安装、卸载包即可。

## `virtualenv` 以及 `virtualenvwrapper`

`virtualenv` 是一个第三方的包，用于创建虚拟环境。
`venv` 其实就是 `virtualenv` 的一个子集，相当于被官方收录了，可见其实力。

为了更方便地使用 `virtualenv`，可以使用 `virtualenvwrapper` ，它对 `virtualenv` 进行了封装，提供了更方便的命令。
在 Windows 上，可以使用 `virtualenvwrapper-win`。

### 安装

```bash
pip install virtualenv
# Linux
pip install virtualenvwrapper
# Windows
pip install virtualenvwrapper-win
```

### `virtualenvwrapper` 环境管理

```bash
# 创建环境
mkvirtualenv &lt;env_name&gt;

# 激活环境（仍然不太兼容最新的 PowerShell）
workon &lt;env_name&gt;

# 退出环境
deactivate

# 删除环境
rmvirtualenv &lt;env_name&gt;
```

### `virtualenvwrapper` 包管理

激活环境后，直接用 `pip` 安装、卸载包即可。

## `conda`

`conda` 是一个开源跨平台语言无关的包管理与环境管理系统。
通常为了方便，可以直接下载包含各种常用软件包的 `Anaconda`，以及最简环境的 `Miniconda`。

然而，`conda` 在 Windows 上的使用体验并不好，暂时还不支持新版本的 `PowerShell`，其官方的 [Issue](https://github.com/conda/conda/issues/12094) 也有提到这个问题。

所以当前我都是切到 `Conmmand Prompt` 也就是 `CMD` 中使用 `conda`。

### `conda` 环境管理

```bash
# 创建环境
conda create -n &lt;env_name&gt; [python=&lt;python_version&gt;] [package_name]

# 激活环境
conda activate &lt;env_name&gt;

# 退出环境
conda deactivate

# 删除环境
conda remove -n &lt;env_name&gt; --all
```

### `conda` 包管理

```bash
conda install &lt;package_name&gt;

conda list

conda remove &lt;package_name&gt;
```

## 总结

在 Windows 上，在借助 VScode 的 Python 插件的情况下，使用 `venv` 和 `virtualenvwrapper` 都还不错，可以快速的激活环境。
而在 Linux 上，使用 `conda` 也是一个不错的选择。

## 参考资料

- [【Python】venv --- 创建虚拟环境](https://docs.python.org/zh-cn/3.11/library/venv.html)
- [【pypa】virtualenv](https://virtualenv.pypa.io/en/latest/)
- [【readthedocs】virtualenvwarepper](https://virtualenvwrapper.readthedocs.io/en/latest/)
- [【Conda】command reference](https://docs.conda.io/projects/conda/en/latest/commands/index.html)


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/28f3e4d7/  

