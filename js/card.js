var card = function(data){ 

  data.el = $('<div>').addClass('card').attr('id', data.id); 

  var fieldset = $('<fieldset>').appendTo(data.el); 
  $('<legend>').appendTo(fieldset).text(data.name); 
  var portrait = $('<div>').addClass('portrait').appendTo(fieldset);
  $('<img>').appendTo(portrait).attr('src', data.img);
  $('<div>').addClass('overlay').appendTo(portrait);
  $('<h1>').appendTo(fieldset).text(data.attribute);
  $('<p>').appendTo(fieldset).text('HP: '+ data.hp + '| Regeneration: '+data.regen + '| Mana: ' + data.mana);
  $('<p>').appendTo(fieldset).text('Skills: '+ data.skills);  
  if(data.passive) $('<p>').appendTo(fieldset).text('Passive skills: '+ data.passive);
  if(data.permanent) $('<p>').appendTo(fieldset).text('Permanent skills: '+ data.permanent);
  if(data.temporary) $('<p>').appendTo(fieldset).text('Special skills: '+ data.temporary);

  return data;
};

//hp = lvl15 hp * 0.05
//reg = hp*0.03  (hp/33.333...)
//mana = lvl15 mana * 0.001
//skills lvl3 ults lvl2
//cards = 100/cooldown 
