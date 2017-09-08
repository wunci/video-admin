# 写在前面

由于最近公司业务不是很忙，空闲时间比较多，于是就在纠结Vue.js（之前就学习过）和Node.js先专研哪个比较好，最终选择了先玩玩Node.js。经过一段时间的学习，就有了教程 [Node+Koa2+Mysql 搭建简易博客](http://www.wclimb.site/2017/07/12/Node-Koa2-Mysql-%E6%90%AD%E5%BB%BA%E7%AE%80%E6%98%93%E5%8D%9A%E5%AE%A2/)  [GitHub地址](https://github.com/wclimb/Koa2-blog)，想要了解的可以先看看，个人水平有限，希望可以帮到你。
大概过来一个多月，我决定两路开工。使用Node.js给前端写接口，配备后台管理功能，先把后台搭建好。大概几天过后，后台一些简单的功能实现后，就开始用Vue.js开始搭建前台，也一直在想做点什么比较好，于是就做了个豆瓣评分类似的项目。

> 前端项目地址 https://github.com/wclimb/vue-video  
> 前端预览 http://video.wclimb.site

> 后端项目地址 https://github.com/wclimb/video-admin  
> 后台管理 http://vue.wclimb.site

> API接口地址 https://github.com/wclimb/video-admin/blob/master/API.md

## 技术栈(Vue2.js + Node.js 全栈项目)

`Node.js` + `Koa2` + `Mysql`

## 开发环境

- Nodejs `v8.1.0`
- Koa `v2.3.0`
- Mysql `v5.7.0`

## 运行

> 只有超级管理员才可以删除文章，其他登录之后会自动注册，可以上传信息和修改信息

```
git clone https://github.com/wclimb/video-admin.git

cd video-admin

npm install  建议使用淘宝镜像(https://npm.taobao.org/) =>  cnpm i

npm i supervisor -g(安装过可以忽略)

supervisor --harmony index (运行项目)

```

> 如果觉得对你有帮助还望关注一下，有问题可以及时提哟，觉得不错的话star一下也是可以的哟
> 注意：上传图片提交之后会出现连接重置的情况，你继续刷新之后会正常上传成功。线上是没有问题的哟，暂时还没找到具体原因！！

## 后端管理后台功能

- [x] 注册
- [x] 登录
- [x] 登出
- [x] 上传video信息
- [x] 修改已上传的video信息
- [x] 查看喜欢/不喜欢的所有数据
- [x] 查看评论的所有数据
- [x] 查看评论的所有数据
- [x] 查看后台所有用户
- [x] 查看前端注册的所有用户

## 后端线上地址

技术栈：`node` + `koa2` + `mysql` 
预览：[video-admin](http://vue.wclimb.site)
GitHub: [管理后台](https://github.com/wclimb/video-admin)

## 前端后台演示

![](http://oswpupqu5.bkt.clouddn.com/admin.gif)

## 前端功能

* 1. 注册登录登出 + 验证码 密码检测，如果用户不存在则自动创建
* 2. 检测是否登录，如果没有登录则不允许评论和评价
* 3. 可以上传影片到后台，进行前台展示
* 4. 评分功能，初始化评分可以自由设置，如果没有人like则默认显示原始评分，如果有则计算当前vide的评分
* 5. 修改用户名，检测用户名是否跟其他人重复
* 6. 上传头像，默认没有头像
* 7. 评论功能，评论之后可以在个人中心展示，并且可以删除
* 8. 搜索功能，可以搜索存在的影片，如果没有则显示无结果
* 9. 自己喜欢的video和评论的内容会在个人中心显示

综上：

- [x] 注册
- [x] 登录
- [x] 登出
- [x] 验证码
- [x] 详情页
- [x] 分类
- [x] 分类影视列表
- [x] 修改用户名
- [x] 上传头像
- [x] 评论
- [x] 删除评论
- [x] 搜索
- [x] 个人中心数据


## 前端线上地址

项目是手机端的，请使用谷歌浏览器手机预览模式

预览：[vue-video](http://video.wclimb.site)

手机扫描图下二维码预览

![](http://oswpupqu5.bkt.clouddn.com/1504574571.png)

