---
title: MIT 6.824 Lecture 1-Introduction
date: 2024-07-01
updated:
tags: [分布式系统,MapReduce,6.824,GFS]
categories: [分布式系统]
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/分布式系统封面.png
toc:
toc_number:
toc_style_simple:
copyright:
copyright_author:
copyright_author_href:
copyright_url:
copyright_info:
mathjax:
katex:
aplayer:
highlight_shrink:
aside:
abcjs:
---

## MIT 6.824: Lecture 1-Introduction

### Lecture 1-Introdunction

#### 1.1**为什么分布式：**

- 连接不同物理实体
- 通过隔离实现安全
- 通过复制实现容错
- 并行的cpu、mem、disk、net实现扩展

#### 1.2**分布式系统：**

Hadoop（ hdfs , yarn , [MapReduce](https://so.csdn.net/so/search?q=MapReduce&spm=1001.2101.3001.7020) )
Spark 批处理
Storm ， Flink 流处理
Hbase K/V分布式数据库
Kafka 消息队列

#### 1.3**Lab:**

1-MapReduce

2-Raft:管理复制和剔除

3-k/v server

4-shard k/v service

#### 1.4 **Infrastructure-Abstraction**

1. storage :star:
2. communications
3. computation-MapReduce

#### 1.5 Implementation:

examples: RPC, Threads,Lock

#### 1.6Performance:

scalability-> 2 * computers-> 2 * throughput

#### 1.7 Fault Tolerance:

**Availability**

**Recoverability**

tools:

NV storage

Replication

**Consistency**

put(k,v)

get(k)->v

strong?weak?

#### 1.8**MapReduce**

Map Function & [Reduce](https://so.csdn.net/so/search?q=Reduce&spm=1001.2101.3001.7020) Function
写好mapreduce程序，无需关心具体分布式实现
WordCount例子

INPUT1->MAP		 a,1 b,1

INPUT2->MAP 			  b,1

INPUT3->MAP 	   a,1         c,1

get intermediate output

Then Reduces(分治思想)

**Map(k,v):**

split v into words

for each word 

emit(w,"1)

**Reduce(k,v):**

emit(len(v))

**简述：**

map/shuffle/reduce

master给workers分配任务，输入被分成M份（M个map task，M比worker多），每份有3个备份；对每份输入调用Map()，产出(k2,v2)的中间结果，在本地Hash成R份，传递给R个Reduce()，每个Reduce task写一个结果文件

**隐藏的细节：**

跟踪task的完成情况、数据移动、错误恢复

**好的负载均衡：**

tasks比workers多，workers完成task后master继续给它分配

**容错：**

某个服务器在运行MR任务时崩溃，只需重新运行相应的Map和Reduce而不用整个任务重新运行；

这依赖Map和Reduce是纯函数，即：

不保存状态、

不读写额外的文件、

没有task间隐藏的通信

崩溃恢复：

Map worker崩溃：

重新给包含该输入的副本的worker分配该task（可能一些Reduce worker已经读取了该Map的部分输入，不要紧，Map是纯函数）；

如果该Map的中间结果都已被读取，则不用重新运行

Reduce worker崩溃：

该worker已运行完的task不用重新运行（结果已存到GFS）

只需重新运行未完成的task

如果Reduce worker写数据中途崩溃，不要紧，GFS会在写入完成时才重命名文件，所以相当于原子操作，未写入完成可重新运行


其他问题：

给两个worker分配了同样的Map task — 只会告诉Reduce worker其中的一个；

给两个worker分配了同意的Reduce task — GFS的原子写入操作可解决

##### 详解MapReduce流程

MapReduce 编程模型开发简单且功能强大，专门为并行处理大规模数据量而设计，接下来，通过一张图来描述 MapReduce 的工作过程，如图所示

![20210617002320632[1].png](https://s2.loli.net/2024/07/01/WUEdQxVR1YjkirO.png)

###### **整体流程**（5步）

在上图中， MapReduce 的工作流程大致可以分为5步，具体如下:

![20210617001737183[1].png](https://s2.loli.net/2024/07/01/tnpNC4mId71EfB9.png)

###### 1.分片、格式化数据源：

输入 Map 阶段的数据源，必须经过分片和格式化操作。

分片操作：指的是将源文件划分为大小相等的小数据块( Hadoop 2.x 中默认 128MB )，也就是分片( split )，
Hadoop 会为每一个分片构建一个 Map 任务，并由该任务运行自定义的 map() 函数，从而处理分片里的每一条记录;
格式化操作：将划分好的分片( split )格式化为键值对<key,value>形式的数据，其中， key 代表偏移量， value 代表每一行内容。

###### 2.执行 MapTask

每个 Map 任务都有一个**内存缓冲区(**缓冲区大小 100MB )，输入的分片( split )数据经过 **Map 任务处理后的中间结果会写入内存缓冲区**中。
如果写入的数据达到内存缓冲的阈值( 80MB )，会启动一个线程将内存中的**溢出数据写入磁盘**，同时不影响 Map 中间结果继续写入缓冲区。
在溢写过程中， MapReduce 框架会对 key 进行排序，如果中间结果比较大，会形成多个溢写文件，最后的缓冲区数据也会全部溢写入磁盘形成一个溢写文件，如果是多个溢写文件，则最后合并所有的溢写文件为一个文件。

![20210617001954380[1].png](https://s2.loli.net/2024/07/01/xX9Zz4vyNIRLVUu.png)

1. **Read 阶段**： MapTask 通过用户编写的 RecordReader ，从输入的 InputSplit 中解析出一个个 key / value 。
2. **Map 阶段**：将解析出的 key / value 交给用户编写的 Map ()函数处理，并产生一系列新的 key / value 。
3. **Collect 阶段：**在用户编写的 map() 函数中，数据处理完成后，一般会调用 **outputCollector.collect() 输出结果**，在该函数内部，它会将生成的 key / value 分片(通过调用 partitioner )，并写入一个环形内存缓冲区中(该缓冲区默认大小是 100MB )。
4. **Spill 阶段**：即“溢写”，当缓冲区快要溢出时(默认达到缓冲区大小的 80 %)，会在**本地文件系统创建一个溢出文件**，将该缓冲区的数据写入这个文件。

- 将数据写入本地磁盘前，先要对数据进行一次**本地排序**，并在必要时对数据进行**合并、压缩**等操作。写入磁盘之前，线程会根据 ReduceTask 的数量，将数据分区，一个 Reduce 任务对应一个分区的数据。

  这样做的目的是为了避免有些 Reduce 任务分配到大量数据，而有些 Reduce 任务分到很少的数据，甚至没有分到数据的尴尬局面。

  如果此时设置了 Combiner ，将排序后的结果进行 Combine 操作，这样做的目的是尽可能少地执行数据写入磁盘的操作。

5. **Combine 阶段**：当所有数据处理完成以后， MapTask 会对所有**临时文件**进行一次合并，以确保最终只会生成一个数据文件

- 合并的过程中会不断地进行排序和 Combine 操作，
- 其目的有两个：一是尽量减少每次写入磁盘的数据量;二是尽量减少下一复制阶段网络传输的数据量。
- 最后合并成了一个已分区且已排序的文件。

###### 3.执行 Shuffle 过程

MapReduce 工作过程中， Map 阶段处理的数据如何传递给 Reduce 阶段，这是 MapReduce 框架中关键的一个过程，这个过程叫作 Shuffle 。
Shuffle 会将 **MapTask 输出的处理结果数据分发给 ReduceTask ，并在分发的过程中，对数据按 key 进行分区和排序。**

###### 4.执行 ReduceTask

输入 ReduceTask 的数据流是<key, {value list}>形式，用户可以自定义 reduce()方法进行逻辑处理，最终以<key, value>的形式输出。

![20210617002008269[1].png](https://s2.loli.net/2024/07/01/NmOz8SnbXaMeAET.png)

1. **Copy 阶段：** Reduce 会从各个 MapTask 上远程复制一片数据（每个 MapTask 传来的数据都是有序的），并针对某一片数据，**如果其大小超过一定國值，则写到磁盘上，否则直接放到内存中**

2. **Merge 阶段**：在远程复制数据的同时， ReduceTask 会启动两个后台线程，分别对内存和磁盘上的文件进行合并，以防止内存使用过多或者磁盘文件过多。

3. **Sort 阶段**：用户编写 reduce() 方法输入数据是按 key 进行聚集的一组数据。
   为了将 key 相同的数据聚在一起， Hadoop 采用了基于排序的策略。
   由于各个 MapTask 已经实现对自己的处理结果进行了**局部排序**，因此， ReduceTask 只需对所有数据进行一次**归并排序即可**。

4. **Reduce 阶段：**对排序后的键值对调用 reduce() 方法，键相等的键值对调用一次 reduce()方法，每次调用会产生零个或者多个键值对，最后把这些输出的键值对写入到 HDFS 中
5. **Write 阶段**： reduce() 函数将计算结果写到 HDFS 上。
   合并的过程中会产生许多的中间文件(写入磁盘了)，但 MapReduce 会让写入磁盘的数据尽可能地少，并且最后一次合并的结果并没有写入磁盘，而是直接输入到 Reduce 函数。

###### 5.写入文件

MapReduce 框架会自动把 ReduceTask 生成的<key, value>传入 OutputFormat 的 write 方法，实现文件的写入操作。

##### MapReduce论文阅读

###### 前言

MapReduce，是 Google 早年提出了一种软件架构模型，支持大规模数据集的并行运算。现在这个概念被运用在大量分布式系统中。

相关的理论由 Google 在 2004 年发表在论文《MapReduce: Simplified Data Processing on Large Clusters》中，可以在这里阅读全文。13 页的小论文，信息密度比某些小论文不知道高到哪里去了。

由于本文是边阅读论文边记录下来的笔记，所以内容可能比较混乱。

###### 编程模型

MapReduce 是一个很简单的并行处理模型，使用 MapReduce 框架，用户只需要指定两个函数：

Map 函数，负责将一个键值对处理成一系列中间键值对
Reduce 函数，负责将所有具有相同 key 的中间值合并
剩下的，就由框架自行处理，包括数据分发、任务分发、错误处理、负载均衡等等细节。用户无需掌握这些细节，更能关注于业务逻辑。

一个大致的处理流程是这样的：

Map 接受一个输入键值对，产生一系列中间键值对。MapReduce 框架将所有具有相同的中间 key 的中间值组织到一起，传递给 Reduce 函数。Reduce 函数，接收一个中间 key 和一系列中间值，函数通常将这些值聚合成一个较小的集合，有时每次 Reduce 函数调用只会产生一个结果值，甚至不产生结果。

以大规模文本单词计数为例：

```
map(String key, String value):
    // key：文章名称
    // value：文章内容
    for 单词 w in value:
        增加中间计数(w, "1")

reduce(String key, Iterator values):
    // key：一个单词
    // value：一系列计数
    int result = 0;
    for v in values:
        result += ParseInt(v);
    输出(ToString(result))
```

###### 实现

###### 执行流程

MapReduce 作为一种编程模型或者说编程思想，实现方式可以有很多。Google 在论文中给出了一种实现方法，用于局域网内互相连接的大量机器。执行流程如下图：

![f292944c2748e9621815ada5cdb50bc7[1].png](https://s2.loli.net/2024/07/01/8MI6BTnkWy12GSt.jpg)

MapReduce 框架首先将输入文件划分为 M 片，每片通常为 16MB 到 64MB 大小。随后会启动集群中的机器（进程）。
集群中的一个进程是一个特殊的 master 进程。剩余的 worker 进程都由 master 分配任务。一共有 M 个 map 任务和 R 个 reduce 任务需要分配。master 会挑选空闲的 worker，一次分配一个 map 任务或者一个 reduce 任务。
被分配到 map 任务的 worker 读入对应分片的输入，从输入中解析出键值对，并分别将其传给用户定义的 map 函数。map 函数返回的中间键值对会被暂时缓存在内存里。
worker 内存中缓存的键值对，会被分片函数分成 R 个分片，并周期性地写进本地磁盘。这些键值对在磁盘上的位置会被发生给 master，master 负责将位置发送给被分配到 reduce 任务的 worker。
当一个 reduce worker 接收到 master 发送的这些位置，它会向保存这些内容的 map worker 发送 RPC 请求来读取这些内容。当一个 reducer worker 读取完所有的中间数据，就会将其根据 key 进行排序，这样所有相同 key 的数据就会聚合在一起。这种排序是必要的，因为通常许多不同的 key 会由同一个 reduce 任务处理。如果数据过大，可能会使用外部排序。
reduce worker 遍历有序的中间数据，对遇到的所有 key，都会将 key 和对应的值集合传给用户定义的 reduce 函数。reduce 函数的输出会被追加到一个最终的输出文件（每个 reduce 分片一个）。
当所有的 map 任务和 reduce 任务都完成后，MapReduce 的任务也就完成了。
运行结束后，MapReduce 的运行结果保存在 R 个输出文件中，通常这些文件会被用作下一个 mapreduce 任务的输入。

###### 容错

这里只考虑 worker 挂掉的情况，不考虑 master 挂掉的情况，因为这可能涉及选举共识等复杂情况。

master 和 worker 会维持一个心跳，如果一段时间没有收到 worker 的回应，就会认为这个 worker 挂掉了。所有由这个 worker 完成的 map 任务都会被重新变成未开始状态，会被重新分配给其他 worker 执行。所有挂掉时正在进行的 map 或者 reduce 任务会被标记为未开始。

已完成的 map 任务需要重新执行是因为它们的结果存储在已经挂掉机器的本地硬盘上，而已经完成的 reduce 任务无需重新执行，reduce 任务的结果被放在全局的文件系统上。

如果一个 map 任务最初由 A 执行，后来 A 挂掉了，被重新分配给 B 执行，这个消息会被通知到所有执行 reduce 任务的 worker。所有还没有从 A 中读取数据的 reduce 任务会转而选择从 B 读取数据。

有时，会出现这种情况：部分机器的性能很低，但是由于网络通畅，不会被判定为挂掉，这种机器就会成为整个系统的短板，整个系统不得不等待慢速机器慢吞吞地执行完他们的任务。对于这种情况，Google 的实现采用的一种机制来提升：在整体 MapReduce 操作快要结束时，master 会将所有仍然在进行的任务分配给其他空闲的 worker 执行。无论是原来的 worker，还是二次分配的 worker 完成了任务，这个任务都算是成功完成。

性能提升与小优化小扩展略去。

#### GFS

- GFS（google file system）	

  - 大数据存储难点：容错能力（分片副本）、数据一致性、性能（快捷）

  - 特点：大文件（分为64Mb的多个chunk块存储）、速度快、通用存储系统、chunk server副本、自动恢复、顺序读取、成本低

  - GFS架构：
    client结点
    master结点（保存元数据）：文件名—数据块列表映射、版本、主数据块、作为master的时限、log、checkpoint，磁盘存储来容错
    块handle（句柄）
    块server结点：默认副本数为3来容错，顺序存储数据

    ![20201208211708899[1].png](https://s2.loli.net/2024/07/01/z8pWkisElhwFQYB.png)

  - GFS读：

    1.client将想读的文件名，偏移量发送到master服务器

    2.master发送**块handle**和**块服务器号**等元数据给client

    3.client**缓存**master发回的数据

    4.client将请求根据元数据发送到最近的副本

    5.副本返回数据给client

  - GFS写：（追加写）

    没有主数据块：
    找到更新到最新的副本们，
    master选取一个作为**主数据块**，写入磁盘，设置主数据块的**时效**
    增加**版本号**，写入磁盘
    主数据块写入，再**同步所有副本**
    返回给client 插入成功 or 插入失败

##### GFS详解

**是什么？**
GFS是一个**可扩展的分布式文件系统**，用于大型的、分布式的、对大量数据进行访问的应用。它运行于廉价的普通硬件上，并提供容错功能。它可以给大量的用户提供总体性能较高的服务。

**为什么要用GFS?**
大量数据的存储会面临很多的难点：

大数据下需要良好的表现就需要分片和容错。在具体操作过程中，涉及到容错一般使用副本来解决，然而**副本的使用会面临不一致问题**。如果有一致性的要求，就会导致表现降低。

所谓的一致性，就是在集群中表现的像与一台机器或一个副本进行交互那样

因为GFS不但是一个理论成熟的框架结构，更是一种通过长期实际使用证明了其优秀性能的分布式架构。GFS是一种松散一致性模型，这是其具有优越的性能主要原因之一。

松散一致性模型关键：

依靠添加而不是重写
检查点
自我验证（校验和）
自我认证记录

**组成？**
一个GFS集群通常由1个Master，多个ChunkServer组成，并同时接受多个Client的访问。

**交互概要图**

![20201208211708899[1].png](https://s2.loli.net/2024/07/01/z8pWkisElhwFQYB.png)

**流程介绍：**

1. client发送请求给Master，寻找存储了对应副本的chunkserver。

2. Master通过遍历本地记录获取chunkserver的信息，包括处理信息和地址信息

   Master不但会在**启动时获取**集群中所有chunkserver的信息，还会在**后续的周期性的获取**chunkserver信息。所有的信息都是存在Master的**RAM里**

3. Master将信息返回给client

4. client之后直接通过地址信息与chunkserver交互

**GFS交互流程图：**

![a72fcfcd40764bc1adaca3eece85a10e[1].png](https://s2.loli.net/2024/07/01/KXZtz9TYPAw58mh.png)

Secondary Replica:辅助副本

**要点：**

1. **Master**通过lease(租约)和Primary Replica(主副本)本来构建交互的流程。

   Master是做出决策、创建新的块和赋值，并协调各种系统范围的活动，以保证块完全复制，平衡所有chunkserver的负载，同时还负责垃圾回收。

   Master的操作通过锁来保证命名空间范围内的序列化

2. **主副本**是从众多chunkserver中选出的**唯一特殊副本**，该副本的特殊性在于其维护了一个定时的租约列表。

3. **租约**指的是**一组由用户发来的有顺序的指令集合**

4. 主副本之外的副本都需要通过主副本中的这个列表来执行指令，以保证每个副本执行的最终结果相同。

**Master失效怎么办**
有**副本master**，拥有master状态的完整副本；GFS论文中设计需要人工干预才能切换到其中一种主故障后的副本。

**如何保障副本记录的正确性**
使用**原子记录**至少追加一次的方法。

**为什么不使用完全追加？**

如果在其中一个写入失败时客户端重新尝试写入，这将导致数据在未失败的副本上多次附加。不同的设计可能会检测到重复的客户端请求，例如，原始故障之间的主要故障请求和客户端的重试。

**应用程序如何知道哪些部分组成填充，哪些是重复记录？**
为了**检测填充**，应用程序可以放置一个可预测的幻数在有效记录的开头，或包含**一个校验和**，该校验和可能**仅当记录有效时才有效**。该应用程序可以检测通过在记录中包含唯一 ID 来复制。然后，如果它读取与先前记录具有相同 ID 的记录，它知道它们是彼此的重复。GFS 为应用程序提供了一个库处理这些情况。

**什么是校验和？**
校验和算法将**一个字节块**作为输入**并返回一个单个数字**，它是所有输入字节的函数。例如，一个简单校验和可能是输入中所有字节的总和（mod一些大数字）。GFS 存储每个块的校验和以及块。当一个chunkserver在它的磁盘上写一chunk时，它首先**计算新块的校验和，并将校验和保存在磁盘上以及块**。当一个chunkserver从磁盘读取一个chunk时，它还读取先前**保存的校验和**，从磁盘**读取的块**，并检查两个校验和是否匹配。如果数据已被磁盘损坏，校验和不匹配，并且chunkserver 会知道返回错误。另外，一些 GFS应用程序存储自己的校验和，而不是应用程序定义的记录，在 GFS 文件中，以区分正确的记录和填充。

**GFS 以正确性换取性能在多大程度上可以接受**
这是分布式系统中反复出现的主题。强一致性通常出现在需要复杂且需要交互的协议机器之间。经过利用特定应用程序类可以容忍的放松方式一致性，可以设计出具有良好性能和足够的一致性。例如，**GFS 针对 MapReduce 进行了优化对大文件需要高读取性能的应用程序可以在文件中有漏洞，记录显示多次，并且不一致的读取**。

**Google 是否仍使用 GFS？**
有传言说 GFS 已经被一个叫做Colossus，总体目标相同，但在 master 方面有所改进性能和容错性。

