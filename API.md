# vue-video api

## Get请求

### 所有video的列表

> 请求URL  get  http://vue.wclimb.site/vi/list

| id  | name   |  country | classify  | time1 |  img | star | timelong | type  | actors | detail |
| :----: | :----: | :----: | :----: | :----: | :----: | :----: | :----: | :----: | :----: | :----: |
| 影片id  | 影片名称  | 国家 | 分类 | 上映时间 | 图片地址 | 评分 | 时长 | 类型 | 演员 | 描述 |

返回

```
[
    [
        {
            "id": 1,
            "name": "敦刻尔克",
            "country": "英国",
            "classify": "电影",
            "time1": "2017-09-01",
            "img": "upload_e0ab97fb011fe6ff7950a0ad2e4545ba",
            "star": "8.0",
            "timelong": "107",
            "type": "战争",
            "actors": "克里斯托弗·诺兰",
            "detail": "故事改编自著名的二战军事事件“敦刻尔克大撤退”。二战初期，40万英法盟军被敌军围困于敦刻尔克的海滩之上，面对敌军步步逼近的绝境，形势万分危急。英国政府和海军发动大批船员，动员人民起来营救军队。"
        },
        {
            "id": 2,
            "name": "战狼2",
            "country": "中国",
            "classify": "电影",
            "time1": "2017-07-27",
            "img": "upload_2337d44336b7bcb67ad9a148029ab3ea",
            "star": "10.0",
            "timelong": "123",
            "type": "动作",
            "actors": " 吴京 / 弗兰克·格里罗 / 吴刚 / 张翰 / 卢靖姗",
            "detail": "故事发生在非洲附近的大海上，主人公冷锋（吴京 饰）遭遇人生滑铁卢，被“开除军籍”，本想漂泊一生的他，正当他打算这么做的时候，一场突如其来的意外打破了他的计划，突然被卷入了一场非洲国家叛乱，本可以安全撤离，却因无法忘记曾经为军人的使命，孤身犯险冲回沦陷区，带领身陷屠杀中的同胞和难民，展开生死逃亡。随着斗争的持续，体内的狼性逐渐复苏，最终孤身闯入战乱区域，为同胞而战斗。"
        },
        ......
    ]
]
```

### 获取单个video的信息

> 请求URL  get  http://vue.wclimb.site/vi/:id

> 示例 http://vue.wclimb.site/vi/2

返回

```
[
    [
        {
            "id": 2,
            "name": "战狼2",
            "country": "中国",
            "classify": "电影",
            "time1": "2017-07-27",
            "img": "upload_2337d44336b7bcb67ad9a148029ab3ea",
            "star": "10.0",
            "timelong": "123",
            "type": "动作",
            "actors": " 吴京 / 弗兰克·格里罗 / 吴刚 / 张翰 / 卢靖姗",
            "detail": "故事发生在非洲附近的大海上，主人公冷锋（吴京 饰）遭遇人生滑铁卢，被“开除军籍”，本想漂泊一生的他，正当他打算这么做的时候，一场突如其来的意外打破了他的计划，突然被卷入了一场非洲国家叛乱，本可以安全撤离，却因无法忘记曾经为军人的使命，孤身犯险冲回沦陷区，带领身陷屠杀中的同胞和难民，展开生死逃亡。随着斗争的持续，体内的狼性逐渐复苏，最终孤身闯入战乱区域，为同胞而战斗。"
        }
    ],
    [],
    []
]
```

### 获取文章的评论

> 请求URL  get  http://vue.wclimb.site/vi/:id/comment

| id | userName | date | content | videoName | uid | avator |
| :----: | :----: | :----: | :----: | :----: | :----: | :----: | 
| 评论id | 用户名 | 评论日期 | 评论内容 | 评论影片 | 影片id | 用户头像 |

> 示例 http://vue.wclimb.site/vi/2/comment

返回

```
[
    {
        "id": 1,
        "userName": "wclimb",
        "date": "2017/9/5 下午9:36:06",
        "content": "冷锋",
        "videoName": "战狼2",
        "uid": "2",
        "avator": "tjh0bzmo58w0000000"
    }
]
```

### 获取用户的评论

> 请求URL  get  http://vue.wclimb.site/vi/comment/user?name=xxx

> 示例 http://vue.wclimb.site/vi/comment/user?name=wclimb

