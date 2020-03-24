var express=require('express');
var router = express.Router();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var eml = require('../../emlxj');
var bodyParser = require('body-parser');
// 设置body-parser中间件
router.use(bodyParser.urlencoded({extended:false}));
router.use(bodyParser.json());

var DB = require('../../modules/db.js');


router.post('/search',function(req,res){
    var Date = req.body.Date;
    // 2.连接数据库查询数据
    var map = {01:"Jan",02:"Feb",3:"Mar",4:"Apr",5:"May",6:"Jun",7:"Jul",8:"Aug",9:"Sep",10:"Oct",11:"Nov",12:"Dec"};
    var l =map[Date.split('/')[1]];
    Date =l+" "+Date.split('/')[0];

    DB.find('honor',{
        Date:Date,
    },function(err,data){

        if(data.length>0){
            res.render('admin/product/index',{
                list:data
        })
        }else{
            res.render('admin/product/index', {
                list: []
            });
           console.log("!!there is no match for search date")
        }
    })
});



router.post('/BadgeSearch',function(req,res){
    var Date = req.body.checkID;
    // 2.连接数据库查询数据

    DB.find('honor',{
        Date:Date,
    },function(err,data){


        if(data.length>0){
            res.render('admin/product/index',{
                list:data
            })
        }else{
            res.render('admin/product/index', {
                list: []
            })
            console.log("!!there is no match for search date")
        }
    })
});

router.get('/',function(req,res){

    DB.find('honor',{},function(err,data){

        res.render('admin/product/index',{
            list:data
        });

    })
});


//显示增加商品的页面
router.get('/add',function(req,res){
    res.render('admin/product/add');

});



router.post('/doAdd',function(req,res){
        var caseID = req.body.CaseID;
        var engineer = req.body.Engineer;
        var date = req.body.Date;
        var badge = req.body.checkID;
        var voice = req.body.Voice;
           //取badge路径
        var dic1 = {"1":"/upload/Empathetic.png","2":"/upload/High-quality.png","3":"/upload/Efficient.png","4":"/upload/Resourceful.png","5":"/upload/Communicate Effectively.png"};
                // 获取json数据进行解析
        var myArray=new Array();
        badge = eval(badge)
        var i;
            for (i=0;i<badge.length;i++) {
                myArray.push(dic1[badge[i]])
            }

                 // 2.连接数据库插入数据
        DB.find('honor',{_id:caseID},function (err,data) {
         if(err) {
            console.log('err---find key error');
                         }
                            else if (data[0]) {
                             console.log('err---find key yes');
                         }  else{
                            console.log('err---find key no');
                            DB.insert('honor',{
                           _id:caseID,
                          Engineer:engineer,
                     CustomerVoice:voice,
                  Date:date,
               Badge:myArray
      },function(err,data){
        if(!err){
            res.send({redirect: '/admin/product'});
        }
        });
        }
    })
});

router.get('/edit',function(req,res){
    // 获取get传值id
    var id = req.query.id;
    //取badge路径

    DB.find('honor',{"_id":id},function(err,data){
        if (!err){
            var dic1 = {"/upload/Empathetic.png":"1","/upload/High-quality.png":"2","/upload/Efficient.png":"3","/upload/Resourceful.png":"4","/upload/Communicate Effectively.png":'5'};
            var myArray=new Array();
            var badge = data[0].Badge;
            var i;
            for (i=0;i<badge.length;i++) {
                myArray.push(dic1[badge[i]])
            }
            var setData ={
                Caseid:data[0]._id,
                Engineer:data[0].Engineer,
                CustomerVoice:data[0].CustomerVoice,
                Date:data[0].Date,
                Badge:myArray.toString()
            }
            res.render('admin/product/edit', {
                list: setData
            })
        }else{
            console.log(err);
        }

    });

});

router.post('/ReEdit',function(req,res) {
    var caseID = req.body.CaseID;
    var engineer = req.body.Engineer;
    var date = req.body.Date;
    var badge = req.body.checkID;
    var voice = req.body.Voice;
//取badge路径
    var dic1 = {
        "1": "/upload/Empathetic.png",
        "2": "/upload/High-quality.png",
        "3": "/upload/Efficient.png",
        "4": "/upload/Resourceful.png",
        '5':"/upload/Communicate Effectively.png"
    }
    var myArray = new Array();
    badge = eval(badge)
    var i;
    for (i = 0; i < badge.length; i++) {
        myArray.push(dic1[badge[i]])
    }
    var setData ={
        _id:caseID,
        Engineer:engineer,
        CustomerVoice:voice,
        Date:date,
        Badge:myArray
    }

    DB.update('honor', {"_id": caseID}, setData,
        function (err, data) {
            if (!err) {
                res.send({redirect: '/admin/product'});
            }
            console.log("错误是:" + err);
        });
});

