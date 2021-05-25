# 浅谈HTML5 canvas（一）


HTML5添加的最受欢迎的功能就是<canvas>元素，这个元素负责在页面中设定一个区域，然后就可以通过JavaScript动态在这个区域绘制图形。

主流浏览器都支持canvas，如IE9+、FireFox1.5+、Safari2+、Opera9+、Chrome、iOS版Safari及安卓版Webkit，IE8及之前的版本不支持<canvas>元素。

Canvas除了具备基本绘图能力的2D上下文，还有一个名为WebGL的3D上下文。目前支持canvas元素的浏览器都支持2D上下文，但对WebGL的支持还不够好。

 

1、基本用法

要使用<canvas>元素，就要先设置width和height属性，指定可以绘制的区域大小，<canvas>和</canvas>标签中的内容是当浏览器不支持<canvas>元素时显示的信息。

注意1：为了避免绘图时canvas元素还未加载，建议将绘制脚本放置在</body>标签之前。

注意2：canvas元素默认宽 300px，高 150px，设置canvas元素的width和height属性有几种方法：

1) HTML中：<canvas width="500" height="500">浏览器不支持canvas元素</canvas>（推荐使用）

2)JavaScript中：canvas.width = 500; canvas.height = 500; （可以使用）

3) CSS中：canvas{ width:500px; height:500px; }（会拉伸，不建议使用）。

4) HTML中：<canvas style="width:500px;height:500px">浏览器不支持canvas元素</canvas>（会拉伸，不建议使用）。

5) JavaScript中：canvas.style.width = "500px"; canvas.style.height = "500px"; （会拉伸，不建议使用）。

6) jQuery中：$("canvas").width(500);$("canvas").height(500); （会拉伸，不建议使用）。

要在画布canvas上绘图，需要取得绘图上下文。要取得绘图上下文的引用，需要调用getContext()方法并传入上下文的名字，如传入“2d”，就可以取得2D上下文对象。在使用<canvas>元素之前，需要先检测getContext()方法是否存在。

使用toDataURL()方法，可以导出在<canvas>元素上绘制的图像，该方法接受一个参数，即图像的MIME类型格式，而且适合用于创建图像的任何上下文。

取得画布中的一幅PNG格式的图像（默认情况下，浏览器会将图像编码为PNG格式，除非另行指定，Firefox和Opera也支持基于image/jpeg的JPEG编码格式，由于该方法是后来才增加的，所以支持canvas的浏览器也是在较新的版本中才加入了对它的支持，如IE9+、Firefox3.5和Opera10）：

var canvas = document.getElementsByTagName("canvas")[0];
if (canvas.getContext) {
	var imgURI = canvas.toDataURL("image/png");
	var image = document.createElement("img");
	image.src = imgURI;
	document.body.appendChild(image);
}


2、2D上下文

使用2D绘图上下文提供的方法，可以绘制简单的2D图形，如矩形、弧线和路径。

2D上下文的坐标开始于<canvas>元素的左上角，原点坐标是(0, 0)，所有坐标值都基于原点进行计算，默认情况下，width和height表示水平和垂直两个方向上可用的像素数目。

1) 填充和描边

填充：用指定的样式（颜色、渐变或图像）填充图形。

描边：只在图形的边缘画线。

大多数2D上下文都会细分为填充和描边两个操作，而操作的结果取决于两个属性：fillStyle和strokeStyle，这两个属性的值可以是字符串、渐变对象或模式对象，默认值都是“#000000”。如果为它们指定表示颜色的字符串，可以使用CSS中指定颜色的任何形式，包括颜色名、十六进制码、rgb、rgba、hsl或hsla。

 

2) 绘制矩形

矩形是唯一一种可以直接在2D上下文中绘制的形状。与矩形有关的方法包括：fillRect()、strokeRect()和clearRect()，这三个方法都能接收4个参数：矩形的x坐标、矩形的y坐标、矩形宽度和矩形高度，单位都是像素。

fillRect()方法在画布上绘制的矩形会填充指定的颜色，填充的颜色通过fillStyle属性指定。

strokeRect()方法在画布上绘制的矩形会使用指定的颜色描边，描边的颜色通过strokeStyle属性指定。

clearRect()方法用于清除画布上的矩形区域，本质上，该方法可以吧绘制上下文中的某个矩形区域变透明。通过绘制形状然后再清除指定区域，可以生成切掉一块的效果。

