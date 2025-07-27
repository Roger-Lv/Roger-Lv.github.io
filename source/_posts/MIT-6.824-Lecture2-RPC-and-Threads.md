---
title: MIT 6.824 Lecture2-RPC and Threads
date: 2024-07-03
updated:
tags: [分布式系统,6.824,Golang]
categories: [分布式系统]
keywords:
description:
top_img: /img/default_top_img.jpg
comments:
cover: /img/cover/分布式系统封面.png
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

### Lecture2-RPC and Threads

#### 2.1 GO语言

❓ why we use go in this class

1️⃣ go提供类许多便捷的工具，如threads、锁以及线程间同步。此外，还有RPC包也十分重要。

2️⃣ go是type safe 以及memory safe的，其垃圾回收机制（garbage collected）十分有效

3️⃣ threads + GC 是十分具有吸引力的

#### 2.2 threads

##### 2.2.1 为什么要关注多线程

📖 多线程是在本课程中实现并发的一个重要工具，在分布式系统中，并发十分有趣。比较常见的情况是：一个程序需要同时和多台计算机（a bunch of other computers）通信，客户端可能会同时和多台服务器通信，一台服务器可能会同时响应来自不同客户端的多条请求。假如我的程序同时有 7 件不同的事情在进行，我想要一种简单的方式实现它能同时做 7 件不同的事情，多线程就能很好的解决它。

在 Go 的文档中，它把线程称为 goroutine，goroutine 真的很像大家所说的线程。

##### 2.2.2 如何理解多线程

假设有一个程序，用一个小盒子表示地址空间，在这个地址空间里，串行执行的程序（serial program）是没有多个线程的，你只有一个线程。它在这个地址空间中执行代码，它只有一个程序计数器（PC），只有一套寄存器(register），一个栈（stack)，这些东西就能描述当前的执行状态。


在一个多线程程序中，比方说 Go 程序，你可以拥有多个线程，如果这些线程同时执行，那它们就分别有一个属于自己的程序计数器，一套寄存器和一个栈，每个线程都有自己的一套线程控制，他们可以在程序中不同的部分执行每个线程。需要注意的是，每一个独立的线程都有一个栈，这些栈都在程序中的同一个地址空间中，知道地址的话不同的线程之间是可以互相访问他们的栈的。

多线程的一个重要作用就是允许程序中不同的部分都能独立的执行不同的动作。

并发的关键是你有处理多个任务的能力，不一定要同时。

并行的关键是你有同时处理多个任务的能力。

2.2.3 使用多线程的原因

**I/O Concurrency——I/O并发**
IO并发：一个线程正在等待从磁盘上读数据，当它在等待的时候，你又想要另一个线程，可能用来做计算或是从某个磁盘的地方读取数据或是向网络发送一条消息并等待回复，所以 IO 并发是使用多线程的地方之一。

比如说，我们有一个程序，已经启动并且通过 RPC 请求网络上不同的服务器，然后同时在等待多个回复。具体做法是，需要为每个 RPC 调用创建一个线程，每个线程都会通过 RPC 发送 request 消息，然后等待。当响应回复时，这个线程将会继续执行，使用多线程可以让我们同时发起多个网络请求，所有线程都会等待回复，也不是非得在同一时间去发请求，只要它愿意，这些线程总可以做不同的事情。

不同 IO 并发活动（activity）可能会有互相重叠（overlapping）的部分，也允许一个活动正在等待，另一个活动可以继续执行

**Parallelism——并行化**
使用**多线程的**另一个重要原因是**多核并行**（multi-core parallelism），我们想通过线程来达到并行化的目的。并行化就是如果你有个多核机器，如果你有一个计算繁重的工作，它需要消耗许多 CPU 时钟周期（CPU cycles），这是一件不太好的事情。假设你的程序能使用机器上所有的 CPU 核，比方说它是用 Go 写的多线程程序，你启动了多个 goroutine，这些 goroutine 执行一些计算密集型的任务，比如一直在那执行一个循环，计算 pi（圆周率)的值，直到达到机器上 cpu 核的极限，你的线程将会真正的以并行的方式运行。**如果你启动 2 个线程代替 1 个线程，你就能获得 2 倍的性能，就能使用 2 倍数量的 CPU 时钟周期**

