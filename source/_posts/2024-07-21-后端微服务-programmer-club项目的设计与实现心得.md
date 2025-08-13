---
title: 后端微服务-programmer-club项目的设计与实现心得
date: 2024-07-21
updated:
tags: [Java,后端,微服务]
categories: 后端
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/java.png
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

# 后端微服务-programmer-club项目的设计与实现心得

## 开发工具

后端：IDEA

前端：VSCode

项目管理：git

包依赖管理：Maven3.6.0

数据库：Mysql5.7

数据库连接池和监控库：Druid

框架：Springboot 2.4.2

数据库图形化：Navicat

接口管理工具：APIPost7

Redis桌面工具：RedisDesktop

表建模：PDManager

原型设计：axure8

原型组件库: antdesign

代码生成器：easycode（idea的plugin市场）

一些插件：mybatis（类->dao->数据库），easycode（由数据库表生成相应代码）, preconditions（参数校验）

node.js

阿里云脚手架用于组件/版本的选择兼容，非常方便: [start.aliyun.com]()

## 架构设计

### 传统项目

[SpringMVC框架（详解）-CSDN博客](https://blog.csdn.net/H20031011/article/details/131511482?ops_request_misc=%7B%22request%5Fid%22%3A%22172145077916800222810035%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172145077916800222810035&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-131511482-null-null.142^v100^pc_search_result_base8&utm_term=spring mvc架构&spm=1018.2226.3001.4187)

一般的mvc：model，view，controller

SpringMVC：controller(view+controller)，service（业务逻辑），dao（数据库）



![image-20240710175347652.png](https://s2.loli.net/2024/07/10/IkmcCyEaiVK8jvT.png)

![image-20240720125604514.png](https://s2.loli.net/2024/07/20/4xSwLQAW6PBKqYI.png)



### 现有的架构

[DDD架构-CSDN博客](https://blog.csdn.net/qq_49619863/article/details/127836283?ops_request_misc=%7B%22request%5Fid%22%3A%22172060612716800222827668%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172060612716800222827668&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-127836283-null-null.142^v100^pc_search_result_base8&utm_term=ddd架构&spm=1018.2226.3001.4187)

[浅谈架构设计：MVC架构与DDD架构【开发实践】_ddd架构和mvc架构区别-CSDN博客](https://blog.csdn.net/qq_40656637/article/details/137344153?ops_request_misc=%7B%22request%5Fid%22%3A%22172145093416800184184571%22%2C%22scm%22%3A%2220140713.130102334.pc%5Fall.%22%7D&request_id=172145093416800184184571&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-1-137344153-null-null.142^v100^pc_search_result_base8&utm_term=spring mvc架构和ddd架构&spm=1018.2226.3001.4187)

ddd 架构

![cbc3530efc1e41d6b6a94455d804d3d3[1].png](https://s2.loli.net/2024/07/10/6L8j9VMkRHxWOga.png)

- 用户接口层（User Interface ）：负责向用户显示信息和解释用户指令（是DDD架构中的表现层）（表现层是视图层的超集，概念有所区别，知道最上层就是表现层即可）
- 应用层（Application）：很“薄”的一层，理论上不应该有业务规则或逻辑，主要面向用例和流程相关的操作。在应用层协调多个服务和领域对象完成服务的组合和编排，协作完成业务操作。此外，应用层也是微服务之间交互的通道，它可以调用其它微服务的应用服务，完成微服务之间服务的组合和编排
- 领域层（Domain）：是实现企业核心业务逻辑，通过各种校验手段保证业务的正确性。领域层主要体现领域模型的业务能力，它用来表达业务概念、业务状态和业务规则。领域层包含聚合根、实体、值对象、领域服务等领域模型中的领域对象
- 基础层（Infrastructure）：贯穿所有层，为其它层提供通用的技术和基础服务，包括第三方工具、驱动、消息中间件、网关、文件、缓存以及数据库等
- 个人理解：将service层拆分为了应用层和领域层。其中应用层关注于用例和流程，不涉及业务规则或逻辑，通过组合和编排下层的领域层来完成业务操作。而领域层用于封装具体的业务规则或逻辑，拆分出来的领域层不再和具体流程关联，实现了高内聚和低耦合，还提高了领域层的可复用性。用户接口层和基础层则为原来的视图层和dao层的扩展，新增了部分职责功能。



![image-20240710175452746.png](https://s2.loli.net/2024/07/10/eTX5pdGHV3OrFIB.png)

1. **API（对外接口层）**：这一层负责定义对外提供的服务接口，通常用于与客户端或其他服务进行交互。

2. **Controller**：在传统的MVC架构中，控制器用于处理用户的请求。在这里，它用于接收API层的请求，并将请求转换为应用层可以理解的格式。

3. **DTO（Data Transfer Object）**：

   代表数据传输对象的意思

   是一种设计模式之间传输数据的软件应用系统，数据传输目标往往是数据访问对象从数据库中检索数据

   数据传输对象与数据交互对象或数据访问对象之间的差异是一个以不具任何行为除了存储和检索的数据（访问和存取器）

   简而言之，就是**接口之间传递的数据封装**

   表里面有十几个字段：id，name，gender（M/F)，age……

   页面需要展示三个字段：name，gender(男/女)，age

   DTO由此产生，一是能提高数据传输的速度(减少了传输字段)，二能隐藏后端表结构。

4. **BO（Business Object）**：

   代表业务对象的意思，Bo就是把业务逻辑封装为一个对象（注意是逻辑，业务逻辑），这个对象可以包括一个或多个其它的对象。通过调用Dao方法，结合Po或Vo进行业务操作。

   形象描述为一个对象的形为和动作，当然也有涉及到基它对象的一些形为和动作。比如处理一个人的业务逻辑，该人会睡觉，吃饭，工作，上班等等行为，还有可能和别人发关系的行为，处理这样的业务逻辑时，我们就可以针对BO去处理。

   再比如投保人是一个PO，被保险人是一个PO，险种信息也是一个PO等等，他们组合起来就是一张保单的BO。

5. **PO/DO: Persistent Object / Data Object，持久对象 / 数据对象。**

   它跟持久层（通常是关系型数据库）的数据结构形成一一对应的映射关系，如果持久层是关系型数据库，那么，数据表中的每个字段（或若干个）就对应PO的一个（或若干个）属性。

6. **VO: View Object, 视图模型，展示层对象**:

   对应页面显示（web页面/移动端H5/Native视图）的数据对象。

7. **Application层（应用层）**：这一层包含应用服务，它们协调领域对象来完成业务逻辑。它还包含一些业务逻辑的转换逻辑，如DTO到BO的转换。

8. **Interceptor**：拦截器，用于在请求处理过程中进行一些前置或后置处理，例如日志记录、权限验证等。

9. **Application-MQ（消费者）/ Application-Job**：这指的是应用层中处理消息队列消息的组件，或者定时任务的处理。

10. **Domain层（领域层）**：这是DDD中的核心层，包含业务逻辑和领域模型。领域层专注于业务规则和业务实体。

11. **Service**：领域服务，执行领域逻辑但不自然属于任何实体或值对象的操作。

12. **Entity/PO（Persistent Object）**：持久化对象，通常与数据库存储相关，代表数据库中的记录。

13. **Mapper**：数据访问对象，用于将领域对象映射到数据库表。

14. **Infra层（基础设施层）**：提供技术实现，如数据库访问、消息传递、外部服务调用等。

15. **RPC**：远程过程调用，用于服务之间的通信。

16. **MG（生产者）**：指的是消息生成者，负责生成并发送消息到消息队列。

17. **Starter（启动层）**：指的是服务启动时需要自动执行的代码或配置。

18. **Aggressive（聚合层）**：聚合层，将多个领域对象聚合成一个更大的业务实体。

19. **Config**：配置层，用于存储和访问配置信息。

20. **Dict（字典）**：指的是数据字典，用于存储一些固定的数据或映射关系。

21. **Common（公共层）**：包含整个应用中多个地方会用到的通用代码或工具。

22. **Enums**：枚举，用于定义一组命名的常量。

23. **Utils**：工具类，提供一些通用的辅助功能。

req->dto->do->bo->entity->po

![UBWaSonlxTkZyGs[1].jpg](https://s2.loli.net/2024/07/10/vcwy8WMZKz7pNSe.jpg)

### 项目结构

![image-20240717163452115.png](https://s2.loli.net/2024/07/17/YwcR1HeWvrqD72s.png)

#### 后端项目目录（backend）

- **asyncTool**: 包含异步处理工具或库，用于处理异步任务。
- **doc**: 存放项目文档，如API文档、技术规范等。
- **jc-club-auth**: 认证服务，负责用户认证和授权。
- **jc-club-circle**: 可能与社区圈子或用户组相关功能。
- **jc-club-common-starter**: 通用启动器或工具类，提供项目通用功能。
- **jc-club-gateway**: 网关服务，负责请求路由、负载均衡等。
- **jc-club-gen**: 代码生成工具，可能用于快速生成项目代码。
- **jc-club-interview**: 面试相关功能，可能包含面试题库或模拟面试。
- **jc-club-oss**: 对象存储服务，用于管理文件存储。
  - [minio安装部署及使用-CSDN博客](https://blog.csdn.net/Java_Mr_Jin/article/details/125643455?ops_request_misc=%7B%22request%5Fid%22%3A%22172205057816800211579712%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172205057816800211579712&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-125643455-null-null.142^v100^pc_search_result_base8&utm_term=minio&spm=1018.2226.3001.4187)

- **jc-club-practice**: 实践项目或示例代码。
- **jc-club-subject**: 主题或课程相关功能，可能用于教育或培训。
- **jc-club-wx**: 微信相关功能，可能包含微信公众号接口或小程序支持。



## 技术选型

[Spring和Spring Boot之间的区别（小结）_spring和springboot的区别-CSDN博客](https://blog.csdn.net/mengxin_chen/article/details/116240326?ops_request_misc=%7B%22request%5Fid%22%3A%22172145220016800227442776%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172145220016800227442776&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-116240326-null-null.142^v100^pc_search_result_base8&utm_term=spring和spring boot区别&spm=1018.2226.3001.4187)

![image-20240710163626898.png](https://s2.loli.net/2024/07/10/SRyfeJV49ksGvNl.png)

## SpringBoot相关

### SpringBoot注解

[@Autowired用法详解-CSDN博客](https://blog.csdn.net/weixin_45797022/article/details/120896184?ops_request_misc=%7B%22request%5Fid%22%3A%22172161940916800222815761%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172161940916800222815761&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-120896184-null-null.142^v100^pc_search_result_base8&utm_term=autowired&spm=1018.2226.3001.4187)

[@RestController 注解_@restcontroller注解-CSDN博客](https://blog.csdn.net/qq_28289405/article/details/82185676?ops_request_misc=%7B%22request%5Fid%22%3A%22172161976516800227461344%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172161976516800227461344&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-82185676-null-null.142^v100^pc_search_result_base8&utm_term=RestController注解&spm=1018.2226.3001.4187)

Mybatis:[@Mapper注解-CSDN博客](https://blog.csdn.net/weixin_46369022/article/details/122755858?ops_request_misc=%7B%22request%5Fid%22%3A%22172162002416800178517757%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172162002416800178517757&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_click~default-1-122755858-null-null.142^v100^pc_search_result_base8&utm_term=@Mapper注解&spm=1018.2226.3001.4187) 给Dao用的

mapstruct：[MAPSTRUCT(@Mapper用法)_org.mapstruct.mapper maven-CSDN博客](https://blog.csdn.net/qq_43459184/article/details/103372740?ops_request_misc=%7B%22request%5Fid%22%3A%22172259704016800180642299%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172259704016800180642299&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-103372740-null-null.142^v100^pc_search_result_base8&utm_term=mapstruct @mapper&spm=1018.2226.3001.4187)

[详细分析Java中的@Service注解-CSDN博客](https://blog.csdn.net/weixin_47872288/article/details/138509834?ops_request_misc=%7B%22request%5Fid%22%3A%22172162036516800226577013%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172162036516800226577013&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-138509834-null-null.142^v100^pc_search_result_base8&utm_term=@Service注解&spm=1018.2226.3001.4187)

[介绍@Component，@Bean，@service，@Autowire 和 @Resource等_@service @bean-CSDN博客](https://blog.csdn.net/weixin_38002126/article/details/122977500?ops_request_misc=%7B%22request%5Fid%22%3A%22172162091816800186516004%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172162091816800186516004&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-122977500-null-null.142^v100^pc_search_result_base8&utm_term=@service和@component @bean @a&spm=1018.2226.3001.4187)

### SpringBoot ioc aop

[深入理解Spring两大特性：IoC和AOP-CSDN博客](https://blog.csdn.net/dkbnull/article/details/87219562?ops_request_misc=%7B%22request%5Fid%22%3A%22172243396116800182129949%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172243396116800182129949&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-87219562-null-null.142^v100^pc_search_result_base8&utm_term=SPRING BOOT AOP ioc&spm=1018.2226.3001.4187)

[AOP的连接点与切点区别，连接点，切点，切面的基础概念_aop连接点-CSDN博客](https://blog.csdn.net/u013190145/article/details/109171013?ops_request_misc=%7B%22request%5Fid%22%3A%22172243433616800213010408%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172243433616800213010408&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-109171013-null-null.142^v100^pc_search_result_base8&utm_term=连接点和切入点的区别&spm=1018.2226.3001.4187)

[Spring AOP术语：连接点和切点的区别。_切入点 连接点 区别-CSDN博客](https://blog.csdn.net/weixin_42649617/article/details/109997718?ops_request_misc=&request_id=&biz_id=102&utm_term=连接点和切入点的区别&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-1-109997718.142^v100^pc_search_result_base8&spm=1018.2226.3001.4187)



## Mybatis

[彻底搞懂MyBaits中#{}和${}的区别_mybatis #{}-CSDN博客](https://blog.csdn.net/Bb15070047748/article/details/107188167/?ops_request_misc=&request_id=&biz_id=102&utm_term=&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-1-107188167.nonecase&spm=1018.2226.3001.4187#{}&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-1-107188167.nonecase)

[mybatis中resultMap的理解_result map-CSDN博客](https://blog.csdn.net/u012843873/article/details/80198185?ops_request_misc=%7B%22request%5Fid%22%3A%22172259150816800178584486%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172259150816800178584486&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~baidu_landing_v2~default-1-80198185-null-null.142^v100^pc_search_result_base8&utm_term=mybatic resultmap&spm=1018.2226.3001.4187)

[【Mybatis】xml常用总结（持续更新）_mybatis xml-CSDN博客](https://blog.csdn.net/libusi001/article/details/134155913?ops_request_misc=&request_id=&biz_id=102&utm_term=mybatis查询语句&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-4-134155913.142^v100^pc_search_result_base8&spm=1018.2226.3001.4187)

[SpringBoot+MyBatis项目Dao层最简单写法_springboot dao层怎么写-CSDN博客](https://blog.csdn.net/iiiliuyang/article/details/104162463?ops_request_misc=&request_id=&biz_id=102&utm_term=springboot dao.xml写法&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-2-104162463.142^v100^pc_search_result_base8&spm=1018.2226.3001.4187)

[Spring Boot专栏六：在Dao.xml文件中写Mybatis语句_springboot dao xml-CSDN博客](https://blog.csdn.net/DTDanteDong/article/details/112606910?ops_request_misc=%7B%22request%5Fid%22%3A%22172243518216800222895850%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172243518216800222895850&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~baidu_landing_v2~default-1-112606910-null-null.142^v100^pc_search_result_base8&utm_term=springboot dao.xml写法&spm=1018.2226.3001.4187)

[Mybatis中动态Sql的if、for和foreach使用_mybatis foreach if open-CSDN博客](https://blog.csdn.net/wflsyf/article/details/112984282?ops_request_misc=%7B%22request%5Fid%22%3A%22172259182216800226531598%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172259182216800226531598&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-112984282-null-null.142^v100^pc_search_result_base8&utm_term=mybatis if test foreach&spm=1018.2226.3001.4187)

dao的接口放在mapper包下，在启动类前要加@MapperScan("com.**.mapper")，便于发现：[blog.csdn.net/zzxcvbnm19/article/details/103275920?ops_request_misc=%257B%2522request%255Fid%2522%253A%2522172259218016800226519050%2522%252C%2522scm%2522%253A%252220140713.130102334.pc%255Fall.%2522%257D&request_id=172259218016800226519050&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-1-103275920-null-null.142^v100^pc_search_result_base8&utm_term=mapperscan和dao&spm=1018.2226.3001.4187](https://blog.csdn.net/zzxcvbnm19/article/details/103275920?ops_request_misc=%7B%22request%5Fid%22%3A%22172259218016800226519050%22%2C%22scm%22%3A%2220140713.130102334.pc%5Fall.%22%7D&request_id=172259218016800226519050&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-1-103275920-null-null.142^v100^pc_search_result_base8&utm_term=mapperscan和dao&spm=1018.2226.3001.4187)

[spring和Mybatis中的拦截器_mybatis handlerinterceptor-CSDN博客](https://blog.csdn.net/qq_59612674/article/details/121027506?ops_request_misc=%7B%22request%5Fid%22%3A%22172388427716800178552460%22%2C%22scm%22%3A%2220140713.130102334.pc%5Fall.%22%7D&request_id=172388427716800178552460&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-2-121027506-null-null.142^v100^pc_search_result_base8&utm_term=mybatis innovation&spm=1018.2226.3001.4187)



## Java相关

### Stream

[讲透JAVA Stream的collect用法与原理，远比你想象的更强大_stream.collection-CSDN博客](https://blog.csdn.net/veezean/article/details/125857074?ops_request_misc=%7B%22request%5Fid%22%3A%22172258578116800227423214%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172258578116800227423214&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-125857074-null-null.142^v100^pc_search_result_base8&utm_term=Java stream collect&spm=1018.2226.3001.4187)

```java
/**
 * 构建缓存key
 */
public String buildKey(String... strObjs) {
    return Stream.of(strObjs).collect(Collectors.joining(CACHE_KEY_SEPARATOR));
}
```

[Java--Stream流详解_java stream-CSDN博客](https://blog.csdn.net/MinggeQingchun/article/details/123184273?ops_request_misc=%7B%22request%5Fid%22%3A%22172258592916800182196501%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172258592916800182196501&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-123184273-null-null.142^v100^pc_search_result_base8&utm_term=Java stream流&spm=1018.2226.3001.4187)

stream的创建：

1. Stream.of(1,2,3,4)    （这里面的1,2,3,4其实是Array的类型）
2. list.stream()

操作符

1. 中间操作符
   1. filter：用于过滤 
      - list.stream().filter(number->number>=2).collect(Collectors.toList());
   2. map：用于映射 
      - list.stream().(str->str+"-IT").collect(Collectors.toList());
   3. dinstinct:  用于去重 
      - numbers.stream().filter(i -> i % 2 == 0).distinct().forEach(System.out::println);[教你看懂System.out::println-CSDN博客](https://blog.csdn.net/qq_36929361/article/details/84926277?ops_request_misc=%7B%22request%5Fid%22%3A%22172258713216800188592335%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172258713216800188592335&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-84926277-null-null.142^v100^pc_search_result_base8&utm_term=System.out%3A%3Aprintln&spm=1018.2226.3001.4187&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT1TeXN0ZW0ub3V0JTNBJTNBcHJpbnRsbiZ0PSZ1PSZ1cnc9)
   4. sorted: 用于排序  
      - strings1.stream().sorted().collect(Collectors.toList());
2. 终端操作符
   1. collect: 收集器，将流转换为其他形式 
      - strings.stream().collect(Collectors.toSet()); 
      - strings.stream().collect(Collectors.toList());
   2. forEach:遍历流
      - strings.stream().forEach(s -> out.println(s));

### Lamda表达式

[Lambda表达式详解_lamda表达式-CSDN博客](https://blog.csdn.net/m0_64102491/article/details/127272988?ops_request_misc=%7B%22request%5Fid%22%3A%22172258673416800213030674%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172258673416800213030674&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-127272988-null-null.142^v100^pc_search_result_base8&utm_term=lamda表达式&spm=1018.2226.3001.4187&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDEuMjEwMS4zMDAxLjQ0OTgmcT1sYW1kYSVFOCVBMSVBOCVFOCVCRSVCRSVFNSVCQyU4RiZ0PSZ1PQ%3D%3D)

形如以下：

> (o1,o2) -> Integer.compare(o1,o2)
>
> ```
> 左边->右边
> ```

- `->` 被称为lambda操作符或箭头操作符
- `左边`：lambda形参列表（其实就是接口中的抽象方法的形参列表）
- `右边`：lambda体 （其实就是重写的抽象方法的方法体）



### 线程池

[java线程池（简单易懂）-CSDN博客](https://blog.csdn.net/qq_64680177/article/details/131445798?ops_request_misc=%7B%22request%5Fid%22%3A%22172277205216800186576272%22%2C%22scm%22%3A%2220140713.130102334.pc%5Fall.%22%7D&request_id=172277205216800186576272&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-2-131445798-null-null.142^v100^pc_search_result_base8&utm_term=java线程池 简单易懂&spm=1018.2226.3001.4187)

[Java四种线程池newCachedThreadPool,newFixedThreadPool,newScheduledThreadPool,newSingle-CSDN博客](https://blog.csdn.net/zhaofuqiangmycomm/article/details/83029165?ops_request_misc=%7B%22request%5Fid%22%3A%22172277227416800182718329%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172277227416800182718329&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-83029165-null-null.142^v100^pc_search_result_base8&utm_term=newCachedThreadPool&spm=1018.2226.3001.4187)

[JAVA线程池submit详解 ，execute和submit提交任务的区别_executor.submit-CSDN博客](https://blog.csdn.net/leilei1366615/article/details/131330243?ops_request_misc=%7B%22request%5Fid%22%3A%22172277262116800222879851%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172277262116800222879851&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-131330243-null-null.142^v100^pc_search_result_base8&utm_term=线程池submit和excute&spm=1018.2226.3001.4187)

继承的ExecutorService接口

- **newCachedThreadPool**（没有上限的线程池），如果线程池长度超过处理需要，可灵活回收空闲线程，若无可回收，则新建线程。

  - ```java
    ExecutorService cachedThreadPool = Executors.newCachedThreadPool();
    cachedThreadPool.execute(new Runnable(){
        @Override
        public void run() {
            System.out.println("执行线程任务");
    })
    ```

- **newFixdedThreadPool**（有上限的线程池），创建一个定长线程池，可控制线程最大并发数，超出的线程会在队列中等待。

  - ```
    ExecutorService fixedThreadPool = Executors.newFixedThreadPool(3);
    fixedThreadPool.execute(new Runnable(){
        @Override
        public void run() {
            System.out.println("执行线程任务");
    })
    ```

- **newScheduledThreadPool**，创建一个定长线程池，支持定时及周期性任务执行。延迟执行示例代码如下：

  - ```java
    ScheduledExecutorService scheduledThreadPool = Executors.newScheduledThreadPool(5);
    scheduledThreadPool.schedule(new Runnable() {
        @Override
        public void run() {
            System.out.println("delay 3 seconds");
        }
    }, 3, TimeUnit.SECONDS);//延迟三秒执行
    ```

- **newSingleThreadExecutor**，创建一个**单线程化**的线程池，它只会用唯一的工作线程来执行任务，保证所有任务按照指定顺序(FIFO, LIFO, 优先级)执行。

- **ThreadPoolExecutor**（自定义创建线程池）

  - 它最长的构造方法有七个参数。

    1. 核心线程数量——在线程池当中无论空闲多久都不会被删除的线程
    2. 线程池当中最大的线程数量——线程池当中最大能创建的线程数量
    3. 空闲时间（数值）——临时线程（线程池中出核心线程之外的线程）空闲了多久就会被淘汰的时间。
    4. 空闲时间（单位）——临时线程空闲了多久就会被淘汰的时间单位，要用枚举类TimeUnit类作为参数
    5. 阻塞队列——就是创建一个阻塞队列作为参数传入，就是当线程池当中线程数量已经达到了最大线程数量，允许多少个任务排队获取线程，其余的用参数七那个方案来处理。
    6. 创建线程的方式——不是new一个线程，而是传入一个线程工厂（例如：Executors工具类中的defaultThreadFactory方法返回的就是一个线程工厂）
    7. 要执行的任务过多时的解决方案——当等待队列中也排满时要怎么处理这些任务(任务拒绝策略)

  - ```java
    
    //代码实现
       /**
         * 之前用工具类进行创建，有好多参数不能自己设置
         * 咱直接自己手动创建一个线程池，自己设置参数
         * 参数一：核心线程数量                           不能小于0
         * 参数二：最大线程数                             不能小于0，数值大于等于核心线程数量
         * 参数三：空闲临时线程最大存活时间（数值）           不能小于0
         * 参数四：空闲临时线程最大存活时间（单位）            用TimeUnit这个枚举类表示
         * 参数五：任务队列，也就是一个堵塞队列               不能为null
         * 参数六:创建线程的工厂                            不能为null
         * 参数七：任务的拒绝策略                             不能为null
         */
     ThreadPoolExecutor threadPoolExecutor = new ThreadPoolExecutor(
            3,  // 核心线程数量
            6,              //最大线程数
            60,             //空闲临时线程最大存活时间（数值）
            TimeUnit.SECONDS,//空闲临时线程最大存活时间（单位）
            new ArrayBlockingQueue<>(3),//任务队列，也就是一个堵塞队列，也可以使用LinkedBlockingQueue这个阻塞队列
            Executors.defaultThreadFactory(),//用线程池工具类Executors创建线程的工厂
            new ThreadPoolExecutor.AbortPolicy()//任务的拒绝策略中其中一个，丢弃任务并抛出RejectedExecutionException
            }
    ```

    ![image-20240804205131842.png](https://s2.loli.net/2024/08/04/fTsqWtGjBRbrVxS.png)



### 锁

[Java中涉及到的锁_java的锁-CSDN博客](https://blog.csdn.net/qq_31129841/article/details/134800508?ops_request_misc=&request_id=&biz_id=102&utm_term=java锁&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-0-134800508.142^v100^pc_search_result_base8&spm=1018.2226.3001.4187)

[可重入锁详解（什么是可重入）-CSDN博客](https://blog.csdn.net/w8y56f/article/details/89554060?ops_request_misc=%7B%22request%5Fid%22%3A%226AC14F77-B54A-40E2-BC9B-B5E43E80DDE1%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=6AC14F77-B54A-40E2-BC9B-B5E43E80DDE1&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-89554060-null-null.142^v100^pc_search_result_base8&utm_term=可重入锁&spm=1018.2226.3001.4187)

[浅谈synchronized、wait、notify和notifyAll_synchronized,wait,notify-CSDN博客](https://blog.csdn.net/qq_15002323/article/details/78299615?ops_request_misc=%7B%22request%5Fid%22%3A%22189C86F7-3A36-4590-84CA-80D0EE05EA8B%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=189C86F7-3A36-4590-84CA-80D0EE05EA8B&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-78299615-null-null.142^v100^pc_search_result_base8&utm_term=synchronized和wait&spm=1018.2226.3001.4187)

[Java中的锁升级_java 锁升级-CSDN博客](https://blog.csdn.net/qq_45795744/article/details/123493673?ops_request_misc=%7B%22request%5Fid%22%3A%22757F3D0D-BE29-47FB-B090-2CC888215371%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=757F3D0D-BE29-47FB-B090-2CC888215371&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-123493673-null-null.142^v100^pc_search_result_base8&utm_term=java锁升级&spm=1018.2226.3001.4187)

## SQL

[史上超强最常用SQL语句大全-CSDN博客](https://blog.csdn.net/promsing/article/details/112793260?ops_request_misc=%7B%22request%5Fid%22%3A%22172278251216800227438114%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172278251216800227438114&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-112793260-null-null.142^v100^pc_search_result_base8&utm_term=史上超强最常用sql&spm=1018.2226.3001.4187)

[mysql数据库--行级锁，间隙锁和临键锁详解 - 菜鸟的奋斗之路 - 博客园 (cnblogs.com)](https://www.cnblogs.com/blogtech/p/18006730)

## 开发启示：

日志是log4j+slf4j：[最通俗易懂的 JAVA slf4j,log4j,log4j2,logback 关系与区别以及完整集成案例_slf4j log4j2-CSDN博客](https://blog.csdn.net/madness1010/article/details/128332275?ops_request_misc=%7B%22request%5Fid%22%3A%22172161994516800178531628%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172161994516800178531628&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-128332275-null-null.142^v100^pc_search_result_base8&utm_term=slf4j和log4j和logback区别&spm=1018.2226.3001.4187)

druid用于控制数据库连接池等配置，可以生成公钥来对数据库密码加密

navicat连MySQL

eazycode是在利用idea与数据库连接后点击具体的表生成的相关的代码，`template`选择`mapper.xml.vm, dao.java.vm, entity.java.vm, service.java.vm, serviceImpl.java.vm`

Controller层是访问的入口，其需要`@RestController`注解，可以将返回结果以正确的形式呈现；然后在每个接口(add,delete等)，使用`@RestMapping`注解，将正确的路由映射。

DTO->BO的BO->实际类的转换的converter是接口+mapstruct的`@Mapper`实现的，要进行convert时记得在converter前加@Mapper ：[Mapstruct @Mapper @Mapping 使用介绍以及总结-CSDN博客](https://blog.csdn.net/weixin_44131922/article/details/126232977?ops_request_misc=%7B%22request%5Fid%22%3A%22172163217516800227461233%22%2C%22scm%22%3A%2220140713.130102334.pc%5Fall.%22%7D&request_id=172163217516800227461233&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-11-126232977-null-null.142^v100^pc_search_result_base8&utm_term=@mapper convert&spm=1018.2226.3001.4187)

- 用于各个对象实体间的相互转换，例如数据库底层实体 转为页面对象，Model 转为 DTO（data transfer object 数据转换实体）, DTO 转为其他中间对象， VO 等等，相关转换代码为编译时自动产生的新文件和代码。
- MapStruct会根据源对象和目标对象的属性名称进行自动映射。如果需要自定义映射逻辑，可以在接口中定义映射方法或使用配置文件。
- 两个对象之间相同属性名的会被自动转换，指定特殊情况时需要通过注解在抽象方法上说明不同属性之间的转换。

`domain`层的接口和实现是具体的业务，会添加`Service`注解 ，会用到infra层的接口和实现，也会添加`Service`注解 

到infra层的对数据库的实际访问是由dao+dao.xml实现的，在dao.xml中有具体的SQL语句

controller->domain serviceImpl->infra serviceImpl

在serviceImpl中，变量会使用`@Resource`注解

微服务之间的调用：[SpringCloud Feign实现微服务间的远程调用（黑马头条Day04）_feign 远程过程调用-CSDN博客](https://blog.csdn.net/weixin_45863010/article/details/136506796?spm=1001.2014.3001.5502)

[EnableFeignClients详解-CSDN博客](https://blog.csdn.net/lw_jack/article/details/140419716?ops_request_misc=&request_id=&biz_id=102&utm_term=@EnableFeignClients&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-0-140419716.142^v100^pc_search_result_base8&spm=1018.2226.3001.4187)

### 刷题模块

对于题目模块（四种题目），共性的可以提出来，不同的就设置handler通过标志位进行判断题目类型（**工厂+策略模式**），进行处理，然后返回结果

查询题目，分页查询：[mysql基础 | 10.分页查询、联合查询_mysql分页语句-CSDN博客](https://blog.csdn.net/qq_47900752/article/details/134583693?ops_request_misc=&request_id=&biz_id=102&utm_term=分页查询&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-0-134583693.142^v100^pc_search_result_base8&spm=1018.2226.3001.4187)

**SQL拦截器自动翻译（mybatis提供的）**，用于打印展示infra层与数据库的交互，便于发现错误

- SqlStatementInterceptor 主要作用是监控MyBatis的SQL执行时间，并根据不同的执行时间记录不同级别的日志

  MybatisPlusAllSqlLog这个类实现了`InnerInterceptor`接口，它是MyBatis-Plus框架提供的一个内部拦截器接口，用于拦截SQL的执行。这个类有两个主要的重写方法：

  - `beforeQuery`: 在查询执行前调用，记录SQL信息。
  - `beforeUpdate`: 在更新执行前调用，记录SQL信息。

[彻底搞懂MyBaits中#{}和${}的区别_mybatis #{}-CSDN博客](https://blog.csdn.net/Bb15070047748/article/details/107188167/?ops_request_misc=&request_id=&biz_id=102&utm_term=&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-1-107188167.nonecase&spm=1018.2226.3001.4187#{}&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-1-107188167.nonecase)

[mybatis中resultMap的理解_result map-CSDN博客](https://blog.csdn.net/u012843873/article/details/80198185?ops_request_misc=%7B%22request%5Fid%22%3A%22172259150816800178584486%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172259150816800178584486&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~baidu_landing_v2~default-1-80198185-null-null.142^v100^pc_search_result_base8&utm_term=mybatic resultmap&spm=1018.2226.3001.4187)

[【Mybatis】xml常用总结（持续更新）_mybatis xml-CSDN博客](https://blog.csdn.net/libusi001/article/details/134155913?ops_request_misc=&request_id=&biz_id=102&utm_term=mybatis查询语句&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-4-134155913.142^v100^pc_search_result_base8&spm=1018.2226.3001.4187)

minio模块：controller->service->adaper（阿里/minio，**适配器模式**，不用工厂＋策略的是因为工厂+策略的传入的参数之类的差不多，所以用适配器）->具体操作。**nacos 作为配置中心**，可以实现动态配置，适用于比如动态数据源切换，动态切换 oss。**这里要配合`RefreshScope`注解去使用**，实现动态刷新（minio->ali）。

参数校验Preconditions:checkNotNull/checkArgument

[一文带你理解@RefreshScope注解实现动态刷新原理-CSDN博客](https://blog.csdn.net/m0_71777195/article/details/126319418?ops_request_misc=%7B%22request%5Fid%22%3A%22172205984816800185890242%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172205984816800185890242&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_click~default-1-126319418-null-null.142^v100^pc_search_result_base8&utm_term=RefreshScope&spm=1018.2226.3001.4187)

nacos: 可通过**@Configuration**注解的`Storage.java`中的`@Bean、@RefreshScope`注解的storageService方法，在`@Value`注解拿到配置文件中的值时，会切换适配器的对应的StorageAdapter，拿到minio/阿里云的oss服务。

阿里云脚手架用于组件/版本的选择兼容，非常方便: [start.aliyun.com]()

分类标签性能优化：[【Java 8 新特性】Java CompletableFuture supplyAsync()详解_completablefuture.supplyasync-CSDN博客](https://blog.csdn.net/qq_45721579/article/details/131384231?ops_request_misc=&request_id=&biz_id=102&utm_term=CompletableFuture.supplyAsync&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-1-131384231.nonecase&spm=1018.2226.3001.4187)

### 登录鉴权模块

扫码微信->微信发送消息到服务器，校验签名确保来自微信（get）->服务器再把消息进行包装， 通过前缀+验证码（一个随机数）作为redis key，fromUserName(openId)作为value存到redis，并把包含验证码的消息发送到微信->用户验证码（微信）,从redis拿到openId（即用户名）->用satoken用openId进行登录，然后利用satoken返回一个token，后续登录就会带上这个token

```java
@Override
public SaTokenInfo doLogin(String validCode) {
    String loginKey = redisUtil.buildKey(LOGIN_PREFIX, validCode);
    String openId = redisUtil.get(loginKey);
    if (StringUtils.isBlank(openId)) {
        return null;
    }
    AuthUserBO authUserBO = new AuthUserBO();
    authUserBO.setUserName(openId);
    this.register(authUserBO); //校验是否存在，存在直接返回，不存在就注册
    StpUtil.login(openId);
    SaTokenInfo tokenInfo = StpUtil.getTokenInfo();
    return tokenInfo;
}
```

[Sa-Token 功能一览](https://sa-token.cc/doc.html#/?id=sa-token-功能一览)

**全局异常拦截**：继承`ErrorWebExceptionHandler`重写`handle`方法返回`Mono`类型（异步的），返回结果`Result`也封装和枚举了。

[深入学习ErrorWebExceptionHandler-CSDN博客](https://blog.csdn.net/aofengdaxia/article/details/129265983?ops_request_misc=%7B%22request%5Fid%22%3A%22172223483416800182161820%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172223483416800182161820&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-129265983-null-null.142^v100^pc_search_result_base8&utm_term=ErrorWebExceptionHandler&spm=1018.2226.3001.4187)

[Flux、Mono、Reactor 实战（史上最全）_reactor mono-CSDN博客](https://blog.csdn.net/crazymakercircle/article/details/124120506?ops_request_misc=%7B%22request%5Fid%22%3A%22172223509816800186538079%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172223509816800186538079&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-124120506-null-null.142^v100^pc_search_result_base8&utm_term=mono&spm=1018.2226.3001.4187)

gateway实现redis数据拉取：RedisTemplate->RedisConfig(重写序列化，@Bean创建RedisTemplate bean)->RedisUtil(封装对redis的操作，具体是用redistemplate来操作的)

[【Redis系列】RedisTemplate的使用与注意事项-CSDN博客](https://blog.csdn.net/m0_69519887/article/details/140610469?ops_request_misc=%7B%22request%5Fid%22%3A%2207845892-42D0-4649-93B6-193BB633E1BA%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=07845892-42D0-4649-93B6-193BB633E1BA&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-140610469-null-null.142^v100^pc_search_result_base8&utm_term=RedisTemplate&spm=1018.2226.3001.4187)

为什么重写redistemplate?

- 这里不重新他的一个序列化会造成一个乱码的问题，重写了RedisTemplate:
  - objectMapper->Jackson2jsonRedisSerializer->redisTemplate，注意@Bean注解返回重写RedisTemplate的方法

[RedisTemplate 概述 与 操作 Redis 5 种数据类型、事务-CSDN博客](https://blog.csdn.net/wangmx1993328/article/details/103253479?ops_request_misc=%7B%22request%5Fid%22%3A%22172225212216800178583631%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172225212216800178583631&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~baidu_landing_v2~default-2-103253479-null-null.142^v100^pc_search_result_base8&utm_term=redis template&spm=1018.2226.3001.4187)

[Spring date-redis中RedisTemplate的Jackson序列化设置_redistemplate序列化时date带有类型信息-CSDN博客](https://blog.csdn.net/qq_42623400/article/details/115791984?ops_request_misc=%7B%22request%5Fid%22%3A%22172225253916800225574987%22%2C%22scm%22%3A%2220140713.130102334.pc%5Fall.%22%7D&request_id=172225253916800225574987&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-1-115791984-null-null.142^v100^pc_search_result_base8&utm_term=redistemplate和jackson&spm=1018.2226.3001.4187)

[Redis 基本命令—— 超详细操作演示！！！_redis 操作-CSDN博客](https://blog.csdn.net/weixin_43412762/article/details/133934585?ops_request_misc=%7B%22request%5Fid%22%3A%22172225344516800227425617%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172225344516800227425617&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-133934585-null-null.142^v100^pc_search_result_base8&utm_term=redis 操作&spm=1018.2226.3001.4187)

### 用户/角色/用户角色关联

用户注册时密码的加密：satoken实现的md5+salt，Hash散列

进行用户角色关联用到redis和数据库时，使用了@Transactional注解：[Spring——事务注解@Transactional【建议收藏】-CSDN博客](https://blog.csdn.net/minghao0508/article/details/124374637?ops_request_misc=%7B%22request%5Fid%22%3A%22172243354616800175766334%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172243354616800175766334&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-124374637-null-null.142^v100^pc_search_result_base8&utm_term=@Transactional&spm=1018.2226.3001.4187)

### 权限开发与角色权限关联模块

`AuthPermissionDao.xml`

- `type`, `show`：这些列名使用了反引号，因为 `type` 和 `show` 是 MySQL 的保留字。在 SQL 中，保留字是具有特定意义的关键字，如果用作列名或表名，需要用反引号括起来，以避免语法错误。

```xml
<!--新增所有列-->
<insert id="insert" keyProperty="id" useGeneratedKeys="true">
    insert into auth_permission(name, parent_id, `type`, menu_url, status, `show`, icon, permission_key, created_by, created_time, update_by, update_time, is_deleted)
    values (#{name}, #{parentId}, #{type}, #{menuUrl}, #{status}, #{show}, #{icon}, #{permissionKey}, #{createdBy}, #{createdTime}, #{updateBy}, #{updateTime}, #{isDeleted})
</insert>
```

### 数据与缓存一致性问题

辩证两个情况

1、直接和缓存做交互，完全信任缓存

2、和缓存做交互，如果缓存没有，则去和数据库查

![1699108963209-2ec4047e-03ee-4f39-99ed-9210e4efc363[1].jpeg](https://s2.loli.net/2024/08/02/vgMZ7Fy3fRPnJj6.jpg)

根据以上的流程没有问题，但是当数据变更的时候，如何把缓存变到最新，使我们下面要讨论的问题。

1. 更新了数据库，再更新缓存

   假设数据库更新成功，缓存更新失败，在缓存失效和过期的时候，读取到的都是老数据缓存。

2. 更新缓存，更新数据库

   缓存更新成功了，数据库更新失败，是不是读取的缓存的都是错误的。

以上两种，全都不推荐。

3. 先删除缓存，再更新数据库

   有一定的使用量。即使数据库更新失败。缓存也可以会刷。

   存在的问题是什么？

   高并发情况下！！

   比如说有两个线程，一个是 A 线程，一个是 B 线程。

   A 线程把数据删了，正在更新数据库，这个时候 B 线程来了，发现缓存没了，又查数据，又放入缓存。缓存里面存的就一直是老数据了。



**延迟双删：**:star:

- **延时是确保 **修改数据库 -> 清空缓存前，其他事务的更改缓存操作已经执行完。[redis缓存为什么要延时双删-CSDN博客](https://blog.csdn.net/qq_35890572/article/details/108538712?ops_request_misc=%7B%22request%5Fid%22%3A%22172258242116800222864858%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172258242116800222864858&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-108538712-null-null.142^v100^pc_search_result_base8&utm_term=缓存双删&spm=1018.2226.3001.4187&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT0lRTclQkMlOTMlRTUlQUQlOTglRTUlOEYlOEMlRTUlODglQTAmdD0mdT0%3D&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT0lRTclQkMlOTMlRTUlQUQlOTglRTUlOEYlOEMlRTUlODglQTAmdD0mdT0%3D&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT0lRTclQkMlOTMlRTUlQUQlOTglRTUlOEYlOEMlRTUlODglQTAmdD0mdT0%3D&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT0lRTclQkMlOTMlRTUlQUQlOTglRTUlOEYlOEMlRTUlODglQTAmdD0mdT0%3D&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT0lRTclQkMlOTMlRTUlQUQlOTglRTUlOEYlOEMlRTUlODglQTAmdD0mdT0%3D&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT0lRTclQkMlOTMlRTUlQUQlOTglRTUlOEYlOEMlRTUlODglQTAmdD0mdT0%3D&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT0lRTclQkMlOTMlRTUlQUQlOTglRTUlOEYlOEMlRTUlODglQTAmdD0mdT0%3D&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT0lRTclQkMlOTMlRTUlQUQlOTglRTUlOEYlOEMlRTUlODglQTAmdD0mdT0%3D&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT0lRTclQkMlOTMlRTUlQUQlOTglRTUlOEYlOEMlRTUlODglQTAmdD0mdT0%3D&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT0lRTclQkMlOTMlRTUlQUQlOTglRTUlOEYlOEMlRTUlODglQTAmdD0mdT0%3D&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT0lRTclQkMlOTMlRTUlQUQlOTglRTUlOEYlOEMlRTUlODglQTAmdD0mdT0%3D&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT0lRTclQkMlOTMlRTUlQUQlOTglRTUlOEYlOEMlRTUlODglQTAmdD0mdT0%3D&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT0lRTclQkMlOTMlRTUlQUQlOTglRTUlOEYlOEMlRTUlODglQTAmdD0mdT0%3D&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT0lRTclQkMlOTMlRTUlQUQlOTglRTUlOEYlOEMlRTUlODglQTAmdD0mdT0%3D&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT0lRTclQkMlOTMlRTUlQUQlOTglRTUlOEYlOEMlRTUlODglQTAmdD0mdT0%3D)

**扩展思路**

1. 消息队列补偿

   删除失败的缓存，作为消息打入 mq，mq 消费者进行监听，再次进行重试刷缓存。

2. canal

   监听数据库的变化，做一个公共服务，专门来对接缓存刷新。优点业务解耦，避免业务太多冗余代码复杂度。



### 登录模块

内网穿透：natapp

全流程：扫码微信->微信发送消息到服务器，校验签名确保来自微信（get）->服务器再把消息进行包装， 通过前缀+验证码（一个随机数）作为redis key，fromUserName(openId)作为value存到redis，并把包含验证码的消息发送到微信->用户验证码（微信）,从redis拿到openId（即用户名）->用satoken用openId进行登录，然后利用satoken返回一个token，后续登录就会带上这个token

### 用户上下文打通

全局拦截器：实现`GlobalFilter`接口[Spring Cloud Gateway--全局过滤器(GlobalFilter)--作用/使用_gateway globalfilter-CSDN博客](https://blog.csdn.net/feiying0canglang/article/details/124476416?ops_request_misc=%7B%22request%5Fid%22%3A%22172344317916800185844782%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172344317916800185844782&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_click~default-1-124476416-null-null.142^v100^pc_search_result_base8&utm_term=GlobalFilter&spm=1018.2226.3001.4187)

`Loginfilter`(实现`Globalfilter接口`，通过filter拿到token，解析出**loginId**，然后传到后面的过滤链中)

->`LoginInterceptor`(实现`HandlerInterceptor`，检验**loginId**是否存在且非空，如果存在，将其保存到自定义的线程局部变量上下文LoginContextHolder中，通过`InheritableThreadLocal`来实现)

[ThreadLocal、InheritableThreadLocal、TransmittableThreadLocal-CSDN博客](https://blog.csdn.net/weixin_37862824/article/details/121177025?ops_request_misc=%7B%22request%5Fid%22%3A%22172344566516800186560849%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172344566516800186560849&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-121177025-null-null.142^v100^pc_search_result_base8&utm_term=ThreadLocal inheritablethreadlocal&spm=1018.2226.3001.4187)

[史上最全ThreadLocal 详解（一）-CSDN博客](https://blog.csdn.net/u010445301/article/details/111322569?ops_request_misc=%7B%22request%5Fid%22%3A%22172344571016800184113290%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172344571016800184113290&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-111322569-null-null.142^v100^pc_search_result_base8&utm_term=ThreadLocal &spm=1018.2226.3001.4187)



[InheritableThreadLocal详解-CSDN博客](https://blog.csdn.net/yexiguafu/article/details/103900568?ops_request_misc=%7B%22request%5Fid%22%3A%22172344903416800207094300%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172344903416800207094300&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-103900568-null-null.142^v100^pc_search_result_base8&utm_term=inheritablethreadlocal&spm=1018.2226.3001.4187)

### 跨微服务调用

[springMVC中拦截器执行时机和执行顺序分析_拦截器在什么时候执行-CSDN博客](https://blog.csdn.net/w55935/article/details/124567299?ops_request_misc=%7B%22request%5Fid%22%3A%22172346209516800225560323%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172346209516800225560323&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-124567299-null-null.142^v100^pc_search_result_base8&utm_term=拦截器和过滤器的顺序&spm=1018.2226.3001.4187)

[SpringBoot常用拦截器（HandlerInterceptor，ClientHttpRequestInterceptor，RequestInterceptor）_springboot handlerinterceptor-CSDN博客](https://blog.csdn.net/weixin_41979002/article/details/124778961?ops_request_misc=%7B%22request%5Fid%22%3A%22172346204716800226593841%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172346204716800226593841&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-124778961-null-null.142^v100^pc_search_result_base8&utm_term=HandlerInterceptor RequestInterceptor&spm=1018.2226.3001.4187)

[拦截器（HandlerInterceptor）-CSDN博客](https://blog.csdn.net/qq_50652600/article/details/127250413?ops_request_misc=%7B%22request%5Fid%22%3A%22172346200216800207096802%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172346200216800207096802&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_click~default-2-127250413-null-null.142^v100^pc_search_result_base8&utm_term=HandlerInterceptor&spm=1018.2226.3001.4187)

### 本地缓存

caffiene && guava

[Caffeine与Guava对比_caffeine guava 对比-CSDN博客](https://blog.csdn.net/zhangyunfeihhhh/article/details/108105928?ops_request_misc=%7B%22request%5Fid%22%3A%22172346273516800182136994%22%2C%22scm%22%3A%2220140713.130102334.pc%5Fall.%22%7D&request_id=172346273516800182136994&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-3-108105928-null-null.142^v100^pc_search_result_base8&utm_term=guava和caffiene&spm=1018.2226.3001.4187)

### 全文检索

**ES:**

全称 elasticsearch。

隶属于 elsastic stack。[官网地址：https://www.elastic.co/cn/](https://www.elastic.co/cn/)

其中包含我们的 elasticsearch（存储、计算、搜索数据），kibana(数据可视化)，beats（数据抓取），logstash（数据抓取）。（ELK）。

es 主要是对数据进行搜索，分析，倒排。他是一个开源的高扩展的分布式全文搜索引擎。近实时的搜索。扩展性高。处理 PB 级别的数据。

为什么不用 mysql 做呢？

es 的特点：

1、搜索的数据对象大量的非结构化的文本

2、倒排索引

3、每个字段都可以被索引和搜索

4、近实时分析，还可以做聚合，支持各种查询

[ELasticsearch基本使用——基础篇_elasticsearch使用-CSDN博客](https://blog.csdn.net/qq_47387991/article/details/129349790?ops_request_misc=%7B%22request%5Fid%22%3A%22172354172816800222897865%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172354172816800222897865&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-2-129349790-null-null.142^v100^pc_search_result_base8&utm_term=elasticsearch&spm=1018.2226.3001.4187)

[ElasticSearch从入门到精通，史上最全（持续更新，未完待续，每天一点点）_elasticsearch从入门到精通,史上最全-CSDN博客](https://blog.csdn.net/JENREY/article/details/81290535?ops_request_misc=%7B%22request%5Fid%22%3A%22172354172816800222897865%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172354172816800222897865&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-81290535-null-null.142^v100^pc_search_result_base8&utm_term=elasticsearch&spm=1018.2226.3001.4187)

es与常规结构化数据数据库概念对照：

index->database

type->table

document->row

Field->column

[通过HTTP的方式操作ES-CSDN博客](https://blog.csdn.net/sss294438204/article/details/122884953?ops_request_misc=%7B%22request%5Fid%22%3A%22172355571716800211536069%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172355571716800211536069&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-2-122884953-null-null.142^v100^pc_search_result_base8&utm_term=es http&spm=1018.2226.3001.4187)



ES集群客户端：hashmap+RestHighLevelClient，key为集群名，value为RestHighLevelClient，配置项->解析成HttpHost的list->通过HttpHost去创建RestHighLevelClient。根据RestHighLevelClient底层的API去使用。

[elasticsearch学习（七）：es客户端RestHighLevelClient-CSDN博客](https://blog.csdn.net/weixin_40482816/article/details/126955661?ops_request_misc=%7B%22request%5Fid%22%3A%22172361783716800222854039%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172361783716800222854039&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_click~default-2-126955661-null-null.142^v100^pc_search_result_base8&utm_term=RestHighLevelClient&spm=1018.2226.3001.4187)

执行Elasticsearch搜索，支持复杂的查询条件、字段选择:[ES构建queryBuilder条件查询_es querybuilder-CSDN博客](https://blog.csdn.net/mingyonghu/article/details/109758236?ops_request_misc=%7B%22request%5Fid%22%3A%22172362055016800182140452%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172362055016800182140452&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-109758236-null-null.142^v100^pc_search_result_base8&utm_term=BoolQueryBuilder&spm=1018.2226.3001.4187)

[Java中使用es条件构造器BoolQueryBuilder-CSDN博客](https://blog.csdn.net/u011507134/article/details/128470306?ops_request_misc=%7B%22request%5Fid%22%3A%22172362055016800182140452%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172362055016800182140452&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_click~default-2-128470306-null-null.142^v100^pc_search_result_base8&utm_term=BoolQueryBuilder&spm=1018.2226.3001.4187) java中： 1. 构造请求的Builder（SearchSourceBuilder和BoolQueryBuilder）2. 给BoolQueryBuilder设置查询条件（MatchQueryBuilder，must/should，minimumShouldMatch） 3. 将BoolQueryBuilder对象设置到SearchSourceBuilder对象中 4. 封装到SearchRequest中：searchRequest.source(searchSourceBuilder);5.  RestHighLevelClient利用SearchRequest进行查询

[Java学习笔记____ElasticSearch进阶(一)_searchhits-CSDN博客](https://blog.csdn.net/qq_44165076/article/details/88189188)

这个可以：[ElasticSearch知识汇总 - 赟麟 - 博客园 (cnblogs.com)](https://www.cnblogs.com/shangyunlin/p/12541416.html)

### Mybatis全文拦截器（createTime字段等）

注意`Field`类

[getsuperclass_Java类类getSuperClass（）方法及示例-CSDN博客](https://blog.csdn.net/cumt30111/article/details/107766525?ops_request_misc=%7B%22request%5Fid%22%3A%22172388481816800186530090%22%2C%22scm%22%3A%2220140713.130102334.pc%5Fall.%22%7D&request_id=172388481816800186530090&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~rank_v31_ecpm-1-107766525-null-null.142^v100^pc_search_result_base8&utm_term=Java 类 getSuperclass&spm=1018.2226.3001.4187)

通过class获取到类，然后获取类的所有Fields：while循环调用getSuperClass去把所有的类的超类以及超类的超类给拿到fields。

根据字段名称，进行对应的设置和sql操作

### 排行榜

#### 常规mysql实现

直接select语句实现就行

#### 通过redis的zset进行排列

[redis——Zset有序集合之reverseRangeWithScore函数使用_reverserangewithscores-CSDN博客](https://blog.csdn.net/fuzhijieabc/article/details/123805608?ops_request_misc=%7B%22request%5Fid%22%3A%22172447209416800188585058%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172447209416800188585058&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-1-123805608-null-null.142^v100^pc_search_result_base8&utm_term=reverseRangeWithScores&spm=1018.2226.3001.4187)

#### xxljob

[XXL-JOB：定时任务框架的实战应用与调度方式详解-CSDN博客](https://blog.csdn.net/qq_53847859/article/details/140483614?ops_request_misc=&request_id=&biz_id=102&utm_term=xxljob&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduweb~default-0-140483614.142^v100^pc_search_result_base8&spm=1018.2226.3001.4187)

[xxl-job学习笔记 | Roger-Lv's space](https://roger-lv.github.io/2024/08/25/2024-08-25-xxl-job学习笔记/)

