# 自定义配置 RocksDB 进行 YCSB 测试


本文主要记录在利用 [YCSB](https://github.com/brianfrankcooper/YCSB) 使用配置文件测试 [RocksDB](https://github.com/facebook/rocksdb) 的过程中遇到的一些问题以及相应的解决办法

## 简介

YCSB 的全程是 Yahoo! Cloud Serving Benchmark，是雅虎开发的用来对云服务进行基础测试的工具，支持目前常见的 NoSQL 数据库产品，如 HBase、MongoDB、OrientDB、Redis 等等

RocksDB 是一个具有键/值接口的存储引擎，其中键和值是任意字节流。它是在 Facebook（Meta） 基于 LevelDB 开发的，并为 LevelDB API 提供向后兼容的支持

## 编译 RocksDB

由于 YCSB 是用 Java 实现的，一般测试的数据库都需要提供 Java 版本的 `.jar` 包

虽然 RocksDB 最初是 C++ 的一个库（因为是嵌入式数据库），但是后续也提供了 Java 的 API 以及可以通过源码编译出 `.jar` 包，也可以直接通过 `Maven` 获取

官方在 GitHub 上给出了 [Java 版本的介绍](https://github.com/facebook/rocksdb/wiki/RocksJava-Basics)，编译过程也很简单

首先需要保证机器上安装好了 Java 的环境，必须在 1.7+ 版本以上，例如，安装 `openjdk-8-jdk` 包即可

```bash
sudo apt install openjdk-8-jdk
```

同时 RocksDB 本身还有一些环境需要安装，[官方](https://github.com/facebook/rocksdb/blob/main/INSTALL.md) 也给出来了

```bash
sudo apt-get install libgflags-dev libsnappy-dev zlib1g-dev libbz2-dev liblz4-dev libzstd-dev
```

实际编译 jar 包时，需要提前配置好环境变量

```bash
export JAVA_HOME="/usr/lib/jvm/java-8-openjdk-amd64"
```

实际编译时，有两个中版本可以选择，其中 `rocksdbjava` 是 debug 版本，而 `rocksdbjavastatic` 这是 release 版本，不过官方在 Java 版说明中没有提及，我是在 [Makefile 文件](https://github.com/facebook/rocksdb/blob/main/Makefile) 中找到的

```bash
make -j$(nproc) rocksdbjava
make -j$(nproc) rocksdbjavastatic
```

## 编译 YCSB

YCSB 在 2019/10/17 的 [4a99009](https://github.com/brianfrankcooper/YCSB/commit/4a990099a667c9226d5c33de7971f8b7ede9ffc0) 增加了对 RocksDB 配置文件的支持，然而目前官方给出的 release 版本还是 0.17.0，并且发布时间是 2019/10/6，因此我们只能选择从源码开始编译了

根据 [官方给出的流程](https://github.com/brianfrankcooper/YCSB/tree/master/rocksdb)

```bash
git clone https://github.com/brianfrankcooper/YCSB.git
cd YCSB
mvn -pl site.ycsb:rocksdb-binding -am clean package
```

此时编译好的文件在 `./rocksdb/target/` 目录下

```bash
~/YCSB$ ls rocksdb/target/*.jar
rocksdb/target/rocksdb-binding-0.18.0-SNAPSHOT.jar
```

该 `.jar` 包其实只是 YCSB 和 RocksDB 之间的中间件，实际使用的 RocksDB 的 `.jar` 包以及其他的依赖包则是在 `./rocksdb/target/dependency/` 目录下

```bash
~/YCSB$ tree rocksdb/target/dependency/
rocksdb/target/dependency/
├── jcip-annotations-1.0.jar
├── rocksdbjni-6.2.2.jar
├── slf4j-api-1.7.25.jar
└── slf4j-simple-1.7.25.jar
```

RocksDB 的包其实是由 YCSB 通过 `Maven` 下载的，具体的版本在 [pom.xml](https://github.com/brianfrankcooper/YCSB/commit/4a990099a667c9226d5c33de7971f8b7ede9ffc0#diff-9c5fb3d1b7e3b0f54bc5c4182965c4fe1f9023d449017cece3005d3f90e8e4d8L150) 中定义了

- 如果使用原本 RocksDB 则可以简单的通过修改这个版本信息，重新编译利用 `Maven` 重新下载
- 如果使用的是自己修改过源码的 RocksDB 则需要将自行编译的 RocksDB 的 `.jar` 包移到该目录下，并且删除旧的 `.jar` 包

## 修复报错

但此时如果使用 `./bin/ycsb.sh` 来进行测试，会报错

```bash
~/YCSB$ ./bin/ycsb.sh load rocksdb -s -P workloads/workloada -p rocksdb.dir=tmp/
/usr/lib/jvm/java-8-openjdk-amd64/bin/java  -classpath /home/ywang/YCSB/conf:/home/ywang/YCSB/core/target/core-0.18.0-SNAPSHOT.jar:/home/ywang/YCSB/rocksdb/target/rocksdb-binding-0.18.0-SNAPSHOT.jar:/home/ywang/YCSB/rocksdb/target/dependency/jcip-annotations-1.0.jar:/home/ywang/YCSB/rocksdb/target/dependency/rocksdbjni-6.2.2.jar:/home/ywang/YCSB/rocksdb/target/dependency/slf4j-api-1.7.25.jar:/home/ywang/YCSB/rocksdb/target/dependency/slf4j-simple-1.7.25.jar site.ycsb.Client -load -db site.ycsb.db.rocksdb.RocksDBClient -s -P workloads/workloada -p rocksdb.dir=tmp/
Command line: -load -db site.ycsb.db.rocksdb.RocksDBClient -s -P workloads/workloada -p rocksdb.dir=tmp/
YCSB Client 0.18.0-SNAPSHOT

Loading workload...
Exception in thread "main" java.lang.NoClassDefFoundError: org/apache/htrace/core/Tracer$Builder
        at site.ycsb.Client.getTracer(Client.java:458)
        at site.ycsb.Client.main(Client.java:304)
Caused by: java.lang.ClassNotFoundException: org.apache.htrace.core.Tracer$Builder
        at java.net.URLClassLoader.findClass(URLClassLoader.java:387)
        at java.lang.ClassLoader.loadClass(ClassLoader.java:418)
        at sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:352)
        at java.lang.ClassLoader.loadClass(ClassLoader.java:351)
        ... 2 more
 (might take a few minutes for large data sets)
```

主要是使用的 `./bin/ycsb.sh` 脚本有 bug，[官方已经知道](https://github.com/brianfrankcooper/YCSB/issues/1105)，[并尝试修复](https://github.com/brianfrankcooper/YCSB/pull/908)，不过好像仍然没有解决

目前可以手动将 `htrace` 的包的依赖加入 RocksDB 中，并重新编译，利用 `Maven` 下载到 `./rocksdb/target/dependency/` 目录下

可以手动将 `./core/pom.xml` 中 `htrace` 的依赖信息复制添加到 `./rocksdb/pom.xml` 中

```xml
<!-- ./rocksdb/pom.xml -->
	……
    <dependency>
      <groupId>org.rocksdb</groupId>
      <artifactId>rocksdbjni</artifactId>
      <version>${rocksdb.version}</version>
    </dependency>
    <dependency>
      <groupId>org.apache.htrace</groupId>
      <artifactId>htrace-core4</artifactId>
      <version>4.1.0-incubating</version>
    </dependency>
    <dependency>
      <groupId>site.ycsb</groupId>
      <artifactId>core</artifactId>
      <version>${project.version}</version>
      <scope>provided</scope>
    </dependency>
	……
```

然后利用 `mvn -pl site.ycsb:rocksdb-binding -am clean package` 重新编译

这时再次利用 `./bin/ycsb.sh` 来进行测试，还会报错

```bash
~/YCSB$ ./bin/ycsb.sh load rocksdb -s -P workloads/workloada -p rocksdb.dir=tmp/
/usr/lib/jvm/java-8-openjdk-amd64/bin/java  -classpath /home/ywang/YCSB/conf:/home/ywang/YCSB/core/target/core-0.18.0-SNAPSHOT.jar:/home/ywang/YCSB/rocksdb/target/rocksdb-binding-0.18.0-SNAPSHOT.jar:/home/ywang/YCSB/rocksdb/target/dependency/htrace-core4-4.1.0-incubating.jar:/home/ywang/YCSB/rocksdb/target/dependency/jcip-annotations-1.0.jar:/home/ywang/YCSB/rocksdb/target/dependency/rocksdbjni-6.2.2.jar:/home/ywang/YCSB/rocksdb/target/dependency/slf4j-api-1.7.25.jar:/home/ywang/YCSB/rocksdb/target/dependency/slf4j-simple-1.7.25.jar site.ycsb.Client -load -db site.ycsb.db.rocksdb.RocksDBClient -s -P workloads/workloada -p rocksdb.dir=tmp/
Command line: -load -db site.ycsb.db.rocksdb.RocksDBClient -s -P workloads/workloada -p rocksdb.dir=tmp/
YCSB Client 0.18.0-SNAPSHOT

Loading workload...
Starting test.
[Thread-3] INFO site.ycsb.db.rocksdb.RocksDBClient - RocksDB data dir: tmp
2021-12-25 16:10:30:807 0 sec: 0 operations; est completion in 0 second
DBWrapper: report latency for each error is false and specific error codes to track for latency are: []
Exception in thread "Thread-3" java.lang.NoClassDefFoundError: org/HdrHistogram/EncodableHistogram
        at site.ycsb.measurements.Measurements.constructOneMeasurement(Measurements.java:129)
        at site.ycsb.measurements.Measurements.getOpMeasurement(Measurements.java:220)
        at site.ycsb.measurements.Measurements.measure(Measurements.java:188)
        at site.ycsb.DBWrapper.measure(DBWrapper.java:184)
        at site.ycsb.DBWrapper.insert(DBWrapper.java:229)
        at site.ycsb.workloads.CoreWorkload.doInsert(CoreWorkload.java:621)
        at site.ycsb.ClientThread.run(ClientThread.java:135)
        at java.lang.Thread.run(Thread.java:748)
Caused by: java.lang.ClassNotFoundException: org.HdrHistogram.EncodableHistogram
        at java.net.URLClassLoader.findClass(URLClassLoader.java:387)
        at java.lang.ClassLoader.loadClass(ClassLoader.java:418)
        at sun.misc.Launcher$AppClassLoader.loadClass(Launcher.java:352)
        at java.lang.ClassLoader.loadClass(ClassLoader.java:351)
        ... 8 more
2021-12-25 16:10:30:954 0 sec: 0 operations; est completion in 106751991167300 days 15 hours
[OVERALL], RunTime(ms), 170
[OVERALL], Throughput(ops/sec), 0.0
[TOTAL_GCS_PS_Scavenge], Count, 0
[TOTAL_GC_TIME_PS_Scavenge], Time(ms), 0
[TOTAL_GC_TIME_%_PS_Scavenge], Time(%), 0.0
[TOTAL_GCS_PS_MarkSweep], Count, 0
[TOTAL_GC_TIME_PS_MarkSweep], Time(ms), 0
[TOTAL_GC_TIME_%_PS_MarkSweep], Time(%), 0.0
[TOTAL_GCs], Count, 0
[TOTAL_GC_TIME], Time(ms), 0
[TOTAL_GC_TIME_%], Time(%), 0.0
```

原因和之前一样，再次将 `HdrHistogram` 相关的依赖，从 `./core/pom.xml` 复制添加到 `./rocksdb/pom.xml` 中

```xml
<!-- ./rocksdb/pom.xml -->
	……
    <dependency>
      <groupId>org.rocksdb</groupId>
      <artifactId>rocksdbjni</artifactId>
      <version>${rocksdb.version}</version>
    </dependency>
    <dependency>
      <groupId>org.apache.htrace</groupId>
      <artifactId>htrace-core4</artifactId>
      <version>4.1.0-incubating</version>
    </dependency>
    <dependency>
      <groupId>org.hdrhistogram</groupId>
      <artifactId>HdrHistogram</artifactId>
      <version>2.1.4</version>
    </dependency>
    <dependency>
      <groupId>site.ycsb</groupId>
      <artifactId>core</artifactId>
      <version>${project.version}</version>
      <scope>provided</scope>
    </dependency>
	……
```

然后利用 `mvn -pl site.ycsb:rocksdb-binding -am clean package` 重新编译

这时再次利用 `./bin/ycsb.sh` 来进行测试就已经正常了

## 自定义配置 RocksDB 进行 YCSB 测试

自定义配置 RocksDB 的方式就很简单了，在 YCSB 测试时增加 `rocksdb.optionsfile` 参数并给出配置文件的路径即可

```bash
./bin/ycsb.sh load rocksdb -s -P workloads/workloada -p rocksdb.dir=/tmp/ycsb-rocksdb-data -p workloads/ycsb-rocksdb-options.ini
./bin/ycsb.sh run rocksdb -s -P workloads/workloada -p rocksdb.dir=/tmp/ycsb-rocksdb-data -p workloads/ycsb-rocksdb-options.ini
```

- 配置文件可以参考 [RocksDB 官方的例子](https://github.com/facebook/rocksdb/blob/main/examples/rocksdb_option_file_example.ini) 修改
- 也可以先不加测试文件，执行一次 `./bin/ycsb.sh load rocksdb -s -P workloads/workloada -p rocksdb.dir=/tmp/ycsb-rocksdb-data`，让 YCSB 自己生成，然后根据 RocksDB 测试目录（`/tmp/ycsb-rocksdb-data`）下的 `OPTIONS-000009` 的配置文件来修改

## 参考资料

- [【GitHub】RocksJava Basics](https://github.com/facebook/rocksdb/wiki/RocksJava-Basics)
- [【man】nproc(1) — Linux manual page](https://man7.org/linux/man-pages/man1/nproc.1.html)
- [【GitHub】Cannot execute YCSB #1105](https://github.com/brianfrankcooper/YCSB/issues/1105)
- [【GitHub】[core] Fix ycsb.sh and ycsb.bat missing core dependencies #908](https://github.com/brianfrankcooper/YCSB/issues/1105)
- [【CSDN】rocksdb 在 YCSB 中的运行教程](https://blog.csdn.net/a993096281/article/details/87864340)


---

> 作者: [Zeus](https://github.com/ywang-wnlo)  
> URL: https://ywang-wnlo.github.io/posts/4bc1e607/  