在本次课程中，我们不会把过多的精力放在此类并行化上。所以并行化是使用多线程的第二个原因

**Convenience——易用性**
有时候你只是想在后台做一些事情，比如你就想周期性的去执行它，但你又不愿意在主线程插入一些检查。比如有一个 master 服务需要周期性的检查它的 worker 服务是否一直存活，因为这些 worker 之一宕机的话，就需要把工作扔到另一台机器上去执行，就像 MapReduce 那样。你可以每秒、每分钟通过发送一条“你还活着吗？”这样的消息到 worker 服务上，你能启动一个 goroutine，然后执行一个死循环，sleep 1 秒后，然后做需要周期执行的动作，然后又 sleep 1 秒。

❓ **开启goroutine的开销大吗**

📖 这个开销是值得的，而且这种开销非常少，取决于创建的线程的多少。但是，这种方法可以节省非常多的时间

❓ **不使用多线程如何追踪不同活动的状态**

📖 使用另一种风格——**异步编程**（asynchronous programing），也称为**事件驱动编程**（event-driven programming）。

事件驱动编程的一般结构，通常它有一个线程，同时有一个循环，这个循环等待输入或者是其它任何事件，这些事件能触发程序继续进行，事件可能是一个来自客户端的请求，可能是定时器到期。如果你在编写windows 系统程序，你电脑上的许多 windows 系统程序都是通过事件驱动的风格来编写的，它们等待的东西是像键盘击键或者是鼠标移动这样的事件。因此你可能会有一个单一的只有一个控制线程的程序，这个线程有一个循环一直等待输入，无论何时有输入进来，比如收到报文，它能够找出来是哪个客户端发送的这个报文。它有一张表格记录这个客户端到底处于什么样的活动状态。

**使用线程的话通常会变的更加方便**，因为线程能让你更容易把把程序写的连贯有序。在事件驱动循环里，你一次只能执行一个活动，这种编程模式的问题在于它实现起来有点痛苦，另一个潜在的缺陷在于当你用这种方法获取了 IO 并发后你就没法利用 CPU 的并行化机制。

所以当你写一个负载很高的服务，你得**想方设法**把一台大型机器的 32 核都用上，使用一个单一循环的话，它相当的不自然，也很难获得多核的性能。另一方面，冒这样的风险编程通常换来的性能提升相比多线程来说并不会太多。

而且线程相对来说也很廉价，**每个线程都有一个栈**，栈通常是 1kb 或数千字节，如果你有 20 个线程，这些消耗根本不用在意。但是你若有 100 万个线程，那它就会消耗大量的内存。

另外，线程调度，它是指下一步应该选择哪个线程运行，通常有一个调度列表，上面记录了 1000 个线程，这时候切换线程执行将付出相当昂贵的代价。

所以，当你只有一个服务器的时候，你的服务器需要为 100 万个客户端提供服务，你需要为这 100 万个客户端记录一些状态，这个代价还是挺高的。如果使用事件驱动编程，花点时间的话，应该容易写一个简单的而又五脏俱全高性能的服务，就是你需要多做点工作。

