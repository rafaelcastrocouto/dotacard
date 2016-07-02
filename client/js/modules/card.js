game.card = {
  bindJquery: function () {
    $.fn.place = game.card.place;
    $.fn.select = game.card.select;
    $.fn.unselect = game.card.unselect;
    $.fn.move = game.card.move;
    $.fn.animateMove = game.card.animateMove;
    $.fn.addBuff = game.card.addBuff;
    $.fn.hasBuff = game.card.hasBuff;
    $.fn.removeBuff = game.card.removeBuff;
    $.fn.stopChanneling = game.card.stopChanneling;
    $.fn.addStun = game.card.addStun;
    $.fn.reduceStun = game.card.reduceStun;
    $.fn.attack = game.card.attack;
    $.fn.damage = game.card.damage;
    $.fn.heal = game.card.heal;
    $.fn.setDamage = game.card.setDamage;
    $.fn.setArmor = game.card.setArmor;
    $.fn.setHp = game.card.setHp;
    $.fn.setCurrentHp = game.card.setCurrentHp;
    $.fn.die = game.card.die;
    $.fn.reborn = game.card.reborn;
  },
  build: function (data) {
    var card, leg, fieldset, portrait, current, desc, range;
    card = $('<div>').addClass('card ' + data.className);
    leg = $('<legend>').text(data.name);
    fieldset = $('<fieldset>');
    portrait = $('<div>').addClass('portrait').appendTo(fieldset);
    $('<div>').appendTo(portrait).addClass('img');
    $('<div>').appendTo(portrait).addClass('overlay');
    if (data.attribute) {
      $('<h1>').appendTo(fieldset).text(data.attribute);
    } else if (game.data.heroes[data.hero]) {
      $('<h1>').appendTo(fieldset).text(game.data.heroes[data.hero].name);
    }
    current = $('<div>').addClass('current').appendTo(fieldset);
    desc = $('<div>').addClass('desc').appendTo(fieldset);
    if (data.hp) {
      $('<p>').addClass('hp').appendTo(desc).text(game.data.ui.hp + ': ' + data.hp);
      data['current hp'] = data.hp;
      $('<p>').addClass('hp').appendTo(current).html('HP <span>' + data.hp + '</span>');
    }
    range = '';
    if (data.damage) {
      if (data.range) {
        range = ' (' + data.range + ')';
      }
      $('<p>').addClass('damage').appendTo(desc).text(game.data.ui.damage + ': ' + data.damage + range);
      data['current damage'] = data.damage;
      $('<p>').addClass('damage').appendTo(current).html('DMG <span>' + data.damage + '</span>');
    }
    if (data.range && !range) {
      $('<p>').appendTo(desc).text(game.data.ui.range + ': ' + data.range);
    }
    if (data.armor) {
      $('<p>').appendTo(desc).text(game.data.ui.armor + ': ' + data.armor + '%').addClass('armor');
    }
    if (data.resistance) {
      $('<p>').appendTo(desc).text(game.data.ui.resistance + ': ' + data.resistance + '%').addClass('resistance');
    }
    if (data.mana) {
      $('<p>').appendTo(desc).text(game.data.ui.mana + ': ' + data.mana);
    }
    if (data.type) {
      $('<p>').appendTo(desc).text(game.data.ui.type + ': ' + data.type);
    }
    if (data.chance) {
      $('<p>').appendTo(desc).text(game.data.ui.chance + ': ' + data.chance + '%');
    }
    if (data.percentage) {
      $('<p>').appendTo(desc).text(game.data.ui.percentage + ': ' + data.percentage + '%');
    }
    if (data.delay) {
      $('<p>').appendTo(desc).text(game.data.ui.delay + ': ' + data.delay);
    }
    if (data.damageType) {
      $('<p>').appendTo(desc).text(game.data.ui.damageType + ': ' + data.damageType);
    }
    if (data.duration) {
      $('<p>').appendTo(desc).text(game.data.ui.duration + ': ' + data.duration + ' ' + game.data.ui.turns);
    }
    if (data.dot) {
      $('<p>').appendTo(desc).text(game.data.ui.dot + ': ' + data.dot);
    }
    if (data.multiplier) {
      $('<p>').appendTo(desc).text(game.data.ui.multiplier + ': ' + data.multiplier + 'X');
    }
    if (data['hp bonus']) {
      $('<p>').appendTo(desc).text('HP Bonus: ' + data['hp bonus']);
    }
    if (data['armor bonus']) {
      $('<p>').appendTo(desc).text('Armor Bonus: ' + data['armor bonus'] + '%');
    }
    if (data.description) {
      card.attr({ title: data.name + ': ' + data.description });
      $('<p>').appendTo(desc).addClass('description').text(data.description);
    }
    if (data.kd) {
      data.kills = 0;
      data.deaths = 0;
      $('<p>').addClass('kd').appendTo(desc).html(game.data.ui.kd + ': <span class="kills">0</span>/<span class="deaths">0</span>');
    }
    if (data.buffs) {
      $('<div>').addClass('buffs').appendTo(fieldset);
    }
    $.each(data, function (item, value) {
      card.data(item, value);
    });
    card.append(leg).append(fieldset);
    return card;
  },
  place: function (target) {
    if (!target.removeClass) target = $('#' + target);
    this.closest('.spot.block').removeClass('block').addClass('free');
    this.parent().find('.fx').each(function () {
      $(this).appendTo(target);
    });
    this.appendTo(target.removeClass('free').addClass('block'));
    //if (this.data('fx') && this.data('fx').canvas) { this.data('fx').canvas.appendTo(target); }
    return this;
  },
  select: function () {//console.trace('card select', card[0].className);
    var card = $(this).closest('.card'); 
    if (card && 
        !card.hasClasses('attacktarget casttarget targetarea dead') &&
        (!event || !card.hasClass('selected'))) {
      game.card.unselect(function () {
        var card = this;
        game.selectedCard = card;
        card.trigger('select', { card: card });
        card.addClass('selected draggable');
        if (game.mode == 'tutorial') {
            if (card.hasClass('skill') && game.tutorial.lesson != 'Skill') {}
            else game.highlight.map();
        } else game.highlight.map();
        game.states.table.selectedClone = card.clone().css({'transform': ''}).appendTo(game.states.table.selectedCard).removeClass('selected tutorialblink dead draggable dragTarget').clearEvents();
        game.states.table.selectedCard.addClass('flip');
      }.bind(card));
    }
    return card;
  },
  unselect: function (cb) {
    game.highlight.clearMap();
    if (game.selectedCard) game.selectedCard.removeClass('selected draggable');
    game.selectedCard = null;
    game.states.table.selectedCard.removeClass('flip');
    if (game.states.table.selectedClone) {
      game.timeout(200, function () {
        if (game.states.table.selectedClone) {
          game.states.table.selectedClone.remove();
          game.states.table.selectedClone = null;
        }
        if (cb && typeof(cb) == 'function') cb();
      });
    } else if (cb && typeof(cb) == 'function') cb();
    
  },
  move: function (destiny) {
    if (typeof destiny === 'string') { destiny = $('#' + destiny); }
    var card = this, t, d,
      from = game.map.getPosition(card),
      to = game.map.getPosition(destiny);
    if (destiny.hasClass('free') && from !== to) {
      card.removeClass('draggable').off('mousedown touchstart');
      game.highlight.clearMap();
      card.stopChanneling();
      card.closest('.spot').removeClass('block').addClass('free');
      destiny.removeClass('free').addClass('block');
      if (!destiny.data('detour')) {
        card.animateMove(destiny);
      } else {
        card.animateMove(destiny.data('detour'));
        game.timeout(100, function () {
          this.card.animateMove(this.destiny);
        }.bind({
          card: card,
          destiny: destiny
        }));
      }
      if (card.data('movement bonus')) card.data('movement bonus', false);
      var evt = { type: 'move', card: card, target: to };
      card.trigger('move', evt).trigger('action', evt);
      game.timeout(300, function () {
//         this.card.parent().find('.fx').each(function () {
//           $(this).appendTo(this.destiny);
//         });
        this.card.css({ transform: '' }).prependTo(this.destiny).addClass('draggable').on('mousedown touchstart', game.card.select);
        $('.map .spot').data('detour', false);
      }.bind({ card: card, destiny: destiny }));
    }
    return card;
  },
  animateMove: function (destiny) {
    var from = game.map.getPosition(this), to = game.map.getPosition(destiny),
      fx = game.map.getX(from), fy = game.map.getY(from),
      tx = game.map.getX(to), ty = game.map.getY(to),
      dx = (tx - fx) * 100, dy = (ty - fy) * 100;
    this.css({ transform: 'translate3d(' + (dx - 50) + '%, ' + (dy - 40) + '%, 100px) rotateX(-30deg)' });
  },
  addBuff: function (target, data) {
    var buff = $('<div>').addClass('buff ' + (data.buff.buff || data.buff)).attr({ title: data.name + ': ' + data.description });
    $('<div>').appendTo(buff).addClass('img');
    $('<div>').appendTo(buff).addClass('overlay');
    buff.data('source', this);
    target.find('.buffs').append(buff);
    if (target.hasClass('selected')) { target.select(); }
    return buff;
  },
  hasBuff: function (buff) {
    var target = this;
    return target.find('.buffs .' + buff).length;
  },
  removeBuff: function (buffs) {
    var target = this;
    $.each(buffs.split(' '), function () {
      var buff = this;
      target.find('.buffs .' + buff).remove();
      if (target.hasClass('selected')) { target.select(); }
    });
    return this;
  },
  addStun: function (target, stun) {
    if (target.hasClass('stunned')) {
      var currentstun = target.data('stun');
      if (!currentstun || stun > currentstun) { target.data('stun', stun); }
    } else {
      target.stopChanneling();
      this.addBuff(target, {
        name: 'Stun',
        buff: 'stun',
        description: 'Unit is stunned and cannot move, attack or cast'
      });
      target.addClass('stunned').data('stun', stun);
      if (target.hasClass('selected')) { target.select(); }
    }
    return this;
  },
  reduceStun: function () {
    var target = this, currentstun;
    if (target.hasClass('stunned')) {
      currentstun = parseInt(target.data('stun'), 10);
      if (currentstun > 0) {
        target.data('stun', currentstun - 1);
      } else { 
        target.trigger('stunend', { target: target }).data('stun', null).removeClass('stunned').removeBuff('stun');
        if (target.hasClass('selected')) { target.select(); }
      }
    }
    return this;
  },
  stopChanneling: function () {
    this.trigger('channelEnd').data('channel', null).data('channeling', null).removeClass('channeling').off('channel');
  },
  setDamage: function (damage) {
    damage = parseInt(damage, 10);
    this.find('.current .damage span').text(damage);
    this.data('current damage', damage);
    if (this.hasClass('selected')) { this.select(); }
    return this;
  },
  setCurrentHp: function (hp) {
    if (hp < 1) { hp = 0; }
    this.find('.current .hp span').text(hp);
    this.data('current hp', hp);
    if (this.hasClass('selected')) { this.select(); }
    return this;
  },
  setHp: function (hp) {
    if (hp < 1) { hp = 0; }
    this.find('.desc .hp').text(hp);
    this.data('hp', hp);
    if (this.hasClass('selected')) { this.select(); }
    return this;
  },
  setArmor: function (armor) {
    this.find('.desc .armor').text(game.data.ui.armor + ': ' + armor + '%');
    this.data('armor', armor);
    if (this.hasClass('selected')) { this.select(); }
    return this;
  },
  attack: function (target) {
    if (typeof target === 'string') { target = $('#' + target + ' .card'); }
    var source = this, damage = source.data('current damage'), name,
      from = game.map.getPosition(source),
      to = game.map.getPosition(target);
    if (damage && from !== to && target.data('current hp')) {
      source.stopChanneling();
      var evt = {
        type: 'attack',
        source: source,
        target: target
      };
      source.trigger('attack', evt).trigger('action', evt);
      game.timeout(10, function () {
        var damage = source.data('current damage');
        if (source.data('crit')) {
          damage = source.data('crit damage');
        }
        source.damage(damage, target, game.data.ui.physical);
        source.trigger('afterattack', evt);
        if (source.hasClass('tower')) {
          name = 'tower';
        } else if (source.hasClass('bear')) {
          name = 'bear';
        } else { name = source.data('hero'); }
        game.audio.play(name + '/attack');
      });
    }
    return this;
  },
  damage: function (damage, target, type) {
    if (damage < 1) { return this; } 
    else { damage = Math.ceil(damage); }
    var source = this, evt, x, y, position, spot, resistance, armor, hp, currentDamage;
    if (source.data('crit')) {
      damage = source.data('crit damage');
      source.data('crit', false);
    }
    if (!type) { type = game.data.ui.physical; }
    resistance = 1 - target.data('resistance') / 100;
    if (type === game.data.ui.magical && resistance) { damage = Math.round(damage * resistance); }
    armor = 1 - target.data('armor') / 100;
    if (type === game.data.ui.physical && armor) { damage = Math.round(damage * armor); }
    if (typeof target === 'string') { target = $('#' + target + ' .card'); }
    hp = target.data('current hp') - damage;
    target.setCurrentHp(hp);
    position = game.map.getPosition(target);
    x = game.map.getX(position);
    y = game.map.getY(position);
    spot = game.map.getSpot(x, y);
    evt = {
      source: this,
      target: target,
      spot: spot,
      x: x,
      y: y,
      position: position,
      damage: damage,
      type: type
    };
    target.trigger('damage', evt);
    if (hp < 1) game.timeout(400, game.card.kill.bind(game, evt));
    if (source.data('crit')) {
      damageFx = target.find('.damaged.critical');
      if (!damageFx.length) {
        damageFx = $('<span>').addClass('damaged critical').appendTo(target);
      } else {
        damage += parseInt(damageFx.text(), 10);
      }
    } else {
      damageFx = target.find('.damaged').not('.critical');
      if (!damageFx.length) {
        damageFx = $('<span>').addClass('damaged').appendTo(target);
      } else {
        damage += parseInt(damageFx.text(), 10);
      }
    }
    damageFx.text(damage);
    game.timeout(2000, function () {
      this.remove();
    }.bind(damageFx));
    return this;
  },
  heal: function (healhp) {
    if (healhp < 1) { return this; } 
    else { healhp = Math.ceil(healhp); }
    var healFx, currentHeal,
      currenthp = this.data('current hp'),
      maxhp = this.data('hp'),
      hp = currenthp + healhp;
    if (hp > maxhp) {
      healhp = maxhp - currenthp;
      this.setCurrentHp(maxhp);
    } else {
      this.setCurrentHp(hp);
    }
    healFx = this.find('.heal');
    if (healFx.length && game.mode !== 'library') {
      currentHeal = parseInt(healFx.text(), 10);
      healFx.text(currentHeal + healhp);
    } else {
      healFx.remove();
      healFx = $('<span>').addClass('heal').text(healhp).appendTo(this);
    }
    game.timeout(2000, function () {
      this.remove();
    }.bind(healFx));
    return this;
  },
  kill: function (evt) {
    var target = evt.target,
        source = evt.source;
    target.addClass('dead').removeClass('target done').setCurrentHp(0);
    game.timeout(400, function () {
      this.source.trigger('kill', this);
      this.target.die(this);
    }.bind(evt));
    if (source.hasClass('hero') && target.hasClass('hero')) {
      game[source.data('side')].kills += 1;
      var kills = source.data('kills') + 1;
      source.data('kills', kills);
      source.find('.kills').text(kills);
      game[target.data('side')].deaths += 1;
      var deaths = target.data('deaths') + 1;
      target.data('deaths', deaths);
      target.find('.deaths').text(deaths);
      if (target.hasClass('selected')) { target.select(); }
      else if (source.hasClass('selected')) { source.select(); }
    }
  },
  die: function (evt) {
    this.trigger('death', evt);
    this.data('killer', evt.source);
    this.addClass('dead').removeClass('target done').setCurrentHp(0);
    var pos = game.map.getPosition(this), deaths,
      spot = $('#' + pos);
    if (!spot.hasClass('cript')) { spot.removeClass('block').addClass('free'); }
    if (this.hasClass('hero')) {
      deaths = this.data('deaths') + 1;
      this.data('deaths', deaths);
      this.find('.deaths').text(deaths);
      this.data('reborn', game.time + game.deadLength);
      if (this.hasClass('player')) {
        this.appendTo(game.player.heroesDeck);
      } else if (this.hasClass('enemy')) { this.appendTo(game.enemy.heroesDeck); }
    } else if (this.hasClass('tower')) {
      if (this.hasClass('player')) {
        if (game[game.mode].lose) game[game.mode].lose();
      } else if (this.hasClass('enemy')) { 
        if (game[game.mode].win) game[game.mode].win(); 
      }
    } else { this.remove(); }
    return this;
  },
  reborn: function (spot) {
    var hp = this.data('hp'), x, y, freeSpot;
    if (!spot) {
      if (this.hasClass('player')) {
        x = 0;
        y = 3;
        spot = game.map.toId(x, y);
        while ($('#' + spot).hasClass('block')) {
          x += 1;
          spot = game.map.toId(x, y);
        }
      } else if (this.hasClass('enemy')) {
        x = 11;
        y = 1;
        spot = game.map.toId(x, y);
        while ($('#' + spot).hasClass('block')) {
          x -= 1;
          spot = game.map.toId(x, y);
        }
      }
    }
    if (spot && spot.length) {      
      var side = this.data('side');
      var tower = game[side].tower;
      var unit = this.data('killer');
      unit.damage(1, tower);
      this.data('reborn', null);
      this.setCurrentHp(hp);
      this.removeClass('dead');
      this.place(spot);
      this.trigger('reborn');
      return this;
    }
  }
};
