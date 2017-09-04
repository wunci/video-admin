var router = require('koa-router')()
var apiModel = require('../lib/sql.js')
var path = require('path')
var koaBody = require('koa-body')
var checkLogin = require('../middlewares/check.js').checkLogin
var fs = require('fs')
router.get('/signin', async(ctx, next) => {
    if (ctx.session.user) {
        await ctx.redirect('/')
    } else {
        await ctx.render('signin')
    }
})

router.post('/signin', koaBody(), async(ctx, next) => {
    // console.log(ctx.request.body)
    var name = ctx.request.body.userName
    var pass = ctx.request.body.password;
    await apiModel.findUser(name)
        .then(res => {
            var res = JSON.parse(JSON.stringify(res))
            if (res[0]['username'] === name) {
                ctx.session.user = name;
                ctx.session.pass = pass;

                ctx.redirect('/')
            }
        }).catch(() => {
            ctx.session.user = name;
            ctx.session.pass = pass;
            apiModel.addUser([name, pass])
        })
    await ctx.redirect('/')

})
router.get('/signout', async(ctx, next) => {
    ctx.session = null;
    await ctx.redirect('/')
})

router.get('/', async(ctx, next) => {
    await checkLogin(ctx)
    await apiModel.findData()
        .then((res) => {
            data = JSON.parse(JSON.stringify(res))
                // console.log(data)
            console.log('ctx.session', ctx.session)
        })
    await ctx.render('list', {
        videos: data,
        session: ctx.session
    })

})

router.get('/upload', async(ctx, next) => {
    await checkLogin(ctx)
    await ctx.render('upload', {
        session: ctx.session
    })
})
router.post('/upload', koaBody({
    multipart: true,
    formidable: {
        uploadDir: './public/images'
    }
}), async(ctx, next) => {
    var i_body = JSON.parse(JSON.stringify(ctx.request.body))
    var fields = i_body['fields']
        // console.log(ctx.request.body)
    var name = fields['video-name']
    var country = fields['video-country']
    var classify = fields['video-classify']
    var time1 = fields['video-time']
    var img = i_body['files']['file']['path']
    var star = fields['video-star']
    var timelong = fields['video-time-long']
    var type = fields['video-type']
    var actors = fields['video-actors']
    var detail = fields['video-detail']
    var data = [name, country, classify, time1, img.match(/\w+/g)[2], star, timelong, type, actors, detail]

    // console.log('1230',i_body['files']['file']['path'])
    // console.log('1231',name)
    await apiModel.insertData(data)
        .then((res) => {
            console.log('添加成功')
            res.body = 'success'
            ctx.redirect('/')
        }).catch(res => {
            console.log('error', res)
        })
        // await ctx.redirect('/')
})
// 编辑页面
router.get('/edit/:id', async(ctx, next) => {
    console.log('params.id', ctx.params.id)
    await apiModel.findDataById(ctx.params.id)
        .then(res => {
            data = JSON.parse(JSON.stringify(res))
                // console.log(data)
        })
    await ctx.render('edit', {
        video: data[0],
        session: ctx.session
    })
})
// 编辑
router.post('/edit/:id', koaBody({
    multipart: true,
    formidable: {
        uploadDir: './public/images'
    }
}), async(ctx, next) => {
    var i_body = JSON.parse(JSON.stringify(ctx.request.body))
    var fields = i_body['fields']
        // console.log('edit',ctx.request.body)
    var name = fields['video-name']
    var country = fields['video-country']
    var classify = fields['video-classify']
    var time1 = fields['video-time']
    var img = i_body['files']['file']['path']
    var star = fields['video-star']
    var timelong = fields['video-time-long']
    var type = fields['video-type']
    var actors = fields['video-actors']
    var detail = fields['video-detail']
    var data = [name, country, classify, time1, img.match(/\w+/g)[2], star, timelong, type, actors, detail, ctx.params.id];
    if (i_body['files']['file']['size'] == 0) {
        dataNoneImg = [name, country, classify, time1, star, timelong, type, actors, detail, ctx.params.id];

        await apiModel.updateDataNoneImg(dataNoneImg)
            .then(() => {
                ctx.redirect('/')
            }).catch(res => {
                console.log('error', res)
            })

    } else {
        await apiModel.updateDataHasImg(data)
            .then(() => {
                ctx.redirect('/')
            })

    }

})
// 删除
router.post('/delete/:id', koaBody(), async(ctx, next) => {
    await apiModel.deleteVideo(ctx.params.id)
        .then(() => {
            ctx.body = 'success'
        }).catch((err) => {
            console.log(err)
        })
        // await ctx.redirect('/')
})
// 获取三个列表的数据
router.get('/vi/list', async(ctx, next) => {
    // ctx.set('Cache-Control', 'no-cache');
    ctx.set('Access-Control-Allow-Origin', '*');
   
    await Promise.all([
            apiModel.findDataByCls('电影'),
            apiModel.findDataByCls('电视剧'),
            apiModel.findDataByCls('综艺'),
            apiModel.findData()
        ]).then(res => {
            // console.log(res[2])
            ctx.body = res
        })
})
 
// 获取单个id的信息
router.get('/vi/:id',async(ctx) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    await apiModel.getDataById(ctx.params.id)
        .then(res => {
            ctx.body = res
        })
})
// 获取文章的评论
router.get('/vi/:id/comment',async(ctx) => {
    ctx.set('Access-Control-Allow-Origin', '*');

    await apiModel.getCommentById(ctx.params.id)
        .then(res => {
            ctx.body = res
        })
})