var canvas = document.getElementsByTagName("canvas")[0];
if (canvas.getContext) {
	var context = canvas.getContext("2d");
	context.fillStyle = "red";
	context.fillRect(10, 10, 50, 50);
	context.strokeStyle= "blue";
	context.strokeRect(30, 30, 50, 50);
	context.clearRect(40, 40, 10, 10); // 在两个矩形重叠的地方清除一个小矩形
}


3) 绘制路径

通过路径可以创造出复杂的形状和线条。

绘制新路径的步骤如下：

①　调用beginPath()方法，表示要开始绘制新路径。

②　调用下列方法来绘制路径：

a. arc(x, y, radius, startAngle, endAngle, counterClockwise)：以(x, y)为圆心，绘制一条弧线，半径为radius，起始和结束角度分别为startAngle和endAngle，counterClockwise为true表示逆时针计算，为false表示顺时针计算；

b. arcTo(x1, y1, x2, y2, radius)：利用上一点、点(x1, y1)和点(x2, y2)这三个点所形成的夹角，绘制一段与夹角的两边相切并且半径为radius的圆上的弧线。夹角的一边是上一点与点(x1, y1)的连线，另一边是点(x1, y1)与点(x2, y2)的连线，弧线的起点就是上一点所在边与圆的切点，弧线的终点就是点(x2,y2)所在边与圆的切点，并且绘制的弧线是两个切点之间长度最短的那个圆弧。此外，如果上一点不是弧线起点，arcTo()方法还将添加一条当前端点到弧线起点的线段。

c. bezierCurveTo(c1x, c1y, c2x, c2y, x, y)：从上一点开始绘制一条曲线，到(x, y)为止，并且以(c1x, c1y)和(c2x, c2y)为控制点。

d. lineTo(x, y)：从上一点开始绘制一条直线，到(x, y)为止。

e. moveTo(x, y)：将绘图游标移动到(x, y)，不画线。

f. quadraticCurveTo(cx, cy, x, y)：从上一点开始绘制一条二次曲线，到(x, y)为止，并且以(cx, cy)作为控制点。

g. rect(x, y, width, height)：从点(x, y)开始绘制一个矩形，宽度和高度分别为width和height，该方法绘制的是矩形路径，而不是fillRect()和strokeRect()所绘制的独立的形状。

③　创建了路径后，有以下几种选择：

a. 若想绘制一条连接路径起点的线条，可以调用closePath()；

b. 若路径已经完成，可以调用fill()方法填充路径，使用的是fillStyle；

说明：fill()方法用于填充路径，fillRect()方法用于填充矩形，rect()与fill()方法合用相当于fillRect()。也就是说，绘制填充矩形有两种方法，但绘制填充圆形只能通过arc()与fill()方法合用。

c. 若路径已经完成，还可以调用stroke()方法对路径描边，使用的是strokeStyle；

说明：stroke()方法用于路径描边，strokeRect()方法用于填充矩形，rect()与stroke()方法合用相当于strokeRect()。也就是说，绘制描边矩形有两种方法，但绘制描边圆形只能通过arc()与stroke()方法合用。

注意：moveTo()和lineTo只是定义了路径，还需要stroke()方法才会实际绘制出路径。在beginPath()和Stroke()或closePath()之间若有多次设置lineWidth或strokeStyle，则后面设置的值会覆盖前面设置的值，若想要对两条路径设置不同的lineWidth或strokeStyle，需要为第一条路径设置lineWidth或strokeStyle通过Stroke()或closePath()结束第一条路径，再通过beginPath开始第二条路径后设置第二条路径的lineWidth或strokeStyle。

var canvas = document.getElementsByTagName("canvas")[0];  
if (canvas.getContext) {  
	var context = canvas.getContext("2d");  
	// 开始路径
	context.beginPath();
	// 绘制外圆
	context.arc(100, 100, 99, 0, 2 * Math.PI, false);
	// 绘制内圆
	context.moveTo(194, 100);
	context.arc(100, 100, 94, 0, 2 * Math.PI, false);
	// 绘制分针
	context.moveTo(100, 100);
	context.lineTo(100, 15);
	// 绘制时针
	context.moveTo(100, 100);
	context.lineTo(35,100);
	// 描边路径
	context.stroke();
} 
注意：在绘制内圆之前，必须把路径移到内圆上的某一点，以避免绘制出多余的线条。

d. 最后还可以调用clip()，在路径上创建一个剪切区域。

