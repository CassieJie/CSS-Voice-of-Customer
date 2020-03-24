var express=require('express');
var router = express.Router();
var bodyParser = require('body-parser');
// 设置body-parser中间件
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());

var DB = require('../../modules/db.js');

router.get('/addEngineer',function (req,res,next) {
    // res.render('admin/product/addEngineer');
    DB.find('engineer', {}, function (err, data) {
    if(!err){
        res.render('admin/engineer/index', {
            list: data
        });
    }
    });
});

router.post('/doAddEngineer',function (req,res,next) {

    console.log("name is" + req.body.engineerName);
    console.log("email is" + req.body.engineerEmail);
    var engiName = req.body.engineerName;
    var engiEmail = req.body.engineerEmail;

    // 2.连接数据库插入数据
    DB.find('engineer', {_id: engiName}, function (err, data) {
        // console.log("data 是:"+ data[0])
        if (err) {
            console.log('err---find key error');
        } else if (data[0]) {
            console.log('err---find key yes');
        } else {
            console.log('err---find key no');
            DB.insert('engineer', {
                _id: engiName,
                engEmail: engiEmail

            }, function (err, data) {
                if (!err) {
                    console.log('Add Engineer success!');
                    res.redirect('/admin/engineer/addEngineer');
                }
            });
        }
    })
});

router.get('/delete',function (req,res,next) {

    console.log("name is" + req.query.id);
    var id = req.query.id;
    DB.deleteOne('engineer',{"_id":id},function(err){
        if(!err){
            console.log("删除成功");
            res.redirect('/admin/engineer/addEngineer');
        }

    });

});

module.exports = router;