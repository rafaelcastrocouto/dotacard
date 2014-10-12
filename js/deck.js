//Damage = lvl15 damage * 0.05
//HP = lvl15 hp * 0.05
//Regen = Card HP * 0.03
//Mana = lvl15 mana * 0.005
//Skills = lvl4 
//Ults = lvl2
//Skill card count = 50/cooldown + 50/manacost // function(cool,mana){return Math.round((50/cool)+(50/mana))} 
//ATS = (1 + ATS%) / BAT  (avarage BAT = 1.7)

var Deck = function(op/* name, [filter], callback */){  
  var name = op.name, filter = op.filter, cb = op.cb, multi = op.multi;
  var deck = $('<div>').addClass('deck '+name);
  if(!game[name])
    Deck.loadDeck(name, function(){
      Deck.createCards(deck, name, cb, filter, multi);
    });    
  else Deck.createCards(deck, name, cb, filter, multi);

  return deck;
};

Deck.loadDeck = function(name, cb){
  $.ajax({
    type: "GET", 
    url: 'json/'+name+'.json',
    complete: function(response){
      var data = JSON.parse(response.responseText);
      game[name] = data;
      cb(data);
    }
  });
};

Deck.createCards = function(deck, name, cb, filter, multi){   
  if(name == 'heroes') Deck.createHeroesCards(deck, name, cb, filter);
  if(name == 'skills') {
    Deck.loadDeck('buffs', function(){
      Deck.createSkillsCards(deck, name, cb, filter, multi);
    });
  }
};

Deck.createHeroesCards = function(deck, name, cb, filter){   
  var deckData = game[name];
  var cards = [];
  $.each(deckData, function(heroid, herodata){
    var found = false;
    if(filter){      
      $.each(filter, function(i, pick){
        if(pick == heroid) found = true;
      });
    }
    if(found || !filter){
      herodata.hero = heroid;
      herodata.speed = 2;
      herodata.kd = true;
      herodata.buffs = true;
      herodata.className = heroid + ' ' +name;
      cards.push(Card(herodata).appendTo(deck));
    }
  });
  deck.data('cards', cards);
  if(cb) cb(deck);     
};

Deck.createSkillsCards = function(deck, name, cb, filter, multi){   
  var deckData = game[name];
  var cards = [];
  $.each(deckData, function(hero, heroSkillsData){ 
    var found = false;
    if(filter){      
      $.each(filter, function(i, pick){
        if(pick == hero) found = true;
      });
    }
    if(found || !filter){
      $.each(heroSkillsData, function(skill, skillData){ 
        skillData.hero = hero;
        skillData.skill = skill;
        skillData.className = hero+'-'+skill + ' ' + name;
        if(game.buffs[hero] && game.buffs[hero][skill]) skillData.buff = game.buffs[hero][skill];
        if(multi){
          for(var k=0; k < skillData[multi]; k++){
            cards.push(Card(skillData).appendTo(deck));
          }
        } else cards.push(Card(skillData).appendTo(deck));
        
      });
    }    
  });
  deck.data('cards', cards);
  if(cb) cb(deck);     
};

Deck.randomCard = function(cards, noseed){
  if(noseed) return $(cards[ parseInt(Math.random() * cards.length) ])
  return $(cards[ parseInt(game.random() * cards.length) ]);
};

////////////////////////////////////////////////////////////////////////////////////

