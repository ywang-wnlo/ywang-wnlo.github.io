# 美化 Shell 之 Windows/Linux PowerShell 篇


## 简介

`PowerShell` 是 Windows 最新的 `Shell`，而且在 GitHub 上开源并且提供了跨平台支持（虽然估计没哪个 `Linux` 用户会选择 `PowerShell`

为了美化 `PowerShell`，个人选择了 `Oh My Posh`。`Oh My Posh` 是一个开源的主体的框架，支持 `PowerShell`、`CMD`、`Zsh`、`Bash`、`Fish` 等多种 `Shell`

本文主要记录自己的 `Oh My Posh` 安装以及配置流程

## 安装最新的 `PowerShell`

Windows 默认安装的 `PowerShell` 版本太旧，所以先通过 `winget` 安装最新的版本

```PowerShell
# winget search Microsoft.PowerShell
winget install --id Microsoft.Powershell --source winget
```

## 安装 `Oh My Posh`

通过 `winget` 一键安装 `Oh My Posh` 即可

```bash
winget install JanDeDobbeleer.OhMyPosh -s winget
```

## 安装 Nerd 字体

[Nerd 字体](https://www.nerdfonts.com/) 其实只是在原本的开源字体上增加了一些图标（包括 PowerLine 所需的符号），而 `Oh My Posh` 中大多数主体都需要 Nerd 字体

直接在 [官网](https://www.nerdfonts.com/font-downloads) 或者 [GitHub 的 Release](https://github.com/ryanoasis/nerd-fonts/releases) 中下载自己常用字体的压缩包，解压后直接打开 ttf 文件安装即可

个人习惯用 `Cascadia Code`、`FiraCode`

字体的启用与 `Shell` 的运行程序相关，需要在 VSCode 或者 Windows Terminal 应用中单独配置，这里不做介绍

## 启用 `Oh My Posh`

启用 `Oh My Posh` 需要修改配置文件，通过 notepad 直接打开配置文件

```PowerShell
notepad $PROFILE
```

> 如果打开报错，则需要首先创建配置文件
>
> ```PowerShell
> New-Item -Path $PROFILE -Type File -Force
> ```

在配置文件中添加以下内容，以后启动 `PowerShell` 就会自动启用 `Oh My Posh` 了

```PowerShell
oh-my-posh init pwsh | Invoke-Expression
```

## 选择主题

`Oh My Posh` 支持非常丰富的主题，而且只需一行命令就可以直接在 `Shell` 预览

```PowerShell
Get-PoshThemes
```

个人选择了 `powerlevel10k_rainbow` 主题，修改主题需要修改之前的配置文件，将之前内容进行修改即可，配置完成后需要重启终端~

```PowerShell
notepad $PROFILE

oh-my-posh init pwsh --config "$env:POSH_THEMES_PATH/powerlevel10k_rainbow.omp.json" | Invoke-Expression
```

## 参考资料

- [【ohmyposh】Oh My Posh 官网](https://ohmyposh.dev/)
- [【GitHub】Oh My Posh 仓库](https://github.com/JanDeDobbeleer/oh-my-posh)
- [【Microsoft】Installing PowerShell on Windows](https://learn.microsoft.com/en-us/powershell/scripting/install/installing-powershell-on-windows?view=powershell-7.3)
- [【ohmyposh】Installation-Windows](https://ohmyposh.dev/docs/installation/windows)
- [【ohmyposh】Fonts](https://ohmyposh.dev/docs/installation/fonts)
- [【ohmyposh】Prompt](https://ohmyposh.dev/docs/installation/prompt)


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/8ad4716e/  

