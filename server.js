var http = require('http'),
    url = require('url'),
    fs = require('fs'),
    serveStatic = require('serve-static'),
    setHeaders = function (response) {
      response.setHeader('Access-Control-Allow-Origin', 'http://rafaelcastrocouto.github.io');
    },
    clientServer = serveStatic('client', {'index': ['index.html', 'index.htm'], 'setHeaders': setHeaders}),
    rootServer = serveStatic(__dirname, {'setHeaders': setHeaders}),
    host = process.env.HOST,
    port = process.env.PORT || 5000,
    waiting = {id: 'none'},
    currentData = {},
    db = {
      get: function(name, cb){cb(currentData[name]||'');},
      set: function(name, val, cb){currentData[name] = val; cb(true);}
    },
    chat = [],
    debug = false,
    send = function(response, data){
      response.statusCode = 200;
      response.end( String(data) );
    };

http.createServer(function(request, response) {
  setHeaders(response);
  var urlObj = url.parse(request.url, true);
  var pathname = urlObj.pathname;
  if(request.headers['x-forwarded-proto'] === 'https'){
    response.writeHead(302, {'Location': 'http://dotacard.herokuapp.com/'});
    response.end();
    return;
  }
  console.log('request: '+pathname);
  if(pathname[0] === '/') { pathname = pathname.slice(1); }
  if(pathname === 'db') {
    response.setHeader('Content-Type', 'application/json');
    var query = urlObj.query;
    if(query.set){
      //console.log('set: '+ query.set);
      //WAITING
      if(query.set === 'waiting'){
        if(waiting.id === 'none'){
          waiting = query.data;
          console.log('Player' + waiting);
          send(response, waiting);
          return;
        } else {
          console.log('Online game started');
          send(response, waiting);
          waiting = {id: 'none'};
          return;
        }
      } //CHAT
      else if(query.set === 'chat'){
        var msg = query.data;
        msg = msg.substring(0, 42);
        chat.unshift(msg);
        chat = chat.slice(0, 240);
        send(response, JSON.stringify({messages: chat}));
        return;
      } //DEFAULT SET
      else { 
        db.set(query.set, query.data, function(data){
          send(response, data);
        });
        return;
      }
    } else if (query.get){
      //console.log('get: '+ query.get);
      //STATUS
      if(query.get === 'server') { 
        send(response, JSON.stringify({status: 'online'})); 
        return;
      }
      //CHAT
      if(query.get === 'chat') { 
        send(response, JSON.stringify({messages: chat}));
        return;
      }
      //LANGUAGE
      if(query.get === 'lang') { 
        send(response, JSON.stringify({lang: request.headers['accept-language']})); 
        return;
      }
      //DEFAULT GET
      db.get(query.get, function(data){ send(response, data); });
      return;
      //DB CHECK
    } else { 
      send(response, 'Db works!');
      return;
    }
  }
  else { //STATIC
    clientServer(request, response, function onNext(err) {
      rootServer(request, response, function onNext(err) {
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/html; charset=UTF-8');
        fs.createReadStream('client/404.html').pipe(response);
      });
    });
  }
}).listen(port, host);

var d = new Date();
console.log(
  d.toLocaleDateString() + ' ' + d.toLocaleTimeString() + ' ' +
  'DOTACARD server running at: http://'+(host || 'localhost')+(port === '80' ? '/' : ':'+port+'/')
);
