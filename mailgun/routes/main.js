var express = require('express');
var Mailgunny = require('mailgunny');
var router = express.Router();


var controllers = {

  index: function(req, res, next){
    var context = {};

    res.render("index", context);
  },

	sendMail: function(req, res, next){

		var correo = req.body.correo;
		console.log(correo);

    var mail = new Mailgunny({
      domain: 'brounieapps.com',
      key: 'key-21c7e8594275cf82882064cebb71aa52'
    });

    mail.send({
      from: 'robot@brounie.com',
      to: ['rudy@brounie.com'],
      subject: 'Prueba',
      html: "<p>Correo es:</p>" +" "+correo 
    },function(error, body){
        console.log(error);
        res.redirect("/");
    });
		res.redirect("/");
  }

}

router.get('/', controllers.index);
router.post('/sendMail', controllers.sendMail);

module.exports = router;
