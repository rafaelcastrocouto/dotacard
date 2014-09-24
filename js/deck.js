//damage = lvl15 d * .05
//hp = lvl15 hp * 0.05
//reg = hp*0.03  (hp/33.333...)
//mana = lvl15 mana * 0.005
//skills lvl3 ults lvl2
//skill card count = 100/cooldown 

var Deck = function(/* name, [filter], callback */){  
  var name = arguments[0];
  var filter, cb;
  if(typeof arguments[1] == 'function') cb = arguments[1];
  else {
    filter = arguments[1];
    cb = arguments[2];
  } 
  var deck = $('<div>').addClass('deck '+name);

  if(!Deck.loadedDecks[name])
    Deck.loadDeck(name, function(){
      Deck.createCards(deck, name, cb, filter);
    });    
  else Deck.createCards(deck, name, cb, filter);

  return deck;
};

Deck.loadedDecks = {};

Deck.loadDeck = function(name, cb){
  $.ajax({
    type: "GET", 
    url: 'json/'+name+'.json',
    complete: function(response){
      var data = JSON.parse(response.responseText);
      Deck.loadedDecks[name] = data;
      cb();
    }
  });
};

Deck.createCards = function(deck, name, cb, filter){   
  if(name == 'heroes') Deck.createHeroesCards(deck, name, cb, filter);
  if(name == 'skills') Deck.createSkillsCards(deck, name, cb, filter);
};

Deck.createHeroesCards = function(deck, name, cb, filter){   
  var deckData = Deck.loadedDecks[name];
  var cards = [];
  $.each(deckData, function(id, heroData){
    if(filter){
      var found = false;
      $.each(filter, function(i, pick){
        if(pick == id) found = true;
      });
    }
    if(found || !filter){
      heroData.id = id;
      heroData.className = name;
      cards.push(Card(heroData).appendTo(deck));
    }
  });
  deck.data('cards', cards);
  if(cb) cb(deck);     
};

Deck.createSkillsCards = function(deck, name, cb, filter){   
  var deckData = Deck.loadedDecks[name];
  var cards = [];
  $.each(deckData, function(heroId, heroSkillsData){ 
    if(filter){
      var found = false;
      $.each(filter, function(i, pick){
        if(pick == heroId) found = true;
      });
    }
    if(found || !filter){
      $.each(heroSkillsData, function(id, skillData){ 
        skillData.id = heroId+'-'+id;
        skillData.className = name;
        for(var k=0; k < skillData.cards; k++){
          cards.push(Card(skillData).appendTo(deck));
        }
      });
    }    
  });
  deck.data('cards', cards);
  if(cb) cb(deck);     
};

Deck.randomCard = function(cards){
  return $(cards[ parseInt(Math.random() * cards.length) ]);
};

var Card = function(data){ 
  var card = $('<div>').addClass(data.id+' card '+ data.className);   
  var fieldset = $('<fieldset>').appendTo(card); 
  $('<legend>').appendTo(fieldset).text(data.name);

  var portrait = $('<div>').addClass('portrait').appendTo(fieldset);
  $('<div>').appendTo(portrait).addClass('img');
  $('<div>').addClass('overlay').appendTo(portrait);

  if(data.attribute) $('<h1>').appendTo(fieldset).text(data.attribute + ' | ' + data.attackType );  
  if(data.cards) $('<h1>').appendTo(fieldset).text('Cards: '+ data.cards + ' | ' + data.type );  

  if(data.hp) {
    $('<p>').appendTo(fieldset).text('HP: '+ data.hp);
    data.currenthp = data.hp;
    $('<span>').addClass('hp').appendTo(card).text(data.currenthp);   
  }

  if(data.chance)    $('<p>').appendTo(fieldset).text('Chance: '+data.chance+'%');
  if(data.percentage)$('<p>').appendTo(fieldset).text('Percentage: '+data.percentage+'%');
  if(data.delay)     $('<p>').appendTo(fieldset).text('Delay: '+data.delay);
  if(data.damageType)$('<p>').appendTo(fieldset).text('Damage Type: '+data.damageType);
  if(data.duration)  $('<p>').appendTo(fieldset).text('Duration: '+data.duration);
  if(data.dot)       $('<p>').appendTo(fieldset).text('Damage over time: '+data.dot);
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

  $.each(data, function(item, value){card.data(item, value);});
  return card;
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
    card.css({top: d.top - t.top - 112, left: d.left - t.left - 22});

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
      source.find('.kills').text(kills);
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
};

$.fn.damage = Card.damage;

Card.die = function(){
  this.addClass('dead').removeClass('target');
  this.find('.hp').text(0);
  this.data('currenthp', 0);
  var spot = Map.getPosition(this);
  $('#'+spot).removeClass('block').addClass('free');
  if(this.hasClass('selected')) this.select();

  if(this.hasClass('heroes')){

    var deaths = this.data('deaths') + 1;
    this.data('deaths', deaths);
    this.find('.deaths').text(deaths);
    this.data('reborn', game.time + game.deadLength);
    if(this.hasClass('player')) this.appendTo(states.table.playerHeroesDeck);
    else if(this.hasClass('enemy')) this.appendTo(states.table.enemyHeroesDeck);

  } else if(this.hasClass('skills')){ 

    if(this.hasClass('player')) this.appendTo(states.table.playerSkillsDeck);
    else if(this.hasClass('enemy')) this.appendTo(states.table.enemySkillsDeck);

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
  this.find('.hp').text(hp);
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

