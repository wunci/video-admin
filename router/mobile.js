let router = require('koa-router')();
let apiModel = require('../lib/sql.js');
let koaBody = require('koa-body');
let fs = require('fs');
let moment = require('moment');
let checkToken = require('../middlewares/check').checkToken;
let jwt = require('jsonwebtoken');
let config = require('../config/default.js');

// 存储手机端的用户信息
router.post('/vi/signin', koaBody(), async (ctx, next) => {
  var data = ctx.request.body;
  data = typeof data == 'string' ? JSON.parse(data) : data;
  var name = data.userName;
  var pass = data.password;

  let token = jwt.sign(
    {
      userName: name,
    },
    config.jwt_secret,
    {
      expiresIn: '30 days',
    },
  );

  await apiModel
    .findMobileUserByName(name)
    .then(res => {
      if (res[0]['userName'] === name && res[0]['password'] === pass) {
        ctx.body = {
          code: 200,
          avator: res[0]['avator'],
          token: token,
          message: '登录成功',
        };
      } else {
        ctx.body = {
          code: 500,
          message: '用户名或密码错误',
        };
      }
    })
    .catch(() => {
      ctx.body = {
        code: 201,
        msg: '注册成功',
        token: token,
      };
      apiModel.addMobileUser([name, pass, moment().format('YYYY-MM-DD HH:mm')]);
    });
});
// 获取三个列表的数据
router.get('/vi/list', async (ctx, next) => {
  await Promise.all([
    apiModel.findDataByCls('电影'),
    apiModel.findDataByCls('电视剧'),
    apiModel.findDataByCls('综艺'),
    apiModel.findData('videos'),
  ])
    .then(res => {
      ctx.body = {
        code: 200,
        data: res,
        message: '获取列表成功',
      };
    })
    .catch(err => {
      ctx.body = {
        code: 500,
        message: '获取订单失败',
      };
    });
});
// 获取单个id的信息
router.post('/vi/getVideoById', koaBody(), async ctx => {
  var id = ctx.request.body.videoId;
  await Promise.all([
    apiModel.getDataById(id),
    apiModel.getLikeStar(1, id),
    apiModel.getUidLikeLength(id),
  ])
    .then(res => {
      ctx.body = {
        code: 200,
        data: res,
        message: '获取详情成功',
      };
    })
    .catch(err => {
      ctx.body = {
        code: 500,
        message: '获取详情失败',
      };
    });
});
// 获取文章的评论
router.post('/vi/getVideoComment', koaBody(), async ctx => {
  await apiModel
    .getCommentById(ctx.request.body.videoId)
    .then(res => {
      ctx.body = {
        code: 200,
        data: res,
        message: '获取评论成功',
      };
    })
    .catch(err => {
      ctx.body = {
        code: 500,
        message: '获取评论失败',
      };
    });
});
// 获取用户的评论
router.post('/vi/getUserComment', koaBody(), async ctx => {
  await apiModel
    .getCommentByUser(ctx.request.body.userName)
    .then(res => {
      ctx.body = {
        code: 200,
        data: res,
        message: '获取用户的评论成功',
      };
    })
    .catch(err => {
      ctx.body = {
        code: 500,
        message: '获取用户的评论失败',
      };
    });
});
// 评论
router.post('/vi/postComment', koaBody(), async ctx => {
  var { userName, content, videoName, avator, videoId } = ctx.request.body;
  var date = moment().format('YYYY-MM-DD HH:mm:ss');

  await checkToken(ctx)
    .then(async res => {
      await apiModel
        .addComment([userName, date, content, videoName, videoId, avator])
        .then(res => {
          ctx.body = {
            code: 200,
            message: '评论成功',
          };
        })
        .catch(err => {
          ctx.body = {
            code: 500,
            message: '评论失败',
          };
        });
    })
    .catch(err => {
      ctx.body = err;
    });
});
// 删除评论
router.post('/vi/deleteComment', koaBody(), async ctx => {
  await checkToken(ctx)
    .then(async res => {
      await apiModel
        .deleteComment(ctx.request.body.commentId)
        .then(res => {
          ctx.body = {
            code: 200,
            message: '删除成功',
          };
        })
        .catch(err => {
          ctx.body = {
            code: 500,
            message: '删除失败',
          };
        });
    })
    .catch(err => {
      ctx.body = err;
    });
});
// 点击喜欢
router.post('/vi/postUserLike', koaBody(), async ctx => {
  var { userName, like, videoName, videoId, videoImg, star } = ctx.request.body;
  await checkToken(ctx)
    .then(async res => {
      let newStar;
      await apiModel.addLike([
        like,
        userName,
        videoName,
        videoImg,
        star,
        videoId,
      ]);
      // 修改评分
      await Promise.all([
        apiModel.getLikeStar(1, videoId),
        apiModel.getUidLikeLength(videoId),
      ]).then(async res => {
        newStar = (
          (res[0][0]['count(*)'] / res[1][0]['count(*)']) *
          10
        ).toFixed(1);
      });
      await Promise.all([
        apiModel.updateVideoStar([newStar, videoId]),
        apiModel.updateLikeStar([newStar, videoId]),
      ])
        .then(res => {
          ctx.body = {
            code: 200,
            message: '评分成功',
          };
        })
        .catch(err => {
          ctx.body = {
            code: 500,
            message: '评分失败',
          };
        });
    })
    .catch(err => {
      ctx.body = err;
    });
});

