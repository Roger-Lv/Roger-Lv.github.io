---
title: P4&SRV6
date: 2024-06-24
updated:
tags: [SDN,P4,SRV6]
categories: SDN
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/SDN.png
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

# B-EP2

背景：互联网变得臃肿，网络管理员迫切需要一种快速高效的**网络遥测方案**，能够利用采集到的实时准确的网络状态信息来快速检测和定位常见网络故障，然后需要一个有效的**网络控制和管理（NC&M）方案**，以实现只能及时决策以在网络路径上**梳理和路由流量**，以同时实现**高效的利用和高质量的服务（QoS**）。

- 采集网络信息，定位故障
- 有效的网络控制和管理方案

[(465条消息) P4学习笔记（一）初识P4_p4接口是干嘛的_程序员学编程的博客-CSDN博客](https://blog.csdn.net/hjxzb/article/details/91141685?ops_request_misc=%7B%22request%5Fid%22%3A%22168753985816782427413509%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=168753985816782427413509&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-91141685-null-null.142^v88^control_2,239^v2^insert_chatgpt&utm_term=P4&spm=1018.2226.3001.4187)

1. 基于P4的主动遥测
   - 探针代替数据分组进行遥测，降低了遥测开销（因为数组分组比如INT即带内网络遥测[(460条消息) 带内网络遥测INT--In-band Network Telemetry_袁冬至的博客-CSDN博客](https://blog.csdn.net/weixin_47104688/article/details/123229563?ops_request_misc=%7B%22request%5Fid%22%3A%22168606788516800222871187%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=168606788516800222871187&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-123229563-null-null.142^v88^control_2,239^v2^insert_chatgpt&utm_term=INT带内&spm=1018.2226.3001.4187)
   
     ![SDN.png](https://s2.loli.net/2024/06/24/pdxWMcIf7mgeRLJ.jpg)
   
     https://www.sdnlab.com/23822.html
   
     [(465条消息) Telemetry 技术概述_LeocenaY的博客-CSDN博客](https://blog.csdn.net/changqing1234/article/details/103669835?spm=1001.2101.3001.6661.1&utm_medium=distribute.pc_relevant_t0.none-task-blog-2~default~BlogCommendFromBaidu~Rate-1-103669835-blog-123229563.235^v38^pc_relevant_anti_t3&depth_1-utm_source=distribute.pc_relevant_t0.none-task-blog-2~default~BlogCommendFromBaidu~Rate-1-103669835-blog-123229563.235^v38^pc_relevant_anti_t3&utm_relevant_index=1)
   
     ，在转发数据分组时能够在数据在网络结构流动的过程中，通过在路径中间节点插入元数据，监控系统可以通过这些元数据进行收集网络状态，但这样载荷比就大)，INT之类的带内网络遥测也存在一些局限性，难以获取全局网络试图。这样就加入了探针进行主动遥测，提高数据分组的有效载荷比。
   
     [一文读懂带内网络遥测技术 | SDNLAB | 专注网络创新技术](https://www.sdnlab.com/23822.html)
   
2. 基于段路由（基于IPV6的一向技术）

   

   ![image-20230607005803362.png](https://s2.loli.net/2024/06/26/CJNZUQIAzHT2E6O.png)

   [(460条消息) 广域网技术——SRv6 SID讲解_静下心来敲木鱼的博客-CSDN博客](https://blog.csdn.net/m0_49864110/article/details/123591943?ops_request_misc=%7B%22request%5Fid%22%3A%22168606977016800225513092%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=168606977016800225513092&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-123591943-null-null.142^v88^control_2,239^v2^insert_chatgpt&utm_term=SRV6&spm=1018.2226.3001.4187)

   [(465条消息) 1.2、SRv6(Segment Routing Over IPv6) 介绍_srv6技术是什么_Ether_Dzh的博客-CSDN博客](https://blog.csdn.net/Ether_Dzh/article/details/119847548?ops_request_misc=%7B%22request%5Fid%22%3A%22168754187716800227440687%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=168754187716800227440687&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_click~default-2-119847548-null-null.142^v88^control_2,239^v2^insert_chatgpt&utm_term=SRV6&spm=1018.2226.3001.4187)

   ![网络编程.png](https://s2.loli.net/2024/06/24/zMpDeVWXRC46Fnd.jpg)
   
   - 改变SR标签和排列顺序指定探测路径
   - 探针加入SR标签栈获取全面的网络视图，环形探测路径，单个探测点具备探针发送端和接收端功能，减少多个探测点之间同步协调探针等复杂操作。
   - 减少遥测冗余，探针分组中加入遥测指示域，指定需要采集的遥测数据
   - 将可编程设备的内部状态的状态信息嵌入到探针中，通过可编程设备的定制化能力自定义数据分组处理逻辑来是实现。

SDN控制面：可编程环境

可集中控制网络：SDN域由集中统一的控制单元实施管理

转发和控制分离

P4：

- 可以对网络设备芯片逻辑进行编程

- 可重配置性：支持转发逻辑代码经过编译部署到具体平台上之后动态修改报文

- 不绑定某个具体的网络协议

- 平台无关性：独立于特定的底层运行平台来编写数据报文处理逻辑

- 需要特定交换机的支持

- 数据采集与感知：

  1. 通过ONOS（一体化的网络操作系统）的Restful北向接口查询得到的ONOS特有数据库内的全局网络信息（但忽略细节）[(460条消息) ONOS预热篇之ONOS简介_weixin_34384681的博客-CSDN博客](https://blog.csdn.net/weixin_34384681/article/details/91849632?ops_request_misc=%7B%22request%5Fid%22%3A%22168606907716800227458444%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=168606907716800227458444&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~baidu_landing_v2~default-6-91849632-null-null.142^v88^control_2,239^v2^insert_chatgpt&utm_term=ONOS&spm=1018.2226.3001.4187)
  2. 数据层交换机中的数据流，插入探针，数据采集服务链，提取各个包的特征进行统计
  3. 基于段路由机制，进行INT主动遥测（INT本身是有局限性的，探测路径需要提前指定，而借助段路由机制进行主动网络遥测，降低成本提高了灵活性），流量包中插入探针，快速获取探测包路径上的第一手数据平面遥测数据

- 这里的智能分析与决策采用深度学习相关的东西

- 可编程动态管控（P4）：仅管理数据平面如何处理数据包，定义控制平面与数据平面通信的接口，但不描述控制平面功能

- 传统交换机和P4交换机

  在传统交换机中，制造商定义了数据平面的功能，控制平面通过一些管理表（如路由表）中的条目以及处理控制数据包（如路由协议数据包）或异步事件（如链路状态更改或学习通知）来控制数据平面。

  P4可编程交换机与传统交换机的区别主要体现在两个方面：

  - 数据平面功能不是预先固定的，而是由 P4 程序定义的。数据平面在初始化时配置为实现 P4 程序描述的功能（由红色长箭头显示），并且没有现有网络协议的内置知识。
  - 控制平面使用与固定功能设备中相同的通道与数据平面进行通信，但数据平面中的表集合和其他对象不再是固定的，因为它们由 P4 程序定义。P4 编译器生成控制平面用于与数据平面通信的 API。

- 控制平面（SDN控制器）如何与P4的设备进行通信？

  - P4Runtime（基于gRPC框架）

  - OpenFlow协议中，控制器和设备是由控制器开放端口，设备才能连接上控制器；而P4Runtime是设备上开始gRPC,控制器连接设备，因此，在支持P4的设备上也会有一个代理的Agent去处理控制器来的连接

    

鉴于基于P4的被动网络遥测可扩展性不足的缺点，首先要保证的就是主动遥测的探测路径在运行时是灵活可控的，我们采用段路由机制来灵活控制探针的探测路径（这里的路径生成采用了[Hierholzer *算法*，欧拉回路](https://blog.csdn.net/KCDCY/article/details/124732427?ops_request_misc=%7B%22request%5Fid%22%3A%22168606887816800222897225%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=168606887816800222897225&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-124732427-null-null.142^v88^control_2,239^v2^insert_chatgpt&utm_term=欧拉通路算法)）。段路由机制简单易用，不需要额外的协议支持，通过组合一系列简单的网络操作指令就可以完全控制数据分组的转发路径。在降低了网络成本的同时也提高了灵活性。最后段路由能够支持增量部署，降低了部署难度，可行性好。该系统下可以灵活定义遥测路径，按需探测可能或已经出现问题的路径，快速定位故障位置。同时，可以在探针格式中加入探测遥测数据类型的字段来支持按需获取遥测数据。同时要保证能够采集到网络设备内部的状态信息等细粒度准确的遥测数据，我们可以通过修改可编程设备的数据平面处理逻辑来区分正常数据分组和探针数据分组，对于正常数据分组直接正常转发，而对于探针数据分组匹配其中的路径转发标签以及遥测指令字段，将实时的网络状态信息封装在探针数据分组中。