---
title: 漫谈 LLM 解码策略-采样策略 贪心解码、随机采样、Top-K 采样、Top-P 采样、核采样 和搜索策略Beam Search
date: 2025-08-13
updated:
tags: [人工智能,贪婪解码]
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



# 漫谈 LLM 解码策略：采样策略（贪心解码、随机采样、Top-K 采样、Top-P 采样、核采样）和搜索策略（ Beam Search）

转载：https://zhuanlan.zhihu.com/p/29031912458

## 一. 前言

[解码策略](https://zhida.zhihu.com/search?content_id=254828805&content_type=Article&match_order=1&q=解码策略&zhida_source=entity)是[大语言模型](https://zhida.zhihu.com/search?content_id=254828805&content_type=Article&match_order=1&q=大语言模型&zhida_source=entity)（Large Language Model, LLM）生成最终文本的关键环节，它直接影响文本的流畅性、连贯性和多样性。为了生成尽可能高质量的文本，研究者们发挥自己的聪明才智设计了各种各样的解码策略，以在准确性和创造行之间取得平衡。本文将系统梳理并总结常见的解码策略，涵盖**[贪心解码](https://zhida.zhihu.com/search?content_id=254828805&content_type=Article&match_order=1&q=贪心解码&zhida_source=entity)（Greedy Decoding）**、**[随机采样](https://zhida.zhihu.com/search?content_id=254828805&content_type=Article&match_order=1&q=随机采样&zhida_source=entity)（Random Sampling）**、**[Top-K 采样](https://zhida.zhihu.com/search?content_id=254828805&content_type=Article&match_order=1&q=Top-K+采样&zhida_source=entity)**、**[Top-P 采样](https://zhida.zhihu.com/search?content_id=254828805&content_type=Article&match_order=1&q=Top-P+采样&zhida_source=entity)（核采样）以及[束搜索](https://zhida.zhihu.com/search?content_id=254828805&content_type=Article&match_order=1&q=束搜索&zhida_source=entity)（Beam Search）**等策略，帮助读者理解各策略的工作原理，并探讨它们各自的优缺点。

**注：笔者水平有限，若有描述不当之处，敬请大家批评指正，与大家共同进步！**

## 二. 什么是解码（Decoding）？

在大语言模型（如 Deepseek、GPT-4o）中，**解码指的是模型在生成文本时，按照一定规则逐步选取下一个token 的过程**。每次生成时，模型会根据前面的内容预测下一个最可能出现的 token，直到满足终止条件（比如达到最大长度或遇到结束符 `</s>`）。解码策略决定了模型如何从多个候选 token 中做出选择，不同的策略会影响文本的连贯性、创造性和合理性。简单的策略可能会让生成的文本更确定、更可靠，但也可能显得单调，而更复杂的策略则能提高文本的多样性，但可能会带来不可控性。下面对上述解码过程进行形式化表述：

假设已经生成了前n-1 个 tokens：t1,t2...,tn-1 ，模型首先计算给定前文的前提下，针对词表t∈V 中的所有 token 的条件概率分布P（t|t1,t2...,tn-1） 。这个概率分布描述了在已生成文本的基础上，模型选择某个 token 的可能性。接下来，模型会在此概率分布的基础上应用一种**解码策略**来生成下一个 token。**解码策略的关键就在于如何从这个概率分布中选择最合适的 token**。

## 三. 解码策略

### 3.1 贪心解码（Greedy Decoding）

**原理：**每一步都选择**概率最高**的 token 作为下一个 token，即：
$$
t_{n} = \arg\max_{t_{n}} P\left(t \mid t_{1}, t_{2}, \cdots, t_{n-1}\right), \quad t \in \mathcal{V}
$$
**优点**： 生成的文本通常会较为确定，计算速度快，适合实时生成。
**缺点**： 缺乏多样性，容易卡在局部最优解，导致重复和乏味的文本（如 "今天很开心，很开心，很开心"）。

### 3.2 随机采样（Random Sampling）

**原理**：随机采样则从当前的概率分布中随机选择一个 token，生成的 token  依赖于概率：
$$
t_{n} \sim P(t \mid t_{1}, t_{2}, \dots, t_{n-1}), \quad t \in \mathcal{V}
$$
**优点**：生成的文本更加随机，带来更多的创造性，可用于对话系统或诗歌生成。
**缺点**：缺乏稳定性，可能选中过于罕见的 token，会生成不连贯或无意义的内容。

### 3.3 Top-k 采样（Top-k Sampling）

**原理**：Top-k 采样通过限制候选 token 的数量来选择下一个 token。具体地，首先**从概率分布中选择概率最大的前 个候选 token 集合** ，然后在 中基于对应的概率分布随机选择一个 token：
$$
t_{n} \sim P^{\prime}\left(t \mid t_{1}, t_{2}, \cdots, t_{n-1}\right), \quad t \in \mathcal{K}
$$
其中， 表示归一化后的概率分布。

**优点**： 只从**概率最高的 k 个 token** 里进行随机采样，避免选中过于罕见的 token，能过滤掉极端低概率的 token，生成更合理的文本。
**缺点**： 过小会限制多样性， 过大会增加不合理 token 的可能性。

### 3.4 Top-p 采样（Nucleus Sampling）

![image.png](https://s2.loli.net/2025/08/13/wr1Og6QqjtZLnH8.png)

### 3.5 Beam Search（束搜索）

**原理**：束搜索的核心思想是**在每个解码步骤中保留** b **个最优的候选序列**，其中 b 称为**束宽（beam width）**。首先计算当前所有候选序列的下一个 token 的概率分布，然后选取得分最高的 b 个扩展序列，丢弃其余序列，最后重复该过程，直到生成结束符（EOS）或达到最大长度（**注：束搜索每次只保留** **个候选序列**）。具体过程如下：

1. 假设第 t 轮的候选序列集合为Bt （大小为 b ）;

2. 对于每个序列Tt属于Bt ，计算所有可能的扩展Tt' = Tt + t' 概率： 
   $$
   P\left(\mathcal{T}_{t}^{\prime}\right) = P\left(\mathcal{T}_{t}\right) P\left(t^{\prime} \mid \mathcal{T}_{t}\right)
   $$
   

3. 从所有扩展序列中选取前 b 个概率最大的序列构成新的候集合 Bt+1；

4. 终止条件：所有序列都生成了结束符或者到达了最大长度。

基于最终的候选集合，一般情况下，束搜索再从中挑选出一个累积概率最大的序列出来作为最终生成序列：
$$
\mathcal{T}^{*} = \arg\max_{\mathcal{T} \in \mathcal{B}} P(\mathcal{T} \mid x)
$$
其中x 代表最开始输入到 LLM 中的输入序列，如最开始输入给 LLM 的问题。

**优点**： 生成结果通常更流畅和高质量，适用于机器翻译等任务。
**缺点**： 计算量较大，可能会增加重复性。

## 四. 总结

本文对常见解码策略的原理及其优缺点进行了简要梳理，并将各策略的特点归纳于下表。通过对这些解码策略设计思路的深入回顾，我们可以清晰地观察到科学研究工作的演进脉络：每一代方法都在前人基础上针对既有缺陷进行优化，而新方法本身又不可避免地引入新的局限性，从而激发进一步的改进与创新。这种螺旋式上升的过程，正是技术不断突破与进步的核心驱动力。愿与诸君共勉！

![img](https://pic4.zhimg.com/v2-a499384ab801a6dfb94ae53566080883_1440w.jpg)