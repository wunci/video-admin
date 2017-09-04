module.exports={
	checkLogin:ctx=>{
		if (!ctx.session || !ctx.session.user) {
			ctx.redirect('/signin')
			// return false
		}
		// return true
	}
}