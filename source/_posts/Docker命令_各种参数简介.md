---
title: Docker命令_各种参数简介
date: 2024-07-27
updated:
tags: [Docker]
categories: Docker
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/docker.png
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

# Docker命令_各种参数简介

## run

```shell
docker run [OPTIONS] IMAGE [COMMOND] [ARGS...]
 
# OPTIONS 说明
	--name="容器新名字": 为容器指定一个名称；
	-d: 后台运行容器，并返回容器ID，也即启动守护式容器；
	-i：以交互模式运行容器，通常与 -t 同时使用；
	-t：为容器重新分配一个伪输入终端，通常与 -i 同时使用；
	-P: 随机端口映射；
	-p: 指定端口映射，有以下四种格式
	      ip:hostPort:containerPort
	      ip::containerPort
	      hostPort:containerPort
	      containerPort
    -w: 指定命令执行时，所在的路径
 
 
# IMAGE
XXX_IMAGE_NAME:XXX_IMAGE_VER
 
 
# COMAND
例：mvn -Duser.home=xxx -B clean package -Dmaven.test.skip=true
 
# 常用OPTIONS补足：
--name：容器名字
--network：指定网络
--rm：容器停止自动删除容器
 
-i：--interactive,交互式启动
-t：--tty，分配终端
-v：--volume,挂在数据卷
-d：--detach，后台运行

# 在已运行的容器中运行命令
docker exec [OPTIONS] CONTAINER COMMAND [ARG…]
常用选项：
  -d：--detach ，后台运行命令
  -e, --env list             设置env
  -i, --interactive         启用交互式
  -t, --tty                     启用终端
  -u, --user string        指定用户 (格式: <name|uid>[:<group|gid>])
  -w, --workdir string       指定工作目录
```

## docker -v 挂载

```shell
#譬如我要启动一个centos容器，宿主机的/test目录挂载到容器的/soft目录，可通过以下方式指定：
 
docker run -it -v /test:/soft centos /bin/bash
 
#冒号":"前面的目录是宿主机目录，后面的目录是容器内目录。

```

## 其他常用

```shell
================================

#查看docker服务运行状况

ps -el | grep -i docker

-

#停止Docker服务
service docker stop

-

#启动docker服务

service docker start

================================

#查看有哪些镜像
docker search yourAppName

-

#获取镜像
docker pull imageName

-

#查看安装了的镜像
docker images

-

#查看运行的容器
docker ps

-

#查看所有的容器
docker ps -a

-

#停止容器运行
docker stop <container_id>

-

#重新启动容器
docker resatart <container_id>

-

#删除容器
docker rm yourContainerID 

-

#删除镜像
docker rmi yourImageName

-

#查看容器开启时的log
docker logs -f yourContainerName

-

#进入容器内部执行命令
docker exec -it yourContainerID bash

＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

#查看Log
docker logs -f <image_name>
```

