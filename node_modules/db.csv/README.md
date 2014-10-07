#DataBase.CSV

Simple single csv file database.

    var http = require('http');
    var db = require('db.csv');
    http.createServer(function(request, response){
      var urlObj = url.parse(request.url, true);  
      var pathname = urlObj.pathname;  
      var query = urlObj.query;
      if(query.get) db.get(name, function(data){ response.end('Get: '+data); });
      else if(query.set) db.set(name, data, function(data){ response.end('Set: '+data); });  
      else response.end('db.csv online');
    });
      
      