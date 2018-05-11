var router = require('koa-router')()
var apiModel = require('../lib/sql.js')
var path = require('path')
var koaBody = require('koa-body')
var fs = require('fs')
var moment = require('moment')
var md5 = require('md5')
let checkToken = require('../middlewares/check').checkToken

// 存储手机端的用户信息
router.post('/vi/signin', koaBody(), async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');

    var data = ctx.request.body
    data = typeof data == 'string' ? JSON.parse(data) : data
    var name = data.userName
    var pass = data.password;
    let token = md5(name + 'token' + pass)
    //console.log('name',name)
    await apiModel.findMobileUserByName(name)
        .then(res => {
            console.log('用户信息', res)
            if (res[0]['userName'] === name && res[0]['password'] === pass) {
                ctx.body = {
                    code: 200,
                    avator: res[0]['avator'],
                    token: token,
                    message: '登录成功'
                }
            } else {
                ctx.body = {
                    code: 500,
                    message: '用户名或密码错误'
                }
            }
        }).catch(() => {
            ctx.body = {
                code: 201,
                msg: '注册成功',
                token: token
            }
            apiModel.addMobileUser([name, pass, moment().format('YYYY-MM-DD HH:mm')])
        })
})
// 获取三个列表的数据
router.get('/vi/list', async(ctx, next) => {

     ctx.set("Access-Control-Allow-Origin", ctx.request.header.origin)
     ctx.set("Access-Control-Allow-Credentials", true);
     console.log(ctx.cookies.get('token'))
    await Promise.all([
            apiModel.findDataByCls('电影'),
            apiModel.findDataByCls('电视剧'),
            apiModel.findDataByCls('综艺'),
            apiModel.findData('videos')
        ]).then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message:'获取列表成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取订单失败'
            }
        })
})
// 获取单个id的信息
router.get('/vi/:id',async(ctx) => {

    ctx.set('Access-Control-Allow-Origin', '*');

    var id = ctx.params.id
    console.log('id',id)
    await Promise.all([
            apiModel.getDataById(id),
            apiModel.getLikeStar(1,id),
            apiModel.getUidLikeLength(id)
        ])
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message: '获取详情成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取详情失败'
            }
        })
})
// 获取文章的评论
router.get('/vi/:id/comment',async(ctx) => {
    ctx.set('Access-Control-Allow-Origin', '*');

    await apiModel.getCommentById(ctx.params.id)
        .then(res => {
            ctx.body = {
                code:200,
                data:res,
                message:'获取评论成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取评论失败'
            }
        })
})
// 获取用户的评论
router.get('/vi/comment/user',async(ctx) => {

    ctx.set('Access-Control-Allow-Origin', '*');

    var name = ctx.querystring.split('=')[1]
    console.log('name',name)
    await apiModel.getCommentByUser(decodeURIComponent(name))
        .then(res => {
            ctx.body = {
                code: 200,
                data: res,
                message: '获取用户的评论成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '获取用户的评论失败'
            }
        })
})
// 评论
router.post('/vi/:id/comment', koaBody(),async(ctx) => {

    ctx.set("Access-Control-Allow-Origin", ctx.request.header.origin)
    ctx.set("Access-Control-Allow-Credentials", true);

    var data = ctx.request.body
        data = typeof data == 'string' ? JSON.parse(data) : data

    var {userName,content,videoName,avator} = data

    var date = moment().format('YYYY-MM-DD HH:mm:ss');
    var uid = ctx.params.id;

    await checkToken(ctx).then(async res=>{
        console.log(res)
        await apiModel.addComment([userName, date, content, videoName, uid, avator])
            .then(res => {
                console.log(res)
                 ctx.body = {
                     code: 200,
                     message: '评论成功'
                 }
            }).catch(err=>{
                 ctx.body = {
                     code: 500,
                     message: '评论失败'
                 }
            })
        
    }).catch(err=>{
        console.log(err)
        ctx.body = err
        return
    })
})
// 删除评论
router.post('/vi/delete/comment/:id', koaBody(),async(ctx) => {

    ctx.set("Access-Control-Allow-Origin", ctx.request.header.origin)
    ctx.set("Access-Control-Allow-Credentials", true);
    await checkToken(ctx).then(async res => {
        console.log(res)
        await apiModel.deleteComment(ctx.params.id)
            .then(res => {
                console.log(res, '删除成功')
                ctx.body = {
                    code: 200,
                    message: '删除成功'
                }
            }).catch(err=>{
                ctx.body = {
                    code: 500,
                    message: '删除失败'
                }
            })
      
    }).catch(err => {
        console.log(err)
        
        ctx.body = err
    })
   
})
// 点击喜欢
router.post('/vi/:id/like', koaBody(),async(ctx) => {

    ctx.set("Access-Control-Allow-Origin", ctx.request.header.origin)
    ctx.set("Access-Control-Allow-Credentials", true);

    var data = ctx.request.body
        data = typeof data == 'string' ? JSON.parse(data) : data
    
    var name = data.userName
    var like = data.like;
    var videoName = data.videoName;
    var videoImg = data.videoImg;
    var star = data.star;
    var uid = ctx.params.id;
    var newStar
    await checkToken(ctx).then(async res => {
        let newStar
        await apiModel.addLike([like, name, videoName, videoImg, star, uid])
        // 修改评分
        await Promise.all([
            apiModel.getLikeStar(1, uid),
            apiModel.getUidLikeLength(uid)
        ]).then(async res => {
            newStar = (res[0].length / res[1].length * 10).toFixed(1)
            console.log('newStar', newStar)
        })
        await Promise.all([
            apiModel.updateVideoStar([newStar, uid]),
            apiModel.updateLikeStar([newStar, uid])
        ]).then(res=>{
            ctx.body = {
                code: 200,
                message: '评分成功'
            }
        }).catch(err=>{
            ctx.body = {
                code: 500,
                message: '评分失败'
            }
        })
       
    }).catch(err => {
        console.log(err)
        ctx.body = err
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
                ctx.body = {
                    code: 200,
                    data:res,
                    message:'获取单个video成功'
                }
            }).catch(err=>{
                ctx.body = {
                    code: 500,
                    message: '获取单个video失败'
                }
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
            ctx.body = {
                code:200,
                data:res,
                message: '获取个人like列表成功'
            }
        }).catch(err=>{
            ctx.body = err
        })
  
})
// 修改用户名
router.post('/vi/edit/user', koaBody(), async(ctx,next)=>{

    ctx.set("Access-Control-Allow-Origin", ctx.request.header.origin)
    ctx.set("Access-Control-Allow-Credentials", true);

    var oldName = decodeURIComponent(ctx.querystring.split('=')[1])
    var data = ctx.request.body
        data = typeof data == 'string' ? JSON.parse(data) : data
   
    var newName = data.newName;
    var userExist = false;
    await checkToken(ctx).then(async res => {
        console.log(res)
        await apiModel.findMobileUserByName(newName)
            .then(res => {
                if (res.length == 0) {
                    userExist = false;
                } else {
                    userExist = true
                }
            })
        if (!userExist) {
            let password = ''
            await Promise.all([
                    apiModel.findMobileUserByName(oldName),
                    apiModel.updateMobileName([newName, oldName]),
                    apiModel.updateMobileCommentName([newName, oldName]),
                    apiModel.updateMobileLikeName([newName, oldName])
                ])
                .then(res => {
                    console.log(Object.assign(res[0][0]))
                    password = Object.assign(res[0][0]).password
                    console.log('用户名修改成功')
                    let nowToken = md5(newName + 'token' + password)
                    ctx.body = {
                        code: 200,
                        token: nowToken,
                        message: '用户名修改成功'
                    }
                }).catch(err => {
                    ctx.body = {
                        code: 500,
                        message: '用户名修改失败'
                    }
                })
            
        }else{
            ctx.body = {
                code: 500,
                message:'用户名存在'
            }
        }
    }).catch(err => {
        console.log(err)
        ctx.body = err
        return
    })
    
})
// 获取用户头像
router.get('/vi/avator/list',koaBody(),async(ctx)=>{
    ctx.set('Access-Control-Allow-Origin', '*');
    var name = decodeURIComponent(ctx.querystring.split('=')[1]);
    await apiModel.findMobileUserByName(name)
        .then(res=>{
            console.log('avator',res)
            console.log(res)
            if (res.length >= 1 ) {
                console.log(Object.assign({},res[0]))
                ctx.body = {
                    code: 200,
                    avator: Object.assign({}, res[0]).avator,
                    message:'获取头像成功'
                }
            }else{
                // 没有上传头像
                ctx.body = {
                    code: 200,
                    avator: '',
                    message: '还没有上传头像'
                }
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
    ctx.set("Access-Control-Allow-Origin", ctx.request.header.origin)
    ctx.set("Access-Control-Allow-Credentials", true);
    var data;
    var requestBody = ctx.request.body;
    if(typeof requestBody === 'string'){
        data = JSON.parse(requestBody)
    }
    else if(typeof requestBody === 'object'){
        data = requestBody
    }
    var name = data.userName
    var avator = data.avator;
    var base64Data = avator.replace(/^data:image\/\w+;base64,/, "");
    var dataBuffer = new Buffer(base64Data, 'base64');
    var getName = Number(Math.random().toString().substr(3)).toString(36) + Date.now()
    await checkToken(ctx).then(async res => {
        console.log(res)
        let uploadDone = await new Promise((reslove, reject) => {
            fs.writeFile('./public/images/avator/' + getName + '.png', dataBuffer, err => {
                if (err) {
                    reject(false)
                }
                reslove(true)
            });
        })
        if (uploadDone) {
            console.log(getName, name)
            await Promise.all([
                apiModel.updateMobileAvator([getName, name]),
                apiModel.updateMobileCommentAvator([getName, name])
            ]).then(res => {
                console.log(res, '上传成功')
                ctx.body = {
                    code: 200,
                    avator: getName,
                    message: '上传成功'
                }
            }).catch(err=>{
                ctx.body = {
                    code: 500,
                    message: '上传失败'
                }
            })
        }
    }).catch(err => {
        console.log(err)
        ctx.body = err
        return
    })
    
})

// 验证码
router.get('/vi/yzm/img',async(ctx,next)=>{
    ctx.set('Access-Control-Allow-Origin', '*');
    const captcha = require('trek-captcha')
    const { token, buffer } = await captcha({ size: 4})
    let getYzm = false
    //console.log(token, buffer)
    getYzm = await new Promise((reslove,reject)=>{
        fs.createWriteStream('./public/images/yzm.jpg').on('finish',  (data) => {
            reslove(true)
        }).end(buffer)
    })
    if (getYzm){
        ctx.body = token
    }
    console.log('验证码',token)
})

// 搜索
router.get('/vi/search/result',koaBody(), async(ctx)=>{
    ctx.set('Access-Control-Allow-Origin', '*');
    var val = decodeURIComponent(ctx.querystring.split('=')[1])
    console.log(val)
    await apiModel.search(val).then(res=>{
        console.log('搜索结果',res)
        ctx.body = {
            code:200,
            data:res,
            message:'获取搜索结果成功',
            total:res.length
        }
    })
})

module.exports = router
