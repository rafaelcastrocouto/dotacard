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
  return el;
};

Card.attack = function(){
  if(game.status == 'turn' && !game.selectedCard.hasClass('done')){ 
    var fromSpot = Map.getPosition(game.selectedCard);
    var toSpot = Map.getPosition($(this));
    game.currentData.moves.push('A:'+fromSpot+':'+toSpot);    
    var source = $('#'+fromSpot+' .card');
    source.damage(source.data('damage'), toSpot);
    game.selectedCard.addClass('done');        
  }
  Map.unhighlight();
  return false;
};

$.fn.damage = function(damage, target){
  var source = $(this);
  if(typeof target == 'string') target = $('#'+target+' .card');
  var hp = target.data('currenthp') - damage;
  if(hp < 1) {
    hp = 0;
    setTimeout(target.die.bind(target), 1000);
  }
  target.children('span.hp').text(hp);
  target.data('currenthp', hp);
  if(target.hasClass('selected')) target.select();
  var damageFx = target.children('span.damage'); console.log(damageFx);
  if(damageFx.length){
    var currentDamage = parseInt(damageFx.text());
    damageFx.text(currentDamage + damage).appendTo(target);
    this.data('timeout', remove);
  } else {
    damageFx = $('<span>').addClass('damage').text(damage).appendTo(target);    
  } 
  clearTimeout(this.data('timeout'));
  var remove = setTimeout(this.remove.bind(damageFx), 1000);
  this.data('timeout', remove);
};

Card.place =function(target) {
  if(typeof target == 'string') target = $('#'+target);
  this.appendTo(target.removeClass('free').addClass('block'));
} 

$.fn.place = Card.place;

Card.die = function(){
  this.addClass('dead').removeClass('target');
  this.children('span.hp').text(0);
  this.data('currenthp', 0);
  var spot = Map.getPosition(this);
  $('#'+spot).removeClass('block').addClass('free');
  if(this.hasClass('heroes')){
    this.data('reborn', game.time + 4);
    if(this.hasClass('player')) this.appendTo(states.table.playerDeck);
    else if(this.hasClass('enemy')) this.appendTo(states.table.enemyDeck);

  } else if(this.hasClass('tower')) {
    if(this.hasClass('player')) states.table.lose();
    else if(this.hasClass('enemy')) states.table.win();
  }
  else this.remove();
};

$.fn.die = Card.die;

Card.reborn = function(){
  this.removeClass('dead');
  var hp = this.data('hp');
  this.children('span.hp').text(hp);
  this.data('currenthp', hp);
  var x, y, spot, freeSpot;
  if(this.hasClass('player')){
    x = 0, y = '4';
    spot = Map.letters[x]+y;
    while($('#'+spot).hasClass('block')) {
      x++;
      spot = Map.letters[x]+y;
    }    
  }
  else if(this.hasClass('enemy')) {
    x = 11, y = '2';
    spot = Map.letters[x]+y;
    while($('#'+spot).hasClass('block')) {
      x--;
      spot = Map.letters[x]+y;
    }
  }
  this.place(spot);
};

$.fn.reborn = Card.reborn;

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

$.fn.select = Card.select;

Card.moveSelected = function(){
  if(game.status == 'turn' && !game.selectedCard.hasClass('done')){
    var fromSpot = Map.getPosition(game.selectedCard);
    var toSpot = Map.getPosition($(this));
    if($('#'+toSpot).hasClass('free')){
      Card.move(fromSpot, toSpot);        
      game.currentData.moves.push('M:'+fromSpot+':'+toSpot);
      game.selectedCard.addClass('done');
    }
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

var Deck = function(/* name, [filter], callback */){  
  var name = arguments[0];
  var filter, cb;
  if(typeof arguments[1] == 'function') cb = arguments[1];
  else {
    filter = arguments[1];
    cb = arguments[2];
  } 
  var el = $('<div>').addClass('deck '+name);

  if(!Deck.loadedDecks[name]){
    $.ajax({
      type: "GET", 
      url: 'json/'+name+'.json',
      complete: function(response){
        var data = JSON.parse(response.responseText);
        Deck.loadedDecks[name] = data;
        Deck.createCards(el, name, cb, filter);
      }
    });
  } else Deck.createCards(el, name, cb, filter);

  return el;
};

Deck.loadedDecks = {};

Deck.createCards = function(el, name, cb, filter){   
  var data = Deck.loadedDecks[name];
  var cards = {};
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
      cards[id].appendTo(el);
    }
  });
  el.data('cards', cards);
  if(cb) cb(el);     
};