```
[
    {
        "id": 1,
        "userName": "wclimb",
        "date": "2017/9/5 下午9:36:06",
        "content": "冷锋",
        "videoName": "战狼2",
        "uid": "2",
        "avator": "tjh0bzmo58w0000000"
    },
    {
        "id": 2,
        "userName": "wclimb",
        "date": "2017/9/5 下午9:40:23",
        "content": "夜王必胜",
        "videoName": "权力的游戏",
        "uid": "4",
        "avator": "tjh0bzmo58w0000000"
    }
]
```

### 获取用户单个video的like信息(检测用户选择与否以及选择的是哪个选项)

> 请求URL  get  http://vue.wclimb.site/vi/:id/like?name=xxx

| id  | iLike   |  userName | videoName  | videoImg |  star | uid |
| :----: | :----: | :----: | :----: | :----: | :----: | :----: | 
| 评论id  | 1喜欢 2不喜欢 | 用户名 | 评论名称 | 影片图片 | 评分 | 影片id |

> 示例 http://vue.wclimb.site/vi/3/like?name=wclimb

返回

```
[
    {
        "id": 1,
        "iLike": "1",
        "userName": "wclimb",
        "videoName": "越狱",
        "videoImg": "upload_dc452bfe4ce756ead824875359adcea2",
        "star": "10.0",
        "uid": "3"
    }
]
```
### 获取用户全部的like信息

> 请求URL  get  http://vue.wclimb.site/vi/like/list?name=xxx

> 示例 http://vue.wclimb.site/vi/like/list?name=wclimb

返回
```
[
    [
        {
            "id": 1,
            "iLike": "1",
            "userName": "wclimb",
            "videoName": "越狱",
            "videoImg": "upload_dc452bfe4ce756ead824875359adcea2",
            "star": "10.0",
            "uid": "3"
        }
    ],
    [
        {
            "id": 2,
            "iLike": "2",
            "userName": "wclimb",
            "videoName": "火星情报局 ",
            "videoImg": "upload_1bd0ef8a387e252042153aba58f8593e",
            "star": "0.0",
            "uid": "5"
        }
    ]
]
```
### 搜索

> 请求URL  get  http://vue.wclimb.site/vi/search/result?val=xxx

> 示例 http://vue.wclimb.site/vi/search/result?val=游戏

返回
```
[
    {
        "id": 4,
        "name": "权力的游戏",
        "country": "美国",
        "classify": "电视剧",
        "time1": "2011-04-17",
        "img": "upload_a12cfa8e69013dfe2744736536048f88",
        "star": "10.0",
        "timelong": "八",
        "type": "科幻",
        "actors": " 伊萨克·亨普斯特德-怀特 / 查尔斯·丹斯 / 约翰·C·布莱德利 ",
        "detail": "故事背景中虚构的世界，分为两片大陆：位于西面的“日落国度”维斯特洛；位于东面的类似亚欧大陆。维斯特洛大陆边境处发现远古传说中早已灭绝的生物开始，危险也渐渐在靠近这里。这片大陆的临冬城主暨北境统领艾德史塔克家族也迎来了老友兼国王劳勃·拜拉席恩的来访。国王希望艾德·史塔克（肖恩·宾 Sean Bean 饰）能担任首相一职，对抗企图夺取铁王座的叛军。危情一触即发，整个王国看似平和的表面下却是波涛暗涌。权高位重的拜拉席恩家族、勇敢善良的史塔克家族、企图谋取王位的坦格利安家族、有着不可告人秘密的兰尼斯特家族。这些家族各怀鬼胎，这个国家将会陷入一场混战....."
    }
]
```

## Post请求

### 注册登录

> 请求URL  post  http://vue.wclimb.site/vi/signin

 | userName  | password |
 | :----: | :----: |
 | 评论id  | 评论id  |

### 删除评论

> 请求URL  post  http://vue.wclimb.site/vi/delete/comment/'+id

 | id  | 
 | :----: | 
 | 评论id  | 

### 上传头像

> 请求URL  post  http://vue.wclimb.site/vi/avator?name='+name

 | name  | avator  | 
 | :----: | :----: | 
 | 用户名  | 图片  | 

### 提交用户选择like数据

> 请求URL  post  http://vue.wclimb.site/vi/'+ id +'/like

 | iLike  | userName  | videoName | videoImg | star |
 | :----: | :----: | :----: | :----: | :----: | 
 | 1或者2代表是否喜欢  | 用户名  |  影片名  |  影片名图片  |  评分  | 

### 发表评论

> 请求URL  post  http://vue.wclimb.site/vi/'+ id +'/comment

 | userName  | date | content | videoName | avator |
 | :----: | :----: | :----: | :----: | :----: | 
 | 用户名  | 评论时间  |  评论内容  |  影片名  |  用户头像  | 


 。。。。。。