// 获取用户的评论
router.get('/vi/comment/user',async(ctx) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    var name = ctx.querystring.split('=')[1]
    console.log(name)
    await apiModel.getCommentByUser(decodeURIComponent(name))
        .then(res => {
            ctx.body = res
        })
})
// 评论
router.post('/vi/:id/comment', koaBody(),async(ctx) => {

    ctx.set('Access-Control-Allow-Origin', '*');

    var data = JSON.parse(ctx.request.body)
    var name = data.userName
    var date = data.date;
    var content = data.content;
    var videoName = data.videoName;
    var uid = ctx.params.id;
    console.log(data)
    await apiModel.addComment([name, date, content,videoName, uid])
        .then(res => {
            ctx.body = 'success'
        })
})
// 删除评论
router.post('/vi/delete/comment/:id', koaBody(),async(ctx) => {

    ctx.set('Access-Control-Allow-Origin', '*');

    await apiModel.deleteComment(ctx.params.id)
        .then(res => {
            ctx.body = 'success'
        })
})
// like
router.post('/vi/:id/like', koaBody(),async(ctx) => {

    ctx.set('Access-Control-Allow-Origin', '*');

    var data = JSON.parse(ctx.request.body)
    var name = data.userName
    var like = data.like;
    var videoName = data.videoName;
    var videoImg = data.videoImg;
    var star = data.star;
    var uid = ctx.params.id;
    console.log(data)
    await apiModel.addLike([like, name, videoName, videoImg, star , uid])
        .then(res => {
            ctx.body = 'success'
        })
})
// 获取单个video的like信息
router.get('/vi/:id/like',async(ctx) => {

    ctx.set('Access-Control-Allow-Origin', '*');
    var name = decodeURIComponent(ctx.querystring.split('=')[1])
    var uid = ctx.params.id;
    // console.log(data)
    await apiModel.getLike(name,uid)
        .then(res => {
            ctx.body = res
        }).catch(err=>{
            ctx.body = err
        })
})
// 获取个人like列表
router.get('/vi/like/list',async(ctx) => {

    ctx.set('Access-Control-Allow-Origin', '*');
    var name = decodeURIComponent(ctx.querystring.split('=')[1])

    // console.log(data)
    await Promise.all([
            apiModel.getLikeList(name,1),
            apiModel.getLikeList(name,2)
        ]).then(res => {
            ctx.body = res
        }).catch(err=>{
            ctx.body = err
        })
   
        
})
// 存储手机端的用户信息
router.post('/vi/signin', koaBody(), async(ctx,next)=>{
    ctx.set('Access-Control-Allow-Origin', '*');
    
    data = JSON.parse(ctx.request.body)
    console.log( JSON.parse(ctx.request.body))
  
    var name = data.userName
    var pass = data.password;
    console.log('name',name)
    await apiModel.findMobileUserByName(name)
        .then(res => {
            console.log('res',res)
            var res = JSON.parse(JSON.stringify(res))
            if (res[0]['userName'] === name && res[0]['password'] === pass) {
               ctx.body = 'allTrue,'+res[0]['avator']
            }else{
                ctx.body = 'passwordFalse'
            }
        }).catch(() => {
            ctx.body =  'newUser'  
            apiModel.addMobileUser([name, pass])
        })
})
// 修改用户名
router.post('/vi/edit/user', koaBody(), async(ctx,next)=>{
    ctx.set('Access-Control-Allow-Origin', '*');
    var oldName = decodeURIComponent(ctx.querystring.split('=')[1])
    var data = JSON.parse(ctx.request.body);
    var newName = data.newName;
    var userExist = false;
    await apiModel.findMobileUserByName(newName)
            .then(res=>{
                console.log('res',res) 
                
                
                if (res.length == 0) {
                   ctx.body = 'notRepeatName';
                   userExist = true;
                }else{
                    ctx.body = 'repeatName';   
                }
               
            })
    if (userExist) {
        await apiModel.updateMobileName([newName,oldName])
            .then(res=>{
                ctx.body = 'editSuccess'
            }).catch(err=>{
                ctx.body = 'editError'
            })    
        
    }          
    
    
})
// 增加头像
router.post('/vi/avator',koaBody({
    "formLimit":"5mb",
    "jsonLimit":"5mb",
    "textLimit":"5mb"
}),async(ctx)=>{
    ctx.set('Access-Control-Allow-Origin', '*');
    var data = JSON.parse(ctx.request.body);
    var name = decodeURIComponent(ctx.querystring.split('=')[1])
    var avator = data.avator;
    var base64Data = avator.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    function random(){
     return Number(Math.random().toString().substr(3) + Date.now()).toString(36)
    }
    var getTime = random() 
     await fs.writeFile('./public/images/avator/'+getTime +'.png', dataBuffer,err=>{

     });
     await apiModel.updateMobileAvator([getTime,name]).then(res=>{
        
     })  
     ctx.body = getTime
})

// 验证码
router.get('/vi/yzm/img',async(ctx,next)=>{
    ctx.set('Access-Control-Allow-Origin', '*');

    const fs = require('fs')
    const captcha = require('trek-captcha')

    const { token, buffer } = await captcha()

    console.log(token, buffer)
    fs.createWriteStream('./public/images/yzm.jpg').on('finish',  (data) => {
       
    }).end(buffer)
   console.log(token)
   ctx.body = token
   

})


module.exports = router