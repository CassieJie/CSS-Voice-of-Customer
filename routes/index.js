var express=require('express');
var router = express.Router();

var bodyParser = require('body-parser');
// 设置body-parser中间件
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());

var DB = require('../modules/db.js');


router.post('/searchByDate',function(req,res){
    var Date = req.body.Date;
    // 2.连接数据库查询数据
    if (Date == "") {
        DB.find('honor', {}, function (err, data) {
            res.render('css', {
                list: data
            })
        })
    }
    else {
        var map = {"01":"Jan","02":"Feb","03":"Mar","04":"Apr","05":"May","06":"Jun","07":"Jul","08":"Aug","09":"Sep","10":"Oct","11":"Nov","12":"Dec"};
        var l =map[Date.split('/')[1]];
        Date =l+" "+Date.split('/')[0];

        DB.find('honor', {
            Date: Date,
        }, function (err, data) {
            if (data.length > 0) {
                res.render('css', {
                    list: data
                })
            } else {
                res.send("<script>alert('No matching data for your searched date!');" +
                    "location.href='/'" +
                    "</script>");
            }
        })
    }
});
    //ID
router.post('/searchById',function(req,res){
    var id = req.body.searchId;
    if (id == "") {
        DB.find('honor', {}, function (err, data) {
            res.render('css', {
                list: data
            })
        })
    }
    else {
        DB.find('honor', {
            _id: id,
        }, function (err, data) {
            if (data.length > 0) {
                res.render('css', {
                    list: data
                })
            } else {
                res.send("<script>alert('No matching data for your searched CaseID!');" +
                    "location.href='/'" +
                    "</script>");
            }
        })
    }

});


router.post('/pop_up_search',function(req,res) {
    var id = req.body.id;
    // 2.连接数据库查询数据

    DB.find('honor', {
        _id: id
    }, function (err, data) {

        var badge = data[0].Badge;
        res.send(badge)
    });
});
router.post('/BadgeSearch',function(req,res){
    var Date = req.body.checkID;
    // 2.连接数据库查询数据

    DB.find('honor',{
        Date:Date,
    },function(err,data){
        if(data.length>0){
            res.render('admin/css',{
                list:data
            })
        }else{
            res.render('admin/css', {
                list: []
            })
            console.log("No matching data for your searched Badge!")
        }
    })
});
router.get('/',function(req,res){

    DB.find('honor',{},function(err,data){

        res.render('css',{
            list:data
        });

    })
});
module.exports = router;