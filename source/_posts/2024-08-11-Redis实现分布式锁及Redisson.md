---
title: Redis实现分布式锁及Redisson
date: 2024-08-11
updated:
tags: [Java,后端,Redis,分布式锁]
categories: 后端
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/Redis.webp
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

# Redis实现分布式锁及Redisson

​	分布式锁是控制分布式系统之间同步访问共享资源的一种方式。

​	在分布式系统中，常常需要协调他们的动作，若不同的系统或是同一个系统的不同主机之间共享了一个或一组资源，那么访问这些资源的时候，往往需要互斥来防止彼此干扰来保证[一致性](https://baike.baidu.com/item/一致性?fromModule=lemma_inlink)，这个时候，便需要使用到分布式锁。

![image-20240811183351968.png](https://s2.loli.net/2024/08/11/YoWBi2jXDCratgx.png)

## 例子：商品秒杀超卖

### 1. 无锁

![image-20240811183509559.png](https://s2.loli.net/2024/08/11/1hIc83xbNWUgKv2.png)

这是一个订单库存的例子，库存stock为1，这里很容易会发现容易造成多次下单成功的错误。

### 2. 加同步锁

![image-20240811183631363.png](https://s2.loli.net/2024/08/11/b6XwlNH2iLxFPQf.png)

这里在单机情况下确实能够满足不出现超卖的问题。



缺点：如果作Nginx进行负载均衡+分布式集群部署，依然会出现超卖问题。

- 原因是同步锁`synchronized`是JVM级别的，每台服务器在并发情况下，只能锁住一个线程。

![image-20240811184041126.png](https://s2.loli.net/2024/08/11/ToOWu59JGKh3y2b.png)

所以，如何处理这种分布式的情况呢？

### 3. Redis or Zookeeper

由于系统已经使用到了Redis，为了系统的轻量避免冗余引入新组件，选择通过Redis来进行实现分布式锁。

## Redis实现分布式锁

### 1. SETNX和SET NX命令

[Windows版Docker安装Redis教程(保姆级)，适合开发环境快速提供Redis服务_windows docker 安装redis-CSDN博客](https://blog.csdn.net/BXD19931010/article/details/135065606?ops_request_misc=&request_id=&biz_id=102&utm_term=windows docker安装redis&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-3-135065606.142^v100^pc_search_result_base8&spm=1018.2226.3001.4187)

```shell
# 创建容器并执行
docker run -it --name redis -p 6379:6379 redis --bind 0.0.0.0 --protected-mode no
# 后台运行容器
docker run -it -d redis
docker ps
# exec表示在运行的容器中执行命令 it表示以终端交互的方式执行命令 /bin/bash表示需要指定的命令
docker exec it redis /bin/bash
# 进入容器后可通过redis-cli命令连接容器内的redis服务器，可通过set创建变量，get获取变量的值
redis-cli
```

​	`Redis`实现分布式锁的核心便在于`SETNX`命令，它是`SET if Not eXists`的缩写，如果键不存在，则将键设置为给定值，在这种情况下，它等于SET；当键已存在时，不执行任何操作；成功时返回1，失败返回0

​	但`setnx`不能同时完成`expire`设置失效时长，不能保证`setnx`和`expire`的原子性。我们可以使用`set`命令完成`setnx`和`expire`的操作，并且这种操作是原子操作。

​	下面是`set`命令的可选项：

```shell
set key value [EX seconds] [PX milliseconds] [NX|XX]
EX seconds：设置失效时长，单位秒
PX milliseconds：设置失效时长，单位毫秒
NX：key不存在时设置value，成功返回OK，失败返回(nil)
XX：key存在时设置value，成功返回OK，失败返回(nil)
```

- 使用示例：

  - 两次插入相同键不同值，第一次返回成功，第二次返回失败：

    ![image-20240811191203670.png](https://s2.loli.net/2024/08/11/2Gs4CMv78hiuzlx.png)

  - 设置过期时间（十秒）：

    ![image-20240811191459809.png](https://s2.loli.net/2024/08/11/9cB6eCYJLUnwRxQ.png)

    

    

### 2. 通过Redis的SETNX实现分布式锁

命令 SET resource-name anystring NX EX max-lock-time 是一种在 Redis 中实现锁的简单方法

```shell
#给lock设置了过期时间为60000毫秒(也可以用ex 6000,单位就变成了秒)，当用NX再次赋值，则返回nil,不能重入操作
127.0.0.1:6379> set lock true NX px 60000
OK
127.0.0.1:6379> set lock true NX px 6000
(nil)
127.0.0.1:6379> get lock
"true"
127.0.0.1:6379> ttl lock
(integer) 43
#时间过期后再次get,返回nil,表明key 为 lock的锁已经释放
127.0.0.1:6379> get lock
(nil)

```

如果setnx 返回ok 说明拿到了锁；如果setnx 返回 nil，说明拿锁失败，被其他线程占用。

换成客户端服务器则是如下：

- 客户端执行以上的命令：
  - 如果服务器返回 OK ，那么这个客户端获得锁。
  - 如果服务器返回 NIL ，那么客户端获取锁失败，可以在稍后再重试。

![image-20240811190440207.png](https://s2.loli.net/2024/08/11/IKD3wsvdYLnlfuM.png)

#### 问题一：为什么需要PX/XX设置超时时间？

答：如果第一个set的进程A不讲道理/突然宕机，锁永远释放不了，导致系统中其他机器的其他线程谁也拿不到锁。

#### 问题二：设置了超时时间还有什么问题吗？

1. 如果第一个set的进程A又不讲道理，业务步骤时间超过设置的超时时间，那么就会导致其他进程拿到锁（趁虚而入），导致超卖问题。
2. 同时，等进程A回来了，回手就是把其他进程的锁删了/释放其他线程的锁，就会更加趁虚而入导致超卖。

**解决办法：**

1. 加长锁的过期时间，并添加子线程每隔10秒确认主线程是否在线，如果在线则将过期时间重新设置（给锁续命）。
2. 给锁加上UUID（锁与线程的唯一性），这样就不会释放别人的锁了。



以上解决方案要确保代码的正确性、健壮性还是比较麻烦的，在此引入`Redisson`工具。



## Redisson

### Redisson原理

![image-20240811200433350.png](https://s2.loli.net/2024/08/11/ghpivaGCYZNtf6d.png)

这里的原理就是上面提到的那两点。

### 问题及解决方案

因为`Redis`是满足`AP`（高可用+分区容错），当`Redis`采用集群（主从节点），这里的加锁只会往`Redis`的一个节点去加锁，比如对主节点加锁了，这时主节点会去从节点那进行锁状态的同步。倘若这时主节点挂掉了，从节点没有有效同步，依然会发生线程不安全的情况。

解决方案：

- 采用`redlock`（红锁）实现：对`Redis`的所有节点都进行加锁后，才返回响应。

  [Redisson-红锁(Redlock)-使用/原理 - 自学精灵 (way2j.com)](https://way2j.com/a/1338)

  

