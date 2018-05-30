var router = require('koa-router')()
var apiModel = require('../lib/sql.js')
var path = require('path')
var koaBody = require('koa-body')
var checkLogin = require('../middlewares/check.js').checkLogin
var fs = require('fs')

router.get('/', async(ctx, next) => {
    var page
    let dataLength = ''
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await checkLogin(ctx)
    await apiModel.findData('videos').then(res => {
        dataLength = res.length
    })
    await apiModel.findPageData('videos', page, 7).then(res => {
        data = JSON.parse(JSON.stringify(res))
    })
    await ctx.render('list', {
        videos: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 7),
        nowPage:  parseInt(page)
    })
})
// 获取登录页面
router.get('/signin', async(ctx, next) => {
    if (ctx.session.user) {
        await ctx.redirect('/')
    } else {
        await ctx.render('signin')
    }
})
// 登录 post
router.post('/signin', koaBody(), async(ctx, next) => {
    var {userName,password} = ctx.request.body
    await apiModel.findUser(userName)
        .then(res => {
            // console.log(res,res[0].username)
            if (res[0]['username'] === userName) {
                ctx.session.user = userName;
                ctx.session.pass = password;
                ctx.redirect('/')
            }
        }).catch(() => {
            ctx.session.user = userName;
            ctx.session.pass = password;
            apiModel.addUser([userName, password])
        })
    await ctx.redirect('/')

})
// 登出
router.get('/signout', async(ctx, next) => {
    ctx.session = null;
    await ctx.redirect('/')
})

// 上传video数据
router.get('/upload', async(ctx, next) => {
    await checkLogin(ctx)
    await ctx.render('upload', {
        session: ctx.session
    })
})
// 上传video数据 post
router.post('/upload', koaBody({
    multipart: true,
    "formLimit":"5mb",
    "jsonLimit":"5mb",
    "textLimit":"5mb",
    formidable: {
        uploadDir: './public/images'
    }
}), async(ctx, next) => {

    var i_body = Object.assign({},ctx.request.body)
    console.log('i_body', i_body)
    let {videoName,videoCountry,videoClassify,videoTime,
        videoStar, videoTimeLong, videoType,
        videoActors,videoDetail} = i_body['fields']
    var img = i_body['files']['file']['path']
    var data = [videoName, videoCountry, videoClassify, videoTime,
                 img.match(/\w+/g)[2], videoStar, videoTimeLong, 
                 videoType, videoActors, videoDetail]
    console.log(data)
    await apiModel.insertData(data)
        .then((res) => {
            console.log('添加成功')
            ctx.body = {
                code:200,
                message:'上传成功'
            }
        }).catch(res => {
            ctx.body = {
                code: 500,
                message: '上传失败'
            }
        })
        
})
// 编辑页面
router.get('/edit/:id', async(ctx, next) => {
    // console.log('params.id', ctx.params.id)
    await apiModel.findDataById(ctx.params.id)
        .then(res => {
            data = JSON.parse(JSON.stringify(res))
        })
    await ctx.render('edit', {
        video: data[0],
        session: ctx.session
    })
})
// 编辑 post
router.post('/edit/:id', koaBody({
    multipart: true,
    "formLimit":"5mb",
    "jsonLimit":"5mb",
    "textLimit":"5mb",
    formidable: {
        uploadDir: './public/images'
    }
}), async(ctx, next) => {
    var i_body = Object.assign({}, ctx.request.body)
    console.log('i_body', i_body)
    let {
        videoName,
        videoCountry,
        videoClassify,
        videoTime,
        videoStar,
        videoTimeLong,
        videoType,
        videoActors,
        videoDetail,
        file
    } = i_body['fields'];
    let img = ''
    if (Object.keys(i_body['files']).length == 0){
        img = file
    }else{
        img = i_body['files']['newFile']['path'].match(/\w+/g)[2]
    }
    var data = [videoName, videoCountry, videoClassify, videoTime,
        img, videoStar, videoTimeLong,
        videoType, videoActors, videoDetail,  ctx.params.id
    ]
    console.log(data)
    // 更改影片信息，喜欢和评论的列表也要相应更新，比如videName
    await apiModel.updateLikeName([videoName, ctx.params.id])
    await apiModel.updateCommentName([videoName, ctx.params.id])
    await Promise.all([
            apiModel.updateDataHasImg(data),
            apiModel.updateLikesImg([img,ctx.params.id])
        ])
        .then(() => {
            console.log('更新成功')
            ctx.body = {
                code:200,
                message:'修改成功'
            }
        }).catch(e=>{
            ctx.body = {
                code: 500,
                message: '修改失败'
            }
        })
         
})
// 删除
router.post('/delete/:id', koaBody(), async(ctx, next) => {
    await apiModel.deleteVideo(ctx.params.id)
        .then(() => {
            ctx.body = 'success'
        }).catch((err) => {
            // console.log(err)
        })    
})

// 后台管理员列表
router.get('/adminUser',async(ctx,next)=>{
    var page,
        dataLength = '';
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await apiModel.findData('users').then(res => {
        dataLength = res.length
    })
    await apiModel.findPageData('users', page, 15).then(res => {
        data = res
    })
    await ctx.render('adminUser', {
        users: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 15),
        nowPage:  parseInt(page)
    })
})
// 手机端用户列表
router.get('/mobileUser',async(ctx,next)=>{
    var page,
        dataLength = '';
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await apiModel.findData('mobileusers').then(res => {
        dataLength = res.length
    })
    await apiModel.findPageData('mobileusers',page,10).then(res=>{
        data = res
    })
    await ctx.render('mobileUser',{
        users:data,
        session:ctx.session,
        dataLength: Math.ceil(dataLength / 10),
        nowPage:  parseInt(page)
    })
})
// 手机端评论列表
router.get('/comment',async(ctx,next)=>{
    var page,
        dataLength = '';
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await apiModel.findData('comments').then(res => {
        dataLength = res.length
    })
    await apiModel.findPageData('comments', page, 15).then(res => {
        data = res
    })
    // console.log(dataLength)
    await ctx.render('comments', {
        comments: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 15),
        nowPage:  parseInt(page)
    })
})
// 手机端like列表
router.get('/like',async(ctx,next)=>{
    var page,
        dataLength = '';
    if (ctx.querystring == '') {
        page = 1
    }else{
        page = ctx.querystring.split('=')[1];
    }
    await apiModel.findData('likes').then(res => {
        dataLength = res.length
    })
    await apiModel.findPageData('likes', page, 15).then(res => {
        data = res
    })
    await ctx.render('likes', {
        likes: data,
        session: ctx.session,
        dataLength: Math.ceil(dataLength / 15),
        nowPage: parseInt(page)
    })
})
module.exports = router