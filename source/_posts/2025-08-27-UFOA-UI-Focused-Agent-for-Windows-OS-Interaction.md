---
title: UFO:A UI-Focused Agent for Windows OS Interaction
date: 2025-08-27
updated:
tags: [LLM,Agent]
categories: Agent
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/UFO.jpg
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

# UFO: A UI-Focused Agent for Windows OS Interaction

转自：https://zhuanlan.zhihu.com/p/685614612

[[2402.07939\] UFO: A UI-Focused Agent for Windows OS Interaction (arxiv.org)](https://link.zhihu.com/?target=https%3A//arxiv.org/abs/2402.07939)

![img](https://pica.zhimg.com/v2-567ce180092baee0fc523c4760b23ea8_1440w.jpg)

### Introduction

大型语言模型（LLMs）的出现展现了在解决类似人类推理、计划和协作的复杂问题上的革命性潜力。这一发展将人类更接近于实现人工通用智能（AGI）的目标，在我们日常生活中的各种任务中提供帮助，并展现了一种之前被认为具有挑战性的强大和全面的能力水平。向更复杂的多模态视觉LLMs发展，以[GPT-Vision](https://zhida.zhihu.com/search?content_id=240488942&content_type=Article&match_order=1&q=GPT-Vision&zhida_source=entity)为例，为LLMs引入了视觉维度，扩展了它们的能力以包括广泛的视觉任务，并拓宽了它们应对需要视觉能力的挑战的范围。

视觉大型语言模型（[VLM](https://zhida.zhihu.com/search?content_id=240488942&content_type=Article&match_order=1&q=VLM&zhida_source=entity)）的应用不断涌现并蓬勃发展。一个值得注意的应用是使用VLMs与软件应用的用户界面（UI）或图形用户界面（GUI）互动，以自然语言表达的用户请求，并将其落实到物理设备中。虽然GUI主要是为了让人类用户看到并与之互动而设计的，但应用程序UI中的元素和控制为VLMs的互动提供了至关重要的桥梁，尤其是通过感知它们的视觉信息并以类似于人类的方式将其行动落实。这促进了从大语言模型（LLMs）到大行动模型（Large Action Models）的演化，使它们的决策能够体现在物理行动中，并产生切实的现实世界影响。

在这一背景下，由于其在计算机系统日常使用中的高市场份额，建立在其基础上的多功能应用程序和GUI的存在，以及需要长期规划和跨各种应用程序交互的任务的复杂性，Windows操作系统（OS）作为LAMs的代表性平台脱颖而出。拥有一个能够理解自然语言中的用户请求，并能自主与建立在Windows上的应用程序UI互动的通用智能体的前景非常吸引人。尽管明显存在开发专为Windows OS定制的VLM智能体以满足用户请求的需求，但这一方向仍然未被大量探索，因为大多数现有的智能体主要集中在智能手机或网络应用程序上。这种探索的缺口呈现出一个巨大的、未被开发的机会，以开发一个特定于Windows的智能体。

为了弥补这一缺口，本文引入了UFO，一个**专门设计用于与Windows OS无缝互动的专注于UI的智能体**，利用VLM GPT-Vision的尖端能力。UFO采用了**双智能体框架**，每个智能体分析屏幕截图并从GUI提取信息，以在选择应用程序时做出明智的决策。随后，它导航并在其控制上执行动作，模仿人类用户以满足自然语言中的请求。系统包含一个控制交互组件，这在将GPT-Vision的动作转化为应用程序上的实际执行中起着至关重要的作用。这一特性确保了完全自动化，无需人类干预，从而确立了它作为一个全面的LAM框架。

鉴于用户的请求通常涉及其日常工作中的多个应用程序，UFO整合了一种应用程序切换机制，允许它在需要时转向不同的应用程序。这种扩展能力使UFO能够处理其他智能体通常忽视的更复杂的任务。此外，UFO具有很高的可扩展性，使用户能够为特定任务和应用程序设计和定制动作和控制，增强了其多用性。总之，UFO为从事日常计算机活动的用户简化了各种任务，将冗长和乏味的过程转换为仅通过文本命令即可完成的简单任务。这使UFO定位为Windows OS的一款宝贵、用户友好且自动化的辅助工具，有效降低了使用的总体复杂性。上图展示了一个示例，其中UFO通过整合从Word文档提取的文本、图像的观察结果以及PowerPoint演示文稿的摘要来组成并发送电子邮件。

为了评估其有效性，本文对UFO框架进行了多功能测试，将其置于涵盖9个广泛使用的Windows应用程序的50项任务的测试中。这些任务被精心选择，以涵盖反映用户日常计算需求的多样化场景。评估涉及定量指标和深入案例研究，特别是在跨多个应用程序的扩展和复杂请求的背景下，凸显了设计的稳健性和适应性。UFO是为Windows OS环境内的通用应用程序量身定制的先驱智能体。

### The Design of UFO

### Overview

![img](https://pic3.zhimg.com/v2-8d777bd561873fff22ea034d1609efba_1440w.jpg)



上图展示了UFO的整体架构。UFO作为一个双重智能体框架运作，包括：（i）一个**应用选择智能体**（AppAgent），负责选择一个应用程序来满足用户请求。当一个请求跨越多个应用程序，且任务在前一个应用程序中部分完成时，这个智能体也可能切换到另一个应用程序。此外，（ii）还配合了一个**动作选择智能体**（ActAgent），负责在选定的应用程序上迭代执行动作，直到任务在特定应用程序内成功结束。这两个智能体利用**GPT-Vision的多模态能力**来理解应用程序界面并满足用户的请求。它们使用一个控制交互模块来执行他们的动作，使得对系统有实际的影响。

在接收到用户请求后，AppAgent开始对需求进行分析。它努力从当前活动的应用程序中选择一个合适的应用程序来满足请求。UFO为AppAgent提供了完整的桌面截图和可用应用程序列表以供参考，以便于AppAgent的决策过程。随后，AppAgent选择一个合适的应用程序，并制定一个**全面的global plan**来完成请求。这个计划然后传递给ActAgent。

一旦识别出合适的应用程序，就会将其聚焦于桌面上。然后ActAgent开始执行动作来满足用户请求。在每次选择动作之前，UFO都会捕获当前应用程序UI窗口的截图，并注释所有可用控件。此外，UFO还记录每个控件的信息供ActAgent观察。ActAgent的任务是选择一个控件进行操作，随后通过控制交互模块选择在所选控件上执行的具体动作。这一决策基于ActAgent的观察、其之前的计划以及其操作记忆。执行后，UFO构建一个local plan用于未来的步骤，并继续到下一个动作选择步骤。这一递归过程持续进行，直到用户请求在选定的应用程序内成功完成。这标志着用户请求的一个阶段的结束。

在用户请求跨越多个应用程序的情况下，ActAgent将任务委托给AppAgent，以便在ActAgent完成当前应用程序上的任务后切换到不同的应用程序，启动请求的第二阶段。这一迭代过程持续进行，直到用户请求的所有方面都完全完成。用户有选项可以交互式地引入新的请求，促使UFO通过重复前述过程来处理新请求。在所有用户请求成功完成后，UFO结束其操作。在随后的部分中，将继续深入探讨UFO框架内每个组件的具体细节。

### AppAgent

![img](https://pic4.zhimg.com/v2-829101012cab1870258b5a26e22e0445_1440w.jpg)



AppAgent负责选择一个活跃的应用程序来满足用户请求，或在必要时切换到新的应用程序。此外，AppAgent构建一个全面的global plan来指挥整个任务，其架构如上图所展示。**AppAgent接受以下信息作为输入**：

- User Request：提交给UFO的原始用户查询。
- Desktop Screenshots：当前桌面的截图，多个屏幕的截图被合并成一个单一的图像。
- Application Information：可用的活跃应用程序详情的列表，包括它们的名称和类型。
- Memory：包括之前的思考、评论、动作和执行结果。
- Examples：应用程序选择的文本示例，作为任务的演示。

提供的信息，包括桌面截图、应用程序信息和记忆，共同为AppAgent装备了一套**全面的数据以便于决策**。桌面截图和应用程序信息使AppAgent能够理解当前状态，并限制其应用程序选择的范围。另一方面，记忆作为过去请求完成情况的历史记录，帮助AppAgent基于先前的经验做出明智的决策。这一多方面的输入框架增强了AppAgent选择最适合满足用户请求的应用程序的能力。

在收集所有相关信息后，AppAgent使用GPT-V生成以下输出：

- Observation：当前桌面窗口截图的详细描述。
- Thoughts：根据Chainof-thought (CoT) 范式，所需的完成给定任务的下一步逻辑推理。
- Selected Application：所选应用程序的标签和名称。
- Status：任务状态，标记为“CONTINUE”或“FINISH”。
- Global Plan：完成用户请求的后续行动计划，通常是一个全局的、粗粒度的计划。
- Comment：提供的额外评论或信息，包括简短的进度总结和需要强调的点。

提示AppAgent输出其观察和思考具有双重目的。首先，它鼓励AppAgent仔细分析当前状态，为其逻辑和决策过程提供详细的解释。这不仅增强了其决策的逻辑连贯性，也有助于提高UFO的整体可解释性。其次，AppAgent确定任务的状态，如果认为任务已完成，则输出“FINISH”。AppAgent还可以给用户发送评论，报告进度，强调潜在问题或解答任何用户查询。一旦AppAgent识别出选定的应用程序，UFO将在此应用程序内采取特定动作以满足用户请求，由ActAgent负责执行这些动作。

### ActAgent

![img](https://picx.zhimg.com/v2-190a58a934666914fab7cb42849d68b3_1440w.jpg)



ActAgent作为AppAgent之后的下游实体，负责在选定的应用程序上执行特定动作以满足用户请求。其输入和输出也与AppAgent相比有所不同，如上图所示。ActAgent接受以下输入：

- User Request：提交给UFO的原始用户查询，与AppAgent相同。
- Screenshots：截图包括三个部分：（i）Previous Screenshot；（ii）Clean screenshot；（iii）Annotated screenshot。
- Control Information：列出在选定应用程序中启用操作的控件的名称和类型。
- Memory：之前的思考、评论、动作和执行结果，与AppAgent相同。
- Examples：用于动作选择的文本示例，作为演示。

与AppAgent相比，UFO为ActAgent提供了**三种类型的截图**，以帮助其决策过程。带有红色矩形突出显示最后选定控件的previous screenshot，有助于理解上一步操作的执行和分析动作的影响。Clean screenshot允许智能体理解应用程序的状态，而不受注释的阻碍；Annotated screenshot，用数字标注每个控件，便于更好地理解UI元素的功能和位置。不同类型的控件用不同的颜色标注以进行区分。

此外，输入到ActAgent的记忆有两个关键目的。首先，它作为智能体的提醒，使ActAgent能够分析过去的动作，并减少重复无效动作的可能性。其次，它建立了跨应用程序通信的关键渠道。执行结果（execution results），如从文档中提取的文本或图像的描述，存储在记忆模块中。ActAgent可以选择性地将这些信息纳入需要它的动作中，例如用来自不同来源的文本编写电子邮件。这种增强显著扩展了UFO的能力。

鉴于这一全面的输入，ActAgent仔细分析所有信息并输出以下内容：

- Observation：当前应用程序窗口截图的详细描述，以及分析上一个动作是否生效。
- Thoughts：当前动作决策背后的逻辑思考和理由过程。
- Selected Control：操作所选控件的标签和名称。
- Function：应用于控件的特定功能及其参数。
- Status：任务状态，标示为“CONTINUE”（如果需要进一步动作）、“FINISH”（如果任务完成）、“PENDING”（如果当前动作需要用户确认）、“SCREENSHOT”（如果智能体认为需要进一步的截图以注释更少的控件集）、以及“APP SELECTION”（当在当前应用程序上的任务完成且需要切换到不同的应用程序时）。
- Local Plan：更精确和细致的未来动作计划，以完全满足用户请求。
- Comment：额外的评论或信息，包括简短的进度总结、突出的点或计划的变化，类似于AppAgent所提供的。

虽然它的一些输出字段可能与AppAgent有相似之处，但UFO根据任务的输出状态决定下一步。如果任务未完成，它会将功能应用于所选控件，触发执行后应用程序的下一个状态。ActAgent迭代重复这一观察和对选定应用程序的反应过程，直到用户请求完全完成或需要切换到不同的应用程序。

### Special Design Consideration

UFO融入了一系列专门针对Windows操作系统定制的设计元素。这些增强功能旨在促进与UI控件的更有效、自动化和安全交互，从而提高其满足用户请求的能力。主要特性包括交互模式、动作定制、控件过滤、计划反思和安全防护，接下来将详细阐述每个特性。

### Interactive Mode

UFO为用户提供了进行交互式和迭代式交互的能力，而不是坚持一次性完成任务。任务完成后，用户可以灵活要求UFO增强先前的任务、提出一个全新的任务让UFO承担，或在UFO可能缺乏熟练度的任务中协助操作，如输入密码。这种用户友好的方法不仅使UFO与市场上其他现有的UI智能体区别开来，而且还允许它吸收用户反馈，促进更长、更复杂任务的完成。

### Action Customization

UFO目前支持对控件或UI的操作，然而，必须指出的是，当前动作并不是详尽无遗的，并且可以在Windows UI自动化的限制之外进行大幅扩展和定制。这种可扩展性对于根据特定用户需求定制框架至关重要，它允许加入键盘快捷键、宏命令、插件等功能。一个例子是summary()动作，它利用UFO的多模态能力按需观察和描述屏幕截图。

为了实现这种级别的定制，用户可以注册他们的定制操作。这包括指定目的、参数、返回值，以及必要时提供示例以供演示。然后，这些信息会被整合到UFO的prompt中以供参考。一旦注册过程完成，定制操作就可以被UFO执行。这种内在的灵活性使UFO成为一个高度可扩展的框架，使其能够在Windows系统内满足更复杂和针对用户特定的请求。

### Control Filtering

在应用程序的图形用户界面（GUI）中，Windows UI自动化可以检测到数百个控件项，每个都可供操作。然而，标注所有这些控件可能会使应用程序UI截图变得杂乱，阻挡了对单个项的视线，并生成一个可能给UFO在做出最佳选择决策时带来挑战的庞大列表。值得注意的是，其中一些控件可能不太可能对满足用户请求有用或相关。因此，实现过滤机制变得至关重要，以排除某些控件并简化UFO的决策过程。

为了应对这一挑战，UFO采用了双层控件过滤方法，包括hard level和soft level。在hard level上，候选控件基于具有高相关性和流行度的特定控件类型进行限制。此外，本文引入了一种软过滤机制，赋予UFO动态决定是否重新选择一个更简洁的特定控件列表的能力。这种自适应过滤方法在UFO感知到控件数量过多，可能使当前截图变得混乱并阻碍所需控件可见性时被触发。在这种情况下，UFO智能地返回一个精炼的感兴趣的控件候选列表。随后，它捕获一个仅用这些控件标注的新截图，促进了一个更集中和有效的过滤过程。这一特性增强了框架的自动化能力，使UFO能够为最佳性能做出智能决策。

### Plan Reflection

虽然应用程序选择智能体和动作选择智能体都负责发起计划以满足用户请求，但应用程序UI的实际状态可能并不总是与预期条件一致。例如，如果UFO最初计划在下一步点击“新建邮件”按钮，但这个按钮在当前UI中不可见，UFO可能需要首先导航到“主页”，然后再定位“新建邮件”按钮。因此，计划和行动都应相应地进行调整。

为了应对UI的这种动态性，本文prompt UFO在每一个决策步骤时持续修正其计划，允许它根据需要偏离原始路径。这种自适应方法提高了UFO基于其观察到的应用程序状态的演变对应用程序的响应性。这种反思机制的有效性在各种LLM框架和智能体架构中已得到证实。此外，计划反思的集成显著提高了UFO在导航和与不同应用程序UI交互方面的性能。

### Safeguard

![img](https://pica.zhimg.com/v2-1378aef5307a913df8459ee1be478b2c_1440w.jpg)



最后，意识到系统内某些操作的敏感性，例如文件删除等操作可能导致的不可逆变更。考虑到这些潜在风险，UFO内置了一种安全防护机制，在执行此类操作前寻求用户确认。上表列出了部分安全防护功能的操作列表，UFO会智能评估每一个操作的敏感度。通过部署这种安全防护，UFO确立了自身作为一个显著更安全、更值得信赖的智能体，降低了损害系统或危害用户文件和隐私的风险。

### Experiment

### Benchmark & Baselines & Metrics

为了全面评估在各种Windows应用程序中的性能，本文开发了一个名为WindowsBench的基准测试。这个benchmark包括50个用户请求（requests），涵盖了9个日常任务中常用的热门Windows应用程序。选定的应用程序包括Outlook、Photos、PowerPoint、Word、Adobe Acrobat、File Explorer、Visual Studio Code、WeChat和Edge Browser。这些应用程序满足工作、通讯、编码、阅读和网页浏览等不同的目的，确保了评估的多样性和全面性。对于每个应用程序，本文设计5个不同的requests，另外5个requests涉及跨多个应用程序的交互。这样的设置共计50个requests，每个应用程序至少有一个request与后续的request相关联，为UFO的交互模式提供了全面的评估。以下列出了部分WindowsBench中使用的requests示例。涉及后续交互的request在每个类别内按数字顺序组织。



![img](https://pica.zhimg.com/v2-5e7361c9a31beb452b53175a1c905fa4_1440w.jpg)



![img](https://pic4.zhimg.com/v2-1521d20327747566c97ea47edee82887_1440w.jpg)

![img](https://pic1.zhimg.com/v2-cd997230e4a0858e4aba71dfc32fa3e0_1440w.jpg)



鉴于现有的Windows智能体的缺失，本文选择了GPT-3.5和GPT-4作为baseline模型。由于这些模型缺乏直接与应用程序交互的能力，作者prompt它们提供step-by-step的指令以完成用户请求。然后，人类作为它们的代理人来执行操作。当需要视觉能力时，允许baseline暂停，因为它们无法独立完成这些任务。

在评估指标方面，作者从三个角度评估UFO的每个request：成功率、步骤数、完成率和safeguard rate。成功指标决定智能体是否成功完成了请求。步骤指智能体完成任务所需采取的动作数量，作为效率的指标。完成率是正确步骤数与总步骤数的比率。最后，safeguard rate衡量UFO在请求涉及敏感操作时请求用户确认的频率。鉴于GPT-V可能产生不同输出的潜在不稳定性，实验对每个request进行三次测试，并选择完成率最高的一个。对于其他baseline也采取了相同的方法。

### Performance Evaluation

首先，使用WindowsBench数据集，对各种框架进行了全面的量化比较，如下表所示。值得注意的是，UFO在benchmark中取得了86%的成功率，比表现最好的baseline（GPT-4）高出一倍多。这一结果强调了UFO在Windows操作系统上成功执行任务的复杂性，将其定位为高效智能体。此外，UFO展现出最高的完成率，表明其能够采取更精确的行动。我们还观察到UFO以最少的步骤完成任务，展示了其作为一个框架的效率，而GPT-3.5和GPT-4倾向于更多的步骤，且对于任务来说效果较差。从安全角度来看，UFO达到了85.7%的最高safeguard rate，这证明它可以准确地分类敏感请求，展现其作为一个主动寻求用户对这些请求进行确认的安全智能体。

![img](https://pic4.zhimg.com/v2-febbcde8f59bfaf421d42a8f797a0ff5_1440w.jpg)



与UFO相比，baseline的较差表现可归因于两个主要因素。首先，两个baseline都缺乏与真实应用环境直接交互的能力，依赖人类作为代理来执行动作。这一限制导致了无法适应环境变化和反馈，从而降低了准确性。其次，baseline仅接受文本输入，忽略了GUI交互中视觉能力的重要性。这一弱点阻碍了它们在Windows上完成用户请求的效果，其中视觉信息有时至关重要。值得注意的是，GPT-4的表现超过了GPT-3.5，凸显了其在这些任务中的更大潜力。总之，综合上述结果，本文展示了UFO在所有四个评估指标上的出色表现，极大地超过了其他baseline，将自己打造为与Windows操作系统交互的多功能且强大的框架。

![img](https://picx.zhimg.com/v2-a82ac80835f104cf6368a116813fdaf9_1440w.jpg)



上表中详细展示了UFO在不同应用程序中的性能细分（对于GPT-3.5和GPT-4的性能细分在文章附录部分）。在Safeguard Rate列中的“-”符号表示与该应用程序相关的所有请求都不是敏感的。值得注意的是，UFO在所有应用程序中都展现出强大的性能，展示了其在与不同软件交互和操作方面的多样性和有效性。然而，在Adobe Acrobat中存在例外，UFO取得了60%的成功率和78.7%的完成率。这可以归因于许多在Adobe Acrobat中的控制类型（control types）不被Windows UI自动化支持，给UFO在此应用程序中的操作带来挑战。重要的是，在完成涉及多个应用程序的请求时，UFO保持了高水平的性能。尽管完成这些requests需要更多步骤（平均9.8步），UFO实现了80%的成功率、83%的完成率和100%的safeguard rate。这凸显了UFO在跨不同应用程序导航以完成长期和复杂任务的能力，巩固了其作为Windows交互的全能智能体的地位。

### Limitations & Lessons Learned

最后，作者列出当前UFO框架存在的一些限制。首先，目前可用的UI控件和操作受限于[pywinauto](https://zhida.zhihu.com/search?content_id=240488942&content_type=Article&match_order=1&q=pywinauto&zhida_source=entity)和Windows UI自动化所支持的范围。偏离这一标准和后端的应用程序和控件目前尚不受UFO支持。为了扩大UFO的能力，作者计划通过支持替代后端，如[Win32 API](https://zhida.zhihu.com/search?content_id=240488942&content_type=Article&match_order=1&q=Win32+API&zhida_source=entity)，或集成专用的GUI模型进行视觉检测，例如CogAgent所表现的那样，来扩展其范围。这种增强将使UFO能够操作更广泛的应用程序，并处理更复杂的动作。

其次，作者发现UFO在探索不熟悉的应用程序UI时面临挑战，这些UI可能是小众的或不常见的。在这种情况下，UFO可能需要大量时间来导航和识别正确的操作。为了解决这个问题，作者提议利用online搜索引擎作为UFO的外部知识库。分析搜索结果中的文本和基于图像的指南将使UFO能够提炼出一个更精确和详细的计划，以完成对不熟悉应用程序的请求，增强其适应性和通用性。

### Conclusion

本文介绍UFO，一种新颖的UI-focused智能体，旨在通过与Windows操作系统上的应用程序进行智能互动，以自然语言满足用户请求。利用GPT-Vision，UFO分析应用程序GUI屏幕截图和控件信息，以动态选择最优的应用程序和控件来执行动作和满足用户查询。通过一个控制交互模块，使动作在应用程序上的执行得以摆脱人工干预，实现全自动化，将其建立为一个全面的LAM（Large Action Model）框架。借助**双智能体设计，即AppAgent和ActAgent**，UFO智能地在应用程序之间切换，允许完成跨不同应用程序的长期和复杂任务。此外，UFO还集成了诸如**动作定制和安全防护**等重要特性，以增强UFO的可扩展性和安全性。基于9个流行Windows操作系统应用程序的50个请求的评估结果证明了其卓越的多功能性和通用性。UFO也是开发专门为Windows操作系统环境量身定制的UI自动化智能体的先驱性工作。