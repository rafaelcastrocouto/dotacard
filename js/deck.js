//damage = lvl15 d * .05
//hp = lvl15 hp * 0.05
//reg = hp*0.03  (hp/33.333...)
//mana = lvl15 mana * 0.001
//skills lvl3 ults lvl2
//cards = 100/cooldown 

var Card = function(data){ 
  data.el = $('<div>').addClass('card '+ data.className).attr('id', data.id); 
  data.el.data('card', data);
  var fieldset = $('<fieldset>').appendTo(data.el); 
  $('<legend>').appendTo(fieldset).text(data.name); 
  $('<span>').addClass('hp').appendTo(data.el).text(data.hp); 
  var portrait = $('<div>').addClass('portrait').appendTo(fieldset);
  $('<img>').appendTo(portrait).attr('src', data.img);
  $('<div>').addClass('overlay').appendTo(portrait);
  $('<h1>').appendTo(fieldset).text(data.attribute + ' | ' + data.attackType );  
  $('<p>').appendTo(fieldset).text('HP: '+ data.hp);
  if(data.regen) $('<p>').appendTo(fieldset).text('Regeneration: '+data.regen);
  if(data.damage) $('<p>').appendTo(fieldset).text('Damage: '+ data.damage);
  if(data.mana) $('<p>').appendTo(fieldset).text('Mana: ' + data.mana);
  if(data.skills) $('<p>').appendTo(fieldset).text('Skills: '+ data.skills);  
  if(data.passive) $('<p>').appendTo(fieldset).text('Passive skills: '+ data.passive);
  if(data.permanent) $('<p>').appendTo(fieldset).text('Permanent skills: '+ data.permanent);
  if(data.temporary) $('<p>').appendTo(fieldset).text('Special skills: '+ data.temporary);

  return data;
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

