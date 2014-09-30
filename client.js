/*
by rafælcastrocouto

client.js dependencies: {
  jquery: ">= 1.x.x",
  prefixfree: ">= 1.x.x",
  youtube-iframe-api: ">= 1.x.x",
  tubular: ">= 1.x.x"
}
*/

var game = {  
  status: 'loading',
  player: {}, enemy: {}, currentData: {},
  debug: location.host == "localhost",  
  width: 12,  height: 5, //slots   
  container: $('<div>').appendTo(document.body).addClass('container'), 
  message: $('<p>').addClass('message'),    
  loader: $('<span>').addClass('loader'),
  triesCounter: $('<small>').addClass('triescounter'), tries: 0,
  timeToPick: 15, timeToPlay: 5, waitLimit: 300, connectionLimit: 90, //seconds    
  dayLength: 6, deadLength: 4, //turns   
  nomenu: function(){return false;}
};