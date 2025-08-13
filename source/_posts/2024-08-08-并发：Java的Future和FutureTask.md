---
title: 并发：Java的Future和FutureTask
date: 2024-08-08
updated:
tags: [Java,后端,Future,FutureTask,并发]
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

# 并发：Java的Future和FutureTask

## Future类的作用

`Future `类是异步思想的典型运用，主要用在一些需要执行耗时任务的场景，避免程序一直原地等待耗时任务执行完成，执行效率太低。具体来说是这样的：当我们执行某一耗时的任务时，可以将这个耗时任务交给一个子线程去异步执行，同时我们可以干点其他事情，不用傻傻等待耗时任务执行完成。等我们的事情干完后，我们再通过 Future 类获取到耗时任务的执行结果。这样一来，程序的执行效率就明显提高了。

这其实就是多线程中经典的 `Future` 模式，你可以将其看作是一种设计模式，核心思想是异步调用，主要用在多线程领域，并非 Java 语言独有。

在 `Java `中，`Future` 类只是一个泛型接口，位于` java.util.concurrent `包下，其中定义了 5 个方法，主要包括下面这 4 个功能：

1. 取消任务；
2. 判断任务是否被取消;
3. 判断任务是否已经执行完成;
4. 获取任务执行结果。

### 源码

```java
// V 代表了Future执行的任务返回值的类型
public interface Future<V> {
    // 取消任务执行
    // 成功取消返回 true，否则返回 false
    boolean cancel(boolean mayInterruptIfRunning);
    // 判断任务是否被取消
    boolean isCancelled();
    // 判断任务是否已经执行完成
    boolean isDone();
    // 获取任务执行结果
    V get() throws InterruptedException, ExecutionException;
    // 指定时间内没有返回计算结果就抛出 TimeOutException 异常
    V get(long timeout, TimeUnit unit)
        throws InterruptedException, ExecutionException, TimeoutExceptio
}
```



## FutureTask的作用

`FutureTask`是`Future`的具体实现。

`FutureTask`实现了`RunnableFuture`接口。`RunnableFuture`接口又同时继承了`Future `和 `Runnable` 接口。所以`FutureTask`既可以作为`Runnable`被线程执行，又可以作为`Future`得到`Callable`的返回值，可以作为任务直接被线程执行。

### 构造函数

```java
public FutureTask(Callable<V> callable) {
    if (callable == null)
        throw new NullPointerException();
    this.callable = callable;
    this.state = NEW;       // ensure visibility of callable
}
    
public FutureTask(Runnable runnable, V result) {
    this.callable = Executors.callable(runnable, result);
    this.state = NEW;       // ensure visibility of callable
}
```

### 例子

```java
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;

public class FutureTaskTest {

    public static void main(String[] args) throws InterruptedException, ExecutionException {

        long starttime = System.currentTimeMillis();

        //input2生成， 需要耗费3秒
        FutureTask<Integer> input2_futuretask = new FutureTask<>(new Callable<Integer>() {

            @Override
            public Integer call() throws Exception {
                Thread.sleep(3000);
                return 5;
            }
        });

        new Thread(input2_futuretask).start();

        //input1生成，需要耗费2秒
        FutureTask<Integer> input1_futuretask = new FutureTask<>(new Callable<Integer>() {

            @Override
            public Integer call() throws Exception {
                Thread.sleep(2000);
                return 3;
            }
        });
        new Thread(input1_futuretask).start();
        Integer integer1 = input1_futuretask.get();
        Integer integer2 = input2_futuretask.get();
        System.out.println(algorithm(integer1, integer2));
        long endtime = System.currentTimeMillis();
        System.out.println("用时：" + String.valueOf(endtime - starttime)+"ms");
    }

    //这是我们要执行的算法
    public static int algorithm(int input, int input2) {
        return input + input2;
    }
}

```

