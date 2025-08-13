---
title: 利用ollama一键式部署SoulChat和性能对比
date: 2024-08-05
updated:
tags: [HuatuoGPT2,Ollama]
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

# 利用ollama一键式部署SoulChat和性能对比

[scutcyr/SoulChat: 中文领域心理健康对话大模型SoulChat (github.com)](https://github.com/scutcyr/SoulChat)

[liutechs/soulchatfa (ollama.com)](https://ollama.com/liutechs/soulchatfa)

## 部署过程

采用ollama进行一键式部署：

```shell
ssh bjtc@162.105.16.236
password: 000000
curl -fsSL https://ollama.com/install.sh | sh //下载ollma
ollama run liutechs/soulchatfa //利用ollma下载SoulChat
```

## 运行和对比

1. 失恋

   - SoulChat:

     ![image-20240805212554946.png](https://s2.loli.net/2024/08/05/QVSv965RDmeuCgE.png)

   - Kimi:

     ![image-20240805213002471.png](https://s2.loli.net/2024/08/05/nwCEM1Uhxe8msaF.png)2. 



2. 宿舍关系

   - SoulChat:

     ![image-20240805213701972.png](https://s2.loli.net/2024/08/05/XGvL31IQ2iPJz5d.png)

   - Kimi:

     ![image-20240805213927208.png](https://s2.loli.net/2024/08/05/vriSUn8OMwlc2eg.png)

3. 期末考试

   - SoulChat

     ![image-20240805214119743.png](https://s2.loli.net/2024/08/05/IGpqnC3yHfb5jOs.png)

   - Kimi:

     ![image-20240805214257800.png](https://s2.loli.net/2024/08/05/F8HajPdV3GYM7wT.png)

4. 科研压力

   - SoulChat

     ![image-20240805214426460.png](https://s2.loli.net/2024/08/05/p5cPGSdTMiOgyaF.png)

   - Kimi:

     ![image-20240805214628846.png](https://s2.loli.net/2024/08/05/jJMGLoigN4OBqTX.png)

5. 实习工作

   - SoulChat

     ![image-20240805214753078.png](https://s2.loli.net/2024/08/05/GgFRuD6ezp2Ooqb.png)

   - Kimi:

     ![image-20240805214848335.png](https://s2.loli.net/2024/08/05/4B5YLU2vWHsVaJ1.png)

     