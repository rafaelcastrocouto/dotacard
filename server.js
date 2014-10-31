/* by rafælcastrocouto */
var http = require('http'),
    url = require('url'),
    static = require('static.simple'),
    host = process.env.HOST,
    port = process.env.PORT || 5000,
    waiting = '{"id":"none"}',
    currentData = {},
    db = {
      get: function(name, cb){cb(currentData[name]||'');},
      set: function(name, val, cb){currentData[name] = val; cb(true);}
    };

if(host == 'localhost') db = require('db.csv');

var send = function(response, data){
  response.writeHead(200, {
    'Content-Type': 'application/json'//,'Access-Control-Allow-Origin': '*'
  });
  response.end(''+data);
};

http.createServer(function(request, response){
  var urlObj = url.parse(request.url, true);
  
  var pathname = urlObj.pathname;  
  console.log('Request: ', pathname);
  if(pathname[0] == '/') pathname = pathname.slice(1); 
  
  if(pathname == 'db'){
    var query = urlObj.query;
    if(query.set) {
      console.log('set: '+ query.set);
      if(query.set == 'waiting') {
        waiting = query.data;
        send(response, true);
      }
      else db.set(query.set, query.data, function(data){send(response, data);});      
//      else {
//        db[query.set] = query.data;
//        send(response, true);     
//      }
    } else if (query.get) {
      console.log('get: '+ query.get);
      if(query.get == 'server') send(response, '{"status":"online"}');
      else if(query.get == 'waiting') send(response, waiting);
//      else send(response, db[query.get] || '');
      else db.get(query.get, function(data){ send(response, data); });
    } else send(response, 'It works!');
    
  } else static.read(response, pathname || 'index.html');
}).listen(port, host);

console.log(new Date() 
            + '\n' //<br>
            + '\x1B[1m' //style:bright
            + '\x1B[33m' //color:yellow
            + 'HTTP server running at: http://'+host+':'+port+'/'
            + '\x1B[0m'); //style:reset 