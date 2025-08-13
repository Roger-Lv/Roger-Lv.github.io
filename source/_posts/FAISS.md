---
title: Faiss入门及应用经验记录
date: 2025-08-13
updated:
tags: [人工智能,向量检索]
categories: 大模型
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/LLM.jpeg
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



# Faiss入门及应用经验记录

转载：https://zhuanlan.zhihu.com/p/357414033

## 1. 什么是Faiss？

Faiss的全称是[Facebook AI Similarity Search](https://link.zhihu.com/?target=https%3A//github.com/facebookresearch/faiss)，是FaceBook的AI团队针对大规模相似度检索问题开发的一个工具，使用C++编写，有python接口，**对10亿量级的索引可以做到毫秒级检索的性能**。

简单来说，**Faiss的工作，就是把我们自己的候选向量集封装成一个index数据库，它可以加速我们检索相似向量TopK的过程，其中有些索引还支持GPU构建，可谓是强上加强。**

## 2. Faiss简单上手

首先，Faiss检索相似向量TopK的工程基本都能分为三步：

1. 得到向量库；
2. 用faiss 构建index，并将向量添加到index中；
3. 用faiss index 检索。

好吧......这貌似和废话没啥区别，参考把大象装冰箱需要几个步骤。本段代码摘自Faiss官方文档，很清晰，**基本所有的index构建流程都遵循这个步骤**。

- 第一步，得到向量：

```python3
import numpy as np
d = 64                                           # 向量维度
nb = 100000                                      # index向量库的数据量
nq = 10000                                       # 待检索query的数目
np.random.seed(1234)             
xb = np.random.random((nb, d)).astype('float32')
xb[:, 0] += np.arange(nb) / 1000.                # index向量库的向量
xq = np.random.random((nq, d)).astype('float32')
xq[:, 0] += np.arange(nq) / 1000.                # 待检索的query向量
```

- 第二步，构建索引，这里我们选用暴力检索的方法FlatL2，L2代表构建的index采用的相似度度量方法为[L2范数](https://zhida.zhihu.com/search?content_id=167555093&content_type=Article&match_order=1&q=L2范数&zhida_source=entity)，即欧氏距离：

```text
import faiss          
index = faiss.IndexFlatL2(d)             
print(index.is_trained)         # 输出为True，代表该类index不需要训练，只需要add向量进去即可
index.add(xb)                   # 将向量库中的向量加入到index中
print(index.ntotal)             # 输出index中包含的向量总数，为100000 
```

- 第三步，检索TopK相似query：

```text
k = 4                     # topK的K值
D, I = index.search(xq, k)# xq为待检索向量，返回的I为每个待检索query最相似TopK的索引list，D为其对应的距离
print(I[:5])
print(D[-5:])
```

- 打印输出为：

```text
>>> 
[[  0 393 363  78] 
 [  1 555 277 364] 
 [  2 304 101  13] 
 [  3 173  18 182] 
 [  4 288 370 531]]  
[[ 0.          7.17517328  7.2076292   7.25116253]  
 [ 0.          6.32356453  6.6845808   6.79994535]  
 [ 0.          5.79640865  6.39173603  7.28151226]  
 [ 0.          7.27790546  7.52798653  7.66284657]  
 [ 0.          6.76380348  7.29512024  7.36881447]]
```

## 3. Faiss常用index优缺点及使用场景

Faiss之所以能加速，是因为它用的检索方式并非精确检索，而是模糊检索。既然是模糊检索，那么必定有所损失，我们用**召回率来表示模糊检索相对于精确检索的损失**。

在我们实际的工程中，候选向量的数量级、index所占内存的大小、检索所需时间（是离线检索还是在线检索）、index构建时间、检索的召回率等都是我们选择index时常常需要考虑的地方。

首先，我建议关于Faiss的所有索引的构建，**都统一使用faiss.index_factory**，基本所有的index都支持这种构建索引方法。

以第二章的代码为例，构建index方法和传参方法建议修改为：

```text
dim, measure = 64, faiss.METRIC_L2
param = 'Flat'
index = faiss.index_factory(dim, param, measure)
```

- 三个参数中，dim为向量维数；
- **最重要的是param参数，它是传入index的参数，代表需要构建什么类型的索引；**
- measure为度量方法，目前支持两种，欧氏距离和inner product，即内积。**因此，要计算余弦相似度，只需要将vecs归一化后，使用内积度量即可。**
- 20220102更新，现在faiss官方支持八种度量方式，分别是：
  - METRIC_INNER_PRODUCT（内积）
  - METRIC_L1（[曼哈顿距离](https://link.zhihu.com/?target=https%3A//blog.csdn.net/hy592070616/article/details/121569933%3Fspm%3D1001.2014.3001.5501)）
  - METRIC_L2（欧氏距离）
  - METRIC_Linf（无穷范数）
  - METRIC_Lp（p范数）
  - METRIC_BrayCurtis（[BC相异度](https://zhuanlan.zhihu.com/p/440130486?utm_id=0)）
  - METRIC_Canberra（[兰氏距离/堪培拉距离](https://link.zhihu.com/?target=https%3A//blog.csdn.net/hy592070616/article/details/122271656)）
  - METRIC_JensenShannon（[JS散度](https://link.zhihu.com/?target=https%3A//blog.csdn.net/hy592070616/article/details/122387046%3Fspm%3D1001.2014.3001.5501)）

接下来笔者将介绍几种最核心的index类型的用法及优缺点，当然faiss支持的index类型非常多，但是以下这些index属于faiss最核心的几种基本index，大部分其他index是在这些核心index思想上的扩展、补充和改进，比如在PQ思想基础上的改进有SQ、OPQ、LOPQ，基于[LSH](https://zhida.zhihu.com/search?content_id=167555093&content_type=Article&match_order=1&q=LSH&zhida_source=entity)的改进有ALSH等等，使用方法和下面介绍的类似。

**3.1 Flat ：暴力检索**

- 优点：该方法是Faiss所有index中最准确的，召回率最高的方法，没有之一；
- 缺点：速度慢，占内存大。
- 使用情况：向量候选集很少，在50万以内，并且内存不紧张。
- 注：虽然都是暴力检索，**faiss的暴力检索速度比一般程序猿自己写的暴力检索要快上不少**，所以并不代表其无用武之地，建议有暴力检索需求的同学还是用下faiss。
- 构建方法：

```text
dim, measure = 64, faiss.METRIC_L2
param = 'Flat'
index = faiss.index_factory(dim, param, measure)
index.is_trained                                   # 输出为True
index.add(xb)                                      # 向index中添加向量
```

**3.2 IVFx Flat ：倒排暴力检索**

- 优点：IVF主要利用倒排的思想，在文档检索场景下的倒排技术是指，一个kw后面挂上很多个包含该词的doc，由于kw数量远远小于doc，因此会大大减少了检索的时间。在向量中如何使用倒排呢？可以拿出每个聚类中心下的向量ID，每个中心ID后面挂上一堆非中心向量，每次查询向量的时候找到最近的几个中心ID，分别搜索这几个中心下的非中心向量。通过减小搜索范围，提升搜索效率。
- 缺点：速度也还不是很快。
- 使用情况：相比Flat会大大增加检索的速度，建议百万级别向量可以使用。
- 参数：IVFx中的x是k-means聚类中心的个数
- 构建方法：

```text
dim, measure = 64, faiss.METRIC_L2 
param = 'IVF100,Flat'                           # 代表k-means聚类中心为100,   
index = faiss.index_factory(dim, param, measure)
print(index.is_trained)                          # 此时输出为False，因为倒排索引需要训练k-means，
index.train(xb)                                  # 因此需要先训练index，再add向量
index.add(xb)                                     
```

**3.3 PQx ：乘积量化**

- 优点：利用乘积量化的方法，改进了普通检索，将一个向量的维度切成x段，每段分别进行检索，每段向量的检索结果取交集后得出最后的TopK。因为PQ算法把原来的向量空间分解为若干个低维向量空间的笛卡尔积，并对分解得到的低维向量空间分别做量化（quantization）。这样每个向量就能由多个低维空间的量化code组合表示，因此速度很快，而且占用内存较小，召回效果也还可以。
- 缺点：召回率相较于暴力检索，下降较多。
- 使用情况：内存及其稀缺，并且需要较快的检索速度，不那么在意召回率
- 参数：PQx中的x为将向量切分的段数，因此，**x需要能被向量维度整除**，且x越大，切分越细致，时间复杂度越高
- 构建方法：

```text
dim, measure = 64, faiss.METRIC_L2 
param =  'PQ16' 
index = faiss.index_factory(dim, param, measure)
print(index.is_trained)                          # 此时输出为False，因为倒排索引需要训练k-means，
index.train(xb)                                  # 因此需要先训练index，再add向量
index.add(xb)          
```

**3.4 IVFxPQy 倒排乘积量化**

- 优点：工业界大量使用此方法，各项指标都均可以接受，利用乘积量化的方法，改进了IVF的k-means，将一个向量的维度切成x段，每段分别进行k-means再检索。
- 缺点：集百家之长，自然也集百家之短
- 使用情况：一般来说，超大规模数据的情况下，各方面没啥特殊的极端要求的话，**最推荐使用该方法！**
- 参数：IVFx，PQy，其中的x和y同上
- 构建方法：

```text
dim, measure = 64, faiss.METRIC_L2  
param =  'IVF100,PQ16'
index = faiss.index_factory(dim, param, measure) 
print(index.is_trained)                          # 此时输出为False，因为倒排索引需要训练k-means， 
index.train(xb)                                  # 因此需要先训练index，再add向量 index.add(xb)       
```

**3.5 LSH 局部敏感哈希**

- 原理：哈希对大家再熟悉不过，向量也可以采用哈希来加速查找，我们这里说的哈希指的是局部敏感哈希（Locality Sensitive Hashing，LSH），不同于传统哈希尽量不产生碰撞，局部敏感哈希依赖碰撞来查找近邻。高维空间的两点若距离很近，那么设计一种哈希函数对这两点进行哈希计算后分桶，使得他们哈希分桶值有很大的概率是一样的，若两点之间的距离较远，则他们哈希分桶值相同的概率会很小。
- 优点：训练非常快，支持分批导入，index占内存很小，检索也比较快
- 缺点：召回率非常拉垮。
- 使用情况：候选向量库非常大，离线检索，内存资源比较稀缺的情况
- 构建方法：

```text
dim, measure = 64, faiss.METRIC_L2  
param =  'LSH'
index = faiss.index_factory(dim, param, measure) 
print(index.is_trained)                          # 此时输出为True
index.add(xb)       
```

**3.6 HNSWx （最重要的放在最后说）**

- 优点：该方法为基于图检索的改进方法，检索速度极快，10亿级别秒出检索结果，而且召回率几乎可以媲美Flat，最高能达到惊人的97%。检索的时间复杂度为loglogn，几乎可以无视候选向量的量级了。并且支持分批导入，极其适合线上任务，毫秒级别体验。
- 缺点：构建索引极慢，占用内存极大（是Faiss中最大的，大于原向量占用的内存大小）
- 参数：HNSWx中的x为构建图时每个点最多连接多少个节点，x越大，构图越复杂，查询越精确，当然构建index时间也就越慢，x取4~64中的任何一个整数。
- 使用情况：不在乎内存，并且有充裕的时间来构建index
- 构建方法：

```text
dim, measure = 64, faiss.METRIC_L2   
param =  'HNSW64' 
index = faiss.index_factory(dim, param, measure)  
print(index.is_trained)                          # 此时输出为True 
index.add(xb)
```

## 4. 使用Faiss时踩过的坑和一些经验

**4.1 以下是我的同事对不同index做过的一些对比实验结果：**

![img](https://pica.zhimg.com/v2-ee956dee3cb177af3281fba6ee5e1b86_1440w.jpg)

召回率、搜索时间对比

![img](https://pica.zhimg.com/v2-b9e534c3995604e4d3ea5e077d0c37de_1440w.jpg)

召回率、检索时间、内存消耗、构建时间对比

**4.2 Faiss可以组合传参**

Faiss内部支持先将向量PCA降维后再构建index，param设置如下：

```text
param = 'PCA32,IVF100,PQ16'
```

代表将向量先降维成32维，再用IVF100 PQ16的方法构建索引。

同理可以使用：

```text
param = 'PCA32,HNSW32'
```

可以用来处理HNSW内存占用过大的问题。

**4.3 Faiss在构建索引时，有时生成的vecs会很大，向index中添加的向量很有可能无法一次性放入内存中，怎么办呢？**

- 这时候，索引的可分批导入index的性质就起了大作用了；
- 如何来知道一种index是否可以分批add呢？一般来说在未对index进行train操作前，如果一个index.is_trained = True，那么它就是可以分批add的；
- 如果是index.is_trained = False，就不能分批导入，当然，其实强行对index.is_trained = False的索引分批add向量是不会报错的，只不过内部构建索引的逻辑和模型都在第一个batch数据的基础上构建的，比如PCA降维，其实是拿第一个batch训练了一个PCA模型，后续add进入的新向量都用这个模型降维，这样会**导致后续batch的向量失真，影响精度，当然如果不在意这点精度损失那也可以直接add；**
- **由上可得，只要一个index的param中包含PCA，那他就不能分批add；**
- **可以分批导入的index为：HNSW、Flat、LSH。**

**4.4 如果我们的需求，既想PCA降维减小index占用内存，还想分批add向量，该怎么办？**

可以使用sklean中的增量pca方法，先把数据降维成低维的，再将降维后的向量分批add进索引中，增量pca使用方法和pca一致：

```python3
from sklearn.decomposition import IncrementalPCA
```

**4.5 关于HNSW**

HNSW虽好，可不要贪杯哦，这里坑还是蛮多的：

- HNSW的构建过程有时很短，有时却又很长，500万量级的向量快时可以15分钟构建完毕，慢则有可能花费两小时，这和HNSW构建多层图结构时的生成函数有关。
- 老版本faiss的HNSW在使用以下这种构建索引方式时，有一个bug，这个bug会导致如果measure选用内积的方法度量，但最后构建的索引的度量方式仍然是欧氏距离：

```text
index = faiss.index_factory(dim, param, measure)  
```

如果想构建以内积（余弦相似度）为基准的HNSW索引，可以这样构建：

```python3
index = faiss.IndexHNSWFlat(dim, x,measure)  # measure 选为内积，x为4~64之间的整数
```

- 所以直接建议使用新版本faiss，版本最好 > 1.7，无此bug。
- HNSW占用内存真的很大，500万条768维的向量构建的索引占用内存17G，而同样数据下LSH仅占用500M，emmm所以自行体会吧。
- HNSW的检索候选可能不会很多，笔者的经验是一般500w的候选集，用HNSW64构建索引，检索top1000的时候就开始出现尾部重复现象，这其实就是HNSW在他的构建图中搜索不到近邻向量了，所以最后会用一个重复的id将尾部padding，让输出list补满至1000个，虽然IVF、PQ都会出现这个问题，但是HNSW会特别明显，这个和算法本身的原理有关。

**4.6 Faiss所有的index仅支持浮点数为float32格式**

Faiss仅支持浮点数为np.float32格式，其余一律不支持，所以用Faiss前需要将向量数据转化为float32，否则会报错！**这也告诉大家，想用降低精度来实现降低index内存占用是不可能的！**

## **5.Faiss构建索引时，如何权衡数据量级和内存占用来选择index呢？**

这里有一份Faiss的官方文档，里面写的很清楚：

[![img](https://pic3.zhimg.com/v2-664d8a9743a39216fca1dd77ca259978_ipico.jpg)Faiss官网，如何选择index类型github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index](https://link.zhihu.com/?target=https%3A//github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index)

关于Faiss中index的更多详细信息，请参考官网：

[Faiss index factory介绍github.com/facebookresearch/faiss/wiki/The-index-factory](https://link.zhihu.com/?target=https%3A//github.com/facebookresearch/faiss/wiki/The-index-factory)