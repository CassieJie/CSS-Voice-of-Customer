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
        var id;
        
//????paragraph
        for (var i=0;i<s.length-1;i++){
            var st1 = JSON.stringify(s[i]);
            //CaseID
            if (st1.match(/SR\s\d{15}/g)){
               id = st1.match(/SR\s\d{15}/g).toString();
            }else{
                id = st1.match(/Reference ID\s\d{1,16}/g).toString();
            }
            
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
    var flag = true;
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
    //  var pagraph = body.split(/\s'|\s"/g); //old
    // var pagraph = body.split(/=20   =20/g);   //the num of space maybe cause error, need check
    var pagraph = body.split(/autoSubmit=3Dtrue>/g);
    console.log("DEBUGG----pagraph:"+pagraph); 
    
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
        newarr = pagraph.slice(1);  
    }

    var id,voice,badgeCopy;
    var badge= new Array();
    var obj1;

    //����paragraph
    var jarray = new Array();
    for (var i = 0; i < newarr.length; i++) {
        var st1 = newarr[i];
        //CaseID
        // if(st1.match(/SR\s\d{15}/g)){
        //     parseNormal(st1);
        //     obj1 = new Case(id, engName, dat, badgeCopy, voice);
        //     jarray.push(obj1);
        // }else 
        if(st1.match(/Reference ID\s\d{1,16}/g)){    //if case number begin as Reference ID
            try{
                console.log("DEBUGG----ST1:"+st1);
                parseSpecial1(st1);  
                obj1 = new Case(id, engName, dat, badgeCopy, voice);
                jarray.push(obj1);
            }catch(err){
                console.log("---parse special1 error:---"+err);
                flag = false;
            }
           
        //     break;
        // }else{
        //     parseSpecial2(newarr);
        //     obj1 = new Case(id, engName, dat, badgeCopy, voice);
        //     jarray.push(obj1);
        //     break;
        }else{
            console.log("---st1 is:---"+st1);
        }
    }
    /*****raw function for paser id,badge... 
   ****/
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

    /*****newly updated on 15/04/2021 ;
 *  for parsing new form of Reference ID;
 ****/
     function parseSpecial1(param) {     
        //voice
        // voice = param.match(/^.*['"]\s/g);
        // voice = voice[0].split(/\.['\"]/g)[0];
        voice = param.split(/=20\s*=20/g);  
        voice = voice[1].split('Have feedback about these notifications?');
        voice = voice[0].split(/\.\s*['\"]/g)[0];
        console.log("DEBUGG---voice:"+voice);
         //caseid 
        id = param.match(/Reference ID\s\d{1,16}/g).toString();       
        //badge
        var mid = param.match(/\s[\w\s|]*\sReference/g);
        mid = mid[0].split(' Reference')[0];
        var mid2 = mid.split('|');
        mid2.forEach(function (val,index) {
            val = trimStr(val);
            badge[index] ="upload/"+ val+".png";
        });
        badgeCopy = badge.slice(0);
     }
     
/*****newly updated on 19/05/2020 ; 
   for parsing voice have ( '); 
   ****/
    function parseSpecial2(newarr) {     
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
       
var outerr;
console.log("---flag---"+flag);
if (flag == true){
    delFile(path3 + filename + ".json");
    outerr = null;
    var result = new Array(outerr, jarray);
    return result;
}else{
    delFile(path3 + filename + ".json");
    outerr = "parse msg failed";
    var result = new Array(outerr, null);
    return result;
}
   
}

module.exports = {parseRawEml,parseRawMsg};