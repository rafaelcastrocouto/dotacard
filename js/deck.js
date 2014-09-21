//damage = lvl15 d * .05
//hp = lvl15 hp * 0.05
//reg = hp*0.03  (hp/33.333...)
//mana = lvl15 mana * 0.001
//skills lvl3 ults lvl2
//cards = 100/cooldown 

var Card = function(data){ 
  var el = $('<div>').addClass(data.id+' card '+ data.className);   
  var fieldset = $('<fieldset>').appendTo(el); 
  $('<legend>').appendTo(fieldset).text(data.name); 
  data.currenthp = data.hp;
  $('<span>').addClass('hp').appendTo(el).text(data.currenthp);   
  var portrait = $('<div>').addClass('portrait').appendTo(fieldset);
  $('<div>').appendTo(portrait).addClass('img');
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
  
  if(data.className == 'heroes'){
    data.kills = 0;
    data.deaths = 0;
    $('<p>').addClass('kd').appendTo(fieldset).html('KD: <span class="kills">0</span>/<span class="deaths">0</span>');
  }
  
  $.each(data, function(item){el.data(item, this);});
  return el;
};

Card.place =function(target) {
  if(typeof target == 'string') target = $('#'+target);
  this.appendTo(target.removeClass('free').addClass('block'));
}

$.fn.place = Card.place;

Card.select = function(){
  var card = $(this);      
  $('.card.selected').removeClass('selected');      
  Map.unhighlight();      
  game.selectedCard = card;
  Map.highlight();
  states.table.selectedArea.empty();      
  var zoom = card.clone().appendTo(states.table.selectedArea);
  card.addClass('selected').children('span.damage').remove();
  return false;
};

$.fn.select = Card.select;

Card.highlightMove = function(){
  var card = this;
  if(!card.hasClasses('enemy done static dead') && card.hasClass('player')){ 
    var spot = Map.getPosition(card);
    Map.paint(spot, 2, 'movearea', false, 'block');      
    $('.movearea').on('contextmenu.move', states.table.moveSelected);
  }
};

$.fn.highlightMove = Card.highlightMove;

Card.highlightAttack = function(){    
  var card = this;
  if(!card.hasClasses('enemy done dead') && card.hasClass('player')){        
    var spot = Map.getPosition(card);
    var att = card.data('attackType'), range, removeDiag;
    if(att == 'Melee') {
      range = 2; removeDiag = false;
    }
    if(att == 'Ranged') {
      range = 3; removeDiag = true;     
    }
    Map.stroke(spot, range, 'attackarea', removeDiag, 'block');
    Map.neightbors(spot, range, function(neighbor){        
      var card = $('.card', neighbor);        
      if(card.is('.enemy')) card.addClass('target').on('contextmenu.attack', states.table.attackWithSelected);        
    }, false, 'free');
  }
};

$.fn.highlightAttack = Card.highlightAttack;

Card.move = function(destiny){
  var card = this;
  if(typeof destiny == 'string') destiny = $('#'+destiny);
  var fromSpot = Map.getPosition(card);
  var toSpot = Map.getPosition(destiny);
  if(destiny.hasClass('free') && (fromSpot != toSpot) && !card.hasClass('done')){
    card.addClass('done').closest('td').removeClass('block').addClass('free');  
    destiny.removeClass('free').addClass('block');    
    Map.unhighlight();   

    var t = card.offset();
    var d = destiny.offset();
    card.css({top: d.top - t.top - 110, left: d.left - t.left - 20});

    setTimeout(function(){    
      $(this.card).css({top: '', left: ''}).appendTo(this.destiny);
    }.bind({ card: card, destiny: destiny }), 500);  
  }
};

$.fn.move = Card.move;

Card.attack = function(target){ 
  if(typeof target == 'string') target = $('#'+target+' .card');
  var source = this;
  var fromSpot = Map.getPosition(source); 
  var toSpot = Map.getPosition(target);
  if(source.data('damage') && (fromSpot != toSpot) && !source.hasClass('done') && target.data('currenthp')){
    source.addClass('done').damage(source.data('damage'), target);
  }
};

$.fn.attack = Card.attack;

Card.damage = function(damage, target){ 
  var source = this;
  if(typeof target == 'string') target = $('#'+target+' .card');
  var hp = target.data('currenthp') - damage;
  if(hp < 1) {
    hp = 0;
    setTimeout(target.die.bind(target), 1000);
    if(source.hasClass('heroes')){
      var kills = source.data('kills') + 1;
      source.data('kills', kills);
      source.children('.kills').text(kills);
    }
  }
  target.children('span.hp').text(hp);
  target.data('currenthp', hp);  
  if(target.hasClass('selected')) target.select();
  var damageFx = target.children('span.damage'); 
  if(damageFx.length){
    var currentDamage = parseInt(damageFx.text());
    damageFx.text(currentDamage + damage).appendTo(target);
    this.data('timeout', remove);
  } else {
    damageFx = $('<span>').addClass('damage').text(damage).appendTo(target);    
  } 
  clearTimeout(this.data('timeout'));
  var remove = setTimeout(damageFx.remove.bind(damageFx), 1000);
  this.data('timeout', remove);
};

$.fn.damage = Card.damage;

Card.die = function(){
  this.addClass('dead').removeClass('target');
  this.children('span.hp').text(0);
  this.data('currenthp', 0);
  var spot = Map.getPosition(this);
  $('#'+spot).removeClass('block').addClass('free');
  if(this.hasClass('selected')) this.select();
  
  if(this.hasClass('heroes')){
    var deaths = this.data('deaths') + 1;
    this.data('deaths', deaths);
    this.children('.deaths').text(deaths);
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
  this.data('reborn', undefined);
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

