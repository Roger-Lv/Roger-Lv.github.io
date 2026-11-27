---
title: IPoIB 与 pkey 子接口:InfiniBand 世界里的"IP 网卡 + VLAN"
date: 2026-10-09
updated:
tags: [InfiniBand,IPoIB,RDMA,SR-IOV,Spiderpool,Kubernetes,云原生]
categories: 云原生
keywords:
description: IPoIB 是运行在 InfiniBand 之上的"IP 网卡"仿真层,pkey 子接口则是按分区键虚拟出的子接口——两者组合就是 IB 世界对"IP 网卡 + VLAN 子接口"的对应物。拆解 InfiniBand 与以太网在寻址体系上的根本差异、IPoIB 的两种工作模式、pkey 的分区隔离机制、与 macvlan 的"形似而神不似",以及 ipoib CNI 在 Kubernetes 中的落地。
top_img: /img/default_top_img.jpg
comments:
cover:
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

# IPoIB 与 pkey 子接口:InfiniBand 世界里的"IP 网卡 + VLAN"

IPoIB(IP over InfiniBand)接口是运行在 InfiniBand 物理网络之上的"IP 网卡",pkey 子接口则是在这张 IP 网卡上按"分区键"虚拟出的子接口——两者的组合,就是 InfiniBand 世界里对"IP 网卡 + VLAN 子接口"的对应物。

之所以需要它们,根源在于 **InfiniBand 与以太网是两套截然不同的 L2 体系**。

---

## 一、前提:InfiniBand 不是以太网

理解 IPoIB + pkey,必须先放下以太网的思维惯性。InfiniBand 是一套独立的链路层协议,从硬件寻址开始就和以太网不同:

| 维度 | 以太网 | InfiniBand |
| --- | --- | --- |
| 硬件地址 | 48 位 MAC 地址,烧录在网卡里 | 无 MAC;由 GUID(端口全局唯一 ID)+ LID(子网内本地 ID,由子网管理器动态分配)标识 |
| 单播地址概念 | MAC | GID(128 位,基于 GUID 生成,兼容 IPv6 格式) |
| 连接标识 | 五元组(IP+端口) | QPN(Queue Pair Number,队列对编号) |
| 网络拓扑发现 | 交换机自学习(flood-and-learn) | 集中式子网管理器(SM,如 OpenSM)预先计算所有路由并下发 |
| 传输语义 | 尽力而为帧 | UD(不可靠数据报)/ RC(可靠连接)/ UC / RD 等多种服务 |

最关键的一点:**InfiniBand 端口没有 MAC 地址,帧的转发基于 LID/GID/QPN,而不是 MAC。** 这就是为什么 macvlan 无法用于 InfiniBand 的根本原因——macvlan 驱动靠 MAC 地址做多路复用,而 IB 网络里根本没有 MAC 可供分发。

---

## 二、IPoIB 接口:在 IB 之上造一张"IP 网卡"

InfiniBand 原生只提供 RDMA 语义(verbs 编程模型),应用必须改造才能使用。IPoIB 的角色就是**提供一个 IP 网络仿真层,让标准 TCP/IP 应用不做修改就能跑在 InfiniBand 上**。

```
┌───────────────────────────────┐
│  应用 / 内核 IP 栈             │  ← IPoIB 接口在这里 (ib0)
├───────────────────────────────┤
│  IPoIB 驱动 (ib_ipoib)        │  ← 封装 IP 报文为 IB UD/RC 传输
├───────────────────────────────┤
│  InfiniBand 传输层 (UD/RC)    │
├───────────────────────────────┤
│  InfiniBand 链路层 (LID/GID)  │
└───────────────────────────────┘
```

驱动加载后,会为每个 IB 端口创建一个接口(如 `ib0`)。IPoIB 有两种工作模式,通过 `/sys/class/net/<接口>/mode` 切换:

- **Datagram 模式**:使用 IB UD(不可靠数据报)传输。MTU 受限于 IB 链路层 MTU 减去 4 字节 IPoIB 头(典型 2048 - 4 = **2044**);
- **Connected 模式**:使用 IB RC(可靠连接)传输。MTU 可达 **64K**,大报文由网卡硬件分段重组,大流量性能更好,但每个对端都要维护 QP,内存开销大。

`ip link` 看到的 IPoIB 接口长这样——注意 `link/infiniband` 开头的"MAC"其实是 20 字节的 GID,而非以太网 MAC:

```bash
$ ip link show ib0
... link/infiniband 00:00:10:49:fe:80:00:00:00:00:00:00:e8:eb:d3:03:00:93:ae:10 brd ...
```

---

## 三、pkey:InfiniBand 的"VLAN"

InfiniBand 从协议设计之初就内建了网络分区机制,这就是 **pkey(Partition Key)**。

pkey 是一个 16 位整数,作用与以太网 VLAN tag 几乎完全对应:

