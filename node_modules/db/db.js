var fs = require('fs');

var readData = function(cb){
  fs.readFile(__dirname+'/database.csv', function (err, data) {    
    if(err) throw err;    
    if(cb) cb(data);
  });
};

var writeData = function(data, cb){
  fs.writeFile(__dirname+'/database.csv', data, function(err){    
    if(err) throw err;
    if(cb) cb(true);
  });  
};

exports.get = function(name, cb){
  readData(function(data){
    var lines = (''+data).split('\n'), val = '';
    for(var i = 0; i < lines.length; i++){
      var line = lines[i].split(';');
      var n = line[0];
      var v = line[1];
      if(name == n) {
        val = v;
        break;      
      }
    }
    console.log('Get('+name+'): '+val);
    if(cb) cb(val || '');
  });  
};

exports.set = function(name, val, cb){
  readData(function(data){
    var lines = (''+data).split('\n'), f = true;
    for(i = 0; i < lines.length; i++){
      var line = lines[i].split(';');
      var n = line[0];
      if(name == n) {
        lines[i] = name + ';' + val;
        f = false;
        break;
      }
    }  
    if(f) lines.push(name + ';' + val);
    writeData(lines.join('\n'), cb); 
  });
};