router.get('/delete',function(req,res){
    var id = req.query.id;
    DB.deleteOne('honor',{"_id":id},function(err){
        if(!err){
            res.redirect('/admin/product');
        }
        console.log("删除成功");
    });
    // res.send('productdelete');
});
//delete  file
function delFile(path){
    fs.unlink(path,function(error){
        if(error){
            console.log(error);
            return false;
        }
        console.log('删除eml文件成功');
    })
}

router.post('/file', function(req, res, next) {
    console.log('开始文件上传....');
    var form = new formidable.IncomingForm();
    //设置编辑
    form.encoding = 'utf-8';
    //设置文件存储路径
    form.uploadDir = "public/files/";
    //保留后缀
    form.keepExtensions = true;
    //设置单文件大小限制
    // form.maxFieldsSize = 2 * 1024 * 1024;
    //form.maxFields = 1000;  设置所以文件的大小总和
    //rename upload file
    function rename(oldpath, newpath) {
        fs.rename(oldpath, newpath, function (err) {
            if (err) {
                console.error("改名失败" + err);
            } else {
                console.log("!!!改名成功")
            }
            // res.render('add', { title: '文件上传成功:', imginfo: newfilename });
        });
        //res.end(util.inspect({fields: fields, files: files}));

    }

//解析文件得到obj
    var obj;
    form.parse(req, function (err, fields, files) {
        var t = (new Date()).getTime();
        //生成随机数
        var ran = parseInt(Math.random() * 8999 + 10000);
        //拿到扩展名
        var extname = path.extname(files.thumbnail.name);
        //path.normalize('./path//upload/data/../file/./123.jpg'); 规范格式文件名
        var oldpath = path.normalize(files.thumbnail.path);

        //新的路径
        let newfilename = t + ran + extname;
        var newpath;


        if (extname == '.eml') {
            newpath = 'pythonParseMsg/emlFile/' + newfilename;
            rename(oldpath, newpath);
            obj = eml.parseRawEml(newfilename, "pythonParseMsg/emlFile/");
            delFile(newpath);
        } else if (extname == '.msg') {
            newpath = 'pythonParseMsg/msgFile/' + newfilename;
            rename(oldpath, newpath);
            obj = eml.parseRawMsg('pythonParseMsg/msgFile/', newfilename);
            delFile(newpath);
        }

        var newobj = obj;
        newobj.forEach(function (val,i) {
        var caseID = newobj[i].caseId;
        var engineer = newobj[i].cengineer;
        // var dic1 = {"ZIZHUAN@microsoft.com":"Neil Zhuang","WEXING@microsoft.com":"Wenli Xing","WEYAO@microsoft.com":"Victor Yao","ZHAWAN@microsoft.com":"Grace Wang","ZIXIE@microsoft.com":"Martin Xie","TILA@microsoft.com":"Tianmao Lan"};
        // if (engineer in dic1){
        //     engineer = dic1[engineer];
        //     console.log("true"+engineer);
        // }
            //工程师的名字-邮箱映射查询
        DB.find('Engineer',{"engEmail":engineer},function (err,data) {
            if(!err){
                if(!data[0]){
                }else{
                    engineer = data[0]._id;
                }
            }else{
                console.log(err);
            }

        });
        var voice = newobj[i].customeVoice;
        var date = newobj[i].cdate;
        var myArray = newobj[i].cbadge;
        // 2.连接数据库插入数据
        DB.find('honor', {_id: caseID}, function (err, data) {

            if (err) {
                console.log('err---find key error');
            } else if (data[0]) {
                console.log('err---find key yes');
            } else {
                console.log('err---find key no');
                DB.insert('honor', {
                    _id: caseID,
                    Engineer: engineer,
                    CustomerVoice: voice,
                    Date: date,
                    Badge: myArray
                }, function (err, data) {
                    if (!err) {
                    }
                });
            }
        })
    });
    });
});


/* supervisor ./bin/www  */


module.exports = router;