---
title: InfiGUIAgent:A Multimodal Generalist GUI Agent with Native Reasoning and Reflection
date: 2025-08-27
updated:
tags: [LLM,Agent]
categories: Agent
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/InfiGUIAgent.png
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

## InfiGUIAgent: A Multimodal Generalist GUI Agent with Native Reasoning and Reflection

2025-01-08｜ZJU, DLUT, Reallm Labs, ByteDance Inc, PolyU| 15

[http://arxiv.org/abs/2501.04575v1](https://link.zhihu.com/?target=http%3A//arxiv.org/abs/2501.04575v1)

[https://huggingface.co/papers/2501.04575](https://link.zhihu.com/?target=https%3A//huggingface.co/papers/2501.04575)

[https://github.com/Reallm-Labs/InfiGUIAgent](https://link.zhihu.com/?target=https%3A//github.com/Reallm-Labs/InfiGUIAgent)

### 研究背景与意义



![img](https://pica.zhimg.com/v2-fbd13103064f8bcea9d304e6f783b9fe_1440w.jpg)



在当今数字化时代，图形用户界面（GUI）智能体的应用愈发广泛，成为自动化任务的重要工具。现有的多模态大语言模型（MLLMs）为GUI智能体的智能化提供了基础，但其在多步骤推理和对文本注释的依赖上仍存在显著局限。本研究提出的InfiGUIAgent旨在解决这些挑战，强调了原生推理能力在提升GUI交互效率中的重要性，为自动化任务的执行提供了新的可能性。

1. **当前挑战**：现有的MLLM基础的GUI智能体在处理复杂操作时，往往受限于单步推理能力，无法有效利用先前步骤的信息，导致重复错误。
2. **研究目标**：通过引入两阶段的监督微调管道，InfiGUIAgent旨在全面提升智能体的基本技能与高级推理能力，从而增强其在多种任务中的表现。

### 研究方法与创新



![img](https://pica.zhimg.com/v2-fbd13103064f8bcea9d304e6f783b9fe_1440w.jpg)



InfiGUIAgent的创新之处在于其两阶段的训练流程，旨在综合提升GUI智能体的基本能力和推理能力。

1. **阶段一**：侧重于**基本能力的提升**，收集多任务数据，增强GUI理解和指令基础能力。该阶段利用多种现有数据集进行**监督微调**，确保**智能体能够准确理解和操作GUI元素**。
2. **阶段二**：引入**原生推理能力**，整合**层次推理与期望-反思推理**技能。这一阶段通过**合成数据**，训练智能体在复杂任务中进行有效的计划和自我纠正，显著提升了其在真实场景中的表现。

### 实验设计与结果分析



![img](https://picx.zhimg.com/v2-3a8e73f195c8541281afb72f20d25ba1_1440w.jpg)



在多个GUI基准测试上，InfiGUIAgent的表现优于许多现有智能体，验证了其在处理复杂任务时的有效性。

1. **实验设置**：通过在不同平台（移动、桌面、Web）上进行评估，InfiGUIAgent在各类任务中均展现出高效的处理能力。
2. **结果分析**：在[ScreenSpot基准测试](https://zhida.zhihu.com/search?content_id=252558295&content_type=Article&match_order=1&q=ScreenSpot基准测试&zhida_source=entity)中，InfiGUIAgent的准确率达76.3%，显著高于其他开源模型，表明其在GUI任务中的优越性。

### 结论与展望

InfiGUIAgent的研究展示了通过两阶段监督微调提升GUI智能体能力的有效性。尽管取得了显著成果，未来的工作将集中在进一步优化模型的推理能力和处理速度上，以适应更复杂的任务环境。

1. **贡献总结**：本研究不仅提出了InfiGUIAgent这一新型智能体，还为未来的GUI智能体研究提供了重要的理论基础和实践指导。
2. **未来展望**：期待在更广泛的应用场景中验证InfiGUIAgent的效能，并进一步探索其在更复杂任务中的应用潜力。