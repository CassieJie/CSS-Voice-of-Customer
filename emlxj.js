//Read ems file
var fs = require('fs');
var emlformat = require('eml-format');
var exec = require('child_process').execSync;
//delete  file
function delFile(path){
    fs.unlink(path,function(error){
        if(error){
            console.log(error);
            return false;
        }
    })
}

function Case(id,engineer,date,badge,voice){
    this.caseId = id;
    this.cengineer = engineer;
    this.cdate = date;
    this.cbadge = badge;
    this.customeVoice = voice;
}
//eml????
function parseRawEml(fileName,path) {
    var eml = fs.readFileSync(path+fileName, "utf-8");

    emlformat.parse(eml, function(error, data) {
        if (error) return console.log(error);
            //write to json
            fs.writeFileSync(path+'json/'+fileName+".json", JSON.stringify(data, " ", 2));
    });

//Read json file and extract html
   var data = fs.readFileSync(path+'json/'+fileName+".json","utf-8");
        //js????
        var jsObject = JSON.parse(data);
        //get header
        var header = jsObject.headers;
        //engineer
        var str1 = header.To;
        var engName = str1.replace(/\s<.*>$/g,"");
        //Date
        str1 = header.Date;
        var dat = str1.match(/\b[A-Z][a-z]{2}\b\s\d{4}/g).toString();
        //get body
        var body = jsObject.body[0].part.body[1].part.body;

        body=body.replace(/=\r\n/g,"");
        body=body.replace('/\=[\s]+/gm',"");

        body=body.replace(/\r\n/g," ");
        // fs.writeFileSync('3.json',body);
        //????caseid??λ????
        var pagraph = body.match(/<font class=[3D]*"verbatimtext">'.*\s[0-9]{15}<\/p>/g).toString();
        var s = pagraph.split(/<\/p>/g);
//????Case????
        var jarry = new Array();
//????paragraph
        for (var i=0;i<s.length-1;i++){
            var st1 = JSON.stringify(s[i]);
            console.log("!!!!input the st1----"+ st1);
            //CaseID
            var id = st1.match(/SR\s\d{15}/g).toString();
            //voice
            var voice = null;
            if (st1.match(/Microsoft Translator - English/g)){
                var midstring = st1.split('<br>')[1];
                voice = midstring.split('Microsoft Translator - English: ')[1];
            } else{
                // voice = st1.match(/'[\w|.|,|\s|{|}]+'/g).toString();
                voice = st1.match(/'[\w\s.&\-_;{},|]+'/g).toString();
                voice = voice.slice(1,-1);

            }
            var mid = st1.match(/<font color=[3D]*\\"#[\w\s=]*\\">([\s\w=])+</g).toString();
            var badge = mid.match(/>[\w\s=]*</g);
            for (let j = 0; j < badge.length; j++) {
                badge[j]="upload/"+badge[j].slice(1,-1)+".png";
            }
            var obj1 = new Case(id,engName,dat,badge,voice);
            jarry.push(obj1);

        }
    delFile(path+'json/'+fileName+".json");
    return jarry;
}

//????
// parseRawEml("1.eml","./pythonParseMsg/emlFile/");


// ????????n???
function pythonParseMsg(path1,path2) {
    exec('python '+path1+' '+path2,function(error,stdout,stderr){
        if(error) {
            console.info('stderr : '+stderr);
        }
        console.log('exec: ' + stdout);
    });
}
//??????????β???
function trimStr(str){
    return str.replace(/(^\s*)|(\s*$)/g,"");
}
//msg????
function parseRawMsg(path1,filename) {

    pythonParseMsg("./pythonParseMsg/outlookmsgfile.py",path1+filename);
    var path2 = './pythonParseMsg/msgFile/emlOutPut/';
    var eml = fs.readFileSync(path2 + filename + '.eml', "utf-8");
    //eml to json
    var path3 = './pythonParseMsg/msgFile/json/';
    emlformat.parse(eml, function (error, data) {
        if (error) return console.log(error);
        fs.writeFileSync(path3 + filename + ".json", JSON.stringify(data, " ", 2));
    });
    delFile(path2 + filename + '.eml');
    //sync
    var data =  fs.readFileSync(path3 + filename + ".json","utf-8");

    //js????
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
    body = body.replace(/=\r\n/g, "");
    body = body.replace('/\=[\s]+/gm', "");
    body = body.replace(/\r\n/g, " ");
    fs.writeFileSync('3.json', body);
    var newarr = new Array();
    //????caseid??λ????
     var pagraph = body.split(/\s'|\s"/g);

    if (body.match(/Microsoft Translator/g)){
        pagraph = pagraph.slice(2);
        for(let i = 0;i<pagraph.length;i++){
            if(pagraph[i].match(/^=.+/g)){
                console.log(pagraph[i]);
            }else{
                newarr.push(pagraph[i]);
            }
        }
    }else{
        newarr = pagraph.slice(1);  //?????????
    }

    var id,voice,badgeCopy;
    var badge= new Array();
    var obj1;
    function parseSpecial1(newarr) {     //newly updated on 19/05/2020 ; for parsing voice have ( ');
    //parse caseid
    id = newarr[1].match(/SR\s\d{15}/g).toString();
    //parse voice
    voice = newarr[0];
    //parse badge
    var mid = newarr[1].match(/\s[\w\s|]*\sSR/g);
    mid = mid[0].split(' SR')[0];
    var mid2 = mid.split('|');
    mid2.forEach(function (val,index) {
        val = trimStr(val);
        badge[index] ="upload/"+ val+".png";
    });
        badgeCopy = badge.slice(0);
}
    function parseNormal(st1){
        //caseid
    id = st1.match(/SR\s\d{15}/g).toString();
    //voice
    voice = st1.match(/^.*['"]\s/g);
    voice = voice[0].split(/\.['\"]/g)[0];
    //badge
    var mid = st1.match(/\s[\w\s|]*\sSR/g);
    mid = mid[0].split(' SR')[0];
    var mid2 = mid.split('|');
    mid2.forEach(function (val,index) {
        val = trimStr(val);
        badge[index] ="upload/"+ val+".png";
    });
    badgeCopy = badge.slice(0);
}

    //����paragraph
    var jarray = new Array();
    for (var i = 0; i < newarr.length; i++) {
        var st1 = newarr[i];
        console.log("-----newarr.length="+newarr.length+"-----i="+i+"-----st1="+st1)
        //CaseID
        if(st1.match(/SR\s\d{15}/g)){
            parseNormal(st1);
            obj1 = new Case(id, engName, dat, badgeCopy, voice);
            jarray.push(obj1);
        }else{
            parseSpecial1(newarr);
            obj1 = new Case(id, engName, dat, badgeCopy, voice);
            jarray.push(obj1);
            break;
        }
    }
    
    console.log("!-------"+jarray.length);
    delFile(path3 + filename + ".json");
    return jarray;
}

module.exports = {parseRawEml,parseRawMsg};