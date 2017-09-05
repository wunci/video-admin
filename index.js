const Koa = require('koa')
const path = require('path')
const ejs = require('ejs')
const session = require('koa-session-minimal');
const MysqlStore = require('koa-mysql-session');
const config = require('./config/default.js')
const koaStatic = require('koa-static')
const views = require('koa-views')
const koaBody = require('koa-body');
const app=new Koa()

const sessionMysqlConfig = {
	user:config.database.USER,
	password:config.database.PASSWORD,
	host:config.database.HOST,
	database:config.database.DATABASE
}
app.use(session({
	key:'USER_SID',
	store:new MysqlStore(sessionMysqlConfig)
}))
app.use(koaStatic(
	path.join(__dirname,'./public')
))
app.use(views(path.join(__dirname,'./views'),{
	extension: 'ejs'
}))

app.use(require('./router/admin.js').routes())
app.use(require('./router/mobile.js').routes())


app.use(koaBody({ multipart: true,formidable:{uploadDir: path.join(__dirname,'./public/images')}}));

app.listen(8000)

console.log('listen in 8000')