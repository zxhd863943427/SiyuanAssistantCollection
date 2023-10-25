## 注意

本插件尚在早期开发阶段，使用时注意务必注意数据安全

## 功能

这是一个实用功能和AI助手集合插件（SiyuanAssistantCollection），不是Stand Alone Complex的意思。

主要是一些实用小工功能，还有一些AI助手的界面对接。

## 组成

### 向量数据生成、存储和查询

#### 数据结构

由于部分属性其实并不适合放到思源的数据库里面(因为所有的自定义属性都会被渲染到DOM中),所以我们重新创建了一个新的键值对存储.

对于思源中所有有ID的对象,都可以通过这个KV存储来扩展它们的属性内容.

#### 数据同步

数据同步计划使用websocket,当任意一个前端网页发生数据更新时,它会做这几件事:

1.通过websocket广播提醒各个端更新本地数据库实例.

2.将新的数据库拷贝落盘存储

#### 性能优化

为了达到比较好的性能,所有的数据将会按照ID对8取模的值,存储在一个json文件中.

当对应的ID被查询时,将会以K近邻检索查询最近的1000个ID并将它们也载入到内存,检索向量来自embedding,


#### 服务端与客户端

这个简易向量数据库没有服务端，使用的是思源的文件接口。

#### 模型选择

目前实验下使用shibing624/text2vec-base-chinese的效果和性能比较合适.

为了能够更方便在web端使用,做了一个量化版本，中文环境下从我的gitee仓库拉取，英文环境下从huggingface拉取

### 实时分词菜单和分词tips生成

在输入的同时计算可用的参考资料和功能,采用了多重防抖以及AbortController保证内容生成性能,目前的测试是在28万个内容块的时候基本可用.(i5 10400,32g).

之后还会继续优化这里地性能表现,实时菜单和实时参考是AI辅助的基础.

### 计算方法

通过用户自定义的动作生成表生成菜单,生成性能较低的菜单项在用户快速输入时会被阻断.

所以能够使用相对更多一点的菜单项目.

### 动作列表示例

位于installed/actionList文件夹,你可以尝试编写自己的动作表

#### 格式

所有的动作表文件必须有一个默认导出，其内容可以为一个动作列表生成函数或者动作列表。

动作表生成函数可以使用异步方式生成（生成速度过慢的动作表将在快速输入时被自动禁用）。

动作表的每一项结构可以参考实例。

除了动作之外，动作表也可以导出一个dict项，这一项中的文本将会被添加到分词器中。

#### 导出动作为插件（@todo）

将动作的必要依赖打包后导出为插件，其中hintAction将会转化为插件的自定义斜杠菜单项（将失去关键词触发功能和拼音触发功能，需要通过斜杠菜单触发）。

blockAction将会转化为插件的自定义块标菜单项。

#### 笔记内的动作（@todo）

## 日志

日志组件的设置可以在顶栏进行。

设置界面的每一项代表一个日志类别。

没有触发过的日志不会出现在设置页面中。

## 协议

使用的外部依赖请参考他们各自的协议,暂时没有时间列出.
除此之外使用AGPL-3.0-or-later,有关协议内容参考官网和本文件夹下的license文件.


## 感谢

向量嵌入部分使用了transformers.js库

向量嵌入部分使用了shibing624的text2vec-base-chinese模型

分词依赖jieba与pinyin

## 其他

有关椽承设计:我们其实是做装修设计的(额,建筑规划景观园林其实也做),不信可以看我们的小红书和知乎,要是有人要做室内设计可以联系我们啊~~~

另外如果觉得这玩意有用可以请我们喝杯咖啡,下面应有二维码但是他们裂了,等我弄下图床,嗯,这是爱发电的讨饭链接:https://afdian.net/a/leolee9086


如果它对你有用可以请我们喝一杯咖啡

![](https://ccds-1300128285.cos.ap-guangzhou.myqcloud.com/%E5%BE%AE%E4%BF%A1%E6%94%B6%E6%AC%BE%E7%A0%811.jpg)

![](https://ccds-1300128285.cos.ap-guangzhou.myqcloud.com/%E6%94%AF%E4%BB%98%E5%AE%9D%E6%94%B6%E6%AC%BE%E7%A0%811.jpg)