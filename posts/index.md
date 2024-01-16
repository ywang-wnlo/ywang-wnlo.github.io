# 

# 基于数据压缩功能卸载的分区固态盘优化方法研究

为了满足海量数据的存储需求和进一步减轻存储成本，闪存的制程工艺和设计在不断发展。尽管四层存储单元（Quad-Level Cell，QLC）闪存写入性能以及寿命不佳，但是其成本也得到了有效控制。
分区命名空间（Zoned NameSpace，ZNS）接口也为固态盘（Solid-State Drive，SSD）的成本带来了新的下降空间。
当前基于 QLC 闪存的分区固态盘正在逐步取代传统机械磁盘，走进企业存储环境。尽管如此，基于 QLC 闪存的分区固态盘仍然比机械磁盘成本高，并且 QLC 闪存的写入性能和寿命问题也给企业存储带来新的性能和数据可靠性问题。
因此，重新提出了基于数据压缩的优化方法，但是在应用程序或者文件系统等主机端进行数据压缩会带来新的问题，例如大量的 CPU 开销或独立压缩硬件的传输瓶颈等。

为了解决这些问题，提出了基于数据压缩功能卸载的分区固态盘优化方法BalloonZNS，将数据压缩功能卸载至固态盘内，实现透明压缩，从而降低数据在闪存上的写入量。
本章的组织结构如下：
- 首先，在4.1节介绍了QLC闪存的写入寿命问题以及主机端压缩存在的性能和管理开销，给出相关的研究背景和动机；
- 在4.2节详细描述了BalloonZNS的基于数据压缩功能卸载的分区固态盘优化方法，并给出具体的原型设计与实现；
- 在4.3节展示了BalloonZNS在多个维度和应用场景下的性能和压缩收益；
- 最后，在4.4节对本章的内容进行总结。

## 研究背景和动机

本节首先介绍了 QLC 闪存的优缺点以及数据压缩技术存在的问题，然后通过实验定量分析了卸载数据压缩功能在分区固态盘上的性能收益和开销，并以此作为研究动机。

### QLC 闪存

闪存根据存储单元内的电子数量呈现出的电路特性来存储数据，最初单个存储单元根据其在特定的读参考电压下的导通状态被切分成两个不同的状态，分别代表数据“0”与“1”，也就是每个存储单元可以存储1比特的数据。
为了更好地降低闪存的存储成本，多层存储单元技术被提出。
如图4.1所示，通过将单个存储单元切分出更多的状态来代表更多的数据位。随着多层存储单元技术的发展，QLC 闪存已经开始大规模量产并投入使用。

![TODO]()
图4.1 多层存储单元技术的发展

但是，多层存储单元技术带来存储密度提升的同时，也带来闪存读写性能和寿命的下降。
如表4.1所示，QLC闪存相比单层存储单元，其操作延迟显著提升，其中擦除延迟增加了5倍，读取延迟增加了7倍，而写入延迟增加了30倍，并且其最大擦除次数也下降至单层存储单元的1/100[1]。
然而作为传统机械硬盘的替换，QLC 的性能仍然十分出色，但是其寿命问题已经成为了阻碍其大规模使用的主要原因。

表4.1 多层存储单元技术的性能差异[1]
性能指标	单层	多层	三层	四层
读取延迟	20-25μs	55-110μs	75-170μs	120-200μs
写入延迟	50-100μs	0.4-1.5ms	0.8-2ms	2-3ms
擦除延迟	2-5ms	5-10ms	10-15ms	15-20ms
最大擦除次数	100,000	15,000	3,000-5,000	800-1,500
存储密度	☆	☆☆	☆☆☆	☆☆☆☆

### 数据压缩技术

为了减少存储设备的性能开销和存储成本，数据压缩技术被广泛应用于存储系统中。
数据压缩技术通过对原始数据进行压缩编码，从而减少数据的存储空间，并且由于需要写入的数据量减少，有时候还能提升系统的整体性能。

