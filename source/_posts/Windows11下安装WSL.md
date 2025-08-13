---
title: Windows11下安装WSL
date: 2024-07-19
updated:
tags: [WSL]
categories: WSL
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/WSL.png
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

# Windows11下安装WSL

## 一、WSL是什么？

开发人员可以在 Windows 计算机上同时访问 Windows 和 Linux 的强大功能。 通过适用于 Linux 的 Windows 子系统 (WSL)，开发人员可以安装 Linux 发行版（例如 Ubuntu、OpenSUSE、Kali、Debian、Arch Linux 等），并直接在 Windows 上使用 Linux 应用程序、实用程序和 Bash 命令行工具，不用进行任何修改，也无需承担传统虚拟机或双启动设置的费用。

## 二、安装步骤

1. 确保电脑虚拟化开启

   1. 控制面板->程序->启用或关闭 windows 功能，开启 Windows 虚拟化和 Linux 子系统（WSL2)以及Hyper-V。由于在Windows11中并没有Hyper-V，需要进行手动配置

      ![image-20240719174041320.png](https://s2.loli.net/2024/07/19/A3LuWHaFGxiN1Xp.png)

   2. 配置Hyper-V

      家庭版windows11没有Hyper-V，需要配置Hyper-V。打开vs code创建Hyper-7.cmd，复制以下内容并保存后执行。

      ```cmd
      pushd "%~dp0"
      dir /b %SystemRoot%\servicing\Packages\*Hyper-V*.mum >hyper-v.txt
      for /f %%i in ('findstr /i . hyper-v.txt 2^>nul') do dism /online /norestart /add-package:"%SystemRoot%\servicing\Packages\%%i"
      del hyper-v.txt
      Dism /online /enable-feature /featurename:Microsoft-Hyper-V-All /LimitAccess /ALL
      ```

      

2. 系统安装
   win11 使用 WSL2 安装 linux 子系统 ubuntu 出现错误：无法解析服务器的名称或地址。原本显示报错：ConnectionError: Couldn’t reach https://raw.githubusercontent.com/huggingfac
   无法访问。

   解决方法：

   1. 修改 本地 host 文件。
      记事本打开 C:\Windows\System32\drivers\etc\hosts 文件，添加如下解析地址（4个中有一个好用就添加它）

      在https://www.ipaddress.com这个网站中的查询框中输入：raw.githubusercontent.com
      在里面找到相应的的ipv4地址，这四个地址随便选一个即可（好用的）：

      > 185.199.108.133 raw.githubusercontent.com
      > 185.199.109.133 raw.githubusercontent.com
      > 185.199.110.133 raw.githubusercontent.com
      > 185.199.111.133 raw.githubusercontent.com

3. 在CMD中刷新 DNS 解析缓存
   ipconfig /flushdns

4. 再次运行查看或安装命令
   查看可安装的 WSL

   ```cmd
   wsl -l -o
   ```

   ![image-20240719174714709.png](https://s2.loli.net/2024/07/19/L9XK5m1WUuCFagJ.png)

5. 列出已安装版本

   ```cmd
   wsl -l -v
   ```

   ![image-20240719174508599.png](https://s2.loli.net/2024/07/19/EMauckZm7XIsgbH.png)

6. wsl --install -d(安装):

   ```cmd
   wsl --install -d Ubuntu-22.04
   ```

7. wsl -d (运行)：

   ```cmd
   wsl -d Ubuntu-22.04
   ```

   ![image-20240719174849821.png](https://s2.loli.net/2024/07/19/Qc8HYLlKUgT4Noy.png)

8. 修改到D盘

   由于默认是到C盘，现修改到C盘。

   1. 关闭子系统

      关闭界面/输入如下命令关闭子系统。

      ```cmd
      wsl --shutdown Ubuntu-22.04
      ```

   2. 导出子系统

      ```cmd
      wsl --export Ubuntu-22.04 D:/WSL/Ubuntu22.04.tar
      ```

      ![image-20240719175252993.png](https://s2.loli.net/2024/07/19/sxLkiu6fzeMSnt8.png)

   3. 注销原子系统

      ```cmd
      wsl --unregister Ubuntu-22.04
      ```

      ![image-20240719175312011.png](https://s2.loli.net/2024/07/19/VeGrK5x89pNmEUC.png)

      ![image-20240719175322005.png](https://s2.loli.net/2024/07/19/ay8BjvmsLEM6zbO.png)

   4. 从D盘导入

      ```cmd
      wsl --import Ubuntu-22.04 D:/WSL/Ubuntu-22.04.tar
      ```

      ![image-20240719175344296.png](https://s2.loli.net/2024/07/19/vVk7RUDGqZlPOC5.png)

      ![image-20240719175359321.png](https://s2.loli.net/2024/07/19/Nylr6I5Esx3kUch.png)

   5. 再次运行导入好的系统

      ![image-20240719175427475.png](https://s2.loli.net/2024/07/19/Tx1PuMZdCLiYVEf.png)

