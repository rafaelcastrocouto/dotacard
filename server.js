/* by rafælcastrocouto */
/*jslint node: true, white: true, sloppy: true, vars: true */
/*global console */

var http = require('http'),
    url = require('url'),
    fs = require('fs'),    
    serveStatic = require('serve-static'),
    clientServer = serveStatic('client', {'index': ['index.html', 'index.htm']}),
    rootServer = serveStatic(__dirname),
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
      response.writeHead(200, {
        'Content-Type': 'application/json'
      });
      response.end(String(data));
};

http.createServer(function(request, response){
  var urlObj = url.parse(request.url, true);
  var pathname = urlObj.pathname;
  if(request.headers['x-forwarded-proto'] === 'https'){
    response.writeHead(302, {'Location': 'http://dotacard.herokuapp.com/'});
    response.end();
  }
  console.log('request: '+pathname);
  if(pathname[0] === '/') { pathname = pathname.slice(1); }
  if(pathname === 'db'){
    var query = urlObj.query;
    if(query.set){
      console.log('set: '+ query.set);
      //WAITING
      if(query.set === 'waiting'){
        if(waiting.id === 'none'){
          waiting = query.data;
          send(response, waiting);
        } else {
          send(response, waiting);
          waiting = {id: 'none'};
        }
      } //CHAT
      else if(query.set === 'chat'){
        var msg = query.data;
        msg = msg.substring(0, 42);
        chat.unshift(msg);
        chat = chat.slice(0, 240);
        send(response, JSON.stringify({messages: chat}));
      } //DEFAULT SET
      else { db.set(query.set, query.data, function(data){send(response, data);}); }
    } else if (query.get){
      console.log('get: '+ query.get);
      //STATUS
      if(query.get === 'server') { send(response, JSON.stringify({status: 'online'})); }
      //CHAT
      if(query.get === 'chat') { send(response, JSON.stringify({messages: chat})); }
      //LANGUAGE
      else if(query.get === 'lang') { send(response, JSON.stringify({lang: request.headers['accept-language']})); }
      //DEFAULT GET
      else { db.get(query.get, function(data){ send(response, data); }); }
      //DB CHECK
    } else { send(response, 'Db works!'); }
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
