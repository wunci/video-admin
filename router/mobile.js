var router = require('koa-router')()
var apiModel = require('../lib/sql.js')
var path = require('path')
var koaBody = require('koa-body')
var fs = require('fs')
var moment = require('moment')
// 获取三个列表的数据
router.get('/vi/list', async(ctx, next) => {

    ctx.set('Access-Control-Allow-Origin', '*');

    await Promise.all([
            apiModel.findDataByCls('电影'),
            apiModel.findDataByCls('电视剧'),
            apiModel.findDataByCls('综艺'),
            apiModel.findData('videos')
        ]).then(res => {
            ctx.body = res
        })
})
 
// 获取单个id的信息
router.get('/vi/:id',async(ctx) => {

    ctx.set('Access-Control-Allow-Origin', '*');

    var id = ctx.params.id
    await Promise.all([
            apiModel.getDataById(id),
            apiModel.getLikeStar(1,id),
            apiModel.getUidLikeLength(id)
        ])
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
    console.log('name',name)
    await apiModel.getCommentByUser(decodeURIComponent(name))
        .then(res => {
            ctx.body = res
        })
})
// 评论
router.post('/vi/:id/comment', koaBody(),async(ctx) => {

    ctx.set('Access-Control-Allow-Origin', '*');

    var data;
    var requestBody = ctx.request.body;
    if(typeof requestBody === 'string'){
        data = JSON.parse(requestBody)
    }
    else if(typeof requestBody === 'object'){
        data = requestBody
    }
    var name = data.userName
    var date = moment().format('YYYY-MM-DD HH:mm:ss');
    var content = data.content;
    var videoName = data.videoName;
    var avator = data.avator;
    var uid = ctx.params.id;
    await apiModel.addComment([name, date, content,videoName, uid,avator])
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

    var data;
    var requestBody = ctx.request.body;
    if(typeof requestBody === 'string'){
        data = JSON.parse(requestBody)
    }
    else if(typeof requestBody === 'object'){
        data = requestBody
    }
    var name = data.userName
    var like = data.like;
    var videoName = data.videoName;
    var videoImg = data.videoImg;
    var star = data.star;
    var uid = ctx.params.id;
    var newStar
    await apiModel.addLike([like, name, videoName, videoImg, star , uid])
        .then(res => {
            ctx.body = 'success'
        })
    // 修改评分
    await Promise.all([
            apiModel.getLikeStar(1,uid),
            apiModel.getUidLikeLength(uid)
        ]).then(res=>{
            var newStar = (res[0].length / res[1].length * 10).toFixed(1)
            console.log('newStar',newStar)
            // console.log(res)
            apiModel.updateVideoStar([newStar,uid])
            apiModel.updateLikeStar([newStar,uid])
        }).then(res => {
            ctx.body = res
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
    
    var data;
    var requestBody = ctx.request.body;
    if(typeof requestBody === 'string'){
        data = JSON.parse(requestBody)
    }
    else if(typeof requestBody === 'object'){
        data = requestBody
    }
    var name = data.userName
    var pass = data.password;
    // token5天过期
    let new_token = name + '&' + Number(Math.random().toString().substr(3)).toString(36) + '&' 
                    + moment().format('YYYY/MM/DD-HH:mm:ss') + '&' + parseInt(new Date().getTime() + 1000 * 60 * 60 * 24 * 5)
    //console.log('name',name)
    await apiModel.findMobileUserByName(name)
        .then(res => {
            console.log('用户信息',res)
            if (res[0]['userName'] === name && res[0]['password'] === pass) {
               ctx.body = {
                   msg: 'allTrue' ,
                   avator: res[0]['avator'],
                   token: new_token
               }
                apiModel.updateToken([new_token,name])               
            }else{
                ctx.body = {
                    msg: 'passwordFalse'
                }
            }
        }).catch(() => {
            ctx.body =  {
                msg: 'newUser',
                token: new_token
            }  
            apiModel.addMobileUser([name, pass, moment().format('YYYY-MM-DD HH:mm'), new_token])
        })
})
// 检测用户登录信息的有效性
router.post('/vi/checkUser',koaBody(),async(ctx,next)=>{
    ctx.set('Access-Control-Allow-Origin', '*');
    var requestBody = ctx.request.body;
    if (typeof requestBody === 'string') {
        data = JSON.parse(requestBody)
    }
    else if (typeof requestBody === 'object') {
        data = requestBody
    }
    //console.log(data.userName)
    await apiModel.checkUser([data.userName])
            .then(res => {
                var user_token = res[0].token;
                //console.log('token', user_token, data.token, user_token.split('&')[3], new Date().getTime())
                if (user_token === data.token && user_token.split('&')[3] < new Date().getTime()) {
                    ctx.body = 'expired'
                }
                else if (user_token === data.token) {
                    ctx.body = 'success'
                }else{
                    ctx.body = 'error'
                }
            }).catch(err=>{
                ctx.body = 'error'
            })
})
// 修改用户名
router.post('/vi/edit/user', koaBody(), async(ctx,next)=>{
    ctx.set('Access-Control-Allow-Origin', '*');
    var oldName = decodeURIComponent(ctx.querystring.split('=')[1])
    var data;
    var requestBody = ctx.request.body;
    if(typeof requestBody === 'string'){
        data = JSON.parse(requestBody)
    }
    else if(typeof requestBody === 'object'){
        data = requestBody
    }
    var newName = data.newName;
    var userExist = false;
    await apiModel.findMobileUserByName(newName)
            .then(res=>{
                //console.log('res',res) 
                if (res.length == 0) {
                   ctx.body = 'notRepeatName';
                   userExist = true;
                }else{
                    ctx.body = 'repeatName';   
                } 
            })
    if (userExist) {
        await Promise.all([
                apiModel.updateMobileName([newName,oldName]),
                apiModel.updateMobileCommentName([newName,oldName]),
                apiModel.updateMobileLikeName([newName,oldName])
            ]) 
            .then(res=>{
                ctx.body = 'editSuccess'
            }).catch(err=>{
                ctx.body = 'editError'
            })    
    }            
})
// 获取用户头像
router.get('/vi/avator/list',koaBody(),async(ctx)=>{
    ctx.set('Access-Control-Allow-Origin', '*');
    var name = decodeURIComponent(ctx.querystring.split('=')[1]);
    await apiModel.findMobileUserByName(name)
        .then(res=>{
            console.log('avator',res)
            if (res.length >=1) {
                ctx.body = res[0]['avator']
            }else{
                // 没有上传头像
                ctx.body = 'none'
            }
        }).catch(err=>{
            ctx.body = 'none'
        })

})
// 增加头像
router.post('/vi/avator',koaBody({
    "formLimit":"5mb",
    "jsonLimit":"5mb",
    "textLimit":"5mb"
}),async(ctx)=>{
    ctx.set('Access-Control-Allow-Origin', '*');
    var data;
    var requestBody = ctx.request.body;
    if(typeof requestBody === 'string'){
        data = JSON.parse(requestBody)
    }
    else if(typeof requestBody === 'object'){
        data = requestBody
    }
    var name = decodeURIComponent(ctx.querystring.split('=')[1])
    var avator = data.avator;
    var base64Data = avator.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    var getName = Number(Math.random().toString().substr(3)).toString(36) + Date.now()
    await fs.writeFile('./public/images/avator/'+getName +'.png', dataBuffer,err=>{});
    await Promise.all([
            apiModel.updateMobileAvator([getName,name]),
            apiModel.updateMobileCommentAvator([getName,name])
        ]).then(res=>{
            
        })
     
    ctx.body = getName
})

// 验证码
router.get('/vi/yzm/img',async(ctx,next)=>{
    ctx.set('Access-Control-Allow-Origin', '*');
    const captcha = require('trek-captcha')
    const { token, buffer } = await captcha({ size: 4})
    //console.log(token, buffer)
    fs.createWriteStream('./public/images/yzm.jpg').on('finish',  (data) => {}).end(buffer)
    console.log('验证码',token)
    ctx.body = token
})

// 搜索
router.get('/vi/search/result',koaBody(), async(ctx)=>{
    ctx.set('Access-Control-Allow-Origin', '*');
    var val = decodeURIComponent(ctx.querystring.split('=')[1])
    console.log(val)
    await apiModel.search(val).then(res=>{
        console.log('搜索结果',res)
        ctx.body = res
    })
})

module.exports = router