![image-20240808152922034.png](https://s2.loli.net/2024/08/08/LZ8uTfUOjQ7dMlP.png)

这里用时仅仅只有3013ms，"input2生成， 需要耗费3秒"，这一步占了主要时间。由此观之，整个过程是异步的（不然时间将会是>3+2=5s的）。



## CompletableFuture类

`Future` 在实际使用过程中存在一些局限性，比如不支持异步任务的编排组合、获取计算结果的 get() 方法为阻塞调用。

Java 8 才被引入`CompletableFuture` 类可以解决`Future` 的这些缺陷。`CompletableFuture` 除了提供了更为好用和强大的 `Future` 特性之外，还提供了函数式编程、异步任务编排组合（可以将多个异步任务串联起来，组成一个完整的链式调用）等能力。

```java
//programmer-club中的例子 
//对于每个category，调用异步的CompletableFuture.supplyAsync()执行getLabelBOList方法和ThreadPoolExecutor作为Executor去多线程+异步的获取labelBOList
List<CompletableFuture<Map<Long, List<SubjectLabelBO>>>> completableFutureList = categoryBOList.stream().map(category ->
                CompletableFuture.supplyAsync(() -> getLabelBOList(category), labelThreadPool).collect(Collectors.toList());
                                                                                                     
```

`CompletableFuture`是对`Future`的扩展和增强。`CompletableFuture`实现了`Future`接口，并在此基础上进行了丰富的扩展，完美弥补了`Future`的局限性，**同时`CompletableFuture`实现了对任务编排的能力**(重点)。

![image-20240826221248525](C:\Users\11505\AppData\Roaming\Typora\typora-user-images\image-20240826221248525.png)

`CompletionStage`接口定义了任务编排的方法，执行某一阶段，可以向下执行后续阶段。**异步执行的，默认线程池是`ForkJoinPool.commonPool()`，但为了业务之间互不影响，且便于定位问题，强烈推荐使用自定义线程池**。

### 功能

#### 常用方法

**依赖关系**

- thenApply()：把前面任务的执行结果，交给后面的Function。
- thenCompose()：用来连接两个有依赖关系的任务，结果由第二个任务返回。

**and集合关系**

- thenCombine()：合并任务，有返回值。
- thenAccepetBoth()：两个任务执行完成后，将结果交给thenAccepetBoth处理，无返回值。
- runAfterBoth()：两个任务都执行完成后，执行下一步操作(Runnable类型任务)。

**or聚合关系**

- applyToEither()：两个任务哪个执行的快，就使用哪一个结果，有返回值。
- acceptEither()：两个任务哪个执行的快，就消费哪一个结果，无返回值。
- runAfterEither()：任意一个任务执行完成，进行下一步操作(Runnable类型任务)。

**并行执行**

- allOf()：当所有给定的 CompletableFuture 完成时，返回一个新的 CompletableFuture。
- anyOf()：当任何一个给定的CompletablFuture完成时，返回一个新的CompletableFuture。

**结果处理**

- whenComplete：当任务完成时，将使用结果(或 null)和此阶段的异常(或 null如果没有)执行给定操作。
- exceptionally：返回一个新的CompletableFuture，当前面的CompletableFuture完成时，它也完成，当它异常完成时，给定函数的异常触发这个CompletableFuture的完成。

#### 异步操作

提供了四个静态方法来创建一个异步操作：

```java
public static CompletableFuture<Void> runAsync(Runnable runnable)
public static CompletableFuture<Void> runAsync(Runnable runnable, Executor executor)
public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier)
public static <U> CompletableFuture<U> supplyAsync(Supplier<U> supplier, Executor executor)
```

这四个方法的区别：

- `runAsync()` 以`Runnable`函数式接口类型为参数，没有返回结果，`supplyAsync() `以`Supplier`函数式接口类型为参数，返回结果类型为`U`；`Supplier`接口的 `get()`是有返回值的(会阻塞)

- 使用没有指定`Executor`的方法时，内部使用`ForkJoinPool.commonPool() `作为它的线程池执行异步代码。如果指定线程池，则使用指定的线程池运行。

- 默认情况下`CompletableFuture`会使用公共的`ForkJoinPool`线程池，这个线程池默认创建的线程数是 CPU 的核数（也可以通过` JVM option`:

  `-Djava.util.concurrent.ForkJoinPool.common.parallelism `来设置`ForkJoinPool`线程池的线程数）。如果所有`CompletableFuture`共享一个线程池，那么一旦有任务执行一些很慢的 I/O 操作，就会导致线程池中所有线程都阻塞在 I/O 操作上，从而造成线程饥饿，进而影响整个系统的性能。所以，强烈建议你要根据不同的业务类型创建不同的线程池，以避免互相干扰

**异步操作**

```java
Runnable runnable = () -> System.out.println("无返回结果异步任务");
CompletableFuture.runAsync(runnable);

CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    System.out.println("有返回值的异步任务");
    try {
        Thread.sleep(5000);
    } catch (InterruptedException e) {
        e.printStackTrace();
    }
    return "Hello World";
});
String result = future.get();

```

**获取结果（join&get）**

`join()`和`get()`方法都是用来获取`CompletableFuture`异步之后的返回值。`join()`方法抛出的是`uncheck`异常（即未经检查的异常),不会强制开发者抛出。`get()`方法抛出的是经过检查的异常，`ExecutionException, InterruptedException `需要用户手动处理（抛出或者 `try catch`）

**结果处理**

当CompletableFuture的计算结果完成，或者抛出异常的时候，我们可以执行特定的 Action。主要是下面的方法：

```java
public CompletableFuture<T> whenComplete(BiConsumer<? super T,? super Throwable> action)
public CompletableFuture<T> whenCompleteAsync(BiConsumer<? super T,? super Throwable> action)
public CompletableFuture<T> whenCompleteAsync(BiConsumer<? super T,? super Throwable> action, Executor executor)

```

`Action`的类型是`BiConsumer<? super T,? super Throwable>`，它可以处理正常的计算结果，或者异常情况。
方法不以`Async`结尾，意味着`Action`使用相同的线程执行，而`Async`可能会使用其它的线程去执行(如果使用相同的线程池，也可能会被同一个线程选中执行)。
这几个方法都会返回`CompletableFuture`，当`Action`执行完毕后它的结果返回原始的`CompletableFuture`的计算结果或者返回异常。

```java
CompletableFuture<String> future = CompletableFuture.supplyAsync(() -> {
    try {
        TimeUnit.SECONDS.sleep(1);
    } catch (InterruptedException e) {
    }
    if (new Random().nextInt(10) % 2 == 0) {
        int i = 12 / 0;
    }
    System.out.println("执行结束！");
    return "test";
});
// 任务完成或异常方法完成时执行该方法
// 如果出现了异常,任务结果为null
future.whenComplete(new BiConsumer<String, Throwable>() {
    @Override
    public void accept(String t, Throwable action) {
        System.out.println(t+" 执行完成！");
    }
});
// 出现异常时先执行该方法
future.exceptionally(new Function<Throwable, String>() {
    @Override
    public String apply(Throwable t) {
        System.out.println("执行失败：" + t.getMessage());
        return "异常xxxx";
    }
});

future.get();

```

上面的代码当出现异常时，输出结果如下:

```
执行失败：java.lang.ArithmeticException: / by zero
null 执行完成！
```

