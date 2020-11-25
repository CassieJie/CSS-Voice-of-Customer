var express=require('express');
var fd = require('formidable');
var fs = require('fs');
var https = require('https');
//引入模块
var admin =require('./routes/admin.js');
var index =require('./routes/index.js');
var storyRouter = require('./routes/story');
// var email = require('./routes/email_parse.js');
// var eml = require('./emlxj');

//PARSE EMAIL
// function test(){
//     console.log("调用了app的parse方法");
//     eml.parseRawEml("1.eml","pythonParseMsg/emlFile/");
//     eml.parseRawMsg('vy.msg');
// }
// test();


//创建管理员账号
var DB = require('./modules/db.js');

DB.insert('user',{
    _id:"admin",
    password:"cssadmin"
},function(err,data){
});


var app=new express(); 
var options = {
    key:fs.readFileSync('./keys/privatekey.pem'),
    cert:fs.readFileSync('./keys/crt.pem')
}
var httpsServer = https.createServer(options,app);

// session保存用户信息
var session = require("express-session");
//配置中间件  固定格式
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge:1000*60*30
    },
    rolling:true
}));

//使用ejs模板引擎   默认找views这个目录
app.set('view engine','ejs');


//配置public目录-静态资源目录
app.use(express.static('public'));
app.use('/upload',express.static('upload'));
app.use('/',index);
app.use('/admin',admin);
app.use('/story', storyRouter);

<<<<<<< Updated upstream
app.disable('view cache');

=======
app.listen(80,'cssdevhonors');
// httpsServer.listen(443, 'cssdevhonors');
>>>>>>> Stashed changes

// httpsServer.listen(443, 'CassieJie-surface');
app.listen(80,'127.0.0.1');

