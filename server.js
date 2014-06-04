var debug = true,                           // debug logging
    ipAddr  = process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1",
    httpPort = process.env.OPENSHIFT_NODEJS_PORT || 8080;
    http = require('http'),                 // http server
    connect = require('connect');           // middleware framework module

// connect app
var app = connect();
app.use(connect.favicon());                    // default fav icon
app.use(connect.static(dir));                  // serve static files
app.use(connect.directory(dir, {icons: true}));// serve directories
app.use(connect.bodyParser());                 // parses post content
app.use(function(req, res){                    // custom URLs
  log('URL', req.url);
  res.end(req.url);
});

var httpServer = http.createServer(app).listen(httpPort, ipAddr);

console.log(new Date() + '\n' 
            + '\x1B[1m'   //style:bright
            + '\x1B[33m'  //color:yellow
            + 'FS directory at: ' + dir + '\n'
            + 'HTTP server at: http://'+ipaddr+':'+httpPort+'/'
            + '\x1B[0m'); //style:reset 
