var express = require('express');
var Mailgunny = require('mailgunny');
var router = express.Router();


var controllers = {

  index: function(req, res, next){
    var context = {};

    res.render("index", context);
  },


}

router.get('/', controllers.index);


module.exports = router;
