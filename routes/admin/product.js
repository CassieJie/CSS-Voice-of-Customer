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
    var map = {"01":"Jan","02":"Feb","03":"Mar","04":"Apr","05":"May","06":"Jun","07":"Jul","08":"Aug","09":"Sep","10":"Oct","11":"Nov","12":"Dec"};
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
           console.log("No matching data for your searched Date!")
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
            console.log("No matching data for your searched Badge!")
        }
    })
});

router.get('/',function(req,res){

    DB.findSort('honor',function(err,data){

        res.render('admin/product/index',{
            list:data
        });
    })
});


//add页面
router.get('/add',function(req,res){
    DB.find('engineer',{},function(err,data){

        res.render('admin/product/add',{
            list:data
        });
});
});

/* Add Story */
router.post('/addStory',function(req,res){
    var caseID = req.body.CaseID;
    var tag = req.body.Tag;
    var engineer = req.body.Engineer;
    var date = req.body.Date;
    var badge = req.body.Badge;
    var voice = req.body.Voice;
    var story = req.body.Story;
    var split0 = date.split(' - ')[0];

    // var map = {"Jan":"01","Feb":"02","Mar":"03","Apr":"04","May":"05","Jun":"06","Jul":"07","Aug":"08","Sep":"09","Oct":"10","Nov":"11","Dec":"12"};
    var sdate = split0.split('-')[2]+split0.split('-')[0]+split0.split('-')[1];
    console.log("---date is"+date+";sdate is"+sdate);
    //map badge number-path
    var i;
    var myArray = new Array();
    var dic1 = {
        "1":"/upload/Empathetic.png",
        "2":"/upload/High Quality.png",
        "3":"/upload/Efficient.png",
        "4":"/upload/Resourceful.png",
        "5":"/upload/Communicate Effectively.png",
        '6':"/upload/Accountable.png"
    };
    badge = eval(badge);
    for (i=0;i<badge.length;i++) {
        myArray.push(dic1[badge[i]])
    }
    // connect datdabase
    DB.find('story',{_id:caseID},function (err,data) {

        if(err) {
            console.log('err---find key error');
        }else if (data[0]) {
                console.log('err---find key of story repeat');
                res.send({repeat: 'yes'});
            }else{
                console.log('find key of story not exist');
                DB.insert('story',{
                _id:caseID,               //主键caseID
                Tag:tag,
                Engineer:engineer,
                CustomerVoice:voice,
                Date:date,
                sortDate:sdate,
                Badge:myArray,
                Story:story
            },function(err,data){
                if(!err){
                    res.send({result: 'success'});
                }
            });
        }

    });
});