[(288条消息) 解读I/O多路复用及其技术，让你彻底了解I/O多路复用(内含图形讲解)【建议新手收藏】_Linux情报站的博客-CSDN博客](https://blog.csdn.net/m0_50662680/article/details/111273308?ops_request_misc=%7B%22request%5Fid%22%3A%22166315159916782390556461%22%2C%22scm%22%3A%2220140713.130102334.pc%5Fall.%22%7D&request_id=166315159916782390556461&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~first_rank_ecpm_v1~pc_rank_34-1-111273308-null-null.142^v47^pc_rank_34_ctr25,201^v3^add_ask&utm_term=异步 多路复用 图解&spm=1018.2226.3001.4187)

❓ **多线程(threads)和多进程(processes)的区别**

📖 通常，对于类 UNIX 系统的机器来说，一个进程就**是一个单独运行的程序，只有一个地址空间**，**一大片可供进程使用的内存**，在这个进程里你可能同时会有好多个线程。当你准备好一个 go 程序并运行，将会创建一个 unix 进程和一块内存区，**当你的 Go 进程创建 goroutine 时，它们实际上都是在同一个进程里**的。

实际上这也取决于操作系统的实现，确实有个别或一些操作系统，并不关心你的进程内部到底发生了什么事情，也不关心你使用什么语言，不关心操作系统内部的业务逻辑，在进程内部能运行多个线程就行了。

如果在你的机器上运行了不止一个进程，比如一个编辑器或是编译器，操作系统需要让它们彼此分开，**你的编辑器和你的编译器都有自己的内存空间，他们之间无法看到彼此的内存，不同的进程之间不会有交集**。你的编辑器可能有多个线程，你的编译器也可能有多个线程，但是他们都处于各自的世界**。但是**在同一个进程中，线程与线程之间可以共享内存，可以使用 channel(Go语言中的概念) 进行同步，也可以使用 mutex 等。但进程之间是没有交集的，这类软件的传统结构就是这样。

❓ **当上下文切换时，是所有线程都在切换吗**(when a context switch happens does it happened for all threads)

你只有一个单核机器，这意味着在同一个时刻你只能做一件事情。你打算在你的机器上运行多进程，操作系统把 CPU 时间片反复的分配给这两个程序，当硬件时钟到期时，操作系统就判断是时候把 CPU 从当前正在运行的进程剥夺，然后把 CPU 分配给另一个进程，这件事件是在进程级别上做的。

我们**使用的线程**最终**是由是操作系统线程所提供的**，当**操作系统上下文切换时，就是不同的线程之间产生切换**时，操作系统是知道这一切的，所以操作系统可能会清楚这儿有两个线程在这个进程中，有三个线程在那个进程，当时钟到期时操作系统会基于一些调度算法选择一个不同的线程来运行。在这个进程中的线程和另一进程中的线程可能是不同的，另外，**Go 会聪明复用一个操作系统线程，在上面运行尽可能多的 goroutine 以节省开支**，所以这可能需要两个阶段去调度。

首先操作系统选择一个线程去运行，然后在这个进程中，Go 会再去选择哪个 goroutine 去运行。

##### 2.2.4 **sharing memory——共享内存**

事实上写多线程程序是有些挑战的，其中一个是**共享数据**，关于线程模型，酷的地方在于这些**线程共享地址空间**，**共享内存**，如果某个线程在内存中创建了一个对象，在其它线程中你也能使用它。你可以创建个数组或是别的什么东西，所有不同的线程都能读写。这就存在一些临界情况，如果你持有一些你关注的状态，可能你会缓存一些数据：你的 server，你的缓存，你的内存。当其中一个线程正处理一个客户端的请求的时候，首先它会先查一下缓存中的数据，但是这个共享缓存，每个线程都能读。当线程里有新的信息时，线程可能会向缓存里写入数据进行更新。

但是事实也表明如果你不关心多线程之间共享内存的话，很容易出现bug。

问题举例
假设你有一个全局变量 N 在不同的线程之间共享，其中一个线程只是对 N 做自增，这可能就是造成 bug 的原因。

```
n=n+1	
```


在同一时刻，总有其它的线程可能也正在查看，所以这里有个很明显的问题。**线程 1 正在执行**，但是另一个**不同的线程 2** 也在执行相同的代码， N 是一个全局变量，所以这里我们说的这个 N 都是同一个 N。

实际上机器运行的并不是这样的代码，而是由编译器吐出来的机器码（machine code）。

```
LD  X , register1
ADD 1 , register1
STORE register1 , X
```

你可以假设所有的线程都在执行这行代码，他们都会执行加载 x 到寄存器，x 从 0 开始有效，这意味着，所有线程都把 0 读入寄存器，然后他们都给寄存器加 1，这样所有线程各有自的寄存器的值是 1，最后再把寄存器的值 1 重新保存到内存里，现在，这两个线程对 N 做自增后，结果都是 1，但是碰巧这样写并不正确，碰巧程序想要的结果不是 1。

❓ **指令的原子性**

这些独立的指令是不是原子的（atomic），答案是有些是，有些不是，对于 **32 位的 store 指令它极有可能是原子的**，从某种意义上来说，如果有两个处理器，最终要么是其中一个处理器上的 32 位值，要么是另一个处理器上的 32 位值，而不是一个混合的值。其它尺寸大小的未必就这么简单，比如一个字节的存储这依赖于你所使用的 CPU。这依赖于处理器和更复杂的指令。

比如微处理器上的自增指令，它能直接给内存上某个地址的值加 1，未必就是原子的，尽管这些指令存在原子版本的。

所以这是一个非常经典的错误，通常我们叫他**“竞争”（race）**，后面我打算会多次提起。称为 race 是因为如果一个 CPU 已经开始执行这段代码，另一些线程正在结束这段代码，这就是 race，第一个处理器能够在第二个处理器开始执行 load 前执行 store，如果第一个处理器的 store(寄存器中的数据存入内存)确实是在第二个处理器 load （内存放入寄存器）之前，那么第二个处理器就能看到第一个处理器存储的值，第二个处理器将 load 值 1，然后再加 1，再把 2 存入。

解决这个问题的方式很简单，加个锁就行了，只有在持有锁的时候，这个共享数据才能被使用，Go 调用 Lock 来锁住 mutex，你能看到 mu.Lock()加在这一段使用共享数据的代码前面，然后在结束的地方调用 mu.Unlock()。无论哪个线程执行到这里，只有足够幸运的那个线程才能第一个抢到锁，然后执行所有这些代码，在结束之前，另一个线程都不能继续，你可以考虑把这些在锁中间的代码封装起来。

❓ **Go是如何知道我们正在锁住哪些变量**

答案是 go 并不知道，在这个锁里的任何位置他们一点关联都没有。所以，这里新的东西是这个变量(mu)，它是个 mutex，在 lock 和任何变量之间他们并没有什么关联。

##### **2.2.5 Coordination——协作**

协作与指导线程运作有关，当我们正在执行涉及到多线程情况下的加锁时，可能并不知道其它线程也在加锁，他们只是想在没有人干涉的情况下拿到数据。但也有一些情况你确实就是故意的想让不同的线程之间互相受到制约，比如你生产某些数据，但是你又和我不是同一个线程，我想在你生产完数据前一直等待，直到你完成后，我再去读取。或者是你启动了一堆线程去抓取 web 页面，然后需要等待所有线程都执行结束。

所以当我们想**特意的互相等待的时候，这种情况通常就称为 coordination (协作)。**Go 中有很多技术可以做到，比如 channel (通道)，channel 是一种用于发数据从这个线程到另一个线程的工具。

也有一些其它工具用于特殊的目的，比如有个东西叫 condition variables (条件变量)，还有WaitGroup。

##### **2.2.6 Deadlock——死锁**

死锁Deadlock：计算机系统中多道程序并发执行时，两个或两个以上的进程由于竞争资源而造成的一种互相等待的现象（僵局），如无外力作用，这些进程将永远不能再向前推进。

四个条件同时出现，死锁将会发生

1️⃣ Mutual exclusion互斥：一次只有一个进程可以使用一个资源

2️⃣ Hold and wait占有并等待：一个进程应该占有至少一个资源，并等待另一个资源，而该资源被另一个进程所占有

3️⃣ No preemption不可抢占：一个资源只有当持有它的进程完成任务后自由的释放

4️⃣ Circular wait循环等待：等待资源的进程之间存在环

##### 2.2.7 Web爬虫

```
package main

import (
	"fmt"
	"sync"
)

//
// Several solutions to the crawler exercise from the Go tutorial
// https://tour.golang.org/concurrency/10
//

//
// Serial crawler
//

func Serial(url string, fetcher Fetcher, fetched map[string]bool) {
	if fetched[url] {
		return
	}
	fetched[url] = true
	urls, err := fetcher.Fetch(url)
	if err != nil {
		return
	}
	for _, u := range urls {
		Serial(u, fetcher, fetched)
	}
	return
}

//
// Concurrent crawler with shared state and Mutex
//

type fetchState struct {
	mu      sync.Mutex
	fetched map[string]bool
}

func ConcurrentMutex(url string, fetcher Fetcher, f *fetchState) {
	f.mu.Lock()
	already := f.fetched[url]
	f.fetched[url] = true
	f.mu.Unlock()

	if already {
		return
	}
	
	urls, err := fetcher.Fetch(url)
	if err != nil {
		return
	}
	var done sync.WaitGroup
	for _, u := range urls {
		done.Add(1)
	    u2 := u
		go func() {
			defer done.Done()
			ConcurrentMutex(u2, fetcher, f)
		}()
		//go func(u string) {
		//	defer done.Done()
		//	ConcurrentMutex(u, fetcher, f)
		//}(u)
	}
	done.Wait()
	return

}

func makeState() *fetchState {
	f := &fetchState{}
	f.fetched = make(map[string]bool)
	return f
}

//
// Concurrent crawler with channels
//

func worker(url string, ch chan []string, fetcher Fetcher) {
	urls, err := fetcher.Fetch(url)
	if err != nil {
		ch <- []string{}
	} else {
		ch <- urls
	}
}

func master(ch chan []string, fetcher Fetcher) {
	n := 1
	fetched := make(map[string]bool)
	for urls := range ch {
		for _, u := range urls {
			if fetched[u] == false {
				fetched[u] = true
				n += 1
				go worker(u, ch, fetcher)
			}
		}
		n -= 1
		if n == 0 {
			break
		}
	}
}

func ConcurrentChannel(url string, fetcher Fetcher) {
	ch := make(chan []string)
	go func() {
		ch <- []string{url}
	}()
	master(ch, fetcher)
}

//
// main
//

func main() {
	fmt.Printf("=== Serial===\n")
	Serial("http://golang.org/", fetcher, make(map[string]bool))

	fmt.Printf("=== ConcurrentMutex ===\n")
	ConcurrentMutex("http://golang.org/", fetcher, makeState())
	
	fmt.Printf("=== ConcurrentChannel ===\n")
	ConcurrentChannel("http://golang.org/", fetcher)

}

//
// Fetcher
//

type Fetcher interface {
	// Fetch returns a slice of URLs found on the page.
	Fetch(url string) (urls []string, err error)
}

// fakeFetcher is Fetcher that returns canned results.
type fakeFetcher map[string]*fakeResult

type fakeResult struct {
	body string
	urls []string
}

func (f fakeFetcher) Fetch(url string) ([]string, error) {
	if res, ok := f[url]; ok {
		fmt.Printf("found:   %s\n", url)
		return res.urls, nil
	}
	fmt.Printf("missing: %s\n", url)
	return nil, fmt.Errorf("not found: %s", url)
}

// fetcher is a populated fakeFetcher.
var fetcher = fakeFetcher{
	"http://golang.org/": &fakeResult{
		"The Go Programming Language",
		[]string{
			"http://golang.org/pkg/",
			"http://golang.org/cmd/",
		},
	},
	"http://golang.org/pkg/": &fakeResult{
		"Packages",
		[]string{
			"http://golang.org/",
			"http://golang.org/cmd/",
			"http://golang.org/pkg/fmt/",
			"http://golang.org/pkg/os/",
		},
	},
	"http://golang.org/pkg/fmt/": &fakeResult{
		"Package fmt",
		[]string{
			"http://golang.org/",
			"http://golang.org/pkg/",
		},
	},
	"http://golang.org/pkg/os/": &fakeResult{
		"Package os",
		[]string{
			"http://golang.org/",
			"http://golang.org/pkg/",
		},
	},
}
```



这是一个使用多线程的例子，有三种不同风格的方案。

爬虫就是你给它一个 URL 让它开始运行。在 web 页面里，包含有许多链接指向了其它的页面，所以 web 爬虫要做的就是把这些链接指向的页面提取出来，抓取这些页面后再检查所有这些页面里的 url，然后继续抓取这些 url 指向的页面，它应该要能够停止——比如直到 web 中所有的页面被抓取完。

另外网页构成的 graph 和 URL 存在环，稍不注意可能就会陷入永无止境的爬取。所以爬虫的工作之一就是需要**记住它抓取过的页面**，或是已经开始抓取的页面，对于任何正在抓取中的页面都不应该有第二次抓取。

它是一个树结构，这个树结构是一个包含了环的实际网页 graph 的子集，我们想避开环，不想抓取同一个页面 2 次，另外，实践证明抓取一个 web 页面需要花点时间，但是因为网络有较长的延迟服务器又很慢，所以你完全不会想一次只抓取一个页面。

你需要使用并行化的方式持续的增加抓取页面的数量，直到达到呑吐极限，也就是每秒你抓取的页面数量不再增加为止，也就是并发数的增加耗尽了网络带宽。所以，我们希望利用并行化的方式抓取。

最后一个挑战有时候也是最难解决的问题，当爬虫运行结束，一旦我们已经抓取了所有的页面，就需要停止爬虫。什么时候结束被证明是最难的一部分。

串行化风格
所以我的第一个爬虫是一个串行化的爬虫，上面这段代码是可以用的，这个串行爬虫在网页 graph 中进行深度优先搜索，它会使用一个 map 类型的变量 fetched ，它只是被当作一个 set 使用来记住它所抓取过的页面。在 18 行你给它一个 URL，如果这个 URL 已经被抓取过它就直接 return，如果没有被抓取过，首先它要把这个 URL 记下，然后开始抓取，fetcher 会真正开始抓取页面，然后提取页面中的 URL，接下来迭代所有的 URL，递归的调用它自己，对于所有的页面，它会把这些页面传递给自己。它只有一个表格，一个 fetched map，当我调用递归的抓取的时候，它又抓取了很多页面。，在抓取实例之外，需要意识到某些页面是已经抓取过的，所以我们十分依赖于在函数里传递的 fetched 对象。map 使用引用而不是拷贝，所以在底层go 把指向map对象的指针传递给每个crawl函数调用，因此这些调用共享同一个对象和内存的指针，而不是（对象）的拷贝。

```
func Serial(url string, fetcher Fetcher, fetched map[string]bool) {
	if fetched[url] {
		return
	}
	fetched[url] = true
	urls, err := fetcher.Fetch(url)
	if err != nil {
		return
	}
	for _, u := range urls {
		Serial(u, fetcher, fetched)
	}
	return
}
```


**并发风格——共享数据与互斥**

```go
//
// Concurrent crawler with shared state and Mutex
//

type fetchState struct {
	mu      sync.Mutex
	fetched map[string]bool
}

func ConcurrentMutex(url string, fetcher Fetcher, f *fetchState) {
	f.mu.Lock()
	already := f.fetched[url]
	f.fetched[url] = true
	f.mu.Unlock()

	if already {
		return
	}
	
	urls, err := fetcher.Fetch(url)
	if err != nil {
		return
	}
	var done sync.WaitGroup
	for _, u := range urls {
		done.Add(1)
		go func(u string) {
			defer done.Done()
			ConcurrentMutex(u, fetcher, f)
		}(u)
	}
	done.Wait()
	return

}

func makeState() *fetchState {
	f := &fetchState{}
	f.fetched = make(map[string]bool)
	return f
}
```


这段代码明显比Serial crawler要复杂的多，它为每个fetch创建一个thread，最大的不同之处在于它做了两件事：一是必要的统计以注意到所有爬取完成的时刻，它也会处理共享表格，这个表格记录了已爬取的URL，所以这段代码仍然有URL表格即 f.fetched，这个表格被所有的crawler线程共享，所有的crawler线程执行在函数 ConcurrentMutex 内 ，所以我们仍然有 ConcurrentMutex 的树结构来探索 web graph 的不同部分。但它们中的每一个是被放在各自的goroutine中启动，而不是作为函数调用，它们都共享一个状态表记录已爬取URL的表格，因为如果有个goroutine爬取了一个URL，我们不希望另一个goroutine意外地爬取同一个URL ，11行和14行之间加上了互斥锁，用于防止race。

当我们检查表中的URL条目之后，在20行URL被以常见的方式爬取urls, err := fetcher.Fetch(url)。之后另一个有趣的事情是线程的启动。在第25行 ，遍历fetch函数返回的URLsfor _, u := range urls。第27行，对每个URL启动一个goroutinego func(u string) 。func语法是一个闭包（closure）或一个匿名函数，func关键字声明了一个函数然后我们调用了这个函数。理解（这段代码）的方式是你把一个函数声明成一段数据 先写下func关键字，然后给出函数参数，之后写出函数体 结束，现在这是一个对象 。为了让它成为一个goroutine，我们要在func前加上go关键字，然后我们必须要调用这个函数，因为在go语法中go关键字后面接函数名以及要传递的参数。第24行的**WaitGroup** 是go语言定义的一个数据结构，用于帮助coordination。WaitGroup内部有一个计数器，调用WaitGroup.Add()来增加计数器，调用WaitGroup.Done()来减小计数器。第32行，Wait方法被调用，等待计数器归零，因此WaitGroup是一种用于等待若干事件结束的方式，它在很多不同场景中都有应用，这里我们应用它来等待最后一个goroutine结束，因为我们对于每个goroutine都对WaitGroup加一。

❓ 如果某个子程序(subroutine)失败导致done没被调用该怎么办

有些方式可以使function失败，goroutine死掉而整个程序不死，这对我们是个麻烦。所以实际上 正确的方式是defer done.Done()，以确保不论goroutine是怎么结束的，done都会被调用。

❓ 为什么两个不同threads对done的调用不构成race

（WaitGroup）内部有互斥锁或类似的机制，每个done的方法会在执行任何指令前先取得锁，于是同时调用WaitGroup的方法并不构成race

非常难搞清楚你是不有一个race，你可能会有一段代码看起来非常合理，但实际上有某些你未知的race 是使用共享变量导致的 ，在实践中唯一能发现race的方法是使用自动化的工具。幸运的是go给我们提供了一个很不错的race探测器，go run -race crawler.go。你应该使用它。如果你把 -race 作为命令行参数，race检测器会告诉我们race发生的准确位置。

如果你不执行任何代码，那么race探测器不会知道任何事，它将不会分析。它并不是做静态分析，race探测器不会看你的源代码，不会基于源代码作出判断，它观察一次具体的程序运行。所以如果这次具体的程序运行没有执行，race探测器不可能知道某些恰好读写共享数据的代码，这是需要小心的地方。需要设置某种测试装置以确保所有的代码都被执行。

**并发风格——channel**

```
//
// Concurrent crawler with channels
//

func worker(url string, ch chan []string, fetcher Fetcher) {
	urls, err := fetcher.Fetch(url)
	if err != nil {
		ch <- []string{}
	} else {
		ch <- urls
	}
}

func master(ch chan []string, fetcher Fetcher) {
	n := 1
	fetched := make(map[string]bool)
	for urls := range ch {
		for _, u := range urls {
			if fetched[u] == false {
				fetched[u] = true
				n += 1
				go worker(u, ch, fetcher)
			}
		}
		n -= 1
		if n == 0 {
			break
		}
	}
}

func ConcurrentChannel(url string, fetcher Fetcher) {
	ch := make(chan []string)
	go func() {
		ch <- []string{url}
	}()
	master(ch, fetcher)
}
```


在这种实现方式中，不需要使用锁。有一个master线程，它有一个表格，但是这个表格是master函数私有的，master函数并不像前一个版本那样创建。这个版本为每个URL创建一个goroutine，但是只由master来创建，只有唯一一个master创建这些线程 ，所以我们没有一个函数的树形结构，我们只有一个master，在16行创建了自己的私有mapfetched := make(map[string]bool)，记录哪些URL已经爬取，然后创建一个channel，只有一个channel 所有的worker线程都将通过这个channel沟通。

这个思路是，启动一个worker线程，每个worker线程在结束时只会通过channel发送恰好一份数据给master，这份数据包含了这个worker从网页上爬取的网页中的URL的列表。master在第17行循环中 从channel中读取数据for urls := range ch。如果URL还未被爬取，它将在第22行启动一个新的worker去爬取那个URL go worker(u, ch, fetcher)。

worker线程不共享任何对象，worker和master之间也不共享任何对象，所以我们不必担心锁和race。