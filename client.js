/* by rafælcastrocouto */
var game = { 
  start: function(){
    if(window.JSON && 
       window.btoa && window.atob &&
       window.AudioContext && window.XMLHttpRequest &&
       Modernizr.backgroundsize && 
       Modernizr.boxshadow && 
       Modernizr.cssanimations &&
       Modernizr.csstransforms &&
       Modernizr.csstransitions &&
       Modernizr.generatedcontent &&
       Modernizr.opacity &&
       Modernizr.rgba ) 
      game.states.build();
    else $('.unsupported').show();
  },
  debug: (location.host == "localhost"), 
  status: 'loading', states: states,  
  id: null, currentData: {}, //db  
  skills: null, heroes: null, buffs: null, //json
  player: {}, enemy: {},   
  container: $('.container').first(), 
  loader: $('<span>').addClass('loader'), 
  message: $('<p>').addClass('message'), 
  triesCounter: $('<small>').addClass('triescounter'), tries: 0,  
  timeToPick: 30, timeToPlay: 10, waitLimit: 90, connectionLimit: 30, //seconds    
  dayLength: 10, deadLength: 10, //turns   
  map: null, width: 12,  height: 5, //slots  
  nomenu: function(){return false;},
  audioctx: new AudioContext(), sounds: {}, audio: audio,
  scrollspeed: 0.4,
  seed: 0, random: function(){  
    if(game.debug) return 0;
    return parseFloat('0.'+Math.sin(++game.seed).toString().substr(6));
  }
};
$(game.start);

