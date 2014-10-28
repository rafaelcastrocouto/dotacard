var audio = function(name){
  var ajax = new XMLHttpRequest(); 
  ajax.open("GET", '/audio/'+name+'.mp3', true); 
  ajax.responseType = "arraybuffer"; 
  ajax.onload = function(){ 
    game.audioctx.decodeAudioData(ajax.response, function(buffer){ 
      game.sounds[name] = game.audioctx.createBufferSource();
      game.sounds[name].buffer = buffer;
      game.sounds[name].connect(game.audioctx.destination);
    }); 
  }; 
  ajax.send();   
};
