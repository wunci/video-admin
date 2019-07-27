var mysql = require('mysql');
var config = require('../config/default.js');

var pool = mysql.createPool({
  host: config.database.HOST,
  user: config.database.USER,
  password: config.database.PASSWORD,
  database: config.database.DATABASE,
});

var query = (sql, val) => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        return resolve(err);
      } else {
        connection.query(sql, val, (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
          connection.release();
        });
      }
    });
  });
};

let videos = `create table if not exists videos(
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
    );`;
let users = `create table if not exists users(
     id INT NOT NULL AUTO_INCREMENT,
     username VARCHAR(100) NOT NULL,
     password VARCHAR(100) NOT NULL,
     PRIMARY KEY ( id )
    );`;
let mobileusers = `create table if not exists mobileusers(
     id INT NOT NULL AUTO_INCREMENT,
     userName VARCHAR(100) NOT NULL,
     password VARCHAR(100) NOT NULL,
     avator VARCHAR(100) NOT NULL DEFAULT '',
     time VARCHAR(100) NOT NULL DEFAULT '',
     PRIMARY KEY ( id )
    );`;
let comments = `create table if not exists comments(
    id INT NOT NULL AUTO_INCREMENT,
    userName VARCHAR(100) NOT NULL,
    date VARCHAR(100) NOT NULL,
    content VARCHAR(100) NOT NULL,
    videoName VARCHAR(100) NOT NULL,
    uid VARCHAR(100) NOT NULL,
    avator VARCHAR(100) NOT NULL DEFAULT '',
    PRIMARY KEY ( id )
    );`;
let likes = `create table if not exists likes(
    id INT NOT NULL AUTO_INCREMENT,
    iLike VARCHAR(100) NOT NULL,
    userName VARCHAR(100) NOT NULL,
    videoName VARCHAR(100) NOT NULL,
    videoImg VARCHAR(100) NOT NULL,
    star VARCHAR(100) NOT NULL,
    uid VARCHAR(100) NOT NULL,
    PRIMARY KEY ( id )
    );`;
let createTable = sql => {
  return query(sql, []);
};
// 建表
createTable(videos);
createTable(users);
createTable(mobileusers);
createTable(comments);
createTable(likes);
// 添加后台用户
let addUser = value => {
  let _sql = `insert into users set username=?,password=?`;
  return query(_sql, value);
};
// 删除后台用户
let deleteUser = name => {
  let _sql = `delete from users where username="${name}"; `;
  return query(_sql);
};
// 查找用户
let findUser = name => {
  var _sql = `select * from users where username="${name}"; `;
  return query(_sql);
};
// 查询所有数据
let findData = table => {
  var _sql = `select * from ${table}; `;
  return query(_sql);
};
// 分页数据查找
let findPageData = (table, page, num) => {
  var _sql = `select * from ${table} limit ${(page - 1) * num},${num}; `;
  return query(_sql);
};
// 通过cls查找
let findDataByCls = cls => {
  var _sql = `select * from videos where classify="${cls}"; `;
  return query(_sql);
};
// 通过id查找
let findDataById = id => {
  var _sql = `select * from videos where id="${id}"; `;
  return query(_sql);
};
// 增加video数据
let insertData = value => {
  let _sql = `insert into videos set name=?,country=?,classify=?,time1=?,img=?,star=?,timelong=?,type=?,actors=?,detail=?;`;
  return query(_sql, value);
};
let updateDataHasImg = value => {
  let _sql = `update videos set name=?,country=?,classify=?,time1=?,img=?,star=?,timelong=?,type=?,actors=?,detail=? where id=?; `;
  return query(_sql, value);
};
let updateDataNoneImg = value => {
  let _sql = `update videos set name=?,country=?,classify=?,time1=?,star=?,timelong=?,type=?,actors=?,detail=? where id=?; `;
  return query(_sql, value);
};
let updateLikesImg = value => {
  let _sql = `update likes set videoImg=? where uid=?; `;
  return query(_sql, value);
};
let updateLikeName = value => {
  let _sql = `update likes set videoName=? where uid=?; `;
  return query(_sql, value);
};
let updateCommentName = value => {
  let _sql = `update comments set videoName=? where uid=?; `;
  return query(_sql, value);
};
// 删除video
let deleteVideo = id => {
  let _sql = `delete from videos where id="${id}"; `;
  return query(_sql);
};
let getDataById = id => {
  var _sql = `select * from videos where id="${id}"; `;
  return query(_sql);
};

// 手机端相关功能

// 通过用户名查找用户
let findMobileUserByName = name => {
  var _sql = `select * from mobileusers where userName="${name}";`;
  return query(_sql);
};

