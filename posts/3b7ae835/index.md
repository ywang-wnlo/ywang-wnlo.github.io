# Windows 平台最强播放器组合 —— Potplayer &#43; LAV Filters &#43; MadVR &#43; Xy-SubFilter


本文主要来源于 VCB-Studio 官网的 [科普教程](https://vcb-s.com/archives/7228)，个人重新梳理进行备份

## 安装程序

1、安装 [PotPlayer](https://potplayer.daum.net/) 和 [LAV Filters](https://github.com/Nevcairiel/LAVFilters/releases)

二者都是普通的 `exe` 安装包，双击启动安装即可，安装过程中可以全默认

2、安装 [madVR](http://madvr.com/) 和 [xy-SubFilter](https://github.com/Cyberbeing/xy-VSFilter/releases)

二者都是插件，推荐将其解压到单独的文件夹中，然后移动至 Potplayer 目录下，最后以管理员权限运行其中的安装脚本 `install.bat`

## 显卡驱动配置

首先解锁显卡驱动上的色彩管理范围和显示器输出配置，打开【NVIDIA 控制面板】，参考下图进行配置

![动态范围](动态范围.png &#34;动态范围&#34;)

![显示器设置](显示器设置.png &#34;显示器设置&#34;)

其他显卡配置类似，这里略去

## 配置 Potplayer

首先我们来看一下最终目标，用 PotPlayer 随便打开一个视频，按一下 Tab 键，即可调出 Potplayer 自带的 OSD 菜单，红框中的内容是配置完成后的最佳配置

![最终目标](最终目标.png &#34;最终目标&#34;)

下面我们一步一步进行配置

### 关闭 Potplayer 内置滤镜

在播放视频（暂停也可以）时 `右键-选项`，或者直接 `F5` 快捷键，进入 `选项` 菜单

切至 `滤镜` 选项卡，关闭 Pot 内置滤镜

![关闭内置滤镜](关闭内置滤镜.png &#34;关闭内置滤镜&#34;)

### 添加 LAV 滤镜/解码器

切至 `滤镜-源滤镜/分离器` 选项卡，点击 `滤镜/解码器管理`

![添加 LAV 滤镜、解码器-1](添加LAV滤镜、解码器-1.png &#34;添加 LAV 滤镜、解码器-1&#34;)

在新窗口中，点击 `搜索后添加` 后确认 LAV 的相关滤镜、解码器已被勾选，然后点击 `确定`

![添加 LAV 滤镜、解码器-2](添加LAV滤镜、解码器-2.png &#34;添加 LAV 滤镜、解码器-2&#34;)

### 分离器

切至 `滤镜-源滤镜/分离器` 选项卡 ，将右侧的所有选项都换成 LAV Splitter Source，无法切换的就保持原状，列表较长，记得滚轮翻页

![配置分离器](配置分离器.png &#34;配置分离器&#34;)

### 视频解码器

切至 `滤镜-视频解码器` 选项卡，将右侧的所有选项都换成 LAV Video Decoder，无法切换为 LAV 的就保持原状，列表较长，记得滚轮翻页

![配置视频解码器](配置视频解码器.png &#34;配置视频解码器&#34;)

### 视频渲染器

切至 `视频` 选项卡，设置视频渲染方式，选择 `Madshi 视频渲染`，也就是 madVR

![配置视频渲染器](配置视频渲染器.png &#34;配置视频渲染器&#34;)

### 音频解码器

切至 `滤镜-音频解码器` 选项卡 ，将右侧的所有选项都换成 LAV Audio Decoder，无法切换的就保持原状，列表较长，记得滚轮翻页

![配置音频解码器](配置音频解码器.png &#34;配置音频解码器&#34;)

### 音频渲染器

切至 `声音` 选项卡，设置音频渲染方式，选择 `内置 WSAPI 音频渲染器`

![配置音频渲染器](配置音频渲染器.png &#34;配置音频渲染器&#34;)

### 其他

#### 调教进度条

切至 `播放` 选项卡，开始调教进度条，将进度条的相关配置全开启

![调教进度条](调教进度条.png &#34;调教进度条&#34;)

#### 关闭音频规格化

切至 `声音-规格化/混响` 选项卡，关闭音频规格化，避免 potplayer 乱改音量

![关闭音频规格化](关闭音频规格化.png &#34;关闭音频规格化&#34;)

#### 启用 xy-SubFilter

切至 `滤镜-个人滤镜优先权` 选项卡，点击 `添加系统滤镜`

![添加字幕滤镜-1](添加字幕滤镜-1.png &#34;添加字幕滤镜-1&#34;)

在新窗口中，选中 xy-SubFilter 的相关滤镜，然后点击 `确定`

![添加字幕滤镜-2](添加字幕滤镜-2.png &#34;添加字幕滤镜-2&#34;)

优先级设置上，将 XySubFilterAutoLoader 设为强制使用，负责外挂字幕； XySubFilter 设为按优先级使用，负责内挂字幕

![配置字幕滤镜](配置字幕滤镜.png &#34;配置字幕滤镜&#34;)

所有配置完成后记得点击 `应用` 和 `确定` 按钮保存当前配置

## 配置 LAV Filters

在播放视频（暂停也可以）时 `右键-属性`，或者直接 `Ctrl&#43;F1` 快捷键，进入 `属性` 菜单

点击红色框就能进入视频/音频解码器设置界面

![属性界面](属性界面.png &#34;属性界面&#34;)

### LAV 视频解码器

视频解码器保持 LAV 默认设置即可，也就是勾选除了 `AYUV` 以外的所有选项；`RGB Output Level` 选 `PC`；`Dither Mode` 选 `Random`；`Hardware Decoder to use` 选 `None`

![LAV 视频解码器](LAV视频解码器.png &#34;LAV 视频解码器&#34;)

### LAV 音频解码器

在音频解码器中，切换至 `Mixing` 标签，勾上 `Enable Mixing` 即可

![LAV 音频解码器](LAV音频解码器.png &#34;LAV 音频解码器&#34;)

## 配置 madVR

madVR 个人没有折腾，直接用默认配置

## 使用 xy-SubFilter

由于 Potplayer 内置了字幕插件，加上我们选择 xy-SubFilter 来处理字幕，所以需要关闭 Potplayer 内置字幕插件，否则就会出现两行字幕

可以通过快捷键 `ALt&#43;H` 快速开关内置字幕

而 xy-SubFilter 的字幕选择和开关则需要要在桌面右下角小图标右键进行切换

## 其他问题

### 倍数播放字幕异常

通过 `x`、`c` 快捷键调整倍数播放之后发现，字幕显示速度没变，经过一番搜索在 Anime 字幕论坛的 [一篇帖子](https://bbs.acgrip.com/thread-5842-2-1.html) 里面找到了解决办法：直接 `Shift&#43;X` 开关声音处理滤镜即可

## 参考资料

- [【PotPlayer 官网】](https://potplayer.daum.net/)
- [【GitHub】LAV Filters](https://github.com/Nevcairiel/LAVFilters/releases)
- [【madVR 官网】](http://madvr.com/)
- [【GitHub】xy-SubFilter](https://github.com/Cyberbeing/xy-VSFilter/releases)
- [【VCB-Studio 官网】科普教程 2.2——基于 PotPlayer 和 madVR 的播放器教程（已更新 XySubFilter）](https://vcb-s.com/archives/7228)
- [【Anime 字幕论坛】倍速播放](https://bbs.acgrip.com/thread-5842-2-1.html)
- [【个人博客】视频播放器使用教程](https://aceclee.art/archives/331)


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/3b7ae835/  

