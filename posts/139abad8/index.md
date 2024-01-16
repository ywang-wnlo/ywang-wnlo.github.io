# 从论文的图中提取数据


## 简介

对于科研工作者来说，从前人论文的图中提取数据来重绘或者对比是一件很常见的事情。
但是有时候论文中的图并没有提供数据，这时候我们就需要自己手动提取数据。
而 `WebPlotDigitizer` 是一个非常方便的工具，无需安装，直接在网页上即可使用。

## 功能特点

- 可以用于提取各种图表（XY，条形，极坐标，三元，地图等）的数据
- 高效的自动提取算法，非常容易提取大量数据点
- 免费使用，开源和跨平台（Web 和桌面）
- 还可以测量各种特征之间的距离或角度

`WebPlotDigitizer` 的网页地址为 [https://apps.automeris.io/wpd/index.zh_CN.html](https://apps.automeris.io/wpd/index.zh_CN.html)，并且 [其源码开源](https://github.com/ankitrohatgi/WebPlotDigitizer)。

![WebPlotDigitizer](WebPlotDigitizer.png &#34;WebPlotDigitizer&#34;)

## 使用方法

官方有详细的 [教程](https://automeris.io/WebPlotDigitizer/tutorial.html)，另外 CSDN 上还有一篇汉化后的 [教程](https://blog.csdn.net/YanLu99/article/details/114172184)，这里简单介绍一下使用流程。

1. 上传图片
2. 标记坐标轴上的已知点，并输入其坐标值
3. 取色器选择需要提取的数据点颜色
4. 利用蒙版选择需要提取的数据点范围
5. 选择合适的颜色距离（其实就是颜色差异度），以及输出点Δ（其实就是数据密度）
6. 点击“运行”提取数据
7. 查看数据，自行导出

## 参考资料

- [【官网】WebPlotDigitizer 教程](https://automeris.io/WebPlotDigitizer/tutorial.html)
- [【GitHub】WebPlotDigitizer](https://github.com/ankitrohatgi/WebPlotDigitizer)
- [【CSDN】提取文献中的折线图/散点图数据](https://blog.csdn.net/YanLu99/article/details/114172184)


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/139abad8/  

