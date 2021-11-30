var express = require('express');
var router = express.Router();
var mongo = require("../model/mongo");
var moment = require("moment")

/* GET home page. */
router.get('/', function (req, res, next) {
  var username = req.session.username || "";
  var page = req.query.page || 1;
  let data = {
    total: 0,    // 总共多少页
    curPage: page,
    list: []
  }
  var pageSize = 10;

  // 查询文章列表
  mongo.open({
    dbName: 'probject',
    collectionName: 'articles'
  }).then(({ user, client }) => {
    user.find().toArray((err, result) => {
      data.total = Math.ceil(result.length / pageSize);

      // 查询当前页的文章列表
      mongo.findList({
        dbName: 'probject',
        collectionName: 'articles',
        _page: data.curPage - 1,
        _sort: "timer",
        _limit: pageSize
      }).then((result2) => {
        result2.data = result2.data || [];

        // if (!result2.data) {
        //   res.redirect('/?page=' + ((page - 1) || 1))
        // }

        result2.data.map((ele, index) => {
          ele['time'] = moment(ele.timer).format("YYYY-MM-DD HH:mm:ss");
        })

        data.list = result2.data
        res.render("index", { username, data })

        client.close();

      }).catch(err => console.log("查询失败...", err))

    })
  }).catch(err => console.log("数据库连接失败..."))


});

// 渲染注册页
router.get('/regist', function (req, res, next) {

  res.render("regist", {})

});

// 渲染登录页
router.get('/login', function (req, res, next) {

  res.render("login", {})

});

// 渲染写文章页面
router.get('/write', function (req, res, next) {
  var username = req.session.username;
  var id = parseInt(req.query.id);
  var page = req.query.page;

  var item = {
    title: "",
    content: ""
  }

  if (id) {
    mongo.open({
      dbName: "probject",
      collectionName: "articles"
    }).then(({ user, client }) => {
      user.findOne({ timer: id }, (err, docs) => {
        if (err) {
          console.log("查询失败...")
        } else {
          item = docs;
          item['page'] = page;
          res.render("write", { username, item });
        }
      })
    }).catch(err => console.log("连接数据库失败...", err))

  } else {
    res.render("write", { username, item})
  }




});

// 渲染详情页
router.get('/detail', (req, res) => {
  var timer = parseInt(req.query.id);
  var username = req.session.username;

  mongo.open({
    dbName: "probject",
    collectionName: "articles"
  }).then(({user, client}) => {

    user.findOne({timer}, (err, data) => {
      if(err){
        console.log("查询失败...")
        client.close();
      }else{
        data['time'] = moment(data.timer).format('YYYY-MM-DD HH:mm:ss')
        res.render("detail", {data, username})
        client.close();
      }
    })
  }) 
})

module.exports = router;
