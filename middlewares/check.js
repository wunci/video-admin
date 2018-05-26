let apiModel = require('../lib/sql.js')
let md5 = require('md5')
let jwt = require('jsonwebtoken');
let config = require('../config/default.js')

module.exports = {
	checkLogin:ctx=>{
		if (!ctx.session || !ctx.session.user) {
			ctx.redirect('/signin')
		}
	},
	checkToken:async ctx=>{
		let token = ctx.get('token')
		// console.log('token', ctx.get('token'))
		var data = ctx.request.body
		let {userName} = data
		// console.log('token', token, userName)
		return new Promise((reslove,reject)=>{
			jwt.verify(token, config.jwt_secret, (err, decoded) => {
				if (err) {
					console.log(err.name, err.message)
					if (err.message == 'jwt expired'){
						reject({
							code: 404,
							message: '用户权限过期'
						})
					} else {
						reject({
							code: 404,
							message: '无效的用户权限，请重新登录'
						})
					}
					/*
						err = {
						name: 'TokenExpiredError',
						message: 'jwt expired',
						expiredAt: 1408621000
						}
					*/
				} else {
					console.log('token success', decoded)
					if (userName === decoded.userName){
						reslove({
							code:200,
							message:'验证成功'
						})
					}else{
						reject({
							code: 404,
							message: '用户身份不一致'
						})
					}
					
				}
			});
		})
	}
}