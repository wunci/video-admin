var router = require('koa-router')()
var apiModel = require('../lib/sql.js')
var path = require('path')
var koaBody = require('koa-body')
var checkLogin = require('../middlewares/check.js').checkLogin
var fs = require('fs')

router.get('/', async(ctx, next) => {
    await checkLogin(ctx)
    await apiModel.findData('videos')
        .then((res) => {
            data = JSON.parse(JSON.stringify(res))
        })
    await ctx.render('list', {
        videos: data,
        session: ctx.session
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
 
    await apiModel.insertData(data)
        .then((res) => {
            console.log('添加成功')
            res.body = 'success'
            ctx.redirect('/')
        }).catch(res => {
            console.log('error', res)
        })
        
})
// 编辑页面
router.get('/edit/:id', async(ctx, next) => {
    console.log('params.id', ctx.params.id)
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
    formidable: {
        uploadDir: './public/images'
    }
}), async(ctx, next) => {
    var i_body = JSON.parse(JSON.stringify(ctx.request.body))
    var fields = i_body['fields']
        
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
})

// 后台管理员列表
router.get('/adminUser',async(ctx,next)=>{
    await apiModel.findData('users').then(res=>{
        data = res
    })
    await ctx.render('adminUser',{
        users:data,
        session:ctx.session
    })
})
// 手机端用户列表
router.get('/mobileUser',async(ctx,next)=>{
    await apiModel.findData('mobileusers').then(res=>{
        data = res
    })
    await ctx.render('mobileUser',{
        users:data,
        session:ctx.session
    })
})
// 手机端评论列表
router.get('/comment',async(ctx,next)=>{
    await apiModel.findData('comments').then(res=>{
        data = res
    })
    await ctx.render('comments',{
        comments:data,
        session:ctx.session
    })
})
// 手机端like列表
router.get('/like',async(ctx,next)=>{
    await apiModel.findData('likes').then(res=>{
        data = res
    })
    await ctx.render('likes',{
        likes:data,
        session:ctx.session
    })
})
module.exports = router