// 添加手机用户
let addMobileUser = value => {
  var _sql = `insert into mobileusers set userName=?,password=?,time=?`;
  return query(_sql, value);
};
// 检测用户登录信息的有效性
let checkUser = value => {
  var _sql = `select * from mobileusers where userName=?;`;
  return query(_sql, value);
};

// 修改手机用户名 comment和like表也要修改
let updateMobileName = value => {
  var _sql = `update mobileusers set userName=? where userName=?;`;
  return query(_sql, value);
};
let updateMobileCommentName = value => {
  var _sql = `update comments set userName=? where userName=?;`;
  return query(_sql, value);
};
let updateMobileLikeName = value => {
  var _sql = `update likes set userName=? where userName=?;`;
  return query(_sql, value);
};

// 添加头像
let updateMobileAvator = value => {
  var _sql = `update mobileusers set avator=? where userName=?;`;
  return query(_sql, value);
};
// 修改评论里的头像
let updateMobileCommentAvator = value => {
  var _sql = `update comments set avator=? where userName=?;`;
  return query(_sql, value);
};
// 增加评论
let addComment = value => {
  var _sql = `insert into comments set userName=?,date=?,content=?,videoName=?,uid=?,avator=?;`;
  return query(_sql, value);
};
// 通过id获取评论
let getCommentById = id => {
  var _sql = `select * from comments where uid="${id}"; `;
  return query(_sql);
};
// 通过用户名获取评论
let getCommentByUser = name => {
  var _sql = `select * from comments where userName="${name}"; `;
  return query(_sql);
};
// 删除评论
let deleteComment = id => {
  var _sql = `delete from comments where id="${id}"; `;
  return query(_sql);
};
// 增加like
let addLike = value => {
  var _sql = `insert into likes set iLike=?,userName=?,videoName=?,videoImg=?,star=?,uid=?; `;
  return query(_sql, value);
};
// 获取单个video里的用户like状态
let getLike = (name, uid) => {
  var _sql = `select * from likes where userName='${name}' AND uid='${uid}'; `;
  return query(_sql);
};
// 获取个人中心自己like/dislike的列表
let getLikeList = (name, num) => {
  var _sql = `select * from likes where userName='${name}' AND iLike='${num}'; `;
  return query(_sql);
};
// 获取喜欢的数量
let getLikeStar = (type, uid) => {
  var _sql = `select count(*) from likes where iLike='${type}' AND uid='${uid}' ; `;
  return query(_sql);
};
// 获取单篇文章like/dislike总的数量
let getUidLikeLength = uid => {
  var _sql = `select count(*) from likes where uid='${uid}'; `;
  return query(_sql);
};
// 更新videos star分数
let updateVideoStar = value => {
  var _sql = `update videos set star=? where id=?; `;
  return query(_sql, value);
};
// 更新likes star分数
let updateLikeStar = value => {
  var _sql = `update likes set star=? where uid=?; `;
  return query(_sql, value);
};
// 搜索
let search = value => {
  var _sql = `select * from videos where name like '%${value}%';`;
  return query(_sql);
};

// ****** 2019-7-27 更新 填坑 ******
// 获取喜欢不喜欢列表，as别名是对前端代码的兼容，跟以前数据达到一致。
// ps: 新增数据不需要插入那么多数据，只需要插入当前相关需要的id，需要查询的时候通过标识符联表查询。之前做的还是too young，但是现在不好改了，只能借鉴一下
let getUserLikeV2 = (name, status = 1) => {
  var _sql = `select likes.id, likes.iLike, videos.name as videoName, videos.star, videos.img as videoImg, videos.id as uid from likes left join videos on videos.id = likes.uid where likes.username = '${name}' and likes.iLike = ${status} and videos.id is not NULL`;
  return query(_sql);
};
module.exports = {
  addUser,
  deleteUser,
  findUser,
  findData,
  findPageData,
  insertData,
  findDataById,
  updateDataHasImg,
  updateDataNoneImg,
  updateLikesImg,
  updateLikeName,
  updateCommentName,
  deleteVideo,
  findDataByCls,
  getDataById,
  addMobileUser,
  findMobileUserByName,
  checkUser,
  addComment,
  getCommentById,
  getCommentByUser,
  addLike,
  getLike,
  getLikeList,
  getLikeStar,
  updateVideoStar,
  updateLikeStar,
  getUidLikeLength,
  deleteComment,
  updateMobileAvator,
  updateMobileCommentAvator,
  updateMobileName,
  updateMobileCommentName,
  updateMobileLikeName,
  search,
  query,
  // 2019-7-27 分割线
  getUserLikeV2,
};
