var mysql = require('mysql');
var config = require('../config/default.js')

var pool = mysql.createPool({
	host:config.database.HOST,
	user:config.database.USER,
	password:config.database.PASSWORD,
	database:config.database.DATABASE,
});

var query = function(sql,val){
	return new Promise((resolve,reject)=>{
		pool.getConnection((err,connection)=>{
			if (err){
				return resolve(err)
			} else{
				connection.query(sql,val,(err,rows)=>{
					if (err) {
						reject(err)
					}else{
						resolve(rows)
					}
					connection.release()
				})
			}
		})
	})
}

let videos=
    `create table if not exists videos(
     id INT NOT NULL AUTO_INCREMENT,
     name VARCHAR(100) NOT NULL,
     country VARCHAR(100) NOT NULL,
     classify VARCHAR(100) NOT NULL,
     time1 VARCHAR(40) NOT NULL,
     img VARCHAR(40) NOT NULL,
     star VARCHAR(40) NOT NULL,
     timelong VARCHAR(40) NOT NULL,
     type VARCHAR(40) NOT NULL,
     actors VARCHAR(100) NOT NULL,
     detail VARCHAR(1000) NOT NULL,
     PRIMARY KEY ( id )
    );`
let users=
    `create table if not exists users(
     id INT NOT NULL AUTO_INCREMENT,
     username VARCHAR(100) NOT NULL,
     password VARCHAR(100) NOT NULL,
     PRIMARY KEY ( id )
    );`
let mobileusers=
    `create table if not exists mobileusers(
     id INT NOT NULL AUTO_INCREMENT,
     userName VARCHAR(100) NOT NULL,
     password VARCHAR(100) NOT NULL,
     avator VARCHAR(100) NOT NULL DEFAULT '',
     PRIMARY KEY ( id )
    );`
let comments=
`create table if not exists comments(
 id INT NOT NULL AUTO_INCREMENT,
 userName VARCHAR(100) NOT NULL,
 date VARCHAR(100) NOT NULL,
 content VARCHAR(100) NOT NULL,
 videoName VARCHAR(100) NOT NULL,
 uid VARCHAR(100) NOT NULL,
  avator VARCHAR(100) NOT NULL DEFAULT '',

 PRIMARY KEY ( id )
);`
let likes=
`create table if not exists likes(
 id INT NOT NULL AUTO_INCREMENT,
 iLike VARCHAR(100) NOT NULL,
 userName VARCHAR(100) NOT NULL,
 videoName VARCHAR(100) NOT NULL,
 videoImg VARCHAR(100) NOT NULL,
 star VARCHAR(100) NOT NULL,
 uid VARCHAR(100) NOT NULL,
 PRIMARY KEY ( id )
);`
let createTable = function( sql ) {
  return query( sql, [] )
}
// 建表
createTable(videos)
createTable(users)
createTable(mobileusers)
createTable(comments)
createTable(likes)
// 添加后台用户
let addUser = function( value ) {
  let _sql = `insert into users(username,password) values(?,?); `
  return query( _sql, value)
}
// 查找用户
let findUser = function(name){
	var _sql = `select * from users where username="${name}"; `
  return query( _sql )
}
// 查询所有数据
let findData = function(table){
	var _sql = `select * from ${table}; `
  return query( _sql )
}
// 通过cls查找
let findDataByCls = function(cls){
  var _sql = `select * from videos where classify="${cls}"; `
  return query( _sql )
}
// 通过id查找
let findDataById = function(id){
	var _sql = `select * from videos where id="${id}"; `
  return query( _sql )
}
// 增加video数据
let insertData = function( value ) {
  let _sql = `insert into videos(name,country,classify,time1,img,star,timelong,type,actors,detail) values(?,?,?,?,?,?,?,?,?,?); `
  return query( _sql, value )
}
let updateDataHasImg = function( value ) {
  let _sql = `update videos set  name=?,country=?,classify=?,time1=?,img=?,star=?,timelong=?,type=?,actors=?,detail=? where id=?; `
  return query( _sql, value )
}
let updateDataNoneImg = function( value ) {
  let _sql = `update videos set  name=?,country=?,classify=?,time1=?,star=?,timelong=?,type=?,actors=?,detail=? where id=?; ` 
  return query( _sql, value )
}
// 删除video
let deleteVideo = function( id ) {
  let _sql = `delete from  videos where id="${id}"; `
  return query( _sql )
}
let getDataById = function( id ) {
  var _sql = `select * from videos where id="${id}"; `
  return query( _sql )
}

// 手机端


// 通过用户名查找用户
let findMobileUserByName = function( name ){
  var _sql = `select * from mobileusers where userName="${ name }";`
  return query( _sql )
}
// 添加手机用户
let addMobileUser = function( value ){
  var _sql = `insert into mobileusers(userName,password) values(?,?);`
  return query( _sql , value)
}

// 修改手机用户名 comment和like表也要修改
let updateMobileName = function( value ){
  var _sql = `update mobileusers set userName=? where userName=?;`
  return query( _sql , value)
}
let updateMobileCommentName = function( value ){
  var _sql = `update comments set userName=? where userName=?;`
  return query( _sql , value)
}
let updateMobileLikeName = function( value ){
  var _sql = `update likes set userName=? where userName=?;`
  return query( _sql , value)
}


// 添加头像
let updateMobileAvator = function( value ){
  var _sql = `update mobileusers set avator=? where userName=?;`
  return query( _sql , value)
}
// 修改评论里的头像
let updateMobileCommentAvator = function( value ){
  var _sql = `update comments set avator=? where userName=?;`
  return query( _sql , value)
}
// 增加评论
let addComment = function(value){
  var _sql = `insert into comments(userName,date,content,videoName,uid,avator) values(?,?,?,?,?,?); `
  return query( _sql , value )
}
// 通过id获取评论
let getCommentById = function(id){
  var _sql = `select * from comments where uid="${id}"; `
  return query( _sql )
}
// 通过用户名获取评论
let getCommentByUser = function(name){
  var _sql = `select * from comments where userName="${name}"; `
  return query( _sql )
}
// 删除评论
let deleteComment = function(id){
  var _sql = `delete from comments where id="${id}"; `
  return query( _sql )
}
// 增加like
let addLike = function(value){
  var _sql = `insert into likes(iLike,userName,videoName,videoImg,star,uid) values(?,?,?,?,?,?); `
  return query( _sql , value )
}
// 获取单个video里的用户like状态
let getLike = function(name,uid){
  var _sql = `SELECT * FROM likes WHERE userName='${name}' AND uid='${uid}'; `
  return query( _sql )
}
// 获取like列表
let getLikeList = function(name,num){
  var _sql = `SELECT * FROM likes WHERE userName='${name}' AND iLike='${num}'; `
  return query( _sql )
}
// 搜索
let search = function( value ){
  var _sql = `select * from videos where name like '%${value}%';`
  return query( _sql )
}
module.exports={
	addUser,
	findUser,
	findData,
	insertData,
	findDataById,
	updateDataHasImg,
	updateDataNoneImg,
	deleteVideo,
  findDataByCls,
  getDataById,
  addMobileUser,
  findMobileUserByName,
  addComment,
  getCommentById,
  getCommentByUser,
  addLike,
  getLike,
  getLikeList,
  deleteComment,
  updateMobileAvator,
  updateMobileCommentAvator,
  updateMobileName,
  updateMobileCommentName,
  updateMobileLikeName,
  search,
}