---
title: 垂类心理健康咨询大模型MeChat的部署和性能对比
date: 2024-08-01
updated:
tags: [MeChat,LLM]
categories: 大模型
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/MeChat.png
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

# 垂类心理健康咨询大模型MeChat的部署和性能对比

## 部署和运行

[qiuhuachuan/smile: SMILE: Single-turn to Multi-turn Inclusive Language Expansion via ChatGPT for Mental Health Support (github.com)](https://github.com/qiuhuachuan/smile)

```shell
git clone https://github.com/qiuhuachuan/smile.git //如果网络不行就git clont到本地再scp到服务器 data目录可以忽略掉
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh //rust complier 然后要重新打开终端 已有rust complier即忽略这条命令
RUSTUP_TOOLCHAIN=1.72.0 pip install tokenizers==0.13.2 
/*执行上面这条命令，如果不这样做会报错：报错：ERROR: Could not build wheels for tokenizers, which is required to install pyproject.toml-based projects报错： error: casting `&T` to `&mut T` is undefined behavior, even if the reference is unused, consider instead using an `UnsafeCell`*/
vi requirements.txt 
//修改requirements.txt中的torch版本为2.2.0，设置完后:wq!退出
pip install -r requirements.txt .0
export HF_HOME="~/verticalLLM/lzjr/smile/cache" 
export HF_ENDPOINT=https://hf-mirror.com //临时换源
export HF_HUB_OFFLINE=0 //设置线上的
echo $HF_ENDPOINT
echo $HF_HUB_OFFLINE
/*注意这个目录是要有权限操作的，这一步的目的是如果不这样操作直接运行Mechat.py会报错：报错：PermissionError: [Errno 13] Permission denied: '/data/.cache/huggingface/modules/transformers_modules/THUDM'*/
python MeChat.py
```

开始下载了

![image-20240801144851595.png](https://s2.loli.net/2024/08/05/wh2Zz8PKacsDitj.png)

加载完之后，开始运行

![image-20240801150509713](C:\Users\11505\AppData\Roaming\Typora\typora-user-images\image-20240801150509713.png)



## 表现对比

可以看到Mechat扩展真实的心理互助 QA为多轮的心理健康支持多轮对话，提高了通用语言大模型**在心理健康支持领域能力的表现**，更加符合在长程多轮对话的应用场景；而通用大模型并不能做到这一点。

1. 人到老年似乎越来越孤独，孤独终老会不会很可怜?

   - Mechat

   ![image-20240801151229766.png](https://s2.loli.net/2024/08/05/xTKI5NJ7nAYLrkl.png)

   - Kimi

     ![image-20240801150931128.png](https://s2.loli.net/2024/08/05/pht1bLAgjqX9eo5.png)

2. 强迫思维严重影响到我的学习与生活该怎么办？

   - Mechat

     ![image-20240801151935573.png](https://s2.loli.net/2024/08/05/7W9UflpPNhFoHxv.png)

   - Kimi

     ![image-20240801152555811.png](https://s2.loli.net/2024/08/05/MAPZIKYgwbr8VFJ.png)

3. 女儿10岁同学不和她玩，女儿就动手煽了同学的脸？已经是第二次动手打人家，上一次也是因为不和她玩孩子是不是有心理问题？

   - Mechat

     ![image-20240801152846135.png](https://s2.loli.net/2024/08/05/gifxI5j1BqSR87K.png)

   - Kimi

     ![image-20240801152902059.png](https://s2.loli.net/2024/08/05/hcFbpsLSBrDAQZe.png)

   

4. 不论睡多久，只要开会就犯困，为什么？工作以来，对于那种不是在解决问题，或者是流水账的会议，就一定会犯困，坚持不过30分钟。新单位想转正，试用期开会三次打盹三次，但实在是太无聊。每次开会就会特别困(இдஇ; )，无语눈_눈，困死了(๑ó﹏ò๑)

   - Mechat

     ![image-20240801153110626.png](https://s2.loli.net/2024/08/05/UPua1j5f6BLteKF.png)

   - Kimi

     ![image-20240801153232783.png](https://s2.loli.net/2024/08/05/lhbsFokZKade39q.png)

5. 还有50天考研非常没信心，觉得未来模糊对不起父母

   - Mechat

     ![image-20240801153443487.png](https://s2.loli.net/2024/08/05/D9JkYeI2UpzNiZK.png)

   - Kimi

     ![image-20240801153555469.png](https://s2.loli.net/2024/08/05/SrA5IMCOtQZvkRm.png)