var Card = function(data){ 
  var card = $('<div>').addClass('card '+ data.className);   
  var fieldset = $('<fieldset>').appendTo(card); 
  $('<legend>').appendTo(fieldset).text(data.name);

  var portrait = $('<div>').addClass('portrait').appendTo(fieldset);
  $('<div>').appendTo(portrait).addClass('img');
  $('<div>').appendTo(portrait).addClass('overlay');

  if(data.attribute) $('<h1>').appendTo(fieldset).text(data.attribute);  
  if(data.cards) $('<h1>').appendTo(fieldset).text(game.heroes[data.hero].name);  

  if(data.hp) {
    $('<p>').appendTo(fieldset).text('HP: '+ data.hp);
    data.currenthp = data.hp;
    $('<span>').addClass('hp').appendTo(card).text(data.currenthp);   
  }
  if(data.range)      $('<p>').appendTo(fieldset).text('Range: '+data.range);
  if(data.type)       $('<p>').appendTo(fieldset).text('Type: '+data.type);
  if(data.cards)      $('<p>').appendTo(fieldset).text('Cards: '+data.cards);
  if(data.chance)     $('<p>').appendTo(fieldset).text('Chance: '+data.chance+'%');
  if(data.percentage) $('<p>').appendTo(fieldset).text('Bonus: '+data.percentage+'%');
  if(data.delay)      $('<p>').appendTo(fieldset).text('Delay: '+data.delay);
  if(data.damageType) $('<p>').appendTo(fieldset).text('Damage Type: '+data.damageType);
  if(data.duration)   $('<p>').appendTo(fieldset).text('Duration: '+data.duration);
  if(data.dot)        $('<p>').appendTo(fieldset).text('Damage over time: '+data.dot);
  if(data.regen)      $('<p>').appendTo(fieldset).text('Regen: '+data.regen);
  if(data.damage)     $('<p>').appendTo(fieldset).text('Damage: '+ data.damage);
  if(data.mana)       $('<p>').appendTo(fieldset).text('Mana: ' + data.mana);
  //if(data.skills)     $('<p>').appendTo(fieldset).text('Skills: '+ data.skills);  
  //if(data.passive)    $('<p>').appendTo(fieldset).text('Passive skills: '+ data.passive);
  //if(data.permanent)  $('<p>').appendTo(fieldset).text('Permanent skills: '+ data.permanent);
  //if(data.temporary)  $('<p>').appendTo(fieldset).text('Special skills: '+ data.temporary);
  if(data.description)$('<p>').appendTo(fieldset).text(data.description);

  if(data.kd){
    data.kills = 0;
    data.deaths = 0;
    $('<p>').addClass('kd').appendTo(fieldset).html('KD: <span class="kills">0</span>/<span class="deaths">0</span>');
  }
  
  if(data.buffs) $('<div>').addClass('buffs').appendTo(card);

  $.each(data, function(item, value){card.data(item, value);});
  return card;
};

Card.place = function(target) {
  if(typeof target == 'string') target = $('#'+target);
  this.closest('td.block').removeClass('block').addClass('free');
  this.appendTo(target.removeClass('free').addClass('block'));
  return this;
};
$.fn.place = Card.place;

Card.select = function(){
  var card = $(this);      
  $('.card.selected').removeClass('selected');      
  $('.card.source').removeClass('source');
  Map.unhighlight();      
  game.selectedCard = card;
  Map.highlight();
  states.table.selectedArea.empty();      
  var zoom = card.clone().appendTo(states.table.selectedArea).addClass('zoom');
  card.addClass('selected');
  return card;
};
$.fn.select = Card.select;

Card.highlightSource = function(){
  var skill = this, hero = skill.data('hero'), source;
  if(hero) {
    source = $('.map .card.player.'+hero).addClass('source');
    game.castSource = source; 
  }
  return skill;
};
$.fn.highlightSource = Card.highlightSource;

Card.highlightTargets = function(){
  var skill = this, hero = skill.data('hero');
  if(hero){
    var source = $('.map .card.player.'+hero);
    if(source.hasClass('heroes') && !source.hasClasses('dead done stunned')){       
      var spot = Map.getPosition(source);
      var range = Map.getRange(skill.data('range'));
      
      if(skill.data('target') == 'passive') {        
        source.addClass('casttarget').on('contextmenu.activate', states.table.passiveActivate);
        
      } else if(skill.data('target') == 'self'){  
        source.addClass('casttarget').on('contextmenu.cast', states.table.castWithSelected);
        
      } else if (skill.data('target') == 'player'){
        source.addClass('target').on('contextmenu.cast', states.table.castWithSelected);
        Map.inRange(spot, range, function(neighbor){      
          var card = $('.card', neighbor); 
          if(card.hasClass('player')) card.addClass('casttarget').on('contextmenu.cast', states.table.castWithSelected);         
        });        
        
      } else if(skill.data('target') == 'ally'){
        Map.inRange(spot, range, function(neighbor){      
          var card = $('.card', neighbor); 
          if(card.hasClass('player')) card.addClass('casttarget').on('contextmenu.cast', states.table.castWithSelected);         
        });  
        
      } else if(skill.data('target') == 'enemy'){              
        Map.inRange(spot, range, function(neighbor){
          var card = $('.card', neighbor);        
          if(card.hasClass('enemy')) card.addClass('casttarget').on('contextmenu.cast', states.table.castWithSelected);        
        });
        
      }else if(skill.data('target') == 'around'){
        Map.around(spot, range, function(neighbor){        
          if(!neighbor.hasClass('block')) neighbor.addClass('targetarea').on('contextmenu.castarea', states.table.castWithSelected);
        });
      } else if(skill.data('target') == 'allaround'){
        Map.around(spot, range, function(neighbor){        
          if(!neighbor.hasClass('block')) neighbor.addClass('targetarea').on('contextmenu.castarea', states.table.castWithSelected);
          else {
            var card = $('.card', neighbor); 
            card.addClass('targetspot').on('contextmenu.cast', states.table.castWithSelected);
          }
        });
      } else if(skill.data('target') == 'area'){
        source.addClass('targetspot').on('contextmenu.cast', states.table.castWithSelected);
        Map.inRange(spot, range, function(neighbor){        
          if(!neighbor.hasClass('block')) neighbor.addClass('targetarea').on('contextmenu.castarea', states.table.castWithSelected);
          else {
            var card = $('.card', neighbor); 
            card.addClass('targetspot').on('contextmenu.cast', states.table.castWithSelected);
          }
        });
      } 
    }
  }
  return skill;
};
$.fn.highlightTargets = Card.highlightTargets;

