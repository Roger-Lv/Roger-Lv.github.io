---
title: Mobile-Agent-v3:Foundamental Agents for GUI Automation
date: 2025-08-27
updated:
tags: [LLM,Agent]
categories: Agent
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/mobile_agent_v3.png
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

# Mobile-Agent-v3: Foundamental Agents for GUI Automation

https://arxiv.org/pdf/2508.15144

以下是对论文《Mobile-Agent-v3: Foundational Agents for GUI Automation》的**精读报告**，重点关注其**实现方式**与**创新点**。

---

## 一、研究概述

### 1.1 研究背景与目标
- **背景**：GUI（图形用户界面）智能代理旨在自动化跨设备（PC、移动端、Web）的用户任务，提升人机交互效率。
- **问题**：现有方法要么依赖闭源模型（泛化差），要么是端到端模型（指令遵循差、多代理兼容性弱）。
- **目标**：提出一个**开源、端到端、多模态基础模型**（GUI-Owl），并在此基础上构建一个**多代理协作框架**（Mobile-Agent-v3），实现高效、可扩展的GUI自动化。

---

## 二、核心贡献与创新点

### 2.1 GUI-Owl：统一的多模态基础模型
- **基础架构**：基于 Qwen2.5-VL，通过大规模GUI交互数据后训练，统一了感知、推理、规划、决策与 grounding 能力。
- **端到端交互**：将GUI交互建模为多步决策过程，支持历史上下文压缩、推理-结论分离输出，提升长序列任务处理能力。
- **多代理兼容**：既可独立运行，也可作为专家模块嵌入多代理系统（如Mobile-Agent-v3）。

### 2.2 自演进轨迹数据生产框架（Self-Evolving Trajectory Production）
#### 🚀 创新点1：大规模云端虚拟环境基础设施
- 构建跨平台（Android、Ubuntu、macOS、Windows）的云虚拟环境，支持动态、多样化的交互场景。
- 减少人工标注依赖，实现数据自动生成与质量评估。

#### 🚀 创新点2：高质量查询生成
- **移动端**：基于人工标注的DAG（有向无环图）建模App导航流，结合LLM生成多约束查询。
- **桌面端**：结合人工标注与LLM生成，覆盖原子操作（点击、拖拽）与复杂软件操作路径。

#### 🚀 创新点3：轨迹正确性判断模块
- **双层级评估**：
  - Step-Level Critic：分析每步动作的前后状态，输出分析、总结与分类（GOOD/NEUTRAL/HARMFUL）。
  - Trajectory-Level Critic：双通道（文本+多模态）评估整条轨迹，通过共识机制判断正确性。

#### 🚀 创新点4：查询特定引导生成
- 利用成功轨迹生成步骤描述，通过LLM总结关键步骤，形成针对性引导，提升难样本处理能力。

### 2.3 多样化基础能力构建
#### 🔹 Grounding 能力
- 从多源数据（开源数据集、A11y树、爬虫图像）构建UI元素定位与细粒度文本定位数据。
- 使用SAM分割PC图像，提升密集区域定位精度。

#### 🔹 任务规划能力
- 从历史成功轨迹中提炼页面转换描述，构建任务执行手册。
- 从大语言模型（如Qwen3-235B）中蒸馏复杂多应用任务规划知识。

#### 🔹 动作语义理解
- 构建“前后状态-动作”配对数据，要求模型预测动作并描述其效果。
- 通过多轮投票筛选高质量描述。

### 2.4 增强的推理能力构建
#### 🔸 Offline Hint-Guided Rejection Sampling
- 使用提示引导VLM生成推理内容，通过动作一致性筛选有效推理。

#### 🔸 多代理框架蒸馏
- 收集Mobile-Agent-v3中各代理输出，通过LLM整合为统一推理内容，提升推理多样性。

#### 🔸 迭代在线拒绝采样
- 模型在两种模式下 rollout：
  1. 端到端生成
  2. 与Mobile-Agent-v3集成
- 通过Critic过滤、思维-动作一致性检查、任务重加权等策略提升数据质量。

### 2.5 可扩展强化学习框架（Scalable RL）
#### 🎯 创新点：Trajectory-aware Relative Policy Optimization (TRPO)
- 使用**轨迹级奖励**计算归一化优势估计，解决长序列信用分配问题。
- 引入**成功轨迹回放缓冲区**，稳定训练过程。
- 支持完全异步训练，提升数据利用效率。

### 2.6 Mobile-Agent-v3：多代理协作框架
#### 🤖 Agent角色分工：
- **Manager**：动态任务分解与规划，使用RAG引入外部知识。
- **Worker**：执行子目标，输出动作三元组（推理、动作、意图）。
- **Reflector**：评估动作结果，提供诊断反馈。
- **Notetaker**：记录关键信息（如验证码、密码），支持长时程任务。

#### 🔁 工作流程：
1. RAG检索外部知识 → Manager初始化计划  
2. Worker执行 → Reflector评估 → Notetaker记录  
3. Manager动态更新计划，直至任务完成或失败。

---

## 三、实验与评估

### 3.1 基准测试表现
- **GUI-Owl-7B** 在 AndroidWorld 达到 **66.4**，OSWorld 达到 **34.9**。
- **GUI-Owl-32B** 在多项测试中超越 GPT-4o、Claude 3.7 等闭源模型。
- **Mobile-Agent-v3 + GUI-Owl** 在 AndroidWorld 达到 **73.3**，OSWorld 达到 **37.7**，达到开源模型SOTA。

### 3.2 消融实验验证
- **在线过滤+回放机制**显著提升训练稳定性与最终性能。
- **推理数据合成**（拒绝采样+多代理蒸馏）逐步提升模型能力。
- **历史图像数+交互步数**增加均能提升长时程任务表现。

---

## 四、总结与展望

### 4.1 主要贡献
1. **GUI-Owl**：首个统一感知、推理、规划、执行的端到端GUI基础模型。
2. **自演进数据生产框架**：实现高质量轨迹数据的自动生成与评估。
3. **多样化能力构建**：涵盖 grounding、规划、动作语义、推理等。
4. **TRPO强化学习策略**：解决长序列GUI任务的信用分配问题。
5. **Mobile-Agent-v3**：模块化多代理框架，支持角色分工与动态规划。

### 4.2 未来方向
- 扩展至更多平台（如AR/VR、车载系统）。
- 支持多模态输入（语音、手势）。
- 探索更高效的环境模拟与数据生成方法。
