/* by rafælcastrocouto */

var game = {  
  debug: (location.host == "localhost"), 
  status: 'loading', states: states,  
  id: null, skills: null, heroes: null, buffs: null, //json
  player: {
    buyCard: function(){
      var availableSkills = $('.skills.available.player.deck .card');
      if(game.player.turn > 5) availableSkills.add('.skills.ult.player.deck .card');
      var card = Deck.randomCard(availableSkills);
      card.appendTo(states.table.playerHand);
      if(card.data('target') == 'auto') {
        var heroid = card.data('hero');        
        var hero = $('.map .player.heroes.'+heroid);
        var toSpot = Map.getPosition(hero);
        card.activate(toSpot); 
        game.currentData.moves.push('P:'+toSpot+':'+card.data('skill')+':'+heroid); 
      }
    }
  }, 
  enemy: { buyCard: function(){ game.random(); } }, 
  currentData: {}, //db  
  container: $('<div>').appendTo(document.body).addClass('container'), 
  loader: $('<span>').addClass('loader'), 
  message: $('<p>').addClass('message'), 
  triesCounter: $('<small>').addClass('triescounter'), tries: 0,  
  timeToPick: 15, timeToPlay: 5, waitLimit: 300, connectionLimit: 90, //seconds    
  dayLength: 6, deadLength: 4, //turns   
  map: null, width: 12,  height: 5, //slots  
  nomenu: function(){return false;},
  seed: 0, random: function(){  //game.log(game.seed);
    //return parseFloat('0.'+Math.sin(++game.seed).toString().substr(6));
    return 0;
  }
};

////start the game////
$(game.states.build);
//////////////////////