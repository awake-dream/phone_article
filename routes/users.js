var express = require('express');
var router = express.Router();
var mongo = require("../model/mongo");

/* GET users listing. */
router.get('/', function (req, res, next) {
  // res.send('respond with a resource');

});

// 注册接口
router.post("/regist", (req, res) => {
  let data = {
    username: req.body.username,
    password: req.body.password,
    password2: req.body.password2,
  }
  // 数据校验

  mongo.open({
    dbName: "probject",
    collectionName: "users"
  }).then(({user, client}) => {
    user.insertOne(data, (err, result) => {
      if(err){
        res.redirect('/regist')
        client.close();
        // res.send({err: 1, msg: "插入失败"});
      }else{
        res.redirect('/login');
        client.close();
        // res.send({err: 0, msg: '插入成功', data: result.ops[0]});
      }

  }).catch(err => console.log("数据库连接失败"))

  })
})

// 登录接口
router.post("/login", (req, res) => {
  let data = {
    username: req.body.username,
    password: req.body.password
  }

  mongo.open({
    dbName: "probject",
    collectionName: "users"
  }).then(({user, client}) => {
    user.find(data).toArray((err, result) => {
      if(err){
        res.send("查询错误");
        client.close();
      }else{

        if(result.length > 0){
          // 登录成功, 进行session会话存储
          req.session.username = data.username;
          res.redirect("/");
        }else{
          res.redirect("/login");
        }
        client.close();
        
      }
    }) 
  }).catch(err => console.log("数据库连接失败..."))

}) 

// 退出登录接口
router.get("/logout", (req, res) => {
  req.session.username = null;
  res.redirect("/login")
})


module.exports = router;
