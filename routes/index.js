var express=require('express');
var router = express.Router();

var bodyParser = require('body-parser');
// 设置body-parser中间件
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());

var DB = require('../modules/db.js');


router.post('/search',function(req,res){
    // var Date = req.body.Date;
    //
    // // 2.连接数据库查询数据
    // if (Date == "") {
    //     DB.find('honor', {}, function (err, data) {
    //         res.render('css', {
    //             list: data
    //         })
    //     })
    // }
    // else {
    //     var map = {"01":"Jan","02":"Feb","03":"Mar","04":"Apr","05":"May","06":"Jun","07":"Jul","08":"Aug","09":"Sep","10":"Oct","11":"Nov","12":"Dec"};
    //     var l =map[Date.split('/')[1]];
    //     Date =l+" "+Date.split('/')[0];
    //
    //     DB.find('honor', {
    //         Date: Date,
    //     }, function (err, data) {
    //         if (data.length > 0) {
    //             res.render('css', {
    //                 list: data
    //             })
    //         } else {
    //             res.send("There is no match for search date");
    //         }
    //     })
    // }

    //ID
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
                res.send("There is no match for search id");
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
            console.log("!!there is no match for search badge")
        }
    })
});
router.get('/',function(req,res){

    DB.find('honor',{},function(err,data){
        // var i;
        // for (i=0;i<data.length;i++){
        //     console.log(data[i].Badge)
        //     console.log(data[i]._id)
        // }

        res.render('css',{
            list:data
        });

    })
});
module.exports = router;