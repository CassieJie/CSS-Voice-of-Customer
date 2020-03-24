//Read msg file
var fs = require('fs');
var emlformat = require('eml-format');
const exec = require('child_process').exec;
// 异步执行

function pythonParseMsg(path1,path2) {
    exec('python3.7 '+path1+' '+path2,function(error,stdout,stderr){
        if(error) {
            console.info('stderr : '+stderr);
        }
        console.log('exec: ' + stdout);
    });

    console.log("finish parse" );

}


function parseRawMsg(filename) {

    pythonParseMsg("./pythonParseMsg/outlookmsgfile.py","./pythonParseMsg/msgFile/*.msg");

    var path2 = './pythonParseMsg/msgFile/emlOutPut/';
    var eml = fs.readFileSync(path2 + filename + '.eml', "utf-8");
    //eml to json
    var path3 = './pythonParseMsg/msgFile/json/';
    emlformat.parse(eml, function (error, data) {
        if (error) return console.log(error);
         fs.writeFileSync(path3 + filename + ".json", JSON.stringify(data, " ", 2));
    });

//Read json file and extract html
    fs.readFile(path3 + filename + ".json", function (err, data) {
        if (err) {
            return console.error(err);
        }
        //js对象
        var jsObject = JSON.parse(data);
        //get header
        var header = jsObject.headers;
        //engineer
        var str1 = header.To;
        var engName = str1.replace(/\s<.*>$/g, "");
        //Date
        str1 = header.Date;
        var dat = str1.match(/\b[A-Z][a-z]{2}\b\s\d{4}/g).toString();

        //get body
        var body = jsObject.body[0].part.body;
        // body=body.replace(/\r\n/g," ");
        body = body.replace(/=\r\n/g, "");
        body = body.replace('/\=[\s]+/gm', "");

        body = body.replace(/\r\n/g, " ");
        fs.writeFileSync('3.json', body);
        //根据caseid定位段落
        // var pagraph = body.match(/'.*SR.*/g).toString();
        var pagraph = body.split(/\s'/g);
        pagraph = pagraph.slice(1);  //去第一个元素

        // fs.writeFileSync('2.txt',pagraph);

//构造Case对象
        function Case(id, engineer, date, badge, voice) {
            this.caseId = id;
            this.cengineer = engineer;
            this.cdate = date;
            this.cbadge = badge;
            this.customeVoice = voice;
        }

//处理paragraph
        for (var i = 0; i < pagraph.length; i++) {
            st1 = pagraph[i];
            //CaseID
            var id = st1.match(/SR\s\d{15}/g).toString();
            //voice
            var voice = null;
            // if (st1.match(/Microsoft Translator - English/g)){
            //     var midstring = st1.split('<br>')[1];
            //     voice = midstring.split('Microsoft Translator - English: ')[1];
            //     console.log("voice is-----"+voice);
            // } else{
            voice = st1.match(/^.*'\s/g);
            // voice = voice.slice(1,-1);
            // }
            //badge
            var mid = st1.match(/\s[\w\s|]*\sSR/g);
            mid = mid[0].split(' SR')[0];

            //  for (let j = 0; j < badge.length; j++) {
            //      // if(badge[j].match(/[=\s]+/g)){
            //      //     badge[j]=badge[j].replace(/=\s/g,'')
            //      // }
            //       badge[j]=badge[j].slice(1,-1)
            // }
            var badge = mid.slice(1);
            var obj1 = new Case(id, engName, dat, badge, voice);
            console.log("obj is :" + JSON.stringify(obj1, null, 4));
        }
    });
}

parseRawMsg('vy.msg');

//Read eml file