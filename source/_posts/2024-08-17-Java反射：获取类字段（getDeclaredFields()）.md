---
title: Java反射：获取类字段（getDeclaredFields()）
date: 2024-08-17
updated:
tags: [Java,反射]
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

# Java反射：获取类字段getFields()方法和getDeclaredFields ()方法

## 1. 概念

反射是Java中一种强大的机制，允许在运行时获取、检查和操作类、方法、字段等信息，而不需要在编译时知道这些信息。

其中字段（Field）在Java中是类中用于存储数据的成员变量。在反射中，可以通过Field类获取和操作类的字段。

- `getFields()`： 该方法用于获取某个类及其父类中所有的公有字段。公有字段是指用public修饰的字段。

  这个方法对于需要获取类的公有属性时很有用，例如在某些框架或通用库中。

- `getDeclaredFields()`： 该方法用于获取某个类中声明的所有字段，包括公有、私有、受保护的字段，但不包括继承的字段。

  这个方法对于需要获取类的所有字段时很有用，尤其是在进行一些高级的操作时。

![image-20240817170953470](C:\Users\11505\AppData\Roaming\Typora\typora-user-images\image-20240817170953470.png)



## 2. getFields()

```java
import java.lang.reflect.Field;

public class GetFieldsTest1 {
    class User {
        public int number;
        public String name;
        private boolean isAdmin;
    }
    class Student extends User {
        public String school;
    }

    public static void main(String[] args) {
        Field[] fields = Student.class.getFields();
        System.out.println(fields.length); // 输出：3


        for (Field field : fields) {
            System.out.println(field.getName()); // 输出：school, number, name, 
        }
    }
}
```

这里获取了自己的字段和父类中的public字段。

## 3. getDeclaredFields()

```java
import java.lang.reflect.Field;

public class GetFieldsTest2 {
    class User {
        public int number;
        public String name;
        private boolean isAdmin;
    }

    public static void main(String[] args) {
        Field[] fields = User.class.getDeclaredFields();
        System.out.println(fields.length); // 输出：4


        for (Field field : fields) {
            System.out.println(field.getName()); // 输出：number, name, isAdmin, this$0
        }
    }
}
```

这里还有个`this$0`。在Java中，`this$0`是一个在匿名内部类或局部内部类中使用的特殊的引用变量。它指向外部类的一个实例，即内部类被创建的那个外部类的实例。

## 4. Field的一些方法

```java
//方法:get(Object obj) 返回指定对象obj上此 Field 表示的字段的值

field.get(obj)

//方法: set(Object obj, Object value)  将指定对象变量上此 Field 对象表示的字段设置为指定的新值

field.set(obj,value)
```