Card.strokeSkill = function(){console.log('stroke');
  var skill = this, 
      hero = skill.data('hero'), 
      source = $('.map .card.player.'+hero),
      range = skill.data('range'),
      spot = Map.getPosition(source);
  if(hero && range && spot && !source.hasClasses('dead done stunned')){
    Map.stroke(spot, Map.getRange(range), 'skillcast');    
    if(skill.data('type') == 'Area of Effect'){
      console.log('aoe');      
      game.castspot = spot;  
      game.castrange = Map.getRange(range);  
      game.castaoe = Map.getRange(skill.data('aoe'));  
      $('.map td').hover(function(){   
        var td = $(this);
        if(td.hasClass('targetarea')){
          $('.map td').removeClass('skillarea skillcast top right left bottom');
          var spot = Map.getPosition($(this));      console.log('aoe hover',spot);      
          Map.stroke(spot, game.castaoe, 'skillarea');
        } else {
          $('.map td').removeClass('skillarea skillcast top right left bottom');
          Map.stroke(game.castspot, game.castrange, 'skillcast');          
        }
      });      
      $('.map .card').hover(function(){     
        var td = $(this);
        if(td.hasClass('targetspot')){
          $('.map td').removeClass('skillarea skillcast top right left bottom');
          var spot = Map.getPosition($(this));      console.log('aoe hover',spot);      
          Map.stroke(spot, game.castaoe, 'skillarea');
        } else {
          $('.map td').removeClass('skillarea skillcast top right left bottom');
          Map.stroke(game.castspot, game.castrange, 'skillcast');   
        }
      });
    }
  }
  return skill;
};
$.fn.strokeSkill = Card.strokeSkill;

Card.highlightMove = function(){
  var card = this;
  if(card.hasAllClasses('player heroes') && !card.hasClasses('enemy done static dead stunned')){       
    var speed = card.data('speed') + (card.data('speedBonus') || 0);
    if(speed < 1) return; 
    if(speed > 3) speed = 3;
    Map.atMovementRange(card, Math.round(speed), function(neighbor){ 
      if(!neighbor.hasClass('block')) neighbor.addClass('movearea').on('contextmenu.movearea', states.table.moveSelected);
    });    
  }
  return card;
};
$.fn.highlightMove = Card.highlightMove;

Card.move = function(destiny){
  var card = this;
  if(typeof destiny == 'string') destiny = $('#'+destiny);
  var fromSpot = Map.getPosition(card);
  var toSpot = Map.getPosition(destiny);
  if(destiny.hasClass('free') && (fromSpot != toSpot) && !card.hasClass('done')){
    Map.unhighlight();
    card.closest('.spot').removeClass('block').addClass('free');      
    destiny.removeClass('free').addClass('block');    
    var t = card.offset(), d = destiny.offset();
    if(!destiny.data('detour')) card.css({top: d.top - t.top - 112, left: d.left - t.left - 22});
    else {
      var x = destiny.data('detour').offset();
      card.css({top: x.top - t.top - 112, left: x.left - t.left - 22});
      setTimeout(function(){
        card.css({top: d.top - t.top - 112, left: d.left - t.left - 22});
      }.bind({ card: card, destiny: destiny }), 250);
    }    
    if(card.data('movementBonus')) card.data('movementBonus', false);
    else card.addClass('done');   
    card.trigger('move', {card: card, target: toSpot});
    setTimeout(function(){          
      $(this.card).css({top: '', left: ''}).appendTo(this.destiny);     
      $('.map td').data('detour', false);
      Map.highlight();   
    }.bind({ card: card, destiny: destiny }), 500);  
  }
  return card;
};
$.fn.move = Card.move;

