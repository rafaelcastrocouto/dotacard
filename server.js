var http = require('http'),
  url = require('url'),
  fs = require('fs'),
  serveStatic = require('serve-static'),
  host = process.env.HOST,
  port = process.env.PORT || 5000,
  waiting = {id: 'none'},
  waitTimeout,
  chat = [],
  debug = false,
  waitLimit = 10,
  permDataFile = 'client/json/data.json',
  permData;

fs.readFile(permDataFile, 'utf8', function (err, data) {
  permData = JSON.parse(data);
});

var db = {
  data: {},
  get: function(name, cb){cb(db.data[name] || '');},
  set: function(name, val, cb){cb(db.data[name] = val);}
};
var send = function(response, data){
  response.statusCode = 200;
  response.end( String(data) );
};
var setHeaders = function (response) {
  response.setHeader('Access-Control-Allow-Origin', 'http://rafaelcastrocouto.github.io');
};
var clientServer = serveStatic('client', {
  'index': ['index.html', 'index.htm'], 
  'setHeaders': setHeaders
});
var rootServer = serveStatic(__dirname, {
  'setHeaders': setHeaders
});
var clearWait = function () {
  clearTimeout(waitTimeout);
  waiting = {id: 'none'};
};
var writeData = function () {
  var writeStream = fs.createWriteStream(permDataFile);
  writeStream.write(JSON.stringify(permData));
  writeStream.end();
};
http.createServer(function(request, response) {
  setHeaders(response);
  var urlObj = url.parse(request.url, true);
  var pathname = urlObj.pathname; // console.log('pathname: '+pathname);
  if (request.headers['x-forwarded-proto'] === 'https'){
    response.writeHead(302, {'Location': 'http://dotacard.herokuapp.com/'});
    response.end();
    return;
  }
  if (pathname[0] === '/') { pathname = pathname.slice(1); }
  if (pathname === 'db') {
    response.setHeader('Content-Type', 'application/json');
    var query = urlObj.query; // console.log('query: '+ (query.set || query.get));
    if (query.set){ //console.log('set: '+ query.set);
      switch (query.set) {
        case 'waiting':
          if (waiting.id === 'none'){
            //console.log('Player' + waiting);
            send(response, JSON.stringify(waiting));
            waiting = query.data;
            waitTimeout = setTimeout(clearWait, waitLimit * 1000);
          } else {
            //console.log('Online game started');
            send(response, waiting);
            clearWait();
          }
          return;
        case 'back': //console.log('Choose back click')
          //console.log(query.data.id, waiting.id)
          if (query.data.id == waiting.id) {
            clearWait();
          }
          send(response, JSON.stringify(waiting));
          return;
        case 'chat':
          var msg = {
            data: query.data.substring(0, 36), 
            user: query.user.substring(0, 24),
            date: query.date
          };
          chat.unshift(msg);
          chat = chat.slice(0, 3);
          send(response, JSON.stringify({messages: chat}));
          return;
        case 'poll':
          if (typeof(permData.poll[query.data]) == 'number') permData.poll[query.data]++;
          send(response, JSON.stringify(permData.poll));
          writeData();
          return;
        default: //console.log('set', query.data)
          db.set(query.set, query.data, function(data){
            send(response, data);
          });
          return;
      }
    } else if (query.get) { //console.log('get: '+ query.get);
      switch (query.get) {
        case 'server':
          send(response, JSON.stringify({status: 'online'}));
          return;
        case 'chat':
          send(response, JSON.stringify({messages: chat}));
          return;
        case 'lang':
          send(response, JSON.stringify({lang: request.headers['accept-language'] || ''})); 
          return;
        case 'waiting':
          send(response, JSON.stringify(waiting));
          return;
        default:
          db.get(query.get, function(data) {
            send(response, data); //console.log('get', data) 
          });
          return;
      }
    } else {
      send(response, '{"msg": "DotaCard DB working!"}');
      return;
    }
  } else { //STATIC
    clientServer(request, response, function onNext(err) {
      rootServer(request, response, function onNext(err) {
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/html; charset=UTF-8');
        fs.createReadStream('client/404.html').pipe(response);
      });
    });
  }
}).listen(port, host);

console.log(new Date().toLocaleString() + ' DOTACARD server running at: http://'+(host || 'localhost')+(port === '80' ? '/' : ':'+port+'/') );
