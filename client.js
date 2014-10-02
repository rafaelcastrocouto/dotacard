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
  
  debug: (location.host == "localhost"), 
  
  status: 'loading', states: states,  
  
  id: null, skills: null, heroes: null, buffs: null, //json
  
  player: {}, enemy: {}, currentData: {}, //db  
  
  container: $('<div>').appendTo(document.body).addClass('container'), 
  
  loader: $('<span>').addClass('loader'), 
  message: $('<p>').addClass('message'), 
  triesCounter: $('<small>').addClass('triescounter'), tries: 0,  
  
  timeToPick: 15, timeToPlay: 5, waitLimit: 300, connectionLimit: 90, //seconds    
  dayLength: 6, deadLength: 4, //turns   
  
  map: null, width: 12,  height: 5, //slots  
  
  nomenu: function(){return false;},
  
  seed: 0, random: function(){ 
    console.log('random', game.seed); 
    return parseFloat('0.'+Math.sin(++game.seed).toString().substr(6));
  }
};

////start the game////
$(game.states.build);
//////////////////////