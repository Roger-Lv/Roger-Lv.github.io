---
title: SFT专攻Pass@k，RL强化Pass@1?
date: 2025-08-21
updated:
tags: [LLM,RL,SFT]
categories: LLM
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/RLVR.png
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



# 深挖RLVR探索机制：SFT专攻Pass@k，RL强化Pass@1

转自：https://mp.weixin.qq.com/s/QSi580SJ2RFewyFirAe65A

先前的工作已经证明了 RLVR 在实践中的成功，但其背后的根本机制，特别是模型在训练过程中的探索行为，仍有待深入研究。来自中国人民大学高瓴人工智能学院的研究者们发表了一篇题为《From Trial-and-Error to Improvement: A Systematic Analysis of LLM Exploration Mechanisms in RLVR》的技术报告，系统性地研究了RLVR 中的探索机制。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL880oOkkr4fp0qaL20Y5mqGQyGQXndXY9kXTqHFKoLmmxXI84jk1dichQ/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

- 论文题目：From Trial-and-Error to Improvement: A Systematic Analysis of LLM Exploration Mechanisms in RLVR
- 论文链接：https://arxiv.org/pdf/2508.07534

这篇报告结合了详尽的文献回顾和创新的实证分析，围绕**探索空间塑造**、**熵与性能的相互作用**以及**强化学习性能优化**这三个维度展开。其目标是为理解和推进 RLVR 系统提供一个基础性框架。本文将详细解读这篇报告的核心内容、创新发现以及实践意义。

## **一、 量化探索能力**

为了系统性地研究探索机制，首先需要能够量化模型的探索能力。报告认为，模型的探索能力本质上受其“能力边界”（Ability Boundary）的限制，即模型解决问题的能力上限。只有在模型能力边界内的“可探索空间”中，RLVR 训练才能生效。为此，报告提出并扩展了两种核心指标来刻画这一边界。

### **1.1 Pass@k 度量与“k-rollout 不可解问题”**

**Pass@k** 是一个广泛用于评估代码生成和数学推理任务的指标。它的含义是：对于一个给定的问题，模型尝试 `k` 次，只要有一次能够生成正确答案，就认为该问题被解决了。Pass@k 的分数代表了在整个测试集中，模型能够在 `k` 次尝试内解决的问题比例。

为了获得更稳定和无偏的估计，实践中通常会先让模型对每个问题生成 `n` 个候选答案（`n >= k`），统计其中正确答案的数量 `c`，然后通过以下公式计算 Pass@k 的无偏估计值：

