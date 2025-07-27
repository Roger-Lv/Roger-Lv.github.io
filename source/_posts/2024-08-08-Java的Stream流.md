---
title: Java的Stream流
date: 2024-08-08
updated:
tags: [Java,后端,Stream]
categories: 后端
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/java.gif
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

# Java的Stream流

[讲透JAVA Stream的collect用法与原理，远比你想象的更强大_stream.collection-CSDN博客](https://blog.csdn.net/veezean/article/details/125857074?ops_request_misc=%7B%22request%5Fid%22%3A%22172258578116800227423214%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172258578116800227423214&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-125857074-null-null.142^v100^pc_search_result_base8&utm_term=Java stream collect&spm=1018.2226.3001.4187)

[Java--Stream流详解_java stream-CSDN博客](https://blog.csdn.net/MinggeQingchun/article/details/123184273?ops_request_misc=%7B%22request%5Fid%22%3A%22172258592916800182196501%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172258592916800182196501&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-123184273-null-null.142^v100^pc_search_result_base8&utm_term=Java stream流&spm=1018.2226.3001.4187)

## stream的创建：

```java
//1.Stream.of(array) （这里面的1,2,3,4其实是Array的类型）
Stream.of(1,2,3,4)    
    
//2.list.Stream()
2. list.stream()
```

## 操作符

### 常用中间操作符

1. filter：用于过滤 ，接受一个返回boolean值的函数，返回一个流

   ```java
   list.stream().filter(number->number>=2).collect(Collectors.toList());
   ```

2. map：用于映射 ，映射流中的每一个元素为另一个流中的元素

   ```java
   //toList
   list.stream().(str->str+"-IT").collect(Collectors.toList());
   
   //toMap  在 toMap 方法中，以每个整数的字节值为键，该整数乘以 2 为值，当遇到重复的键时取最后一个值。（这里实际上可以用任何能区分不同键的方式作为第一个参数，而不一定是 Integer::byteValue）
   list.stream().collect(Collectors.toMap(Integer::byteValue,num->num*2,(num1,num2)->num2));
   ```

3. dinstinct:  用于去重 

   ```java
   numbers.stream().filter(i -> i % 2 == 0).distinct().forEach(System.out::println);
   ```

   [教你看懂System.out::println-CSDN博客](https://blog.csdn.net/qq_36929361/article/details/84926277?ops_request_misc=%7B%22request%5Fid%22%3A%22172258713216800188592335%22%2C%22scm%22%3A%2220140713.130102334..%22%7D&request_id=172258713216800188592335&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-84926277-null-null.142^v100^pc_search_result_base8&utm_term=System.out%3A%3Aprintln&spm=1018.2226.3001.4187&ydreferer=aHR0cHM6Ly9zby5jc2RuLm5ldC9zby9zZWFyY2g%2Fc3BtPTEwMDAuMjExNS4zMDAxLjQ0OTgmcT1TeXN0ZW0ub3V0JTNBJTNBcHJpbnRsbiZ0PSZ1PSZ1cnc9)

4. sorted: 用于排序  

   ```java
   List<String> collect = strings1.stream().sorted().collect(Collectors.toList());
   ```

5. limit: 可以将流限制为指定的元素数

   ```java
   List<Integer> collect = numbers.stream().limit(3).collect(Collectors.toList());
   ```

   

### 常用终端操作符

1. collect: 收集器，将流转换为其他形式 

   ```java
   strings.stream().collect(Collectors.toSet()); 
   
   strings.stream().collect(Collectors.toList());
   
   strings.stream().collect(Collectors.toMap()); 
   ```

2. forEach:遍历流

   ```java
   strings.stream().forEach(s -> out.println(s));
   ```

3. Count(计数)

   ```java
   List<String> names = Arrays.asList("Alex", "Brian", "Charles", "David");
   long count = names.stream().count();
   ```

   