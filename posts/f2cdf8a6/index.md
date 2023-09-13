# 美化 Shell 之 Linux Zsh 篇


## 简介

`Z shell（Zsh）`是一款可用作互动式登入的shell及指令码编写的命令直译器。
`Zsh` 对 Linux 默认的 `Bourne shell（sh）`做出了大量改进，同时加入了 `Bash`、`ksh` 及 `tcsh` 的某些功能。
并且自 2019 年起，macOS 的预设 `Shell` 已从 `Bash` 改为 `Zsh`

为了美化以及快速配置 `Zsh`，`Oh My Zsh` 应运而生。
`Oh My Zsh` 是一个开源的、社区驱动的框架，支持各种插件以及主题，在管理 `Zsh` 配置提供了很大的便利

本文主要记录自己的 `Oh My Zsh` 安装以及配置流程
<!-- more -->

## 安装 `Zsh`

如果没有安装 `Zsh` 则需要手动安装一下，以 Ubuntu 为例：

```bash
sudo apt install zsh
```

配置 Zsh 为默认 Shell

```bash
chsh -s $(which zsh)
```

## 安装 `Oh My Zsh`

通过 `curl` 或者 `wget` 下载安装脚本一键安装 `Oh My Zsh` 即可

```bash
# curl
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
# wget
sh -c "$(wget -O- https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

类似于 `bash` 的配置文件 `~/.bashrc` 命名规则类似，`Zsh` 的配置文件是 `~/.zshrc`，后续配置只需对该配置文件进行小小的修改即可

## 主题配置

`Oh My Zsh` 支持非常丰富的主题，[官方](https://github.com/ohmyzsh/ohmyzsh/wiki/Themes) 给出了内置的所有主题的预览图

部分主题需要额外 [PL 字体](https://github.com/powerline/fonts) 以及 [Nerd 字体](https://www.nerdfonts.com/) 支持，参见 [安装 Nerd 字体](/posts/8ad4716e/#安装 Nerd 字体) 

由于在 [`Oh My Posh`](/posts/8ad4716e/) 中用习惯了 `powerlevel10k`，并且 `powerlevel10k` 也支持 `Oh My Zsh`，于是后来又额外安装了 `powerlevel10k` 主题

安装流程也很方便，直接从 GitHub 拉取仓库，然后修改配置文件即可

```bash
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

vim ~/.zshrc

ZSH_THEME="powerlevel10k/powerlevel10k"
```

之后重启终端后，`powerlevel10k` 会进入引导流程，可以自行微调风格

## 插件安装

`Oh My Zsh` 默认会开启 `git` 插件，除此之外个人还额外安装了 `zsh-autosuggestions` 以及 `zsh-syntax-highlighting` 插件

### `zsh-autosuggestions`

`zsh-autosuggestions` 开启后，`Zsh` 会根据历史记录和完成情况在您键入时建议命令，也就是根据历史记录快速补全命令，非常的好用！！！

安装起来也非常简单，直接 `git clone` 即可

```bash
git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
# git clone git@github.com:zsh-users/zsh-autosuggestions.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

之后修改配置文件，在 `plugins` 中加入 `zsh-autosuggestions` 即可

```bash
vim ~/.zshrc

plugins=(git zsh-autosuggestions)
```

### `zsh-syntax-highlighting`

`zsh-syntax-highlighting` 开启后，在输入命令时就有了语法高亮，提升整体颜值的同时，还能辅助检查命令是否打错，安装过程类似

```bash
git clone https://github.com/zsh-users/zsh-syntax-highlighting ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
# git clone git@github.com:zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

之后修改配置文件，在 `plugins` 中加入 `zsh-syntax-highlighting` 即可

```bash
vim ~/.zshrc

plugins=(git zsh-autosuggestions zsh-syntax-highlighting)
```

## 参考资料

- [【维基百科】Z shell](https://zh.wikipedia.org/zh-hk/Z_shell)
- [【ohmyz】Oh My Zsh 官网](https://ohmyz.sh/)
- [【GitHub】Oh My Zsh 仓库](https://github.com/ohmyzsh/ohmyzsh)
- [【GitHub】Installing ZSH](https://github.com/ohmyzsh/ohmyzsh/wiki/Installing-ZSH)
- [【GitHub】Themes](https://github.com/ohmyzsh/ohmyzsh/wiki/Themes)
- [【GitHub】zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions)
- [【GitHub】zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting)
- [【Zhihu】oh-my-zsh：让终端飞](https://zhuanlan.zhihu.com/p/62501175)
- [【GitHub】Powerlevel10k](https://github.com/romkatv/powerlevel10k#installation)

