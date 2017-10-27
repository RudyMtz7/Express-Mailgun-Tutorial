// Example express application adding the parse-server module to expose Parse
// compatible API routes.
var os  = require('os');
var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var GCSAdapter = require('parse-server-gcs-adapter');
var SimpleSendGridAdapter = require('parse-server-sendgrid-adapter');
var ParseDashboard = require('parse-dashboard');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/main');
var users = require('./routes/users');

var databaseUri = process.env.DATABASE_URI || process.env.MONGOLAB_URI;


if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

APP_ID = 'BrounieApp';
MASTER_KEY = "C4suYZKkyRMYPGR7fEae";
APP_NAME = "ConstruCompara";
serverURL = "https://construcompara.brounieapps.com/parse";

TAG = APP_ID + ":" + os.hostname();
var dd_options = {
  'response_code':true,
  'tags': [TAG]
}

var connect_datadog = require('connect-datadog')(dd_options);
var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
  // cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || APP_ID,
  masterKey: process.env.MASTER_KEY || MASTER_KEY, //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || serverURL,  // Don't forget to change to https if needed
  filesAdapter: new GCSAdapter(
      "parse-serf",
      "key.json",
      "parsefiles",
      {directAccess: true}
  ),
  sessionLength : 31536000 * 2, // 1 Year in seconds
  verbose : false,
  emailAdapter: {
         module: 'parse-server-simple-mailgun-adapter',
         options: {
           // The address that your emails come from
           fromAddress: 'robot@brounieapps.com',
           // Your domain from mailgun.com
           domain: 'brounieapps.com',
           // Your API key from mailgun.com
           apiKey: 'key-21c7e8594275cf82882064cebb71aa52',
         }
  }

});

var allowInsecureHTTP = true;

var dashboard = new ParseDashboard({
  "apps": [
    {
      "serverURL": serverURL,
      "appId": APP_ID,
      "masterKey": MASTER_KEY,
      "appName": APP_NAME
    },
  ],
  "users": [
      {
        "user":"admin",
        "pass":"cliente"
      }
    ]
},allowInsecureHTTP);


var app = express();
app.use('/dashboard', dashboard);

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(connect_datadog);
app.use(mountPath, api);
app.enabled('trust proxy')
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.error(err);
  res.send(err);
});

var httpServer = require('http').createServer(app);



var port = process.env.PORT || 8080;
app.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});