![image.png](https://s2.loli.net/2025/08/21/oOlSu8LcfZEt2hU.png)

这个公式计算的是，从 `n` 个答案中随机抽取 `k` 个，至少包含一个正确答案的概率。

基于 Pass@k，报告提出了一个创新的概念——**k-rollout 不可解问题 (k-rollout Unsolvable Problems)** 。这个指标定义为，在经过 `k` 次尝试后，模型仍然无法解决的问题集合。当 `k` 值足够大时，这个集合趋于稳定，可以被视为模型当前能力边界的一个实用度量。通过比较不同模型（例如，基础模型、SFT 模型、RL 模型）的不可解问题集合的差异和重叠，研究者可以更直观地分析不同训练方法如何改变模型的能力边界。

### **1.2 策略熵与“Rollout 分支因子”**

除了评估最终结果的 Pass@k，报告还关注生成过程中的多样性，并使用**策略分布的熵 (Entropy of Policy Distribution)** 来度量。在信息论中，熵是系统不确定性的度量。在 LLM 中，词元级别的熵（Token-level Entropy）量化了模型在生成每个词元时的不确定性。第 个词元的熵 计算公式如下：

![image.png](https://s2.loli.net/2025/08/21/KCNFodlz3V8hpiB.png)

其中， 是词汇表， 是模型在给定前文 的条件下，生成词元 的概率。更高的熵值意味着模型在当前位置的选择更多样，不确定性更高，反映了更强的探索行为。

为了更直观地衡量这种生成多样性，报告进一步提出了**Rollout 分支因子 (Rollout Branching Factor)** 。这个指标借鉴了常见的 `top-p` 采样策略（例如 `top-p = 0.95`），将累积概率达到 95% 的所有候选词元视为“有效候选集”。Rollout 分支因子就是这个集合中词元的数量。这个值越大，表明模型在当前步骤可供选择的、可能性较高的路径就越多，其探索能力和能力边界也相应更强。

### **1.3 实验对比：SFT vs. RL**

报告通过一系列精巧的实验，对比了监督微调（Supervised Fine-Tuning, SFT）和强化学习（RL）对模型探索能力的影响。实验设置了一个序贯的训练流程：

1. **基础模型 (Base):** Qwen2.5-Math-7B
2. **SFT 模型:** 在基础模型上进行 SFT 得到的 DeepSeek-R1-Distill-Qwen-7B
3. **RL 模型:** 在 SFT 模型上进一步进行 RL 训练得到的 Skywork-OR1-Math-7B

实验得出了三个关键结论：

- **SFT 扩展 Pass@k 边界，RL 锐化 Pass@1 性能：**如下图 (a) 所示，SFT 显著提升了模型的 Pass@k 分数，意味着 SFT 能够通过学习外部高质量数据，有效扩大模型的能力边界，使其能够解决更多之前无法解决的问题。 相比之下，RL 模型的 Pass@k 曲线几乎没有提升，甚至略有下降，但 RL 训练通常会提升 Pass@1 性能（即首次尝试的成功率）。这表明 RL 的作用更侧重于“利用”（Exploitation），即在已有的解空间内优化和强化最高概率的正确路径，而这种优化是以牺牲探索广度为代价的。图 (b) 中的答案多样性对比也证实了这一点，RL 模型的答案多样性下降最为显著。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL863dk8icwe29mwDAgsKeHoGjtMOJnL00koDpYCxGo6GrDQiaib6R4CQHMA/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL8F1IptwtGibCsM1C779Cu7niaIa3DfzhKaq24YjPGm4ZvofbiasKqL62cA/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

- **SFT 和 RL 都会“移动”能力边界，而非简单扩展：**通过分析三个模型的“不可解问题”集合（图 c），报告发现这些集合之间并非简单的包含关系。这意味着训练过程（无论是 SFT 还是 RL）不仅仅是单向地扩大能力边界，还会导致一些原本可解的问题变得不可解。这揭示了训练过程的复杂性：它是在重新配置模型的能力，而非简单的线性增强。值得注意的是，RL 模型的不可解问题集比 SFT 模型更大，再次说明 RL 倾向于收窄探索空间。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL8FOhGGjGiaCIaCdsF0sNC18rllmcSfckPia1grOphyOlzMCwLiahiblZdDA/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

- **SFT 促进词元级多样性，RL 导致策略更固化：**通过对比 Rollout 分支因子（图 d），报告发现，无论是针对特定领域（SFT-Math）还是多领域（SFT-All）的 SFT，都能显著增加分支因子，即提升模型在每个生成步骤的候选词元多样性。而 RL 模型的分支因子则没有增加。这说明，从高质量的外部数据中学习（SFT 的方式）是增强模型内在探索能力的关键机制。而 RL 局限于模型自身生成的数据，更倾向于强化已有的高概率路径，而不会主动促进词元层面的多样性。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL81swZHtmIAkcqPNSjEicJkn4Ox9NtMufI1oImcgJShsdB7sePvpKbfKw/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

### **1.4 外部工具的影响**

报告还探讨了集成外部工具（如代码解释器）对模型能力边界的影响。实验对比了四种设置：纯文本推理的基础模型、使用代码推理的基础模型、经过 RL 训练的纯文本模型，以及经过工具增强 RL 训练的代码模型。结果（如下图所示）清晰地表明，集成工具能够极大地提升 Pass@k 性能，其效果远超单纯的 RL 训练。这证明了外部工具通过提供结构化的计算和利用能力，为模型开辟了全新的探索路径，是扩展能力边界的另一条有效途径。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL8REic7lBgicYKzZkQNoqdTstLc7BsKpcsUIfc04NicxWOAuUvTUf09sqew/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

**小结：** 这一部分通过引入新的度量指标和精细的对比实验，清晰地剖析了 SFT 和 RL 在塑造 LLM 探索能力上的不同角色。**SFT 通过学习外部知识来拓宽视野（提升 Pass@k 和词元多样性）；而 RL 则通过反复练习来精通某项技艺（提升 Pass@1），但代价是视野可能变得狭窄。**

## **二、 熵与性能的相互作用**

在量化了探索能力之后，报告进一步深入分析了探索（以策略熵为代表）与性能（以准确率为代表）之间的相互作用关系。研究者将 RLVR 的训练过程进行细粒度拆解，从**阶段**、**实例**和**词元**三个层面进行了系统研究，揭示了学习过程在不同粒度下的动态机制。

### **2.1 阶段动态（Stage-level Dynamics）：上升期与平台期**

先前的工作发现，RLVR 训练过程通常呈现出两个不同的阶段：

1. **上升期 (Rising Stage):** 模型性能快速提升，同时策略熵迅速下降。
2. **平台期 (Plateau Stage):** 模型性能增长变得缓慢、平稳，熵的变化也趋于平缓。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL8ndW5QADKNJAcmatdibXK1zWFBSkRlibD5dIjxOorlbBPY8P4j7Gu0uEg/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

报告的核心问题是：这两个阶段的性能提升分别是由什么机制驱动的？

- **上升期：负样本驱动熵下降，确立推理模式**通过将每个训练步的样本分为正样本（回答正确）和负样本（回答错误），并分别追踪它们的熵变化，报告发现了一个关键现象：**在上升期，熵的下降主要来源于负样本**。如下图 (c) 所示，负样本的平均熵始终高于正样本，并且其下降速度远快于正样本。这表明，在学习的初始阶段，模型的主要任务是通过惩罚大量的错误推理路径来快速收缩探索空间，从而摆脱混乱状态。这种对错误路径的“修剪”是模型建立起有效推理模式的基础。

  进一步分析词元的分布变化（下图 b）也支持了这一结论。熵下降最显著的词元大多是与任务无关的、无意义的符号（如 `erot`, `whim`），而与数学推理强相关的词元（如 `\`, `=`, `frac`）的出现频率则显著增加。同时，报告还将低质量的回答分为三类：格式错误、内容无关和语言混杂。如下图 (d) 所示，在上升期，这三类错误的比例都显著下降。这都说明了上升期的学习本质上是一个“去伪存真”的过程，通过降低无关路径的概率，来巩固和强化有效的推理模式。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL8libQgACbxGvxb91ebicZWOj6DpR0DdVYzfUXHnjgiaDibrUB5AGdCezseA/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL8VPcRvYVhq1cGic1wGa9bkn9Wjqeticwnl2rB7sm1n9Of3EGGd6XLic5nQ/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

- **平台期：学习集中于高熵、高梯度的关键“分叉点”**进入平台期后，性能提升变得困难，学习信号也变得稀疏。报告通过分析词元概率的更新发现，此时绝大多数（超过 99%）词元的概率变化都非常小。学习信号集中在了一小部分关键的词元上。如下图 (a) 所示，这些被显著更新的词元（无论是概率被增强的正样本，还是被抑制的负样本）都集中在高熵区域（图 b）。这些高熵词元往往对应着推理路径中的关键“分叉点”，模型在这些点上存在较大的不确定性。平台期的学习，正是在解决这些关键节点上的不确定性。

  报告还将词元按照语义功能分为四类：形式推理（数字、运算符）、逻辑结构（因此、但是）、元认知（让我们检查一下）和语义支持（语法成分）。分析显示，在平台期，受到最强更新信号的，是与**形式推理**相关的词元。这表明，在掌握了基本的推理模式后，平台期的学习重点转向了更精细、更复杂的逻辑和计算，以攻克更难的问题。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL86HrRNGD80nLEqlzwHhPCWxwbOGYR4QT5FUd5j3Iaowaib8efe7H5ekA/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL8vIwJ0YFAtFPubuF4B7lialUmRRqcOCLJcGYYcQsG6j9HwibfkbQeN7MQ/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

### **2.2 实例效率（Instance-level Efficacy）：低 PPL 样本更关键**

并非所有训练样本都对学习做出同等贡献。报告引入了**实例级别的困惑度（Perplexity, PPL）**作为衡量模型对整个生成序列不确定性的指标。PPL 越低，说明模型对生成该序列的“把握”越大，序列本身也通常更流畅、更符合模型的内在逻辑。

分析表明：

- **学习信号集中在低 PPL 样本中：** 如下图 (a) 所示，那些经历了最大概率更新的词元，绝大多数都来自于低 PPL 的样本。这说明模型更倾向于在那些它认为“合理”的生成中进行学习和调整。
- **低 PPL 样本代表更鲁棒的推理路径：** 通过对低 PPL 和高 PPL 样本进行“词元替换”的干预实验，报告发现，替换低 PPL 样本中的高熵词元，对最终答案准确率的影响更小（图 b）。这说明低 PPL 样本中的推理路径更加稳定和鲁棒，即使在关键节点上做出微调，也不容易偏离正确的方向。
- **优先学习低 PPL 样本能提升 RL 效果：** 报告设计了一个动态重加权的实验，分别增强低 PPL 样本和高 PPL 样本在训练中的权重。结果（图 c, d）显示，优先学习低 PPL 样本能够带来更好的性能提升和更低的策略熵，而侧重于高 PPL 样本则会导致性能下降和熵的剧增。这有力地证明了，将学习资源集中于模型已经有一定把握的、更“自信”的样本上，是一种更高效的优化策略。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL8a4OVA8efIY9Nds36ck1oibYMyqWBv0klxZaZYETmvHALjpS9Qibz9c8A/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

### **2.3 词元重要性（Token-level Significance）：序列末端更关键**

最后，报告分析了词元在序列中的不同位置对其学习重要性的影响。

- **词元熵呈 U 型分布：** 如下图 (a) 所示，序列的开头和结尾部分的词元熵普遍较高。开头的熵高，反映了模型在刚开始解决问题时，需要从广阔的探索空间中选择一个切入点；结尾的熵高，则反映了模型在得出最终结论时的不确定性，这与任务目标直接相关。
- **开头的高熵决定方向，结尾的高熵反映不确定性：** 通过词元替换实验（图 b），报告发现，替换序列**开头**的高熵词元，对最终结果的准确率影响巨大。这说明早期的决策对整个推理路径起着决定性作用。而替换序列**结尾**的高熵词元，对准确率影响则小得多。这表明结尾的高熵更多是模型对最终答案信心的体现，而非路径方向的根本性改变。
- **优化序列末端的词元更高效：** 基于上述发现，报告设计了给予序列不同位置词元不同奖励加成的实验。结果（图 c, d）显示，**给予序列末端词元更高奖励的策略，取得了最好的性能**。虽然这两种策略都会增加策略熵，但奖励末端词元会引导模型生成更长的推理链条，这表明模型花更多时间在最终决策的“精雕细琢”上，从而提高了准确率。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL8hVhrsWe92Y6DFexHEiaS8NDUJ0MhG7ujZacjpiaUOe1XrgrLAbznlnVw/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

**小结：** 这一部分的细粒度分析揭示了 RLVR 训练过程的内部动态。学习并非一个均质的过程，而是**分阶段、分实例、分位置**的。**初期靠“排除法”学习，后期靠“攻坚战”提升；学习的重点在于模型有把握的（低 PPL）样本；而优化的关键则在于序列末端的决策词元。** 这些发现为后续设计更高效的 RL 算法提供了坚实的理论基础。

## **三、 探索增强的强化学习方法**

在系统性地分析了探索机制之后，报告的最后一部分将这些洞见转化为具体的、可操作的性能提升方法。这部分内容分为两块：一是回顾现有的探索增强方法，二是通过实验验证基于前文发现提出的新策略。

### **3.1 现有探索增强方法回顾**

报告首先对领域内已有的探索增强技术进行了梳理，并将其归纳为四大类：

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL8JCv5o4JXA11OkMwWKS5jqweUrTXNoQfRPVQG7Os05QJA5Z3AdQPEyQ/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

1. **优势函数优化 (Advantage Refinement):** 通过修改优势函数（Advantage）来直接影响奖励信号。例如，为高熵词元提供额外的奖励，或者对负样本进行更强的惩罚。
2. **词元/梯度选择 (Token/Gradient Selection):** 在反向传播时，有选择性地更新部分词元的梯度。例如，只更新高熵的“分叉词元”的梯度，或者保护那些低概率但有潜力的词元不被过度抑制。
3. **KL 正则化 (KL Regularization):** 通过 KL 散度惩罚当前策略与某个参考策略（通常是训练前的模型）之间的差异，防止模型在训练中“跑偏”太远，从而维持一定的探索性。
4. **工具增强 (Tool Augmentation):** 前文已述，通过集成外部工具来扩展模型的探索空间和能力边界。

这些方法的核心目标都是缓解 RLVR 训练中固有的“探索空间崩塌”问题，确保模型在整个训练过程中都保持足够的多样性，从而将探索潜力有效地转化为最终的性能提升。

### **4.2 维持探索能力：保留 Pass@k 的 RFT 策略**

考虑到标准 RL 训练的计算成本很高，报告选择使用一种更轻量级的方法——**拒绝采样微调（Rejection-sampling Fine-Tuning, RFT）**来进行实验。RFT 的流程是：模型生成多个候选答案，通过一个验证器（或规则）筛选出其中的正确答案，然后用这些正确的答案对模型自身进行微调。

为了在 RFT 过程中维持并增强模型的探索能力（即 Pass@k），报告提出了三种数据选择策略，并与基线（只用规则过滤后的正确样本）进行对比：

1. **引入噪声数据 (Incorporating Noisy Data):** 在训练数据中混入一小部分（5%）的负样本。目的是防止模型变得过于“确定”，通过接触少量错误来激发更广阔的探索。
2. **选择高熵数据 (Selecting High-Entropy Data):** 优先选择那些平均词元熵最高的样本进行微调。这直接优化了生成过程的多样性。
3. **选择高 Rollout 分支因子数据 (Selecting High-RBF Data):** 优先选择平均 Rollout 分支因子最高的样本。这是对高熵策略的进一步优化，直接针对模型在每一步的探索潜力。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL8FpW1D36NF1ZEZ511atIVK7EPsjkDicXicLveo1cYEssyVWSgsIrXNJicw/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

实验结果（如上表）非常清晰：

- **可控的噪声注入是有效的：** 加入 5% 的噪声数据后，模型的 Pass@k 性能得到了提升，而 Pass@1 性能几乎不受影响。这说明适度的“干扰”有助于模型保持探索活力。
- **直接优化探索指标效果显著：** 基于高熵和高 RBF 的选择策略都大幅提升了 Pass@k 性能，其中 RBF 策略效果最好。这证明了直接针对探索性指标进行数据选择是一种强大的优化手段。
- **探索增强的 RFT 超越了强大的 RL 基线：** 报告将“噪声注入”和“高 RBF”两种策略结合，训练出的最终模型，在所有测试基准上的 Pass@k 性能都超过了一个强大的 RL 基线模型（Qwen-2.5-32B-SimpleRL-Zoo），同时 Pass@1 性能保持竞争力。这表明，通过精心设计的数据策略，RFT 这种相对简单的方法也能够有效地维持和增强模型的探索能力。

### **4.3 提升优化效率：基于 PPL 和位置的优势塑造**

最后，报告将第二部分中关于实例效率（低 PPL）和词元重要性（序列末端）的发现，应用于标准的 RL 算法（GRPO）中，提出了两种简单而有效的**优势塑造 (Advantage Shaping)** 方法。

1. **基于 PPL 的优势塑造：**这个方法的核心是降低高 PPL 样本的学习权重。对于每个生成的样本 ，首先计算其标准化的对数 PPL 权重 。然后，将原始的词元优势 乘以一个调制因子 ，其中 是一个超参数。这样，PPL 越高的样本，其优势值就被压缩得越多，从而让模型更专注于学习那些低 PPL 的、更“靠谱”的推理路径。

   

2. **基于位置的优势塑造：**这个方法旨在增强序列末端词元的学习信号。它定义了一个位置奖励 ，这个奖励值随着词元在序列中的相对位置增加而增加。然后，将这个奖励加到原始的优势上，并且其符号与原始优势的符号保持一致。这意味着，对于正样本，越靠后的词元奖励越高；对于负样本，越靠后的词元惩罚越重。

   

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL8uf7GOCJDwWvM6zZR1wrQgtLtbG0F2Jpx1B06MDLkyKSicghCw4Eh5CQ/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

实验结果（如上表和下图）表明，这两种看似简单的修改都带来了显著的性能提升。与 GRPO 基线相比，它们在多个数学推理基准上都取得了更高的平均分和最高分。同时，这两种方法都使得模型在训练后期能够维持更高的熵水平，保留了更强的探索能力。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL8sQPy7uEE7kXwqVBcsLTs8zLh03x2oWibMsLnyAvTuG4wiaOHZicBCnQzg/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL88Rica3icR5c8AM0TQtz3R5LwuT8ibnk0Hibu4ecluLl81HkJBpmCqXKunw/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

进一步的分析还发现，这两种方法都促使模型生成了更长的、包含更多形式推理和逻辑结构词元的回答。这说明，通过精准地调整奖励信号，可以引导模型进行更深入、更细致的思考过程，最终带来性能的提升。

![图片](https://mmbiz.qpic.cn/sz_mmbiz_png/QFAVf6ySRArlqyK9yMzu7W3gvgLhFtL8LhnDHvuu43KTSBfQnatoPBZu0UeUD0gzGGcV1DiaeLcscjIcQficcSaQ/640?wx_fmt=png&from=appmsg&watermark=1&tp=webp&wxfrom=5&wx_lazy=1)

## **点评**

论文主要贡献可以总结为以下几点：

1. **提出了新的量化指标：** 引入“k-rollout 不可解问题”和“Rollout 分支因子”，与 Pass@k 和熵等传统指标相结合，为量化和比较不同训练范式下 LLM 的能力边界和探索潜力提供了更丰富的工具集。
2. **揭示了 SFT 和 RL 的不同作用：** 通过实验清晰地证明了 SFT 主要通过学习外部数据来扩展探索边界（拓宽），而 RL 则主要通过利用自身生成的数据来锐化已有能力（挖深），并揭示了后者可能会以牺牲探索广度为代价。
3. **进行了细粒度的学习动态分析：** 将 RLVR 训练过程分解为不同阶段、实例和词元层面，揭示了学习信号在不同粒度下的分布规律和作用机制，特别是发现了负样本、低 PPL 样本和序列末端词元在学习中的关键作用。
4. **提出了简单有效的优化方法：** 基于分析洞见，提出了在 RFT 中通过数据选择维持探索能力，以及在 RL 中通过优势塑造提升优化效率的具体方法，并通过实验验证了其有效性。

“SFT拓宽，RL挖深”是一个非常棒的总结，但在某些情况下可能过于简化。例如：

- 如果SFT的数据集质量不高、多样性差，也可能导致模型能力收窄（过拟合）。
- 某些探索性RL算法（如加入好奇心、随机网络蒸馏等机制）也可能旨在扩展模型的能力边界，而不仅仅是利用。

论文为了突出核心矛盾，可能忽略了这些中间地带和特殊情况。