当前数据压缩的主流设计可以分为以下三类，如图4.2所示。
第一类是基于软件的数据压缩，例如Zlib、Snappy、ZSTD等，这些压缩算法通常在应用程序或者文件系统等主机端进行，通过CPU进行压缩，然后将压缩后的数据写入存储设备。
第二类是基于硬件的数据压缩，例如Intel的QuickAssist、AMD的Xpress Data Compression等，在独立的压缩硬件中进行压缩，然后将压缩后的数据写入存储设备。
第三类是基于存储设备本身固件的数据压缩，例如NetApp的A-SIS、Pure Storage的Pure等，这些压缩算法通常在存储设备的固件中进行压缩，然后将压缩后的数据写入存储设备。
 
![TODO]()		
(a)	基于软件	(b)	基于独立硬件	(c)	基于存储设备固件
图4.2 数据压缩的主流设计分类

然而，基于软件的压缩算法通常需要大量的CPU开销，而基于硬件的压缩算法则需要独立的压缩硬件，同时也会受到独立硬件传输瓶颈的影响。
此外，这些算法还需要管理压缩前后数据的映射关系，从而增加了额外的管理开销。相比之下，基于存储设备固件的压缩过程是透明的，主机端不需要额外管理数据映射，从而减少了管理开销。
因此，基于固件的压缩设计受到了越来越多的关注，并开始广泛应用于企业存储系统中。

### 研究动机

当前，基于固件的压缩设计已经在块接口的固态盘中得到了广泛应用，例如ScaleFlux的CSD已经量产并投入使用。然而，这类CSD都是基于块接口的固态盘，利用了块接口固态盘内的页级地址映射表来管理压缩前后数据的映射关系，实现了透明压缩，并且没有增加额外的管理开销。

相比之下，分区命名空间接口的固态盘采用分区的方式来管理闪存，分区的逻辑地址空间直接映射到盘内的闪存物理地址空间，映射表的粒度为分区而不是传统的块。这种设计使得分区固态盘在映射表管理上更加简单，映射表所需的缓存空间也更小，从而减少了管理开销和用于缓存的内存开销，降低了成本。另外，由于分区固态盘的映射表粒度相比块接口固态盘有着数量级的差异，所以其所需的缓存空间也相应减少了数量级，通常为MB量级。
 
图4.3 数据压缩技术在分区固态盘上的挑战

如图4.3所示，数据压缩技术会将固定大小的数据页更改为在物理闪存页中的可变长度片段，这与分区固态盘的粗粒度映射冲突，会导致映射表的管理变得复杂，同时也会增加映射表的缓存开销以及硬件成本。因此，基于固件的压缩设计在分区固态盘上的透明压缩更具挑战性。

为了解决这一棘手的挑战，我们对真实数据的可压缩性进行了全面的分析研究，并对各种不同的公开数据集进行了4KB页面的压缩率分析。4KB页面是当前操作系统中最常用的页面大小，也是存储设备的默认页面大小。这些数据集包括著名的Silesia压缩语料库和其他一些公开可用的数据集，涵盖了广泛的应用场景，例如数据库（“nci”和“osdb”）、代码和库文件（“samba”和“ooffice”）、网页文本（“webstrer”和“XML”）、邮件（“mail”）、语言短语标记（“autokey”）和生物信息（“hgdb”和“neuro”）。我们采用的压缩算法是基于静态哈夫曼编码的Deflate算法，它是Zlib的一部分，也是许多其他压缩算法的基础。数据集大小范围从2.2MB到7.6GB。

我们将数据压缩后的大小与原始数据大小的比值称为压缩性，压缩性数值越低，说明数据越容易被压缩。如图4.4所示，柱状图为不同百分位的数据压缩性，其中这些数据集的第50个百分位的数据压缩性为0.224~0.805，平均为0.466，这意味着真实数据普遍具有良好的可压缩性，并且数据压缩在存储空间成本上有着2倍以上的潜在收益。此外，我们还发现，大部分数据集显示出压缩性的局部性明显，即大部分的数据页压缩性相似，也就是不同百分位之间压缩性的差异较小。
 
图4.4 不同数据集的数据压缩性分布

