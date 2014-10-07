#Static.simple

Simple static file server.

    var http = require('http');
    var static = require('static.simple');
    http.createServer(function(request, response){
      var urlObj = url.parse(request.url, true);
      var pathname = urlObj.pathname;    
      static.read(response, pathname || 'index.html');   
    });