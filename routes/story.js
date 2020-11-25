var express = require('express');
var router = express.Router();
// var DB = require('../bin/db');
var DB = require('../modules/db.js');

/* GET home page. */
router.get('/',function(req,res){ 
  DB.findSort('story', function (err, data) {
    // console.log("data.")
      res.render('timestory', {
          list:data
      })
  })
});



module.exports = router;
