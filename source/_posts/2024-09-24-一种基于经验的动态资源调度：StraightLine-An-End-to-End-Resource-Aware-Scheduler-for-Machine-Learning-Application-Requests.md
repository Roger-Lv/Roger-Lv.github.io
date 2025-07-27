---
title: 一种基于经验的动态资源调度：StraightLine:An End-to-End Resource-Aware Scheduler for Machine Learning Application Requests
date: 2024-09-24
updated:
tags: [人工智能,容器化,虚拟化,资源调度,AI Infra]
categories: AI Infra
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/dynamic.png
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



# StraightLine: An End-to-End Resource-Aware Scheduler for Machine Learning Application Requests

![image-20240924093642461.png](https://s2.loli.net/2024/09/24/pdiqaoBR1wtJ4PO.png)

## **摘要**：

提出了一个端到端的资源感知调度器，用于在混合基础设施中调度机器学习应用请求的最优资源。

## **关键词**：

机器学习部署、异构资源、资源放置、容器化、无服务器计算。

## 主要内容：

- ML应用的生命周期包括模型开发和模型部署两个阶段。
- 传统ML系统通常只关注生命周期中的一个特定阶段或阶段。
- StraightLine通过一个基于经验的动态放置算法，根据请求的独特特征（如请求频率、输入数据大小和数据分布）智能地放置请求。
- 包括三个层次：模型开发抽象、多种实现部署、实时资源调度。

## 模型容器化：

- 使用NVIDIA-Docker实现模型开发的容器化。

- 为模型训练构建了强大的NVIDIA-Docker，为模型验证构建了轻量级的NVIDIA-Docker。

  [深度学习docker环境配置之nvidia-docker安装使用_nvidia docker-CSDN博客](https://blog.csdn.net/qq_41776453/article/details/129794608?ops_request_misc=%7B%22request%5Fid%22%3A%22B8B4BA2A-F2FF-4251-BE51-383561A4A332%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=B8B4BA2A-F2FF-4251-BE51-383561A4A332&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-129794608-null-null.142^v100^pc_search_result_base8&utm_term=nvidia-docker&spm=1018.2226.3001.4187)

## 容器定制：

- 根据不同的压缩ML模型，构建相应的RESTful API、无服务器应用程序和Docker容器。
- 使用Docker容器适应不同的计算环境。

## 实时资源感知调度：

- 设计了一个基于经验的动态放置算法，以在混合基础设施中智能地放置不同的ML应用请求。

## 评估：

- 在一个混合测试平台（RESTful API、无服务器进程、Docker容器和虚拟机）上进行了实验。
- 实验结果表明，StraightLine在适应异构资源方面有效。



## 具体的算法：

在论文 "StraightLine: An End-to-End Resource-Aware Scheduler for Machine Learning Application Requests" 中，提出了一个名为 Empirical Dynamic Placing Algorithm 的算法，用于智能地放置机器学习（ML）应用请求到最优资源上。这个算法是 StraightLine 调度器的关键创新之一。

### Empirical Dynamic Placing Algorithm 的核心特点：

1. **基于经验**：算法依赖于对过往请求和资源使用情况的经验数据来做出决策。

2. **动态放置**：算法实时分析请求的特征，并动态地决定将请求分配到哪种资源（如容器、虚拟机或无服务器进程）。

3. **考虑请求特征**：算法考虑了请求的独特特征，例如请求频率、输入数据大小和数据分布。

### 算法的逻辑流程：

1. **输入**：算法接收一组请求 R，每个请求 r 包含请求 ID（rid）、在时间 t 的请求频率（ft）、请求数据大小（rd）。

2. **初始化**：定义请求频率阈值（F）和数据大小阈值（D），以及可用资源（Flask SF 和 Docker SD）。

3. **请求分析**：
   - 如果请求频率 ft 大于阈值 F 且数据大小 rd 小于阈值 D，则将请求 r 部署到无服务器平台上。
   - 如果数据大小 rd 大于阈值 D，则将请求 r 部署到 Docker 平台上。
   - 如果 Flask SF 资源可用且请求频率 ft 适中，则将请求 r 部署到 Flask（本地 web 服务器）上。

4. **资源分配**：
   - 如果 Flask SF 资源不可用，但 Docker SD 资源可用，则将请求分配到 Docker 平台。
   - 如果 Flask SF 和 Docker SD 资源都不可用作进一步请求，则将请求分配到无服务器平台上。

5. **输出**：算法输出请求 R 的放置 K，即每个请求分配到的具体资源。

### 算法的目的：

- **最小化延迟**：通过智能放置请求，减少 ML 应用部署的响应时间和失败率。
- **适应混合基础设施**：算法能够适应包含云计算数据中心、本地服务器、容器和无服务器平台的混合基础设施。

### 算法的效果：

- **减少响应时间**：通过将请求分配到最适合的资源，算法减少了处理请求所需的时间。
- **降低失败率**：通过考虑请求的特征和资源的可用性，算法减少了请求处理失败的可能性。

Empirical Dynamic Placing Algorithm 是 StraightLine 调度器中用于优化 ML 应用请求处理的核心组件，它通过实时分析和智能决策来提高资源利用率和系统性能。