router.post('/doAdd',function(req,res){
        var caseID = req.body.CaseID;
        var engineer = req.body.Engineer;
        var date = req.body.Date;
        var badge = req.body.checkID;
        var voice = req.body.Voice;
        var map = {"Jan":"01","Feb":"02","Mar":"03","Apr":"04","May":"05","Jun":"06","Jul":"07","Aug":"08","Sep":"09","Oct":"10","Nov":"11","Dec":"12"};
        var l = map[date.split(' ')[0]];

        var sdate =[date.split(' ')[1]]+l;
           //取badge路径
        var dic1 = {"1":"/upload/Empathetic.png","2":"/upload/High Quality.png","3":"/upload/Efficient.png","4":"/upload/Resourceful.png","5":"/upload/Communicate Effectively.png","6":"/upload/Accountable.png"};
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
            console.log('err---find key of case error');
                         }
                            else if (data[0]) {
                             console.log('find key of case repeat');
             res.send({repeat: 'yes'});
                         }  else{
                            console.log('find key of case not exist');
                            DB.insert('honor',{
                           _id:caseID,
                          Engineer:engineer,
                     CustomerVoice:voice,
                  Date:date,
               Badge:myArray,
               sortDate:sdate
      },function(err,data){
        if(!err){
            res.send({result: 'success'});
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
            var dic1 = {"/upload/Empathetic.png":"1","/upload/High Quality.png":"2","/upload/Efficient.png":"3","/upload/Resourceful.png":"4","/upload/Communicate Effectively.png":'5',"/upload/Accountable.png":'6'};
            var myArray=new Array();
            var badge = data[0].Badge;
            var i;
            for (i=0;i<badge.length;i++) {
                myArray.push(dic1[badge[i]])
            }
            var date = data[0].Date;

            var map = {"Jan":"01","Feb":"02","Mar":"03","Apr":"04","May":"05","Jun":"06","Jul":"07","Aug":"08","Sep":"09","Oct":"10","Nov":"11","Dec":"12"};
            var l = map[date.split(' ')[0]];

            date =date.split(' ')[1]+"/"+l;

            var setData ={
                Caseid:data[0]._id,
                Engineer:data[0].Engineer,
                CustomerVoice:data[0].CustomerVoice,
                Date:date,
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
        "2": "/upload/High Quality.png",
        "3": "/upload/Efficient.png",
        "4": "/upload/Resourceful.png",
        '5':"/upload/Communicate Effectively.png",
        '6':"/upload/Accountable.png"
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
            console.log("update honor: err is" + err);
        });
});

router.get('/delete',function(req,res){
    var id = req.query.id;
    DB.deleteOne('honor',{"_id":id},function(err){
        if(!err){
            res.redirect('/admin/product');
        }
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
    })
}
// function rename(oldp, newp) {
//     fs.rename(oldp, newp, function (err) {
//         if (err) {
//             console.error("改名失败" + err);
//         } else {
//             console.log("!!!改名成功")
//         }
//         // res.render('add', { title: '文件上传成功:', imginfo: newfilename });
//     });
//     //res.end(util.inspect({fields: fields, files: files}));
// }
function rename(oldp, newp) {
    fs.renameSync(oldp, newp);
    }

var outerr;
router.post('/file', function(req, res, next) {
    var form = new formidable.IncomingForm();
    //设置编辑
    form.encoding = 'utf-8';
    //设置文件存储路径
    form.uploadDir = "public\\files\\";
    //保留后缀
    form.keepExtensions = true;


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
        var result;

        if (extname == '.eml') {
            newpath = 'pythonParseMsg/emlFile/' + newfilename;
            rename(oldpath, newpath);
            obj = eml.parseRawEml(newfilename, "pythonParseMsg/emlFile/");
            delFile(newpath);
        } else if (extname == '.msg') {
            newpath = 'pythonParseMsg/msgFile/' + newfilename;
            rename(oldpath, newpath);
            try{
                console.log("--------------------------into try catch block---------------------");
                result = eml.parseRawMsg('pythonParseMsg/msgFile/', newfilename); 
                console.log("--------result[0]"+result[0]+"--------result1"+result[1]);
                if(result[0] === null && !(result[1] === null)){
                    var newobj = result[1];
                    //循环
                    newobj.forEach(function (val,i) {
                    var caseID = newobj[i].caseId;
                    var engineer = newobj[i].cengineer;
                    engineer = engineer.toLowerCase();
                        //工程师的名字-邮箱映射查询
                    DB.find('engineer',{"engEmail":engineer},function (err,data) {
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
                    console.log("HI here date is"+date);
                    var myArray = newobj[i].cbadge;
                    var map = {"Jan":"01","Feb":"02","Mar":"03","Apr":"04","May":"05","Jun":"06","Jul":"07","Aug":"08","Sep":"09","Oct":"10","Nov":"11","Dec":"12"};
                    var l = map[date.split(' ')[0]];
                    var sdate =[date.split(' ')[1]]+l;
                    console.log("--------------------------caseID"+caseID);
                    // 2.连接数据库插入数据
                    DB.find('honor', {_id: caseID}, function (err, data) {
            
                        if (err) {
                            console.log('err---find key error'+err);
                            res.send('insert case to DB error');  
                        }else if(data[0]){
                            console.log('err---find key yes');
                            res.send('Duplicate caseID！');  
                        }else {
                                console.log('err---find key no');
                                DB.insert('honor', {
                                    _id: caseID,
                                    Engineer: engineer,
                                    CustomerVoice: voice,
                                    Date: date,
                                    Badge: myArray,
                                    sortDate:sdate
                                }, function (err, data) {
                                    if (err) {
                                    console.log(err);
                                    }else{
                                        res.send('Upload and parse email successfully！');  
                                    }
                                });
                            }
                    })
                    });
                    
                }else{
                    res.send('Upload and parse email failed！');
                }                
            }catch(err){
                console.log("----Parse error--"+err);
                res.send('Upload and parse email failed！');
            } 
            delFile(newpath);
        }
    });    
});


/* supervisor ./bin/www  */


module.exports = router;