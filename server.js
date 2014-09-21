var http = require('http'),
    url = require('url'),
    db = require('db'),
    static = require('static'),
    host = 'localhost',
    port = 80;

var send = function(response, data){
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  response.end(''+data);
};

db.set('server', '{"status":"online"}', function(){
  db.set('waiting', '{"id":"none"}');
});

http.createServer(function(request, response){
  var urlObj = url.parse(request.url, true);
  
  var pathname = urlObj.pathname;  
  console.log('Request: ', pathname);
  if(pathname[0] == '/') pathname = pathname.slice(1); 
  
  if(pathname == 'db'){
    var query = urlObj.query;
    if(query.set) {
      db.set(query.set, query.data || '', function(data){
        send(response, data);
      });      
    } else if (query.get) {
      db.get(query.get, function(data){    
        send(response, data);
      });
    } else send(response, {data: 'It works!'});
  } else static.read(response, pathname || 'index.html');
}).listen(port, host);

console.log(new Date() 
            + '\n' //<br>
            + '\x1B[1m' //style:bright
            + '\x1B[33m' //color:yellow
            + 'HTTP server running at: http://'+host+':'+port+'/'
            + '\x1B[0m'); //style:reset 