| 维度 | 以太网 VLAN | InfiniBand Pkey |
| --- | --- | --- |
| 值空间 | 12 位(1-4094) | 15 位(0x0001-0x7FFF) |
| 标识方式 | 帧头中的 802.1Q tag | IB 包头中的 P_Key 字段 |
| 分区默认值 | VLAN 1 | pkey 0x7FFF(默认分区,所有节点加入) |
| 隔离效果 | 不同 VLAN 二层隔离 | 不同 pkey 的端口间无法通信 |
| 管理位置 | 交换机配置 | 子网管理器(OpenSM)的 partitions.conf |
| 成员类型 | 无(Trunk/Access 二分) | full(0x8000 高位置位)/ limited membership |

pkey 隔离在**数据包层面强制执行**:IB 包到达端口时,交换机/网卡会比对包头中的 pkey 与该端口被授权加入的 pkey 集合,不匹配则丢弃。所以即使两个节点物理上接在同一台 IB 交换机上,若 SM 未把它们划入同一个 pkey,它们也无法通信——这和 VLAN 的隔离语义一致。

P_Key 的低 15 位标识分区，最高位标识成员类型。同一分区的两个端口至少有一端是 **full member**，才能通过这项成员资格检查；两个 **limited member** 不能直接互通。下文的 Linux IPoIB 子接口示例采用全成员值 `0x8001`。[NVIDIA 对 P_Key 成员资格的说明](https://docs.nvidia.com/networking/display/NVIDIAWinOF2Documentationv25750000/InfiniBand%2BNetwork)

---

## 四、pkey 子接口:ib0.8001 的含义

有了 pkey 概念,"pkey 子接口"就顺理成章了:**在 IPoIB 主接口上按 pkey 值创建子接口**,每个子接口承载一个分区内的 IP 流量——形式上和 VLAN 子接口(eth0.100)几乎一模一样。

```
ib0 (IPoIB 主接口, 默认 pkey 0x7FFF)
 ├── ib0.8001   (pkey 0x0001, full membership)
 ├── ib0.8002   (pkey 0x0002, full membership)
 └── ib0.8064   (pkey 0x0064, full membership)
```

命名规则由内核固定:`<父接口名>.<pkey十六进制值>`,且值中必须包含 0x8000 高位。这就是为什么 `ib0.8001` 对应 pkey 0x0001,`ib0.8064` 对应 pkey 0x0064。

在 Linux 上创建 pkey 子接口有两种方式:

```bash
# 方式一:echo 到 sysfs
echo 0x8001 > /sys/class/net/ib0/create_child

# 方式二:标准 ip 命令
ip link add link ib0 name ib0.8001 type ipoib pkey 0x8001
ip link set ib0.8001 up
ip addr add 172.91.0.10/16 dev ib0.8001
```

> **一个高频踩坑点**:pkey 的定义在 SM 侧(OpenSM 的 partitions.conf)和 Linux 侧的写法不一致——SM 侧用基础值(不带 0x8000,如 0x0001),Linux 创建子接口时必须加 0x8000(如 0x8001),否则会报 `P_Key 0x8001 is not found` 或 `Invalid Pkey`。

---

## 五、与 macvlan 的对比:形似而神不似

把两者并排放,结构高度对称,但机制完全不同:

| 维度 | macvlan(以太网) | pkey 子接口(InfiniBand) |
| --- | --- | --- |
| 父接口类型 | 物理网卡 / bond / VLAN 接口 | IPoIB 主接口 |
| 多路复用依据 | MAC 地址(每子接口独立 MAC) | pkey(所有子接口共享同一 GID,但分属不同分区) |
| 子接口是否改变 MAC | 是(每子接口生成新 MAC) | 否(共享父接口 GID,仅 pkey 不同) |
| 分发机制 | macvlan 驱动 rx_handler 按 MAC 查哈希表 | IB 硬件/SM 按 pkey 匹配端口分区表 |
| 隔离来源 | Linux netns + 可选模式 | InfiniBand 硬件层强制(SM 下发 PKey 表) |
| 典型用途 | 给多 Pod 提供独立 L2 身份 | 给不同租户/应用划分 IB 网络分区 |

一句话总结差异:**macvlan 是"用 CPU 在内核软件层模拟交换机按 MAC 分发",pkey 子接口是"让 IB 硬件本身按分区键分发"。** 前者靠软件,后者靠硬件和 SM 的集中式管理。

---

## 六、Kubernetes 中的落地:Spiderpool 的 ipoib CNI

在 K8s 场景下,这套机制通过 ipoib CNI 插件暴露给 Pod。Mellanox 的 ipoib-cni 的核心功能就是一句话:"创建 IPoIB child link 并移入 Pod":

```json
{
  "name": "mynet",
  "type": "ipoib",
  "master": "ib0",
  "ipam": { "type": "host-local", "subnet": "192.168.2.0/24" }
}
```

`master` 指定宿主机上的 IPoIB 主接口,插件会在其上创建子接口,移入 Pod netns,交给 IPAM 分配 IP。

Spiderpool 也原生支持这个方案,通过 SpiderMultusConfig 声明 `cniType: ipoib` 并指定 `spec.ipoib.master` 为节点的 IB 接口:

```yaml
apiVersion: spiderpool.spidernet.io/v2beta1
kind: SpiderMultusConfig
metadata:
  name: ipoib-config
spec:
  cniType: ipoib
  ipoib:
    master: "ib0"    # 宿主机 IPoIB 主接口
```

Spiderpool 文档明确指出两种 InfiniBand 接入方式的定位差异:

- **IPoIB CNI**:提供一张 IPoIB 网卡(无 RDMA 设备),适合常规 TCP/IP 应用。不需要 SR-IOV,可在宿主机上跑更多 Pod;
- **IB-SRIOV CNI**:提供 SR-IOV 虚拟网卡 + RDMA 设备,适合需要 RDMA 通信的负载。

值得强调 IPoIB 的一个**本质局限:它是仿真层,性能明显低于原生 RDMA**。因为 IP 报文要经过 IPoIB 驱动封装成 IB 传输,两端走的是完整内核 TCP/IP 栈——失去了 RDMA"绕过内核"的核心优势。所以在大模型训练场景中,IPoIB 只适合承载控制面/管理流量,GPU 训练数据流必须走 SR-IOV + 原生 RDMA。

---

## 七、全链路图景

把 IPoIB + pkey 放进完整的技术栈:

```
┌────────── Pod netns ──────────┐
│   ib0.8001 (IPoIB 子接口)     │  ← 由 ipoib CNI 创建
│   IP: 172.91.0.116            │
└────────────┬──────────────────┘
             │ (父子关系: 内核设备模型)
┌────────────▼──────────────────┐
│  宿主机 ib0 (IPoIB 主接口)     │  ← ib_ipoib 驱动创建
│  pkey: 0x7FFF (默认分区)       │
├───────────────────────────────┤
│  IB 传输层 (UD/RC)            │
├───────────────────────────────┤
│  mlx5_0 (IB 硬件, GID/LID)    │
└────────────┬──────────────────┘
              │
   ┌──────────▼──────────┐
   │ IB 交换机            │
   │ (按 pkey 过滤转发)   │
   └──────────┬──────────┘
              │
   ┌──────────▼──────────┐
   │ OpenSM (子网管理器)  │
   │ partitions.conf:    │
   │ 0x0001: ...guids... │
   │ (决定谁能加入哪个pkey)│
   └─────────────────────┘
```

---

## 总结

- **IPoIB 接口**是 InfiniBand 上的 IP 网卡仿真层,驱动为 `ib_ipoib`,接口名为 `ibN`,报文基于 GID/LID/QPN 寻址,**没有 MAC**;
- **pkey** 是 InfiniBand 的分区机制,作用等同于以太网 VLAN,16 位值,由子网管理器集中管控,**硬件强制隔离**;
- **pkey 子接口**是 IPoIB 主接口上按 pkey 虚拟出的子接口,命名固定为 `ibN.<pkey含0x8000>`,创建后可移入 Pod netns,由 ipoib CNI 或 Spiderpool 的 `cniType: ipoib` 支持;
- 它与 macvlan 在结构上对称(父子接口、多子接口共享一父),但机制本质不同:**macvlan 以 MAC 做软件分发,pkey 子接口以分区键做硬件分发**;
- 定位上,IPoIB + pkey 解决的是 InfiniBand 环境下的 IP 连通与租户隔离问题,适合常规 TCP/IP 流量;追求 RDMA 性能的 AI 训练数据面,则需走 IB-SRIOV 方案。

---

## 延伸资源

- 相关阅读:[《深入理解 macvlan:从父子接口到内核实现》](/2026/10/09/2026-10-09-深入理解macvlan从父子接口到内核实现/)——以太网侧的"对应物":macvlan 靠 MAC 做软件分发,本文的 pkey 靠分区键做硬件分发
- 相关阅读:[《Macvlan 在大模型训练中的角色:为 Pod 提供共享 RDMA 通道》](/2026/10/09/2026-10-09-Macvlan在大模型训练中的角色为Pod提供共享RDMA通道/)——其中"为什么 macvlan 不能用于 InfiniBand"的答案就在本文第一节
- 相关阅读:[《Spiderpool 多网卡 IPAM 深度解析:Underlay 网络缺的那块拼图》](/2026/10/09/2026-10-09-Spiderpool多网卡IPAM方案深度解析/)——ipoib CNI 与 SpiderMultusConfig 的整体体系
- 相关阅读:[《RDMA 全链路拆解:从 ibv_reg_mr 到硬件,再到 AI 训练平台的实战落点》](/2026/09/11/2026-09-11-RDMA全链路拆解从verbs到硬件再到训练平台落点/)——IPoIB 之下那套原生 RDMA verbs 栈
- Linux RDMA 文档:<https://docs.kernel.org/infiniband/>
