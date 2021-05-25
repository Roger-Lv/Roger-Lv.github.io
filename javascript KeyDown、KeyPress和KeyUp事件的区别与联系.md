# javascript KeyDown、KeyPress和KeyUp事件的区别与联系 

KeyDown、KeyPress和KeyUp事件的区别与联系,以后就可以根据需求来选择使用。 

KeyDown：在控件有焦点的情况下按下键时发生。 

KeyPress：在控件有焦点的情况下按下键时发生。

 KeyUp：在控件有焦点的情况下释放键时发生。 

1、KeyPress主要用来接收字母、数字等ANSI字符 KeyDown 和 KeyUP 事件过程通常可以捕获键盘除了PrScrn所有按键(这里不讨论特殊键盘的特殊键 

2、KeyPress 只能捕获单个字符 KeyDown 和KeyUp 可以捕获组合键。 3、KeyPress 不显示键盘的物理状态（SHIFT键），而只是传递一个字符。KeyPress 将每个字符的大、小写形式作为不同的 键代码解 释，即作为两种不同的字符。 KeyDown 和KeyUp 不能判断键值字母的大小。KeyDown 和 KeyUp 用两种参数解释每个字符的大写形式和小写形式： keycode — 显 示物理的键（将 A 和 a 作为同一个键返回）和 shift —指示 shift + key 键的状态而且返回 A 或 a 其中之一。 

5、KeyPress 不区分小键盘和主键盘的数字字符。 KeyDown 和KeyUp 区分小键盘和主键盘的数字字符。

 6、KeyDown、KeyUp事件是当按下 ( KeyDown ) 或松开 ( KeyUp ) 一个键时发生的。 由于一般按下键盘的键往往会立即放开（这和鼠标不同），所以这两个事件使用哪个差别不大。 而且，up和其他两者还有一个区别：要判断key修改后的状态必须用up