<!DOCTYPE html>
<html>
<head>
    <title></title>
    <style>
    </style>
</head>
<body>
	<br>没有clip():<br>
	<canvas id="canvas1" width="400" height="200" style="border:1px solid grey">浏览器不支持canvas元素</canvas>
	<br>有clip():<br>
	<canvas id="canvas2" width="400" height="200" style="border:1px solid grey">浏览器不支持canvas元素</canvas>
	<script src="js/jquery-1.8.2.min.js"></script>
    <script>
		var canvas1 = document.getElementById("canvas1");
		var context1 = canvas1.getContext("2d");
		context1.rect(50, 50, 200, 100);
		context1.stroke();
		context1.fillStyle = "red";
		context1.fillRect(0, 0, 150, 100);
		var canvas2 = document.getElementById("canvas2");
		var context2 = canvas2.getContext("2d");
		context2.rect(50, 50, 200, 100);
		context2.stroke();
		context2.clip();
		context2.fillStyle="red";
		context2.fillRect(0, 0, 150, 100);
    </script>
</body>
</html> 
在2D绘制上下文中，路径是一种主要的绘图方式，因为路径能为要绘制的图形提供更多控制。isPointInPath()方法接收x和y坐标作为参数，用于在路径被关闭之前确定画布上的某一点是否位于路径上。

if (context.isPointInPath(100, 100))
	alert("Point (100, 100) is in the path");


4) 绘制文本

绘制文本主要有两个方法：fillText()和strokeText()，这两个方法可以接收4个参数，要绘制的文本字符串，x坐标，y坐标和可选的最大像素宽度（该可选参数尚未得到所有浏览器支持，提供该参数后，调用fillText()或strokeText()时若传入的字符串大于最大宽度，则绘制的文本字符的高度正确，，但宽度会收缩以适应最大宽度），fillText()方法使用fillStyle属性绘制文本，strokeText()方法使用strokeStyle属性绘制文本，且这两个方法都以下列3个属性为基础：

①　font：表示文本样式、大小和字体，用CSS指定字体的格式来指定；

②　textAlign：表示文本对齐方式，可能的值有start，end，left，right，center，建议使用start，end，不要使用left和right，前两者适用于从左到右和从右到左显示的语言。start表示x坐标的位置是文本左端的位置（从左到右阅读的语言），end表示x坐标的位置是文本右端的位置（从右到左阅读的语言）；

③　textBaseline：表示文本的基线，可能的值有top，hanging，middle，alphabetic，ideographic和bottom，top表示y坐标的位置是文本顶端的位置，bottom表示y坐标的位置是文本底端的位置，hanging，alphabetic，ideographi表示y坐标分别指向字体的特定基线坐标。

这几个属性都有默认值，因此没有必要每次使用它们都重新设置一次值。

var canvas = document.getElementsByTagName("canvas")[0];  
if (canvas.getContext) {  
	var context = canvas.getContext("2d");  
	// 开始路径
	context.beginPath();
	// 绘制外圆
	context.arc(100, 100, 99, 0, 2 * Math.PI, false);
	// 绘制内圆
	context.moveTo(194, 100);
	context.arc(100, 100, 94, 0, 2 * Math.PI, false);
	// 绘制分针
	context.moveTo(100, 100);
	context.lineTo(100, 15);
	// 绘制时针
	context.moveTo(100, 100);
	context.lineTo(35,100);
	// 描边路径
	context.stroke();
	context.font = "15px solid Arial";
	context.textAlign = "center";
	context.textBaseine= "middle";
	context.fillText("12", 100, 20);
	context.textAlign = "start";
	context.fillText("12", 100, 40);
	context.textAlign = "end";
	context.fillText("12", 100, 60);
}
在需要把文本控制在某一区域中时，2D上下文提供了辅助确定文本大小的方法measureText()，该方法接收一个参数即要绘制的文本，利用font、textAlign、textBaseline的当前值计算指定文本的大小。返回一个TextMetrics对象，该对象目前只包含指示以像素计的指定字体宽度的width属性，但将来还会增加更多属性。

var canvas = document.getElementsByTagName("canvas")[0];  
if (canvas.getContext) {  
	var context = canvas.getContext("2d");  
	var fontSize = 100;
	context.font = fontSize + "px Arial";
	while (context.measureText("Hello world").width > 140) {
		fontSize--;
		context.font = fontSize + "px Arial";
	}
	context.fillText("Hello world", 10, 10);
}
82406