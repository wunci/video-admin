var apiModel = require('../lib/sql.js')
let md5 = require('md5')
module.exports = {
	checkLogin:ctx=>{
		if (!ctx.session || !ctx.session.user) {
			ctx.redirect('/signin')
		}
	},
	 checkToken:async ctx=>{
		// let token = ctx.cookies.get('token')
		var data = ctx.request.body
		data = typeof data == 'string' ? JSON.parse(data) : data
		let {userName,token} = data
		console.log('token', token, userName)
		return new Promise((reslove,reject)=>{
			apiModel.findMobileUserByName(userName).then(res => {
				var res = Object.assign(res)
				console.log(res)
				if(res.length > 0){
					console.log(res[0])
					res = res[0]
					let nowToken = userName + 'token' + res.password
					console.log(md5(nowToken))
					if (md5(nowToken) != token) {
						console.log('无效的token')
						reject({
							code: 404,
							message: '用户权限校验失败'
						})
					}else{
						reslove({
							code: 200,
							message: '身份验证成功'
						})
					}
				}else{
					console.log('用户不存在')
					reject({
						code: 404,
						message: '用户不存在'
					})
				}
			})
		})
	}
}