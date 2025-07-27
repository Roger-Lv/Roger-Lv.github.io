---
title: TOR Leaf Spine交换机
date: 2025-06-25
updated:
tags: [集群,分布式系统,基础架构]
categories: 计算机网络
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



# TOR Leaf Spine交换机

### Spine、Leaf、ToR 交换机：数据中心网络的三层核心架构

这三种交换机是现代数据中心网络架构（通常称为 **Spine-Leaf 架构**）的核心组件，主要用于处理东西向流量（服务器之间的流量），替代了传统的三层网络架构（接入层-汇聚层-核心层）。

#### 1. ToR（Top-of-Rack）交换机 - **接入层**

- **位置**：位于服务器机柜顶部

- 功能：

  - 直接连接机柜内的服务器（每个ToR连接12-48台服务器）
  - 提供1G/10G/25G端口连接服务器
  - 提供40G/100G/400G上行端口连接Leaf层
  - 实现机柜内部服务器之间的数据交换
  
- 特点：

  - 端口密度高
- 部署成本低（单机柜部署）
  - 易于维护（故障仅影响单个机柜）

- 应用场景：

  ```
  [机柜]
  |-- ToR 交换机
      ├── 服务器1
      ├── 服务器2
      └── ...（其他服务器）
  ```

#### 2. Leaf 交换机 - **汇聚层**

- **位置**：位于一组机柜的中心汇聚点

- 功能：

  - 汇聚多个ToR交换机的流量
  - 提供跨机柜通信能力
  - 连接所有Spine交换机（全互连架构）
  - 实施网络策略（ACL、QoS等）
  
- 特点：

  - 高上行带宽（通常100G/400G端口）
- 支持ECMP（等价多路径）
  - 可堆叠或集群部署

- 连接关系：

  ```
  Leaf 交换机
  ├── ToR 交换机1 (机柜1)
  ├── ToR 交换机2 (机柜2)
  ├── ...
  └── Spine 交换机（所有）
  ```

#### 3. Spine 交换机 - **核心层**

- **位置**：数据中心网络核心

- 功能：

  - 连接所有Leaf交换机
  - 提供Leaf之间的高速互连
  - 不连接任何服务器
  - 实现数据中心的横向扩展
  
- 特点：

  - 超高背板带宽（通常>10Tbps）
- 低延迟（微秒级转发）
  - 高端口密度（通常48-128个100G+端口）

- 关键作用：

  ```
  Spine 交换机（Spine 1）   Spine 交换机（Spine 2）
       |       |                   |       |
    Leaf1    Leaf2              Leaf1    Leaf2
     / \      / \                / \      / \
   ToR1 ToR2 ToR3 ToR4        ToR1 ToR2 ToR3 ToR4
  ```

### 三层架构的工作原理

```
服务器A → ToR交换机1 → Leaf交换机1 
                      ↘
                      Spine交换机（所有）
                      ↗
服务器B → ToR交换机2 → Leaf交换机2
```

1. **同一机柜通信**
   (服务器A → ToR → 服务器B) ：流量不离开机柜
2. **同Leaf不同机柜通信**
   (服务器A → ToR1 → Leaf → ToR2 → 服务器C) ：流量在Leaf层完成
3. **跨Leaf通信**
   (服务器A → ToR1 → Leaf1 → Spine → Leaf2 → ToR2 → 服务器D) ：必经Spine层

### 与传统三层架构对比

| **特性**       | 传统架构（核心-汇聚-接入） | Spine-Leaf 架构   |
| -------------- | -------------------------- | ----------------- |
| 扩展性         | 垂直扩展（纵向）           | 水平扩展（横向）  |
| 最大跳数       | 4跳以上                    | 固定2跳           |
| 带宽收敛比     | 4:1 或更高                 | 1:1（无阻塞）     |
| 东西向流量优化 | 差                         | 极佳              |
| 故障域         | 大范围                     | 隔离域小          |
| 适用场景       | 南北向流量为主             | 云计算/虚拟化环境 |

### 技术演进趋势

1. **融合架构**：现代超融合系统中，ToR和Leaf常合并为分布式架构
2. **智能网卡**：在ToR层引入DPU/IPU智能网卡卸载网络功能
3. **光电混合**：Spine层开始采用光电混合交换技术提高能效比
4. **可编程芯片**：P4可编程芯片在Leaf和Spine层逐渐普及

现代云数据中心（如AWS/Azure/GCP）大多采用这种架构，Facebook甚至实现了单层Spine架构（称为F16），支持数十万台服务器的无阻塞通信。