Card.cast = function(skill, target){  
  var source = this;  
  var hero = skill.data('hero');
  var skillid = skill.data('skill');
  if(skillid && hero && source.data('hero') == hero) {
    if(typeof target == 'string') {
      var t = game.skills[hero][skillid].target;
      if(t == 'spot' || t == 'around' || t == 'allaround') target = $('#'+target);
      else target = $('#'+target+' .card');
    }
    source.trigger('cast', {skill: skill, source: source, target: target});
    skills[hero][skillid].cast(skill, source, target);    
    Map.unhighlight();
    this.addClass('done');
  }
  return this;
};
$.fn.cast = Card.cast;

Card.activate = function(target){
  var skill = this;
  var hero = skill.data('hero');
  var skillid = skill.data('skill');
  if(typeof target == 'string') target = $('#'+target+' .card');                           
  if(skillid && hero && target.data('hero') == hero) {    
    skills[hero][skillid].activate(skill, target);
    Map.unhighlight();
  }
  return this;
};
$.fn.activate = Card.activate;

Card.addBuff = function(target, skill, duration, custombuff){ 
  var source = this;
  var hero = skill.data('hero');
  var skillid = skill.data('skill');
  var buffdata = skill.data('buff');
  var data = buffdata;
  var buffid = skillid;
  if(custombuff) {
    data = buffdata[custombuff];
    buffid = custombuff;
  }  
  var buff = $('<div>').addClass('buff '+hero+'-'+buffid+' '+buffid).attr({title: data.name +': '+ data.description});
  buff.data('source', source).data('hero', hero).data('skill', skill).data('skillid', skillid).data('buffid', buffid);
  if(duration) buff.data('duration', duration);
  $('<div>').appendTo(buff).addClass('img');
  $('<div>').appendTo(buff).addClass('overlay');
  target.children('.buffs').append(buff);
  target.data(hero+'-'+(custombuff||skillid)+'-buff', buff);
  return buff;
};
$.fn.addBuff = Card.addBuff;

Card.hasBuff = function(buff){ 
  var target = this;
  return target.find('.buffs .'+buff).length;
};
$.fn.hasBuff = Card.hasBuff;

Card.removeBuff = function(buff){ 
  var target = this;
  target.find('.buffs .'+buff).remove();
  if(target.hasClass('selected')) target.select();
};
$.fn.removeBuff = Card.removeBuff;

Card.addStun = function(stun){ 
  this.addClass('stunned');
  var currentstun = this.data('stun');
  if(!currentstun || stun > currentstun) this.data('stun', stun);
  return this;
};
$.fn.addStun = Card.addStun;

Card.reduceBuffs = function(){
  var hero = this;
  if(hero.hasClass('stunned')){
    var currentstun = parseInt(hero.data('stun')); 
    if(currentstun > 0) hero.data('stun', currentstun - 1); 
    else hero.trigger('stunend', {target: hero}).data('stun', null).removeClass('stunned').removeBuff('stun');
  }  
  $('.buffs .buff', hero).each(function(){
    var buff = $(this);
    var duration = buff.data('duration');
    if(duration > 0) buff.data('duration', duration - 1);
    else hero.removeBuff(buff.data('buffid'));
  });    
  if(hero.hasClass('selected')) hero.select();
  return this;
};
$.fn.reduceBuffs = Card.reduceBuffs;

Card.discard = function(){
  if(this.hasClass('player')) this.appendTo(states.table.playerCemitery);
  else this.appendTo(states.table.enemySkillsDeck);
};
$.fn.discard = Card.discard;


Card.strokeAttack = function(){    
  var card = this;
  if(!card.hasClasses('done dead stunned')){        
    var spot = Map.getPosition(card), range = Map.getRange(card.data('range'));     
    Map.stroke(spot, range, card.data('side')+'attack');
  }
  return card;
};
$.fn.strokeAttack = Card.strokeAttack;

Card.highlightAttack = function(){    
  var card = this;
  if(card.hasAllClasses('player heroes') && !card.hasClasses('enemy done dead stunned')){        
    var spot = Map.getPosition(card), range = Map.getRange(card.data('range')); 
    Map.inRange(spot, range, function(neighbor){
      var card = $('.card', neighbor);        
      if(card.hasClass('enemy')) card.addClass('attacktarget').on('contextmenu.attack', states.table.attackWithSelected);        
    });
  }
  return card;
};
$.fn.highlightAttack = Card.highlightAttack;

