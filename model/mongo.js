/*
 * @Author: your name
 * @Date: 2021-04-29 09:54:56
 * @LastEditTime: 2021-11-30 16:24:32
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \zis\article\model\mongo.js
 */
let mongodb = require("mongodb");
let mongoCt = mongodb.MongoClient;
let ObjectId = mongodb.ObjectId;

// const sshCollectionUrl = 'mongodb://42.192.95.252:27017' // 远程服务器mongoDB地址
const defalutUrl = 'mongodb://localhost:27017'

let open = ({ dbName, collectionName, url = defalutUrl }) => {
    return new Promise((resolve, reject) => {
        mongoCt.connect(url, { useUnifiedTopology: true }, (err, client) => {
            if (!err) {
                let db = client.db(dbName);
                let user = db.collection(collectionName);

                resolve({ user, client, ObjectId })
            } else {
                reject(err);
            }
        })
    })
}

// 排序功能
let findList = ({ dbName, collectionName, _page, _sort, _limit, q }) => {
    // 使用正则匹配, 可以实现模糊搜索
    let rule = q ? { title: new RegExp(q, "g") } : {};
    // let rule = q ? {username: eval("/" + q + "/")} : {};

    return new Promise((resolve, reject) => {
        open({
            dbName,
            collectionName,
        }).then(({ user, client }) => {
            user.find(rule, {
                skip: _page * _limit,
                limit: _limit
            }).sort({ [_sort]: -1 }).toArray((err, result) => {
                if (!err && result.length > 0) {
                    resolve({ err: 0, data: result });
                } else {
                    resolve({ err: 1, des: "用户信息获取不到..." });
                }

                // 关闭资源
                client.close();
            })

        }).catch(err => {
            reject(err)
        })
    })
}

let findDetail = ({ dbName, collectionName, _id = null}) => {
    return new Promise((resolve, reject) => {
        open({
            dbName,
            collectionName,
        }).then(({ user, client }) => {
            if(_id.length === 24){
                user.find({_id: ObjectId(_id)}).toArray((err, result) => {
                    if(!err && result.length > 0){
                        resolve({err:0, data: result[0]});
                    }else{
                        resolve({err: 1, msg: "查询不到数据"});
                    }
                    // 关闭资源
                    client.close();
                })
            }else{
                reject({err:1, msg: "id长度有误..."});
            }
        })
            .catch((err) => {
                reject({ err: 1, msg: "数据库连接失败..." })
            })


    })
}




exports.open = open;
exports.findList = findList;
exports.findDetail = findDetail;