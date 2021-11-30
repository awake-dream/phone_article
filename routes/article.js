var express = require('express');
var router = express.Router();
var mongo = require("../model/mongo");
var multiparty = require("multiparty");
var fs = require("fs");


// 编辑 / 发布
router.post('/add', (req, res) => {
    var id = parseInt(req.body.id);
    if (id) {  // 编辑
        let {page, title, content} = req.body;
        mongo.open({
            dbName: "probject",
            collectionName: "articles"
        }).then(({user, client}) => {
            user.updateOne({timer: id}, {$set: {
                title, content
            }}, (err, result) => {
                if(err){
                    console.log('修改失败')
                }else{
                    res.redirect("/?page=" + page)
                }
            })
        })

    } else {   // 发布
        var data = {
            title: req.body.title,
            content: req.body.content,
            timer: Date.now(),
            username: req.session.username
        }

        mongo.open({
            dbName: "probject",
            collectionName: "articles"
        }).then(({ user, client }) => {
            user.insertOne(data, (err, result) => {
                if (err) {
                    console.log("文章发布失败...");
                    res.redirect("/write");
                    client.close();
                } else {
                    res.redirect("/");
                    client.close();
                }
            })
        }).catch(err => console.log('数据库连接失败...'))
    }

})

// 删除文章
router.get("/delete", (req, res) => {
    let page = req.query.page;
    let timer = parseInt(req.query.id);

    mongo.open({
        dbName: "probject",
        collectionName: "articles"
    }).then(({ user, client }) => {
        user.deleteOne({ timer }, (err, result) => {
            console.log('数据:',result)

            if (err) {
                console.log('删除失败..')
            } else {
                res.redirect('/?page=' + page);
            }
        })
    })


})

// 上传图片
router.post("/upload", (req, res) => {
    var form = new multiparty.Form();

    form.parse(req, (err, fields, files) => {
        if(err){
            console.log("文件上传失败", err)
        }else{
            // console.log("文件上传成功", files)
            var file = files.filedata[0];

            var rs = fs.createReadStream(file.path);
            var newPath = '/upload/' + file.originalFilename;
            var ws = fs.createWriteStream("./public" + newPath);
            
            rs.pipe(ws);
            ws.on("close", () => {
                res.send({err:0, msg: newPath})
            })
        }
    })

})


module.exports = router;
