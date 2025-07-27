---
title: 法律垂类大模型DISC-LawGPT的部署运行和对比
date: 2024-08-07
updated:
tags: [DISC-LawGPTt,LLM]
categories: 大模型
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/DISC-LawGPT.png
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

# 法律垂类大模型DISC-LawGPT的部署运行和对比

## 部署和运行

```shell
# 部署
git clone https://github.com/FudanDISC/DISC-LawLLM.git
cd DISC-LawLLM
pip install -r requirements.txt
mkdir ShengbinYue
cd ShengbinYue
git clone https://hf-mirror.com/ShengbinYue/DISC-LawLLM
cd ..
mkdir cache
# 遇到报错 [Errno 13] Permission denied: '/data/.cache/huggingface/modules/transformers_modules/DISC-LawLLM'
export HF_HOME="~/verticalLLM/lzjr/DISC-LawLLM/cache" 
# 如果遇到CUDA error: out of memory 用 watch -n 0.5 nvidia-smi查看显卡占用情况 如果kill不了相关进程，就运行下面的指令，比如有三张卡0,1,2,其中2被另一个程序占用了大量显存且Kill不了，就用下面的命令
export CUDA_VISIBLE_DEVICES=0,1
# 运行
python cli_demo.py
```

运行成功：

![image-20240807123508410.png](https://s2.loli.net/2024/08/07/oK1lrgLAFYdjhb3.png)

## 性能对比

1. 请对以下案件做出分析并给出可能的判决：2021年11月9日，原告与被告南湖国旅公司签订《综合授信协议》，约定原告向被告南湖公司提供授信额度1000万元。同日，原告与被告南湖国旅公司、南湖粤途公司、王子山公司、布某、郭某、郑某、刘某、徐某、胡某、赵某、许某签订《最高额保证合同》，约定为上述债务提供最高额保证担保。2021年11月10日，原告与被告南湖国旅公司签订《流动资金借款合同》，约定贷款金额分别为1000万元，2021年1月10日，原告依约发放上述贷款。但被告南湖国旅公司在原告发放贷款后的2个月内，新增数十笔执行案件，严重危及原告债权，被告布某作为保证人，也发生新的重大执行案件，且在发生上述情况后，均未及时书面通知原告。

   - DISC-LawGPT：

     ![image-20240807131707454.png](https://s2.loli.net/2024/08/07/eoKcCgHjTyqQDv9.png)

   - Kimi:

     ![image-20240807131726207.png](https://s2.loli.net/2024/08/07/FwzhXucij3eyK5I.png)

2. 请对以下案件做出分析并给出可能的判决：2021年4月17日，刘某1向刘某出具借条一份，内容为：“借条今借到现金贰拾万元（￥200000.00）借款人：刘某1（捺印）2021.4月17号”刘某通过微信转账方式向刘某1交付出借款，分别为2021年4月17日转账30000元、30000元、30000元、10000元，2021年5月29日转账30000元、20000元、30000元、20000元，共计200000元。至本次诉讼，刘某1通过微信转账还款61500元，尚欠138500元。

   - DISC-LawGPT：

     ![image-20240807132055034.png](https://s2.loli.net/2024/08/07/iqcLWBl2a9uysOx.png)

   - Kimi:

     ![image-20240807132106568.png](https://s2.loli.net/2024/08/07/meUoVv8lhtfRnX2.png)

3. 劳动者（正式工）未提前30日告知用人单位即离职，需要支付违约金吗？

   - DISC-LawGPT

     ![image-20240807132306145.png](https://s2.loli.net/2024/08/07/ETL7JypSWdkaAbh.png)

   - Kimi:

     ![image-20240807132324700.png](https://s2.loli.net/2024/08/07/46CNPuW38xb9QYZ.png)

4. 请对以下案件做出分析并给出可能的判决：原告与被告于2020年8月11日签订《内江师范学院新校区建设工程配电箱买卖合同》，双方约定由原告向被告内江师范学院新校区项目提供配电箱设备，合同暂定合计1262676.36元，双方并就供货期限、运输及交货方式、验收、货款支付、争议解决等进行约定。合同签订后，原告依约履行，至2021年5月6日完成全部供货，实际供货金额1164220.59元，并已向被告开具全额发票。现被告已支付货款695000元，剩余货款469220.59元未支付。另外，原告于2020年8月31日向被告缴纳了该项目履约保证金63133元，被告未予退还。

   - DISC-LawGPT:

     ![image-20240807132716297.png](https://s2.loli.net/2024/08/07/5ZztM1dk8SrwAHq.png)

   - Kimi:

     ![image-20240807132607039.png](https://s2.loli.net/2024/08/07/2SBbJ4cG5fxwpYT.png)

     

5. 网购商品用快递送达，商品在快递途中、签收之前毁损的风险谁承担？

   - DISC-LawGPT:

     ![image-20240807133036171.png](https://s2.loli.net/2024/08/07/ta5LNwDUFjI7bCW.png)

   - Kimi:

     ![image-20240807132754350.png](https://s2.loli.net/2024/08/07/aibWvgdDErx1ehN.png)

     