// 获取单个video的like信息
router.post('/vi/getUserSingleLike', koaBody(), async ctx => {
  var { userName, videoId } = ctx.request.body;
  await apiModel
    .getLike(userName, videoId)
    .then(res => {
      ctx.body = {
        code: 200,
        data: res,
        message: '获取单个video成功',
      };
    })
    .catch(err => {
      ctx.body = {
        code: 500,
        message: '获取单个video失败',
      };
    });
});

// 获取个人like列表
router.post('/vi/getUserLikeData', koaBody(), async ctx => {
  var userName = ctx.request.body.userName;

  await Promise.all([
    apiModel.getUserLikeV2(userName, 1),
    apiModel.getUserLikeV2(userName, 2),
  ])
    .then(res => {
      ctx.body = {
        code: 200,
        data: res,
        message: '获取个人like列表成功',
      };
    })
    .catch(err => {
      ctx.body = err;
    });
});

// 修改用户名
router.post('/vi/editUserName', koaBody(), async (ctx, next) => {
  var { userName, newName } = ctx.request.body;
  var userExist = false;
  await checkToken(ctx)
    .then(async res => {
      await apiModel.findMobileUserByName(newName).then(res => {
        if (res.length == 0) {
          userExist = false;
        } else {
          userExist = true;
        }
      });
      if (!userExist) {
        // 2019-7-27 这里是个大坑，当时too young，按道理查询是需要联表查询的，现在已经不好改了，可以参照lib/sql.js里最后的一段sql，获取喜欢列表的优化版本
        await Promise.all([
          apiModel.findMobileUserByName(userName),
          apiModel.updateMobileName([newName, userName]),
          apiModel.updateMobileCommentName([newName, userName]),
          apiModel.updateMobileLikeName([newName, userName]),
        ])
          .then(res => {
            password = Object.assign(res[0][0]).password;
            let nowToken = jwt.sign(
              {
                userName: newName,
              },
              config.jwt_secret,
              {
                expiresIn: '30 days',
              },
            );
            ctx.body = {
              code: 200,
              token: nowToken,
              message: '用户名修改成功',
            };
          })
          .catch(err => {
            ctx.body = {
              code: 500,
              message: '用户名修改失败',
            };
          });
      } else {
        ctx.body = {
          code: 500,
          message: '用户名存在',
        };
      }
    })
    .catch(err => {
      ctx.body = err;
      return;
    });
});
// 获取用户头像
router.post('/vi/getUserAvator', koaBody(), async ctx => {
  await apiModel
    .findMobileUserByName(ctx.request.body.userName)
    .then(res => {
      if (res.length >= 1) {
        ctx.body = {
          code: 200,
          avator: Object.assign({}, res[0]).avator,
          message: '获取头像成功',
        };
      } else {
        // 没有上传头像
        ctx.body = {
          code: 200,
          avator: '',
          message: '还没有上传头像',
        };
      }
    })
    .catch(err => {
      ctx.body = 'none';
    });
});
// 增加头像
router.post(
  '/vi/uploadAvator',
  koaBody({
    formLimit: '5mb',
    jsonLimit: '5mb',
    textLimit: '5mb',
  }),
  async ctx => {
    var { userName, avator } = ctx.request.body;
    var base64Data = avator.replace(/^data:image\/\w+;base64,/, '');
    var dataBuffer = new Buffer(base64Data, 'base64');
    var getName =
      Number(
        Math.random()
          .toString()
          .substr(3),
      ).toString(36) + Date.now();
    await checkToken(ctx)
      .then(async res => {
        let uploadDone = await new Promise((reslove, reject) => {
          fs.writeFile(
            './public/images/avator/' + getName + '.png',
            dataBuffer,
            err => {
              if (err) {
                reject(false);
              }
              reslove(true);
            },
          );
        });
        if (uploadDone) {
          await Promise.all([
            apiModel.updateMobileAvator([getName, userName]),
            apiModel.updateMobileCommentAvator([getName, userName]),
          ])
            .then(res => {
              ctx.body = {
                code: 200,
                avator: getName,
                message: '上传成功',
              };
            })
            .catch(err => {
              ctx.body = {
                code: 500,
                message: '上传失败',
              };
            });
        }
      })
      .catch(err => {
        ctx.body = err;
      });
  },
);

// 验证码
router.get('/vi/getYzm', async (ctx, next) => {
  const captcha = require('trek-captcha');
  const { token, buffer } = await captcha({ size: 4 });
  let getYzm = false;
  getYzm = await new Promise((reslove, reject) => {
    fs.createWriteStream('./public/images/yzm.jpg')
      .on('finish', data => {
        reslove(true);
      })
      .end(buffer);
  });
  if (getYzm) {
    ctx.body = {
      code: 200,
      data: token,
      message: '获取验证码成功',
    };
  } else {
    ctx.body = {
      code: 500,
      data: token,
      message: '获取验证码失败',
    };
  }
});

// 搜索
router.post('/vi/search', koaBody(), async ctx => {
  var val = ctx.request.body.val;
  await apiModel.search(val).then(res => {
    ctx.body = {
      code: 200,
      data: res,
      message: '获取搜索结果成功',
      total: res.length,
    };
  });
});

module.exports = router;