Card.attack = function(target){ 
  if(typeof target == 'string') target = $('#'+target+' .card');
  var source = this;
  var fromSpot = Map.getPosition(source); 
  var toSpot = Map.getPosition(target);  
  if(source.data('damage') && (fromSpot != toSpot) && !source.hasClass('done') && target.data('currenthp')){
    if(source.data('replacedamage')) source.trigger('attack', {source: source, target: target});
    else {
      source.trigger('attack', {source: source, target: target}).damage(source.data('damage'), target, 'Physical');
    }
  }
  source.addClass('done');
  return this;
};
$.fn.attack = Card.attack;

Card.damage = function(damage, target, type){ 
  if(damage < 1) return this;
  else damage = Math.round(damage);
  var source = this;
  if(!type) type = 'Physical';
  if(typeof target == 'string') target = $('#'+target+' .card');
  var hp = target.data('currenthp') - damage;
  target.changehp(hp);  
  if(hp < 1) {
    var spot = Map.getPosition(target);    
    setTimeout(function(){ target.trigger('die', {source: this, target: target, spot: spot}).die(); }, 2000);
    if(source.hasClass('heroes') && target.hasClass('heroes')){
      game[source.data('side')].kills += 1;
      var kills = source.data('kills') + 1;
      source.data('kills', kills);
      source.find('.kills').text(kills);
      game[target.data('side')].deaths += 1;
      var deaths = source.data('deaths') + 1;      
      target.data('deaths', deaths);
      source.find('.deaths').text(deaths);
    }
  }
  var damageFx = target.children('span.damage'); 
  if(damageFx.length){
    var currentDamage = parseInt(damageFx.text());
    damageFx.text(currentDamage + damage);
  } else {
    damageFx = $('<span>').addClass('damage').text(damage).appendTo(target);    
  }
  if(source.data('crit')) {
    source.data('crit', false);
    damageFx.addClass('critical');
  }
  return this;
};
$.fn.damage = Card.damage;

Card.heal = function(healhp){ 
  healhp = Math.ceil(healhp);
  var target = this;
  var currenthp = target.data('currenthp');
  var maxhp = this.data('hp');
  var hp = currenthp + healhp;
  
  if(hp > maxhp){
    healhp = maxhp - currenthp;
    target.changehp(maxhp);
  } else {
    target.changehp(hp);
  }  
  if(healhp > 0){
    var healFx = target.children('span.heal'); 
    if(healFx.length){
      var currentHeal = parseInt(healFx.text());
      healFx.text(currentHeal + healhp);
    } else {
      healFx = $('<span>').addClass('heal').text(healhp).appendTo(target);    
    }
  }

  return this;  
};
$.fn.heal = Card.heal;

Card.changehp = function(hp){
  if(hp < 1) hp = 0;
  this.children('span.hp').text(hp);
  this.data('currenthp', hp);    
  if(this.hasClass('selected')) this.select();
  return this;
};
$.fn.changehp = Card.changehp;

Card.die = function(){
  this.addClass('dead').removeClass('target');
  this.changehp(0);  
  var spot = Map.getPosition(this);
  var td = $('#'+spot);
  if(!td.hasClass('cript')) td.removeClass('block').addClass('free');
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

  } else if(this.hasClass('towers')) { 
    if(this.hasClass('player')) states.table.lose();
    else if(this.hasClass('enemy')) states.table.win();
  }
  else this.remove();
  return this;
};
$.fn.die = Card.die;

Card.reborn = function(spot){
  this.removeClass('dead');
  var hp = this.data('hp');
  this.find('.hp').text(hp);
  this.data('currenthp', hp);
  this.data('reborn', null);
  if(!spot){
    var x, y, freeSpot;
    if(this.hasClass('player')){
      x = 0; y = 3;
      spot = Map.toId(x,y);
      while($('#'+spot).hasClass('block')) {
        x++;
        spot = Map.toId(x,y);
      }    
    }
    else if(this.hasClass('enemy')) {
      x = 11; y = 1;
      spot = Map.toId(x,y);
      while($('#'+spot).hasClass('block')) {
        x--;
        spot = Map.toId(x,y);
      }
    }
  }
  this.place(spot);
  return this;
};
$.fn.reborn = Card.reborn;
