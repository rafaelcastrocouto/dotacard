var audio = function(name){
  if(!game.mute) audio.createMuteGain();
  var ajax = new XMLHttpRequest(); 
  ajax.open("GET", '/audio/'+name+'.mp3', true); 
  ajax.responseType = "arraybuffer"; 
  ajax.onload = function(){ 
    game.audioctx.decodeAudioData(ajax.response, function(buffer){ 
      game.sounds[name] = game.audioctx.createBufferSource();
      game.sounds[name].buffer = buffer;
      game.sounds[name].connect(game.mute);
    }); 
  }; 
  ajax.send();   
};
audio.createMuteGain = function(){
  game.mute = game.audioctx.createGain();
  game.mute.connect(game.audioctx.destination);
};