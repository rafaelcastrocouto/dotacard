//damage = lvl15 d * .05
//hp = lvl15 hp * 0.05
//reg = hp*0.03  (hp/33.333...)
//mana = lvl15 mana * 0.001
//skills lvl3 ults lvl2
//cards = 100/cooldown 

var Card = function(data){ 
  var el = $('<div>').addClass('card '+ data.className).attr('id', data.id);   
  var fieldset = $('<fieldset>').appendTo(el); 
  $('<legend>').appendTo(fieldset).text(data.name); 
  data.currenthp = data.hp;
  $('<span>').addClass('hp').appendTo(el).text(data.currenthp);   
  var portrait = $('<div>').addClass('portrait').appendTo(fieldset);
  $('<img>').appendTo(portrait).attr('src', data.img);
  $('<div>').addClass('overlay').appendTo(portrait);
  $('<h1>').appendTo(fieldset).text(data.attribute + ' | ' + data.attackType );  
  $('<p>').appendTo(fieldset).text('HP: '+ data.hp);
  if(data.regen)     $('<p>').appendTo(fieldset).text('Regeneration: '+data.regen);
  if(data.damage)    $('<p>').appendTo(fieldset).text('Damage: '+ data.damage);
  if(data.mana)      $('<p>').appendTo(fieldset).text('Mana: ' + data.mana);
  if(data.skills)    $('<p>').appendTo(fieldset).text('Skills: '+ data.skills);  
  if(data.passive)   $('<p>').appendTo(fieldset).text('Passive skills: '+ data.passive);
  if(data.permanent) $('<p>').appendTo(fieldset).text('Permanent skills: '+ data.permanent);
  if(data.temporary) $('<p>').appendTo(fieldset).text('Special skills: '+ data.temporary);
  $.each(data, function(item){el.data(item, this);});
  data.el = el;
  return data;
};


Card.attack = function(){
  if(game.status == 'turn' && !game.selectedCard.hasClass('done')){ 
    var fromSpot = Map.getPosition(game.selectedCard);
    var toSpot = Map.getPosition($(this));
    game.currentData.moves.push('A:'+fromSpot+':'+toSpot);        
    Card.damage($('#'+fromSpot+' .card').data('damage'), toSpot);
    game.selectedCard.addClass('done');        
  }
  Map.unhighlight();
  return false;
};

Card.damage = function(damage, target){
  if(typeof target == 'string') target = $('#'+target+' .card');
  var hp = target.data('currenthp') - damage;
  if(hp < 1) {
    hp = 0;
    setTimeout(Card.die.bind(target), 1010);
  }
  target.children('span.hp').text(hp);
  target.data('currenthp', hp);
  var damageFx = target.children('span.damage');
  if(damageFx.length){
    var currentDamage = parseInt(damageFx.text());
    damageFx.text(currentDamage + damage);
  } else {
    damageFx = $('<span>').addClass('damage').text(damage).appendTo(target);
    setTimeout(function(){ this.remove(); }.bind(damageFx), 1000);
  } 
};
  
Card.die = function(){
  this.addClass('dead');
  this.children('span.hp').text(0);
  this.data('currenthp', 0);  
  if(this.hasClass('heroes')){
    if(this.hasClass('player')) this.appendTo(states.table.playerDeck.el);
    else if(this.hasClass('enemy')) this.appendTo(states.table.enemyDeck.el);
    
  } else if(this.hasClass('tower')) {
    if(this.hasClass('player')) states.table.lose();
    else if(this.hasClass('enemy')) states.table.win();
  }
  else this.remove();
};

Card.select = function(){
  var card = $(this);      
  $('.card.selected').removeClass('selected');      
  Map.unhighlight();      
  game.selectedCard = card;
  if(game.status == 'turn'){
    Map.highlightMove(card); 
    Map.highlightAttack(card); 
  }
  states.table.selectedArea.empty();      
  var zoom = card.clone().appendTo(states.table.selectedArea);
  card.addClass('selected').children('span.damage').remove();
  
};

Card.moveSelected = function(){
  if(game.status == 'turn' && !game.selectedCard.hasClass('done')){
    var fromSpot = Map.getPosition(game.selectedCard);
    var toSpot = Map.getPosition($(this));
    Card.move(fromSpot, toSpot);        
    game.currentData.moves.push('M:'+fromSpot+':'+toSpot);
    game.selectedCard.addClass('done');
  }
  Map.unhighlight();
  return false;
};

Card.move = function(card, spot){
  if(typeof card == 'string') card = $('#'+card+' .card');
  card.closest('td').removeClass('block').addClass('free');
  if(typeof spot == 'string') spot = $('#'+spot);
  spot.removeClass('free').addClass('block');    
  Map.unhighlight();   

  var data = {
    target: card,
    destiny: spot
  };

  var target = card.offset();
  var destiny = spot.offset();

  card.css({top: destiny.top - target.top - 108, left: destiny.left - target.left - 18});

  setTimeout(function(){    
    $(this.target).css({top: '', left: ''}).appendTo(this.destiny);
  }.bind(data), 1000);  
};

var loadedDecks = {};

var Deck = function(/* name, [filter], callback */){  
  var name = arguments[0];
  var filter, cb;
  if(typeof arguments[1] == 'function') cb = arguments[1];
  else {
    filter = arguments[1];
    cb = arguments[2];
  }

  var d = {};  
  var createCards = function(data){
    var el = $('<div>').addClass('deck '+name);
    var cards = {};
    var count = 0;
    $.each(data, function(id, type){
      if(filter){
        var found = false;
        $.each(filter, function(i, pick){
          if(pick == id) found = true;
        });
      }
      if(found || !filter){
        type.id = id;
        type.className = name;
        cards[id] = Card(type);
        cards[id].el.appendTo(el);
        count++;
      }
    });
    d.el = el;
    d.cards = cards;
    d.length = count;
    if(cb) cb(d);     
  };


  if(!loadedDecks[name]){
    $.ajax({
      type: "GET", 
      url: 'json/'+name+'.json',
      complete: function(response){
        var data = JSON.parse(response.responseText);
        loadedDecks[name] = data;
        createCards(data);
      }
    });
  } else createCards(loadedDecks[name]);

  return d;
};