而利用压缩性的局部性，可以通过将压缩数据页对齐到固定大小的槽中来减少映射表的条目，从而减少映射表的管理开销和缓存开销。闪存页会被分成固定大小的槽，每个槽中存储一个压缩页。如果压缩页的大小小于槽的大小，则会浪费一些空间，数据的压缩率会降低。如果压缩页的大小大于槽的大小，则会将压缩页截断，并且将剩余部分以日志的形式存储在额外空间并集中管理。在这种情况下，需要读取两个闪存页来恢复被截断的压缩页。

为此，我们进行了初步的实验来评估槽对齐设计的存储空间收益。图4.4中空间收益的计算是基于压缩页对齐到槽的情况，槽的大小设置为使得数据集中第 70 个百分位的压缩页可以完全包含在槽中。实验结果表面，槽对齐的策略会导致约 7.5%的存储空间损失，即便如此数据压缩仍然可以带来 16.8%~73.4% 存储空间收益，在存储成本上有着可观的收益。

综上所述，数据压缩技术在分区固态盘上具有很大的潜力。真实数据集的压缩性和其局部性使得基于槽对齐的透明压缩成为可能，从而减少映射表的管理开销和缓存开销，降低成本。

## 基于数据压缩功能卸载的分区固态盘优化方法

为了解决基于QLC为代表的高密度闪存的分区固态盘的写性能、寿命及成本问题，本章提出了一种基于数据压缩功能卸载的分区固态盘优化方法BalloonZNS，实现在分区固态盘上的透明压缩。

### 方法概况

![TODO]()
BalloonZNS的整体架构如图4.5所示。
BalloonZNS将数据压缩功能卸载至分区固态盘，实现透明压缩，从而降低数据在闪存上的写入量，提升闪存的写入性能和寿命。
透明压缩意味着主机端不需要额外的管理开销，因此BalloonZNS的设计主要集中在分区固态盘内部，包括四个部分：分区映射管理、槽对齐的数据布局、压缩性自适应的槽配置以及额外日志数据区管理。
具体来说，BalloonZNS首先重新组织了逻辑分区到物理闪存块集合的映射逻辑，通过更细粒度的映射方式，避免了分区固态盘内置压缩带来的空间浪费；
为了减轻压缩带来的映射管理开销，根据数据的压缩局部性设计了槽对齐的数据布局以及压缩自适应的槽配置；
最后为额外数据区进行日志方式管理，并且采用轻量级垃圾回收策略，保证系统的高效稳定运行。

### 分区映射管理








&lt;!-- 对于ZNS SSD，当要写入一个区域时，首先将其打开，然后SSD将其映射到闪存超级块，即GC单元。通常，超级块由跨许多或所有并行闪存芯片/管芯具有相同偏移的闪存块组成。然后，数据页以顺序且对齐的方式写入闪存页。如图 3 所示，Balloon-ZNS 支持数据压缩，并实现了多种高效存储管理技术，包括区域到闪存映射、槽对齐数据布局、压缩性自适应槽和剩余空间回收。 --&gt;








&lt;!-- DCLACO 的主要思想是，利用数据内容局部性，将数据按照一定的粒度进行分区，并为每个分区选择合适的压缩算法和参数。同时，为了减轻压缩映射表的开销， DCLACO 采用了一种静态映射的策略，即对一段连续的空间采用相同的压缩率，并根据压缩率实现静态映射。如果某些数据块的压缩率达不到预设的要求，则将这些数据块写入到额外的空间中，并采用日志方式记录额外映射表。
如图所示，对于一段连续的地址空间， DCLACO 首先直接根据压缩结果，通过直接映射的方式写入对应的数据分区内，当存在不满足压缩率要求的结果时，将多余的部分记录在元数据分区中， 并记录下映射，并记录日志。后续访问可以直接根据数据分区内的映射结合日志定位到元数据分区内的内容。
此外，为了适应数据内容局部性的变化， DCLACO 还实现了一种压缩率自适应调整的机制，即通过统计和预测当前分区的压缩率，自动调整后续分区的压缩率配置。通过这些方法， DCLACO 可以有效地提高透明压缩分区固态盘的存储效率和性能。 --&gt;


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/  
