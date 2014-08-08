var http = require('http'),
    url = require('url'),
    db = require('db'),
    host = 'localhost',
    port = 8080;

var send = function(response, data){
  response.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  response.end(JSON.stringify(data));
};

http.createServer(function(request, response){
  var query = url.parse(request.url, true).query;
  if(query.set) {
    db.set(query.set, query.data || '');
    send(response, true);
  } else if (query.get) {
    db.get(query.get, function(data){    
      send(response, data);
    });
  } else if (query) send(response, query);
  else send(response, 'It works!');
}).listen(port, host);

console.log(new Date() 
            + '\n' //<br>
            + '\x1B[1m' //style:bright
            + '\x1B[33m' //color:yellow
            + 'HTTP server running at: http://'+host+':'+port+'/'
            + '\x1B[0m'); //style:reset 