game.card = {
  bindJquery: function () {
    $.fn.place = game.card.place;
    $.fn.select = game.card.select;
    $.fn.unselect = game.card.unselect;
    $.fn.highlightSource = game.card.highlightSource;
    $.fn.highlightTargets = game.card.highlightTargets;
    $.fn.strokeSkill = game.card.strokeSkill;
    $.fn.highlightMove = game.card.highlightMove;
    $.fn.move = game.card.move;
    $.fn.animateMove = game.card.animateMove;
    $.fn.cast = game.card.cast;
    $.fn.stopChanneling = game.card.stopChanneling;
    $.fn.passive = game.card.passive;
    $.fn.toggle = game.card.toggle;
    $.fn.addBuff = game.card.addBuff;
    $.fn.hasBuff = game.card.hasBuff;
    $.fn.removeBuff = game.card.removeBuff;
    $.fn.addStun = game.card.addStun;
    $.fn.reduceStun = game.card.reduceStun;
    $.fn.discard = game.card.discard;
    $.fn.strokeAttack = game.card.strokeAttack;
    $.fn.highlightAttack = game.card.highlightAttack;
    $.fn.attack = game.card.attack;
    $.fn.damage = game.card.damage;
    $.fn.heal = game.card.heal;
    $.fn.changedamage = game.card.changedamage;
    $.fn.changehp = game.card.changehp;
    $.fn.die = game.card.die;
    $.fn.reborn = game.card.reborn;
  },
  build: function (data) {
    var card, fieldset, portrait, current, desc, range;
    card = $('<div>').addClass('card ' + data.className);
    $('<legend>').appendTo(card).text(data.name);
    fieldset = $('<fieldset>').appendTo(card);
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
    if (data.mana) {
      $('<p>').appendTo(desc).text(game.data.ui.mana + ': ' + data.mana);
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
      $('<p>').appendTo(desc).text(game.data.ui.armor + ': ' + data.armor + '%');
    }
    if (data.resistance) {
      $('<p>').appendTo(desc).text(game.data.ui.resistance + ': ' + data.resistance + '%');
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
    return card;
  },
  place: function (target) {
    if (!target.removeClass) {
      target = $('#' + target);
    }
    this.closest('spot.block').removeClass('block').addClass('free');
    this.parent().find('.fx').each(function () {
      $(this).appendTo(target);
    });
    this.appendTo(target.removeClass('free').addClass('block'));
    if (this.data('fx') && this.data('fx').canvas) { this.data('fx').canvas.appendTo(target); }
    return this;
  },
  select: function (event) { 
    var card = $(this).closest('.card'); //console.log('card select', card[0]);
    if (!game.selectedCard || card[0] !== game.selectedCard[0]) {
      if (!card.hasClasses('attacktarget casttarget')) {
        game.card.unselect();
        game.selectedCard = card;
        game.map.highlight();
        card.clone().appendTo(game.states.table.selectedArea).addClass('zoom').removeClass('tutorialblink').clearEvents();
        card.addClass('selected draggable');
        card.trigger('select', { card: card });
        setTimeout(function () {
          game.states.table.selectedArea.addClass('flip');
        });
      }
    }
    return card;
  },
  unselect: function () {
    game.map.unhighlight();
    if (game.selectedCard) {
      game.selectedCard.removeClass('selected draggable');
    }
    game.selectedCard = null;
    game.states.table.selectedArea.removeClass('flip');
    //game.states.table.selectedArea.trigger('unselect');
    var del = $('.selectedarea .card')[0];
    if (del) setTimeout(function () { $(this).remove(); }.bind(del), 400);
  },
  highlightSource: function () {
    var skill = this, hero = skill.data('hero');
    if (hero) $('.map .card.player.hero.' + hero).addClass('source');
    return skill;
  },
  highlightTargets: function () {
    var skill = this, hero = skill.data('hero');
    if (hero) {
      var source = $('.map .source');
      if (source.hasClasses('hero unit')) {
        if (skill.data('type') === game.data.ui.passive) {
          game.card.highlightPassive(source);
        } else if (skill.data('type') === game.data.ui.toggle) {
          game.card.highlightToggle(source);
        } else if (skill.data('type') === game.data.ui.active) {
          game.card.highlightActive(source, skill);
        }
      }
    }
    return skill;
  },
  highlightPassive: function (source) {
    if (!source.hasClass('dead')) {
      source.addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.passive);
    }
  },
  highlightToggle: function (source) {
    if (!source.hasClasses('dead done stunned silenced hexed disabled sleeping cycloned taunted')) {
      source.addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.toggle);
    }
  },
  highlightSelf: function (source) {
    source.addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.cast);
  },
  hightlightAlly: function (source, skill) {
    var range = game.map.getRange(skill.data('range'));
    if (range === game.data.ui.global) {
      $('.map .player').addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.cast);
    } else {
      var pos = game.map.getPosition(source);
      game.map.inRange(pos, range, function (neighbor) {
        var card = $('.card', neighbor);
        if (card.hasClass('player')) {
          card.addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.cast);
        }
      });
    }
  },
  highlightEnemy: function (source, skill) {
    var range = game.map.getRange(skill.data('range'));
    if (range === game.data.ui.global) {
      $('.map .enemy').addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.cast);
    } else {
      var pos = game.map.getPosition(source);
      game.map.inRange(pos, range, function (neighbor) {
        var card = $('.card', neighbor);
        if (card.hasClass('enemy')) {
          card.addClass('casttarget').on('mouseup.highlight touchend.highlightd', game.player.cast);
        }
      });
    }
  },
  hightlightSummoner: function (source, skill) {
    var pos = game.map.getPosition(source.data(game.data.ui.sumonner)),
        range = game.map.getRange(skill.data('range'));
    game.map.around(pos, range, function (neighbor) {
      if (neighbor.hasClass('free')) {
        neighbor.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
      }
    });
  },
  hightlightFreeSpots: function (source, skill) {
    var pos = game.map.getPosition(source),
        range = game.map.getRange(skill.data('range'));
    game.map.around(pos, range, function (neighbor) {
      if (neighbor.hasClass('free')) {
        neighbor.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
      }
    });
  },
  hightlightRadial: function (source, skill) {
    var pos = game.map.getPosition(source),
        range = game.map.getRange(skill.data('range'));
    game.map.around(pos, range, function (neighbor) {
      neighbor.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
      if (neighbor.hasClass('block')) {
        var card = $('.card', neighbor);
        card.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
      }
    });
  },
  highlightLinear: function (source, skill) {
    var pos = game.map.getPosition(source),
        range = skill.data('aoe range'),
        width = skill.data('aoe width');
    game.map.atCross(pos, range, width, function (neighbor) {
      neighbor.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
      if (neighbor.hasClass('block')) {
        var card = $('.card', neighbor);
        card.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
      }
    });
  },
  highlightActive: function (source, skill) {
    var targets = skill.data('targets');
    if (!source.hasClasses('dead done stunned frozen silenced hexed disabled sleeping cycloned taunted')) {
      if (targets.indexOf(game.data.ui.self) >= 0) game.card.highlightSelf(source);
      if (targets.indexOf(game.data.ui.ally) >= 0) game.card.highlightAlly(source, skill);
      if (targets.indexOf(game.data.ui.enemy) >= 0) game.card.highlightEnemy(source, skill);
      if (targets.indexOf(game.data.ui.sumonner) >= 0) game.card.hightlightSummoner(source, skill);
      if (targets.indexOf(game.data.ui.spot) >= 0) {
        if (targets.indexOf(game.data.ui.free) >= 0) game.card.hightlightFreeSpots(source, skill);
        else {
          var aoe = skill.data('aoe');
          if (aoe === 'Radial') game.card.hightlightRadial(source, skill);
          if (aoe === 'Linear') game.card.highlightLinear(source, skill);
        }
      }
    }
  },
  highlightMove: function () {
    var card = this, speed;
    if (card.hasClass('player') && card.hasClasses('unit hero') && !card.hasClasses('enemy done static dead stunned frozen entangled disabled sleeping cycloned taunted')) {
      speed = card.data('current speed');
      if (speed < 1) { return card; }
      if (speed > 3) { speed = 3; }
      game.map.atMovementRange(card, Math.round(speed), function (neighbor) {
        if (!neighbor.hasClass('block')) { 
          neighbor.addClass('movearea').on('mouseup.highlight touchend.highlight', game.player.move); 
        }
      });
    }
    return card;
  },
  strokeSkill: function () { 
    var skill = this,
      hero = skill.data('hero'),
      source = $('.map .source'),
      range,
      pos = game.map.getPosition(source);
    if (hero && pos && !source.hasClasses('dead done stunned')) {
      if (skill.data('aoe')) {
        game.castpos = pos;
        game.aoe = skill.data('aoe');
        if (game.aoe === 'Linear') {
          game.aoewidth = skill.data('aoe width');
          game.aoerange = skill.data('aoe range');
          game.map.crossStroke(pos, game.aoerange, game.aoewidth, 'skillarea');
        } else if (game.aoe === 'Radial') {
          game.aoerange = game.map.getRange(skill.data('range'));
          game.aoecastrange = game.map.getRange(skill.data('aoe range'));
        }
        $('.map .spot, .map .card').hover(function () {
          var spot = $(this);
          $('.map .spot').removeClass('skillarea skillcast top right left bottom');
          if (spot.hasClass('targetarea')) {
            if (game.aoe === 'Linear') {
              game.map.linearStroke(game.map.getPosition($(this)), game.aoerange, game.aoewidth, 'skillcast');
            } else if (game.aoe === 'Radial') {
              game.map.radialStroke(game.map.getPosition($(this)), game.aoecastrange, 'skillcast');
            }
          } else {
            if (game.aoe === 'Linear') {
              game.map.crossStroke(game.castpos, game.aoerange, game.aoewidth, 'skillarea');
            } else if (game.aoe === 'Radial') {
              game.map.radialStroke(game.castpos, game.aoerange, 'skillarea');
            }
          }
        });
      }
      if (skill.data('range')) {
        game.map.radialStroke(pos, game.map.getRange(skill.data('range')), 'skillarea');
      }
    }
    return skill;
  },
  move: function (destiny) {
    if (typeof destiny === 'string') { destiny = $('#' + destiny); }
    var card = this, t, d,
      from = game.map.getPosition(card),
      to = game.map.getPosition(destiny);
    if (destiny.hasClass('free') && from !== to) {
      game.map.unhighlight();
      card.stopChanneling();
      card.closest('.spot').removeClass('block').addClass('free');
      destiny.removeClass('free').addClass('block');
      t = card.offset();
      d = destiny.offset();
      if (!destiny.data('detour')) {
        card.animateMove(destiny);
      } else {
        card.animateMove(destiny.data('detour'));
        setTimeout(function () {
          this.card.animateMove(this.destiny);
        }.bind({
          card: card,
          destiny: destiny
        }), 200);
      }
      if (card.data('movement bonus')) {
        card.data('movement bonus', false);
      } else { card.addClass('done'); }
      card.trigger('move', { card: card, target: to });
      setTimeout(function () {
//         this.card.parent().find('.fx').each(function () {
//           $(this).appendTo(this.destiny);
//         });
        $(this.card).css({ transform: '' }).prependTo(this.destiny);
        $('.map .spot').data('detour', false);
        game.map.highlight();
        //if (game.events.dragging) game.events.end();
      }.bind({
        card: card,
        destiny: destiny
      }), 400);
    }
    return card;
  },
  animateMove: function (destiny) {
    var from = game.map.getPosition(this), to = game.map.getPosition(destiny),
      fx = game.map.getX(from), fy = game.map.getY(from),
      tx = game.map.getX(to), ty = game.map.getY(to),
      dx = (tx - fx) * 100, dy = (ty - fy) * 100;
    this.css({ transform: 'translate3d(' + (dx - 50) + '%, ' + (dy - 50) + '%, 100px) rotateX(-30deg)' });
  },
  cast: function (skill, target) {
    var source = this, targets, duration, channeler, channelDuration,
      hero = skill.data('hero'),
      skillid = skill.data('skill');
    if (skillid && hero && source.data('hero') === hero) {
      if (typeof target === 'string') {
        targets = game.data.skills[hero][skillid].targets;
        if (targets.indexOf(game.data.ui.spot) >= 0) {
          target = $('#' + target);
        } else {target = $('#' + target + ' .card'); }
      }
      if (target.length) {
        source.stopChanneling();
        source.trigger('cast', {
          skill: skill,
          source: source,
          target: target
        });
        game.skills[hero][skillid].cast(skill, source, target);
        if (game.audio.sounds.indexOf(hero + '/' + skillid) >= 0) {
          game.audio.play(hero + '/' + skillid);
        }
        channelDuration = skill.data('channel');
        if (channelDuration) {
          source.data('channeling', channelDuration).addClass('channeling');
          source.on('channel', function (event, eventdata) {
            channeler = eventdata.source;
            duration = channeler.data('channeling');
            if (duration) {
              duration -= 1;
              channeler.data('channeling', duration);
            } else {
              channeler.stopChanneling();
            }
          });
        }
        if (source.hasClass('enemy')) {
          game.enemy.hand -= 1;
        } else {
          setTimeout(function () {
            this.select();
          }.bind(source));
        }
        source.addClass('done');
        setTimeout(function () {
          this.discard();
        }.bind(skill), 400);
      }
    }
    return this;
  },
  stopChanneling: function () {
    this.data('channeling', false).removeClass('channeling').off('channel');
  },
  passive: function (target) {
    var skill = this,
      hero = skill.data('hero'),
      skillid = skill.data('skill');
    if (typeof target === 'string') { target = $('#' + target + ' .card'); }
    if (skillid && hero && target.data('hero') === hero) {
      target.trigger('passive', {
        skill: skill,
        target: target
      });
      game.skills[hero][skillid].passive(skill, target);
      if (skill.hasClass('enemy')) {
        game.enemy.hand -= 1;
      } else { target.select(); }
      setTimeout(function () {
        skill.remove();
      }, 400);
    }
    return this;
  },
  toggle: function (target) {
    var skill = this,
      hero = skill.data('hero'),
      skillid = skill.data('skill');
    if (typeof target === 'string') { target = $('#' + target + ' .card'); }
    if (skillid && hero && target.data('hero') === hero) {
      target.trigger('toggle', {
        skill: skill,
        target: target
      });
      game.skills[hero][skillid].toggle(skill, target);
      if (skill.hasClass('enemy')) {
        game.enemy.hand -= 1;
      } else { target.select(); }
    }
    return this;
  },
  addBuff: function (target, data) {
    var buff = $('<div>').addClass('buff ' + data.buff).attr({ title: data.name + ': ' + data.description });
    $('<div>').appendTo(buff).addClass('img');
    $('<div>').appendTo(buff).addClass('overlay');
    buff.data('source', this);
    target.find('.buffs').append(buff);
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
    }
    return this;
  },
  reduceStun: function () {
    var hero = this, currentstun;
    if (hero.hasClass('stunned')) {
      currentstun = parseInt(hero.data('stun'), 10);
      if (currentstun > 0) {
        hero.data('stun', currentstun - 1);
      } else { hero.trigger('stunend', { target: hero }).data('stun', null).removeClass('stunned').removeBuff('stun'); }
    }
    if (hero.hasClass('selected')) { hero.select(); }
    return this;
  },
  discard: function () {
    if (this.hasClass('skill')) {
      this.trigger('discard', {target: this});
      if (this.hasClass('player')) {
        if (this.data('deck') === game.data.ui.temp) {
          this.appendTo(game.player.skills.temp);
        } else {
          this.appendTo(game.player.skills.cemitery);
        }
      } else {
        this.appendTo(game.enemy.skills.deck);
        game.enemy.hand -= 1;
      }
    }
  },
  strokeAttack: function () {
    var card = this, pos, range;
    if (!card.hasClasses('done dead stunned disabled disarmed hexed')) {
      pos = game.map.getPosition(card);
      range = game.map.getRange(card.data('range'));
      game.map.radialStroke(pos, range, card.data('side') + 'attack');
    }
    return card;
  },
  highlightAttack: function () {
    var card = this, pos, range;
    if (card.hasClass('player') && card.hasClasses('unit hero') && !card.hasClasses('enemy done dead stunned frozen')) {
      pos = game.map.getPosition(card);
      range = game.map.getRange(card.data('range'));
      game.map.inRange(pos, range, function (neighbor) {
        var card = $('.card', neighbor);
        if (card.hasClass('enemy')) { card.addClass('attacktarget').on('mouseup.highlight touchend.highlight', game.player.attack); }
      });
    }
    return card;
  },
  attack: function (target) {
    if (typeof target === 'string') { target = $('#' + target + ' .card'); }
    var source = this, name,
      from = game.map.getPosition(source),
      to = game.map.getPosition(target);
    if (source.data('current damage') && from !== to && target.data('current hp')) {
      source.stopChanneling();
      source.trigger('attack', {
        source: source,
        target: target
      });
      source.damage(source.data('current damage'), target, game.data.ui.physical);
      source.trigger('afterattack', {
        source: source,
        target: target
      });
      if (source.hasClass('tower')) {
        name = 'tower';
      } else if (source.hasClass('bear')) {
        name = 'bear';
      } else { name = source.data('hero'); }
      game.audio.play(name + '/attack');
      source.addClass('done');
    }
    return this;
  },
  damage: function (damage, target, type) {
    if (damage < 1) {
      return this;
    } else { damage = Math.round(damage); }
    var source = this, evt, x, y, position, spot, resistance, armor, hp, currentDamage, kills, deaths, damageFx;
    if (!type) { type = game.data.ui.physical; }
    resistance = 1 - target.data('resistance') / 100;
    if (type === game.data.ui.magical && resistance) { damage = Math.round(damage * resistance); }
    armor = 1 - target.data('armor') / 100;
    if (type === game.data.ui.physical && armor) { damage = Math.round(damage * armor); }
    if (typeof target === 'string') { target = $('#' + target + ' .card'); }
    hp = target.data('current hp') - damage;
    target.changehp(hp);
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
    if (hp < 1) {
      target.addClass('dead').removeClass('target done').changehp(0);
      setTimeout(function () {
        this.trigger('kill', evt);
        target.trigger('die', evt);
        target.die();
      }, 2000);
      if (source.hasClass('hero') && target.hasClass('hero')) {
        game[source.data('side')].kills += 1;
        kills = source.data('kills') + 1;
        source.data('kills', kills);
        source.find('.kills').text(kills);
        game[target.data('side')].deaths += 1;
        deaths = target.data('deaths') + 1;
        target.data('deaths', deaths);
        target.find('.deaths').text(deaths);
      }
    }
    damageFx = target.find('.damaged');
    if (damageFx.length) {
      currentDamage = parseInt(damageFx.text(), 10);
      damageFx.text(currentDamage + damage).appendTo(target);
    } else {
      damageFx = $('<span>').addClass('damaged').text(damage).appendTo(target);
    }
    if (source.data('crit')) {
      source.data('crit', false);
      damageFx.addClass('critical');
    }
    return this;
  },
  changedamage: function (damage) {
    damage = parseInt(damage, 10);
    this.find('.current .damage span').text(damage);
    this.data('current damage', damage);
    if (this.hasClass('selected')) { this.select(); }
    return this;
  },
  heal: function (healhp) {
    healhp = Math.ceil(healhp);
    var healFx, currentHeal,
      currenthp = this.data('current hp'),
      maxhp = this.data('hp'),
      hp = currenthp + healhp;
    if (hp > maxhp) {
      healhp = maxhp - currenthp;
      this.changehp(maxhp);
    } else {
      this.changehp(hp);
    }
    if (healhp > 0) {
      healFx = this.find('.heal');
      if (healFx.length) {
        currentHeal = parseInt(healFx.text(), 10);
        healFx.text(currentHeal + healhp);
      } else {
        healFx = $('<span>').addClass('heal').text(healhp).appendTo(this);
      }
    }
    return this;
  },
  changehp: function (hp) {
    if (hp < 1) { hp = 0; }
    this.find('.current .hp span').text(hp);
    this.data('current hp', hp);
    if (this.hasClass('selected')) { this.select(); }
    return this;
  },
  die: function () {
    this.addClass('dead').removeClass('target done').changehp(0);
    var pos = game.map.getPosition(this), deaths,
      spot = $('#' + pos);
    if (!spot.hasClass('cript')) { spot.removeClass('block').addClass('free'); }
    if (this.hasClass('selected')) { this.select(); }
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
        game.online.lose();
      } else if (this.hasClass('enemy')) { game.online.win(); }
    } else { this.remove(); }
    return this;
  },
  reborn: function (spot) {
    this.removeClass('dead');
    var hp = this.data('hp'), x, y, freeSpot;
    this.find('.hp').text(hp);
    this.data('current hp', hp);
    this.data('reborn', null);
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
    this.place(spot);
    this.trigger('reborn');
    return this;
  }
};
