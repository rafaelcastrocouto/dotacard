/* by rafælcastrocouto */
/*jslint browser: true, regexp: true */
/*global AudioContext, Skills, btoa, atob, $, Modernizr, alert, console*/
var game = (function () {
  'use strict';
  return {
    vs: 0.071,
    debug: (location.host === 'localhost'),
    id: null,
    currentData: {},
    status: 'loading',
    mode: '',
    scrollspeed: 0.4,
    skills: null,
    heroes: null,
    buffs: null,
    units: null,
    container: $('.container').first(),
    loader: $('<span>').addClass('loader'),
    message: $('<p>').addClass('message'),
    tries: 0,
    triesCounter: $('<small>').addClass('triescounter'),
    timeToPick: 30,
    timeToPlay: (location.host === 'localhost') ? 5 : 15,
    waitLimit: 90,
    connectionLimit: 30,
    dayLength: 12,
    deadLength: 10,
    width: 12,
    height: 6,
    seed: null,
    start: function () {
      if (Skills &&
          window.$ &&
          window.JSON &&
          window.btoa && window.atob &&
          window.AudioContext &&
          window.XMLHttpRequest &&
          Modernizr.backgroundsize &&
          Modernizr.boxshadow &&
          Modernizr.cssanimations &&
          Modernizr.csstransforms &&
          Modernizr.csstransitions &&
          Modernizr.generatedcontent &&
          Modernizr.opacity &&
          Modernizr.rgba) {
        game.load();
      } else { game.unsupported(); }
    },
    unsupported: function () {
      var welcome = document.getElementsByClassName('welcome')[0],
        unsupported = document.getElementsByClassName('unsupported')[0];
      welcome.style.display = 'none';
      unsupported.style.display = 'block';
      unsupported.innerHTML = [
        '<div class="box">',
        '  <img class="banner" src="img/banner.png" />',
        '  <h2>DotaCard requires a <i>modern browser</i></h2>',
        '  <p><a href="http://whatbrowser.org/" target="_blank">How can I get a <i>modern browser?</i></a></p>',
        '</div>'
      ].join('\n');
    },
    load: function () {
      if (!Number.prototype.map) { Number.prototype.map = function (a, b, c, d) { return c + (d - c) * ((this - a) / (b - a)); }; }
      if (!Number.prototype.limit) { Number.prototype.limit = function (a, b) { return Math.min(b, Math.max(a, this)); }; }
      if (!Number.prototype.round) { Number.prototype.round = function (a) { return Math.round(this); }; }
      if (!Number.prototype.floor) { Number.prototype.floor = function () { return Math.floor(this); }; }
      if (!Number.prototype.ceil) { Number.prototype.ceil = function () { return Math.ceil(this); }; }
      if (!Number.prototype.toInt) { Number.prototype.toInt = function () { return Number.parseInt(this); }; }
      if (!Number.prototype.toRad) { Number.prototype.toRad = function () { return this / 180 * Math.PI; }; }
      if (!Number.prototype.toDeg) { Number.prototype.toDeg = function () { return 180 * this / Math.PI; }; }
      if (!Array.prototype.random) { Array.prototype.random = function () { return this[Math.floor(Math.random() * this.length)]; }; }
      if (!Array.prototype.erase) {
        Array.prototype.erase = function (a) {
          var b;
          for (b = this.length - 1; b > -1; b -= 1) {
            if (this[b] === a) {
              this.splice(b, 1);
            }
          }
          return this;
        };
      }
      if (!Function.prototype.bind) {
        Function.prototype.bind = Function.prototype.bind || function (a) {
          var b = this;
          return function () {
            var c = Array.prototype.slice.call(arguments);
            return b.apply(a || null, c);
          };
        };
      }
      $.fn.hasClasses = function (list) {
        var classes = list.split(' '), i;
        for (i = 0; i < classes.length; i += 1) {
          if (this.hasClass(classes[i])) {
            return true;
          }
        }
        return false;
      };
      $.fn.hasAllClasses = function (list) {
        var classes = list.split(' '), i;
        for (i = 0; i < classes.length; i += 1) {
          if (!this.hasClass(classes[i])) {
            return false;
          }
        }
        return true;
      };
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
      $.fn.passive = game.card.passive;
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
      game.states.load.build();
    },
    db: function (send, cb) {
      if (typeof send.data !== 'string') {
        send.data = JSON.stringify(send.data);
      }
      $.ajax({
        type: 'GET',
        url: '/db',
        data: send,
        complete: function (receive) {
          var data;
          if (receive.responseText) {
            data = JSON.parse(receive.responseText);
          }
          if (cb) {
            cb(data || {});
          }
        }
      });
    },
    random: function () {
      if (game.debug) {
        return 0;
      }
      game.seed += 1;
      return parseFloat('0.' + Math.sin(game.seed).toString().substr(6));
    },
    nomenu: function () {
      return false;
    },
    card: {
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
        } else if (game.heroes[data.hero]) {
          $('<h1>').appendTo(fieldset).text(game.heroes[data.hero].name);
        } else {
          $('<h1>').appendTo(fieldset).text(data.hero);
        }
        current = $('<div>').addClass('current').appendTo(fieldset);
        desc = $('<div>').addClass('desc').appendTo(fieldset);
        if (data.hp) {
          $('<p>').addClass('hp').appendTo(desc).text(game.ui.hp + ': ' + data.hp);
          data.currenthp = data.hp;
          $('<p>').addClass('hp').appendTo(current).html('HP <span>' + data.currenthp + '</span>');
        }
        if (data.mana) {
          $('<p>').appendTo(desc).text(game.ui.mana + ': ' + data.mana);
        }
        range = '';
        if (data.damage) {
          if (data.range) {
            range = ' (' + data.range + ')';
          }
          $('<p>').addClass('damage').appendTo(desc).text(game.ui.damage + ': ' + data.damage + range);
          data.currentdamage = data.damage;
          $('<p>').addClass('damage').appendTo(current).html('DMG <span>' + data.currentdamage + '</span>');
        }
        if (data.range && !range) {
          $('<p>').appendTo(desc).text(game.ui.range + ': ' + data.range);
        }
        if (data.armor) {
          $('<p>').appendTo(desc).text(game.ui.armor + ': ' + data.armor + '%');
        }
        if (data.resistance) {
          $('<p>').appendTo(desc).text(game.ui.resistance + ': ' + data.resistance + '%');
        }
        if (data.type) {
          $('<p>').appendTo(desc).text(game.ui.type + ': ' + data.type);
        }
        if (data.cards) {
          $('<p>').appendTo(desc).text(game.ui.cards + ': ' + data.cards);
        }
        if (data.chance) {
          $('<p>').appendTo(desc).text(game.ui.chance + ': ' + data.chance + '%');
        }
        if (data.percentage) {
          $('<p>').appendTo(desc).text(game.ui.percentage + ': ' + data.percentage + '%');
        }
        if (data.delay) {
          $('<p>').appendTo(desc).text(game.ui.delay + ': ' + data.delay);
        }
        if (data.damageType) {
          $('<p>').appendTo(desc).text(game.ui.damageType + ': ' + data.damageType);
        }
        if (data.duration) {
          $('<p>').appendTo(desc).text(game.ui.duration + ': ' + data.duration + ' ' + game.ui.turns);
        }
        if (data.dot) {
          $('<p>').appendTo(desc).text(game.ui.dot + ': ' + data.dot);
        }
        if (data.multiplier) {
          $('<p>').appendTo(desc).text(game.ui.multiplier + ': ' + data.multiplier + 'X');
        }
        if (data.description) {
          card.attr({ title: data.name + ': ' + data.description });
        }
        if (data.kd) {
          data.kills = 0;
          data.deaths = 0;
          $('<p>').addClass('kd').appendTo(desc).html(game.ui.kd + ': <span class="kills">0</span>/<span class="deaths">0</span>');
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
        this.appendTo(target.removeClass('free').addClass('block'));
        return this;
      },
      select: function (event) {
        var card = $(this);
        $('.card.selected').removeClass('selected');
        $('.card.source').removeClass('source');
        game.card.unselect();
        game.selectedCard = card;
        game.map.highlight();
        card.clone().appendTo(game.states.table.selectedArea).addClass('zoom');
        card.addClass('selected');
        if (event && event.stopPropagation) {
          event.stopPropagation();
        }
        return card;
      },
      unselect: function () {
        game.map.unhighlight();
        if (game.selectedCard) {
          game.selectedCard.removeClass('selected');
        }
        game.selectedCard = null;
        game.states.table.selectedArea.empty();
        game.states.table.selectedArea.trigger('unselect');
      },
      highlightSource: function () {
        var skill = this, hero = skill.data('hero');
        if (hero) {
          $('.map .card.player.hero.' + hero).addClass('source');
        }
        return skill;
      },
      highlightTargets: function () {
        var skill = this, source, spot, range, targets, hero = skill.data('hero');
        if (hero) {
          source = $('.map .source');
          if (source.hasClasses('hero unit')) {
            spot = game.map.getPosition(source);
            range = game.map.getRange(skill.data('range'));
            targets = skill.data('targets');
            if (skill.data('type') === game.ui.passive) {
              if (!source.hasClass('dead')) {
                source.addClass('casttarget').on('contextmenu.passive', game.player.passive);
              }
            } else if (!source.hasClasses('dead done stunned frozen entangled')) {
              if (targets.indexOf(game.ui.self) >= 0) {
                source.addClass('casttarget').on('contextmenu.cast', game.player.cast);
              }
              if (targets.indexOf(game.ui.ally) >= 0) {
                if (range === game.ui.global) {
                  $('.map .player').addClass('casttarget').on('contextmenu.cast', game.player.cast);
                } else {
                  game.map.inRange(spot, range, function (neighbor) {
                    var card = $('.card', neighbor);
                    if (card.hasClass('player')) {
                      card.addClass('casttarget').on('contextmenu.cast', game.player.cast);
                    }
                  });
                }
              }
              if (targets.indexOf(game.ui.enemy) >= 0) {
                if (range === game.ui.global) {
                  $('.map .enemy').addClass('casttarget').on('contextmenu.cast', game.player.cast);
                } else {
                  game.map.inRange(spot, range, function (neighbor) {
                    var card = $('.card', neighbor);
                    if (card.hasClass('enemy')) {
                      card.addClass('casttarget').on('contextmenu.cast', game.player.cast);
                    }
                  });
                }
              }
              if (targets.indexOf(game.ui.spot) >= 0) {
                if (targets.indexOf(game.ui.free) >= 0) {
                  game.map.around(spot, range, function (neighbor) {
                    if (neighbor.hasClass('free')) {
                      neighbor.addClass('targetarea').on('contextmenu.castarea', game.player.cast);
                    }
                  });
                } else {
                  game.map.around(spot, range, function (neighbor) {
                    neighbor.addClass('targetarea').on('contextmenu.castarea', game.player.cast);
                    if (neighbor.hasClass('block')) {
                      var card = $('.card', neighbor);
                      card.addClass('targetarea').on('contextmenu.cast', game.player.cast);
                    }
                  });
                }
              }
            }
          }
        }
        return skill;
      },
      strokeSkill: function () {
        var skill = this,
          hero = skill.data('hero'),
          source = $('.map .source'),
          range = skill.data('range'),
          spot = game.map.getPosition(source);
        if (hero && range && spot && !source.hasClasses('dead done stunned')) {
          game.map.stroke(spot, game.map.getRange(range), 'skillcast');
          //console.log(skill, skill.data('targets'));
          if (skill.data('aoe')) {
            game.castspot = spot;
            game.castrange = game.map.getRange(range);
            game.aoerange = game.map.getRange(skill.data('aoerange'));
            game.aoe = skill.data('aoe');
            if (game.aoe === 'Linear') {
              game.aoerange = skill.data('aoerange');
              game.aoewidth = skill.data('aoewidth');
            }
            $('.map .spot, .map .card').hover(function () {
              var spot = $(this);
              if (spot.hasClass('targetarea')) {
                $('.map .spot').removeClass('skillarea skillcast top right left bottom');
                if (game.aoe === 'Radial') {
                  game.map.stroke(game.map.getPosition($(this)), game.aoerange, 'skillarea');
                } else if (game.aoe === 'Linear') {
                  game.map.linear(game.map.getPosition($(this)), game.aoerange, 'skillarea');
                }
              } else {
                $('.map .spot').removeClass('skillarea skillcast top right left bottom');
                game.map.stroke(game.castspot, game.map.getPosition($(this)), 'skillcast');
              }
            });
          }
        }
        return skill;
      },
      highlightMove: function () {
        var card = this, speed;
        if (card.hasClass('player') && card.hasClasses('unit hero') && !card.hasClasses('enemy done static dead stunned frozen entangled')) {
          speed = card.data('currentspeed');
          if (speed < 1) { return card; }
          if (speed > 3) { speed = 3; }
          game.map.atMovementRange(card, Math.round(speed), function (neighbor) {
            if (!neighbor.hasClass('block')) { neighbor.addClass('movearea').on('contextmenu.movearea', game.player.move); }
          });
        }
        return card;
      },
      move: function (destiny) {
        if (typeof destiny === 'string') { destiny = $('#' + destiny); }
        var card = this, t, d,
          fromSpot = game.map.getPosition(card),
          toSpot = game.map.getPosition(destiny);
        if (destiny.hasClass('free') && fromSpot !== toSpot) {
          game.map.unhighlight();
          card.data('channeling', false).removeClass('channeling');
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
          if (card.data('movementBonus')) {
            card.data('movementBonus', false);
          } else { card.addClass('done'); }
          card.trigger('move', {
            card: card,
            target: toSpot
          });
          setTimeout(function () {
            $(this.card).css({ transform: '' }).appendTo(this.destiny);
            $('.map .spot').data('detour', false);
            game.map.highlight();
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
        var source = this, targets, duration, channeler, channelduration,
          hero = skill.data('hero'),
          skillid = skill.data('skill');
        if (skillid && hero && source.data('hero') === hero) {
          if (typeof target === 'string') {
            targets = game.skills[hero][skillid].targets;
            if (targets.indexOf(game.ui.spot) >= 0) {
              target = $('#' + target);
            } else {target = $('#' + target + ' .card'); }
          }
          if (target.length) {
            source.data('channeling', false).removeClass('channeling');
            source.trigger('cast', {
              skill: skill,
              source: source,
              target: target
            });
            Skills[hero][skillid].cast(skill, source, target);
            channelduration = skill.data('channel');
            if (channelduration) {
              source.data('channeling', channelduration).addClass('channeling');
              source.on('turnstart.channel', function (event, eventdata) {
                channeler = eventdata.target;
                duration = channeler.data('channeling');
                if (duration) {
                  duration -= 1;
                  channeler.data('channeling', duration);
                } else {
                  channeler.data('channeling', false);
                  channeler.off('channel turnstart.channel');
                }
              });
            }
            if (source.hasClass('enemy')) {
              game.enemy.hand -= 1;
            } else { source.select(); }
            if (skill.data('type') === game.ui.active) {
              source.addClass('done');
              setTimeout(function () {
                skill.discard();
              }, 400);
            }
          }
        }
        return this;
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
          Skills[hero][skillid].passive(skill, target);
          if (skill.hasClass('enemy')) {
            game.enemy.hand -= 1;
          } else { target.select(); }
          setTimeout(function () {
            skill.remove();
          }, 400);
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
          target.data('channeling', false).removeClass('channeling');
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
            this.appendTo(game.player.skills.cemitery);
          } else {
            this.appendTo(game.enemy.skills.deck);
            game.enemy.hand -= 1;
          }
        }
      },
      strokeAttack: function () {
        var card = this, spot, range;
        if (!card.hasClasses('done dead stunned')) {
          spot = game.map.getPosition(card);
          range = game.map.getRange(card.data('range'));
          game.map.stroke(spot, range, card.data('side') + 'attack');
        }
        return card;
      },
      highlightAttack: function () {
        var card = this, spot, range;
        if (card.hasClass('player') && card.hasClasses('unit hero') && !card.hasClasses('enemy done dead stunned frozen')) {
          spot = game.map.getPosition(card);
          range = game.map.getRange(card.data('range'));
          game.map.inRange(spot, range, function (neighbor) {
            var card = $('.card', neighbor);
            if (card.hasClass('enemy')) { card.addClass('attacktarget').on('contextmenu.attack', game.player.attack); }
          });
        }
        return card;
      },
      attack: function (target) {
        if (typeof target === 'string') { target = $('#' + target + ' .card'); }
        var source = this,
          fromSpot = game.map.getPosition(source),
          toSpot = game.map.getPosition(target);
        if (source.data('currentdamage') && fromSpot !== toSpot && target.data('currenthp')) {
          source.data('channeling', false).removeClass('channeling');
          source.trigger('beforeattack', {
            source: source,
            target: target
          });
          source.trigger('attack', {
            source: source,
            target: target
          });
          source.damage(source.data('currentdamage'), target, game.ui.physical);
          source.trigger('afterattack', {
            source: source,
            target: target
          });
        }
        source.addClass('done');
        return this;
      },
      damage: function (damage, target, type) {
        if (damage < 1) {
          return this;
        } else { damage = Math.round(damage); }
        var source = this, spot, resistance, armor, hp, currentDamage, kills, deaths, damageFx;
        if (!type) { type = game.ui.physical; }
        resistance = 1 - target.data('resistance') / 100;
        if (type === game.ui.magical && resistance) { damage = Math.round(damage * resistance); }
        armor = 1 - target.data('armor') / 100;
        if (type === game.ui.physical && armor) { damage = Math.round(damage * armor); }
        if (typeof target === 'string') { target = $('#' + target + ' .card'); }
        hp = target.data('currenthp') - damage;
        target.changehp(hp);
        target.trigger('damage', {
          source: this,
          target: target,
          spot: spot,
          damage: damage
        });
        if (hp < 1) {
          spot = game.map.getPosition(target);
          target.addClass('dead').removeClass('target done').changehp(0);
          setTimeout(function () {
            target.trigger('die', {
              source: this,
              target: target,
              spot: spot
            });
            target.die();
          }, 2000);
          if (source.hasClass('hero') && target.hasClass('hero')) {
            game[source.data('side')].kills += 1;
            kills = source.data('kills') + 1;
            source.data('kills', kills);
            source.find('.kills').text(kills);
            game[target.data('side')].deaths += 1;
            deaths = source.data('deaths') + 1;
            target.data('deaths', deaths);
            source.find('.deaths').text(deaths);
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
        this.data('currentdamage', damage);
        if (this.hasClass('selected')) { this.select(); }
        return this;
      },
      heal: function (healhp) {
        healhp = Math.ceil(healhp);
        var target = this, healFx, currentHeal,
          currenthp = target.data('currenthp'),
          maxhp = this.data('hp'),
          hp = currenthp + healhp;
        if (hp > maxhp) {
          healhp = maxhp - currenthp;
          target.changehp(maxhp);
        } else {
          target.changehp(hp);
        }
        if (healhp > 0) {
          healFx = target.find('.heal');
          if (healFx.length) {
            currentHeal = parseInt(healFx.text(), 10);
            healFx.text(currentHeal + healhp);
          } else {
            healFx = $('<span>').addClass('heal').text(healhp).appendTo(target);
          }
        }
        return this;
      },
      changehp: function (hp) {
        if (hp < 1) { hp = 0; }
        this.find('.current .hp span').text(hp);
        this.data('currenthp', hp);
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
            game.match.lose();
          } else if (this.hasClass('enemy')) { game.match.win(); }
        } else { this.remove(); }
        return this;
      },
      reborn: function (spot) {
        this.removeClass('dead');
        var hp = this.data('hp'), x, y, freeSpot;
        this.find('.hp').text(hp);
        this.data('currenthp', hp);
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
    },
    deck: {
      build: function (op) {
        var name = op.name,
          filter = op.filter,
          cb = op.cb,
          multi = op.multi,
          deck = $('<div>').addClass('deck ' + name);
        if (!game[name]) {
          game.states.load.json(name, function () {
            game.deck.createCards(deck, name, cb, filter, multi);
          });
        } else { game.deck.createCards(deck, name, cb, filter, multi); }
        return deck;
      },
      createCards: function (deck, name, cb, filter, multi) {
        if (name === 'heroes') { game.deck.createHeroesCards(deck, name, cb, filter); }
        if (name === 'skills') { game.deck.createSkillsCards(deck, name, cb, filter, multi); }
        if (name === 'units') { game.deck.createUnitsCards(deck, name, cb, filter); }
      },
      createHeroesCards: function (deck, name, cb, filter) {
        var deckData = game[name],
          cards = [];
        $.each(deckData, function (heroid, herodata) {
          var found = false;
          if (filter) {
            $.each(filter, function (i, pick) {
              if (pick === heroid) { found = true; }
            });
          }
          if (found || !filter) {
            herodata.hero = heroid;
            herodata.speed = 2;
            herodata.currentspeed = 2;
            herodata.kd = true;
            herodata.buffs = true;
            herodata.className = [
              heroid,
              name
            ].join(' ');
            cards.push(game.card.build(herodata).appendTo(deck));
          }
        });
        deck.data('cards', cards);
        if (cb) { cb(deck); }
      },
      createSkillsCards: function (deck, name, cb, filter, multi) {
        var deckData = game[name],
          cards = [];
        $.each(deckData, function (hero, heroSkillsData) {
          var found = false;
          if (filter) {
            $.each(filter, function (i, pick) {
              if (pick === hero) { found = true; }
            });
          }
          if (found || !filter) {
            $.each(heroSkillsData, function (skill, skillData) {
              var k;
              skillData.hero = hero;
              skillData.skill = skill;
              skillData.className = [
                hero + '-' + skill,
                name,
                hero
              ].join(' ');
              if (game.buffs[hero] && game.buffs[hero][skill]) {
                skillData.buff = game.buffs[hero][skill];
              }
              if (multi && !game.debug) {
                for (k = 0; k < skillData[multi]; k += 1) {
                  cards.push(game.card.build(skillData).appendTo(deck));
                }
              } else { cards.push(game.card.build(skillData).appendTo(deck)); }
            });
          }
        });
        deck.data('cards', cards);
        if (cb) { cb(deck); }
      },
      createUnitsCards: function (deck, name, cb, filter) {
        var deckData = game[name],
          cards = [];
        $.each(deckData, function (groupid, groupdata) {
          var found = false;
          if (filter) {
            $.each(filter, function (i, pick) {
              if (pick === groupid) { found = true; }
            });
          }
          if (found || !filter) {
            $.each(groupdata, function (unitid, unitdata) {
              unitdata.className = [
                unitid,
                name,
                groupid
              ].join(' ');
              unitdata.hero = groupid;
              unitdata.speed = 2;
              unitdata.currentspeed = 2;
              unitdata.buffs = true;
              cards.push(game.card.build(unitdata).appendTo(deck));
            });
          }
        });
        deck.data('cards', cards);
        if (cb) { cb(deck); }
      },
      randomCard: function (cards, noseed) {
        if (noseed) { return $(cards[parseInt(Math.random() * cards.length, 10)]); }
        return $(cards[parseInt(game.random() * cards.length, 10)]);
      }
    },
    player: {
      manaBuild: function () {
        game.player.mana = 0;
        $(game.player.picks).each(function () {
          var card = $('.card.' + this);
          game.player.mana += card.data('mana');
        });
        game.player.cardsPerTurn = 1 + Math.round(game.player.mana / 10);
        game.player.maxCards = Math.round(game.player.mana / 2);
      },
      buyCard: function () {
        if (game.player.turn === 6 || game.debug) {
          $('.player.deck.skills.ult .card').appendTo(game.player.skills.deck);
        }
        var availableSkills = $('.skills.available.player.deck .card'), card = game.deck.randomCard(availableSkills), heroid, hero, toSpot;
        if (card.data('type') === game.ui.free) {
          card.appendTo(game.player.skills.temp);
        } else if (card.data('type') === game.ui.automatic) {
          heroid = card.data('hero');
          hero = $('.map .player.heroes.' + heroid);
          toSpot = game.map.getPosition(hero);
          card.passive(toSpot);
          game.currentData.moves.push('P:' + toSpot + ':' + card.data('skill') + ':' + heroid);
          card.appendTo(game.player.skills.temp);
        } else {
          card.appendTo(game.player.skills.hand);
        }
      },
      buyHand: function () {
        var i;
        for (i = 0; i < game.player.cardsPerTurn; i += 1) {
          if (game.player.skills.hand.children().length < game.player.maxCards) {
            game.player.buyCard();
          }
        }
      },
      move: function () {
        var spot = $(this),
          card = game.selectedCard,
          fromSpot = game.map.getPosition(card),
          toSpot = game.map.getPosition(spot);
        if (game.status === 'turn' && spot.hasClass('free') && fromSpot !== toSpot && !card.hasClass('done')) {
          card.move(toSpot);
          if (game.mode !== 'tutorial') { game.currentData.moves.push('M:' + fromSpot + ':' + toSpot); }
          game.map.unhighlight();
        }
        return false;
      },
      attack: function () {
        var target = $(this),
          source = game.selectedCard,
          fromSpot = game.map.getPosition(source),
          toSpot = game.map.getPosition(target);
        if (game.status === 'turn' && source.data('damage') && fromSpot !== toSpot && !source.hasClass('done') && target.data('currenthp')) {
          source.attack(target);
          if (game.mode !== 'tutorial') { game.currentData.moves.push('A:' + fromSpot + ':' + toSpot); }
          game.map.unhighlight();
        }
        return false;
      },
      passive: function () {
        var target = $(this),
          skill = game.selectedCard,
          hero = skill.data('hero'),
          skillid = skill.data('skill'),
          toSpot = game.map.getPosition(target);
        if (hero && skillid && game.status === 'turn') {
          game.audio.play('activate');
          if (game.mode !== 'tutorial') { game.currentData.moves.push('P:' + toSpot + ':' + skillid + ':' + hero); }
          skill.passive(target);
          game.states.table.animateCast(skill, target);
        }
      },
      cast: function () {
        var target = $(this),
          skill = game.selectedCard,
          source = $('.map .source'),
          fromSpot = game.map.getPosition(source),
          toSpot = game.map.getPosition(target),
          hero = skill.data('hero'),
          skillid = skill.data('skill');
        if (hero && skillid && fromSpot && toSpot && game.status === 'turn' && !source.hasClass('done')) {
          if (game.mode !== 'tutorial') { game.currentData.moves.push('C:' + fromSpot + ':' + toSpot + ':' + skillid + ':' + hero); }
          source.cast(skill, toSpot);
          game.states.table.animateCast(skill, toSpot);
        }
      }
    },
    enemy: {
      playtime: 2,
      buyCard: function () {
        game.enemy.hand += 1;
        game.random();
      },
      buyHand: function () {
        var i;
        for (i = 0; i < game.enemy.cardsPerTurn; i += 1) {
          if (game.enemy.hand < game.enemy.maxCards) {
            game.enemy.buyCard();
          }
        }
      },
      move: function () {
        game.message.text(game.ui.enemymove);
        game.enemy.skills.deck.addClass('slide');
        var fromSpot, toSpot, m, move, source, target, hero, skillid, skill,
          moves = game.currentData.moves.split('|');
        for (m = 0; m < moves.length; m += 1) {
          move = moves[m].split(':');
          fromSpot = game.map.mirrorPosition(move[1]);
          toSpot = game.map.mirrorPosition(move[2]);
          if (move[0] === 'M') {
            target = $('#' + fromSpot + ' .card');
            console.log(target);
            if (toSpot && !target.hasClass('done') && target.hasClass('enemy') && target.move) {
              target.move(toSpot);
            }
          }
          if (move[0] === 'A') {
            source = $('#' + fromSpot + ' .card');
            if (toSpot && !source.hasClass('done') && source.hasClass('enemy') && source.attack) {
              source.attack(toSpot);
            }
          }
          if (move[0] === 'C') {
            skillid = move[3];
            hero = move[4];
            source = $('#' + fromSpot + ' .card');
            target = $('#' + toSpot);
            skill = $('.enemy.skills .' + hero + '-' + skillid).show();
            if (skill.data('target') === game.ui.enemy || skill.data('target') === game.ui.ally || skill.data('target') === game.ui.self) {
              target = $('#' + toSpot + ' .card');
            }
            if (Skills[hero][skillid].cast && skill && !source.hasClass('done') && source.hasClass('enemy') && source.cast) {
              source.cast(skill, target);
              game.enemy.hand -= 1;
            }
          }
          if (move[0] === 'P') {
            toSpot = game.map.mirrorPosition(move[1]);
            skillid = move[2];
            hero = move[3];
            target = $('#' + toSpot + ' .card');
            skill = $('.enemy.skills .' + hero + '-' + skillid).show();
            if (Skills[hero][skillid].passive && skill && target.hasClass('enemy') && skill.passive) {
              skill.passive(target);
              game.enemy.hand -= 1;
            }
          }
        }
        $('.card.heroes').each(function () {
          var hero = $(this);
          hero.trigger('enemyturnend', { target: hero });
        });
        if (game.mode !== 'tutorial') { setTimeout(game.enemy.end, game.enemy.playtime * 1000); }
      },
      end: function () {
        if (game.status !== 'over') {
          game.status = 'turn';
          game.enemy.skills.deck.removeClass('slide');
          $('.card.enemy.heroes').removeClass('done');
          $('.enemy.skills .card').hide();
          game.turn.begin();
          if (game.selectedCard) { game.selectedCard.select(); }
        }
      }
    },
    tutorial: {
      build: function () {
        game.mode = 'tutorial';
        game.seed = new Date().valueOf();
        game.id = btoa(game.seed);
        game.message.text(game.ui.waiting);
        game.states.choose.counter.show().text(game.ui.rightpick);
        game.enemy.name = 'axe';
        game.enemy.type = 'challenged';
        game.player.type = 'challenger';
        if (!game.tutorial.axe) {
          game.tutorial.axe = $('<div>').addClass('axe tutorial');
          game.tutorial.axeimg = $('<div>').addClass('img').appendTo(game.tutorial.axe);
          game.tutorial.axebaloon = $('<div>').addClass('baloon').appendTo(game.tutorial.axe);
          game.tutorial.message = $('<div>').addClass('txt').appendTo(game.tutorial.axebaloon);
        }
        game.tutorial.message.html(game.ui.axepick);
        game.tutorial.axe.appendTo(game.states.choose.el);
        game.tutorial.axeshow();
      },
      axeshow: function () {
        setTimeout(function () {
          game.tutorial.axe.addClass('up');
        }, 2000);
        setTimeout(function () {
          game.audio.play('tutorial/axehere');
          game.tutorial.axebaloon.fadeIn('slow');
          game.message.text(game.ui.tutorialstart);
          game.loader.removeClass('loading');
          game.states.choose.enablePick();
        }, 2400);
      },
      pick: function () {
        game.tutorial.oldAvailableSlots = 5;
        var availableSlots = $('.slot.available').length;
        if (availableSlots === 4) {
          game.tutorial.message.html(game.ui.axeheroes);
        } else if (availableSlots === 3) {
          game.tutorial.message.html(game.ui.axemaxcards);
        } else if (availableSlots === 2) {
          game.tutorial.message.html(game.ui.axecardsperturn);
        } else if (availableSlots === 1) {
          game.tutorial.message.html(game.ui.axeautodeck);
        }
        if (availableSlots < game.tutorial.oldAvailableSlots) {
          game.tutorial.axebaloon.hide().fadeIn('slow');
        }
        if (availableSlots) {
          game.states.choose.counter.text(availableSlots + ' ' + game.ui.togo + '. ' + game.ui.cardsperturn + ': ' + game.player.cardsPerTurn);
        } else {
          game.message.text(game.ui.getready);
          game.states.choose.counter.text(game.ui.cardsperturn + ': ' + game.player.cardsPerTurn);
          game.tutorial.axe.addClass('left');
          game.audio.play('tutorial/axebattle');
          game.tutorial.message.html(game.ui.axebattle);
          setTimeout(function () {
            game.tutorial.deck();
          }, 2000);
        }
        game.tutorial.oldAvailableSlots = availableSlots;
      },
      deck: function () {
        game.player.picks = [];
        $('.slot').each(function () {
          var slot = $(this), card = slot.find('.card');
          game.player.picks[slot.data('slot')] = card.data('hero');
          if (game.player.picks.length === 5) {
            game.states.choose.reset();
            game.states.changeTo('table');
          }
        });
      },
      start: function () {
        game.message.text(game.ui.battle);
        game.loader.removeClass('loading');
        game.audio.play('horn');
        game.states.table.placeTowers();
        game.states.table.placeTrees();
        game.tutorial.placePlayerHeroes();
        game.tutorial.placeEnemyHeroes();
        game.states.table.buildUnits();
        game.tutorial.started = true;
        game.tutorial.axe.removeClass('up').appendTo(game.states.table.el);
        game.tutorial.axebaloon.hide();
        game.tutorial.lessonSelectEnemy = true;
        game.states.table.time.text(game.ui.time + ': 0:00 ' + game.ui.day);
        setTimeout(function () {
          game.tutorial.axe.addClass('up');
        }, 500);
        setTimeout(game.tutorial.selectEnemy, 1000);
        game.player.kills = 0;
        game.enemy.kills = 0;
      },
      placePlayerHeroes: function () {
        game.player.mana = 0;
        game.player.heroesDeck = game.deck.build({
          name: 'heroes',
          filter: game.player.picks,
          cb: function (deck) {
            deck.addClass('player').appendTo(game.states.table.el);
            var x = 0, y = 5;
            $.each(deck.data('cards'), function (i, card) {
              var p = game.player.picks.indexOf(card.data('hero'));
              card.addClass('player hero').data('side', 'player').on('click.select', game.tutorial.select);
              card.place(game.map.toId(x + p, y));
              game.player.mana += card.data('mana');
            });
          }
        });
      },
      placeEnemyHeroes: function () {
        game.enemy.picks = [ 'nyx', 'kotl', 'pud', 'ld', 'am' ];
        game.enemy.heroesDeck = game.deck.build({
          name: 'heroes',
          filter: game.enemy.picks,
          cb: function (deck) {
            deck.addClass('enemy').hide().appendTo(game.states.table.el);
            var x = 0, y = 5;
            $.each(deck.data('cards'), function (i, card) {
              var p = game.enemy.picks.indexOf(card.data('hero'));
              card.addClass('enemy hero').data('side', 'enemy').on('click.select', game.tutorial.select);
              card.place(game.map.mirrorPosition(game.map.toId(x + p, y)));
            });
          }
        });
      },
      selectEnemy: function () {
        game.tutorial.axebaloon.fadeIn('slow');
        game.tutorial.message.html(game.ui.axeselectenemy);
        game.message.text(game.ui.yourturncount + ' 5');
        $('.map .enemy.tower').addClass('tutorialblink').on('click.select', game.tutorial.select);
      },
      select: function () {
        var card = $(this);
        if (game.tutorial.lessonSelectEnemy) {
          if (card.hasAllClasses('tower enemy')) {
            $('.map .enemy.tower').removeClass('tutorialblink');
            game.tutorial.lessonSelectEnemy = false;
            game.tutorial.zoom();
          }
        }
        if (game.tutorial.lessonSelectPlayer) {
          if (card.hasAllClasses('hero player')) {
            $('.map .player.hero').removeClass('tutorialblink');
            game.tutorial.lessonSelectPlayer = false;
            game.tutorial.move();
          }
        }
        if (game.tutorial.lessonSkill) {
          if (card.hasAllClasses('skill player')) {
            $('.player.skill').removeClass('tutorialblink');
            game.tutorial.lessonSkill = false;
            game.tutorial.skill();
          }
        }
        card.select();
      },
      zoom: function () {
        game.tutorial.lessonZoom = true;
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axezoom);
        game.message.text(game.ui.yourturncount + ' 4');
        game.states.table.selectedArea.addClass('tutorialblink');
        game.states.table.selectedArea.on('mouseover.tutorial', '.card', game.tutorial.over);
      },
      over: function () {
        if (game.tutorial.lessonZoom) {
          var card = $(this);
          game.states.table.selectedArea.removeClass('tutorialblink');
          game.tutorial.unselect();
          game.tutorial.lessonZoom = false;
        }
      },
      unselect: function () {
        game.states.table.el.click(function (event) {
          var target = $(event.target);
          if (!target.closest('.selected').length && !target.closest('.selectedarea').length) { game.card.unselect(); }
        });
        game.tutorial.lessonUnselect = true;
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axeunselect);
        game.message.text(game.ui.yourturncount + ' 3');
        game.states.table.selectedArea.on('unselect.tutorial', game.tutorial.unselected);
      },
      unselected: function () {
        if (game.tutorial.lessonUnselect) {
          game.tutorial.selectPlayer();
          game.tutorial.lessonUnselect = false;
        }
      },
      selectPlayer: function () {
        game.tutorial.lessonSelectPlayer = true;
        $('.map .player.hero').addClass('tutorialblink');
        game.tutorial.axe.removeClass('left');
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axeselectplayer);
        game.message.text(game.ui.yourturncount + ' 2');
        setTimeout(game.card.unselect);
      },
      move: function () {
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axemove);
        game.audio.play('tutorial/axemove');
        game.status = 'turn';
        game.message.text(game.ui.yourturncount + ' 1');
        $('.map .hero.player').on('move', game.tutorial.done);
      },
      done: function () {
        game.tutorial.axe.addClass('left');
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axedone);
        game.message.text(game.ui.enemyturn);
        game.message.addClass('tutorialblink');
        game.status = 'unturn';
        setTimeout(game.tutorial.wait, 4000);
      },
      wait: function () {
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axewait);
        game.message.text(game.ui.enemyturncount + ' 2');
        game.audio.play('tutorial/axetime');
        game.states.table.time.text(game.ui.time + ': 1:30 ' + game.ui.night);
        game.message.removeClass('tutorialblink');
        game.states.table.time.addClass('tutorialblink');
        setTimeout(game.tutorial.time, 4000);
      },
      time: function () {
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.message.text(game.ui.enemyturncount + ' 1');
        game.tutorial.message.html(game.ui.axetime);
        game.states.table.time.removeClass('tutorialblink');
        game.states.table.turns.addClass('tutorialblink');
        game.states.table.turns.text(game.ui.turns + ': 1/1 (2)');
        setTimeout(game.tutorial.enemyMove, 4000);
        game.tutorial.buildSkills();
      },
      enemyMove: function () {
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axeenemymove);
        game.message.html(game.ui.enemymove);
        game.audio.play('tutorial/axewait');
        game.states.table.turns.removeClass('tutorialblink');
        var to = 'G2';
        if ($('#' + game.map.mirrorPosition(to)).hasClass('block')) { to = 'G1'; }
        game.currentData = { moves: 'C:E6:' + to + ':blink:am' };
        game.enemy.move();
        setTimeout(game.tutorial.attack, 3000);
      },
      attack: function () {
        game.tutorial.axe.removeClass('left');
        game.enemy.skills.deck.removeClass('slide');
        $('.enemy.skills .card').fadeOut(400);
        game.tutorial.lessonAttack = true;
        $('.map .hero').removeClass('done');
        var spot = game.map.getPosition($('.map .enemy.am')),
          range = game.map.getRange(game.ui.ranged);
        game.map.around(spot, range, function (spot) {
          spot.find('.card.player.hero').addClass('tutorialblink');
        });
        game.status = 'turn';
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axeattack);
        game.audio.play('tutorial/axeattack');
        game.message.html(game.ui.yourturn);
        if (game.selectedCard) { game.selectedCard.select(); }
        $('.player.hero').on('attack.tutorial', game.tutorial.skillSelect);
      },
      buildSkills: function () {
        game.player.skills = {};
        game.player.skills.hand = $('<div>').hide().appendTo(game.states.table.el).addClass('player deck skills hand');
        game.player.skills.cemitery = $('<div>').hide().appendTo(game.states.table.el).addClass('player deck skills cemitery');
        game.player.skills.deck = game.deck.build({
          name: 'skills',
          multi: 'cards',
          filter: game.player.picks,
          cb: function (deck) {
            deck.addClass('player available').hide().appendTo(game.states.table.el);
            $.each(deck.data('cards'), function (i, skill) {
              skill.addClass('player skill').data('side', 'player').on('click.select', game.tutorial.select);
            });
          }
        });
        game.enemy.skills = {};
        game.enemy.skills.deck = game.deck.build({
          name: 'skills',
          filter: ['am'],
          cb: function (deck) {
            deck.addClass('enemy hand cemitery free').appendTo(game.states.table.el);
            $.each(deck.data('cards'), function (i, skill) {
              skill.hide().addClass('enemy skill').data('side', 'enemy');
            });
          }
        });
      },
      skillSelect: function () {
        $('.card.enemy.done').removeClass('done');
        game.tutorial.lessonSkill = true;
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axeskillselect);
        game.player.buyHand();
        game.player.skills.hand.show();
        $('.player.hero').removeClass('tutorialblink');
        $('.player.skill').addClass('tutorialblink');
        setTimeout(function () {
          $('.player.hero').removeClass('done');
        }, 200);
      },
      skill: function () {
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axeskill);
        $('.card').on('cast.tutorial', game.tutorial.end);
        $('.card').on('passive.tutorial', game.tutorial.end);
      },
      end: function () {
        game.tutorial.lessonAttack = false;
        game.tutorial.lessonSkill = false;
        game.tutorial.axebaloon.hide().fadeIn('slow');
        game.tutorial.message.html(game.ui.axeend);
        game.audio.play('tutorial/axeah');
        game.message.text(game.ui.lose);
        game.winner = game.player.name;
        game.states.table.showResults();
        game.tutorial.started = false;
        game.status = 'tutorialcompleted';
      },
      clear: function () {
        game.tutorial.axe.removeClass('up');
        game.tutorial.axe.removeClass('left');
        game.tutorial.axebaloon.hide();
        game.db({
          'set': 'chat',
          'data': game.player.name + ' ' + game.ui.completedtutorial + ':+1:'
        }, function (chat) {
          game.chat.update(chat);
        });
      }
    },
    match: {
      online: function () {
        game.mode = 'online';
        game.seed = new Date().valueOf();
        game.id = btoa(game.seed);
        game.db({
          'set': 'waiting',
          'data': { id: game.id }
        }, function (waiting) {
          if (game.id === waiting.id) {
            game.player.type = 'challenged';
            game.match.wait();
          } else {
            game.id = waiting.id;
            game.seed = parseInt(atob(game.id), 10);
            game.player.type = 'challenger';
            game.match.found();
          }
        });
      },
      wait: function () {
        game.loader.addClass('loading');
        game.currentData.challenged = game.player.name;
        game.db({
          'set': game.id,
          'data': game.currentData
        }, function () {
          game.message.text(game.ui.waiting);
          game.tries = 1;
          game.match.search();
        });
      },
      search: function () {
        clearTimeout(game.timeout);
        game.db({ 'get': game.id }, function (found) {
          if (found.challenger) {
            game.triesCounter.text('');
            game.currentData = found;
            game.match.battle.call(game.states.choose, found.challenger, 'challenger');
          } else {
            game.triesCounter.text(game.tries += 1);
            if (game.tries > game.waitLimit) {
              game.message.text(game.ui.noenemy);
              setTimeout(function () {
                game.states.changeTo('menu');
              }, 2000);
            } else { game.timeout = setTimeout(game.match.search, 1000); }
          }
        });
      },
      found: function () {
        game.message.text(game.ui.gamefound);
        game.db({ 'get': game.id }, function (found) {
          if (found.challenged) {
            game.loader.removeClass('loading');
            game.triesCounter.text('');
            game.currentData = found;
            game.currentData.challenger = game.player.name;
            game.db({
              'set': game.id,
              'data': game.currentData
            }, function () {
              game.match.battle(found.challenged, 'challenged');
            });
          } else { game.states.load.reset(); }
        });
      },
      pick: function () {
        if ($('.slot.available').length === 0) {
          game.states.choose.counter.text(game.ui.startsin + ': ' + game.states.choose.count + ' ' + game.ui.cardsperturn + ': ' + game.player.cardsPerTurn);
        } else { game.states.choose.counter.text(game.ui.pickdeck + ': ' + game.states.choose.count); }
      },
      pickCount: function () {
        game.states.choose.count -= 1;
        if ($('.slot.available').length !== 0) {
          game.states.choose.counter.text(game.ui.pickdeck + ': ' + game.states.choose.count);
        } else { game.states.choose.counter.text(game.ui.startsin + ': ' + game.states.choose.count + ' ' + game.ui.cardsperturn + ': ' + game.player.cardsPerTurn); }
        if (game.states.choose.count < 0) {
          game.states.choose.counter.text(game.ui.getready);
          game.states.choose.disablePick();
          game.match.fillDeck();
        } else { setTimeout(game.match.pickCount, 1000); }
      },
      fillDeck: function () {
        $('.slot').each(function () {
          var slot = $(this), card;
          if (slot.hasClass('available')) {
            card = game.deck.randomCard($('.pickbox .card'), 'noseed');
            slot.append(card).removeClass('available active');
            game.player.picks[slot.data('slot')] = card.data('hero');
          }
          if ($('.choose .card.active').length === 0) { game.states.choose.pickDeck.children().first().click(); }
          if (game.player.picks.length === 5) { game.match.sendDeck(); }
        });
      },
      sendDeck: function () {
        game.states.choose.el.removeClass('turn');
        game.states.choose.pickDeck.css('margin-left', 0);
        game.states.choose.tries = 1;
        if (game.player.type === 'challenged') {
          game.currentData.challengedDeck = game.player.picks.join('|');
          game.db({
            'set': game.id,
            'data': game.currentData
          }, function () {
            game.match.getChallengerDeck();
          });
        }
        if (game.player.type === 'challenger') { game.match.getChallengedDeck(); }
      },
      getChallengerDeck: function () {
        clearTimeout(game.timeout);
        game.message.text(game.ui.loadingdeck);
        game.loader.addClass('loading');
        game.db({ 'get': game.id }, function (found) {
          if (found.challengerDeck) {
            game.triesCounter.text('');
            game.currentData = found;
            game.enemy.picks = game.currentData.challengerDeck.split('|');
            game.states.choose.reset();
            game.states.changeTo('table');
          } else {
            game.triesCounter.text(game.tries += 1);
            if (game.tries > game.connectionLimit) {
              game.states.load.reset();
            } else { game.timeout = setTimeout(game.match.getChallengerDeck, 1000); }
          }
        });
      },
      getChallengedDeck: function () {
        clearTimeout(game.timeout);
        game.message.text(game.ui.loadingdeck);
        game.loader.addClass('loading');
        game.db({ 'get': game.id }, function (found) {
          if (found.challengedDeck) {
            game.triesCounter.text('');
            game.currentData = found;
            game.currentData.challengerDeck = game.player.picks.join('|');
            game.enemy.picks = game.currentData.challengedDeck.split('|');
            game.db({
              'set': game.id,
              'data': game.currentData
            }, function () {
              game.states.choose.reset();
              game.states.changeTo('table');
            });
          } else {
            game.triesCounter.text(game.tries += 1);
            if (game.tries > game.connectionLimit) {
              game.states.load.reset();
            } else { game.timeout = setTimeout(game.match.getChallengedDeck, 1000); }
          }
        });
      },
      battle: function (enemy, challenge) {
        game.status = 'picking';
        game.loader.removeClass('loading');
        game.states.choose.el.addClass('turn');
        game.enemy.name = enemy;
        game.enemy.type = challenge;
        game.message.html(game.ui.battlefound + ' <b>' + game.player.name + '</b> vs <b class="enemy">' + game.enemy.name + '</b>');
        game.states.choose.counter.show();
        game.audio.play('battle');
        game.states.choose.count = game.debug ? 1 : game.timeToPick;
        game.states.choose.enablePick();
        setTimeout(game.match.pickCount, 1000);
      },
      start: function () {
        game.states.table.el.click(function (event) {
          var target = $(event.target);
          if (!target.closest('.selected').length && !target.closest('.selectedarea').length) { game.card.unselect(); }
        });
        game.loader.addClass('loading');
        game.message.text(game.ui.battle);
        game.audio.play('horn');
        game.match.placePlayerHeroes();
        game.match.placeEnemyHeroes();
        game.match.buildSkills();
        game.states.table.placeTowers();
        game.states.table.placeTrees();
        game.states.table.buildUnits();
        game.turn.build();
        game.match.started = true;
        setTimeout(game.turn.first, 1000);
      },
      placePlayerHeroes: function () {
        if (game.player.picks) {
          game.player.mana = 0;
          game.player.heroesDeck = game.deck.build({
            name: 'heroes',
            filter: game.player.picks,
            cb: function (deck) {
              deck.addClass('player').appendTo(game.states.table.el);
              var x = 0, y = 5;
              $.each(deck.data('cards'), function (i, card) {
                var p = game.player.picks.indexOf(card.data('hero'));
                card.addClass('player hero').data('side', 'player').on('click.select', game.card.select);
                card.place(game.map.toId(x + p, y));
                game.player.mana += card.data('mana');
                if (game.debug) {
                  if (p === 0) { card.place('F3'); }
                }
              });
            }
          });
        }
      },
      placeEnemyHeroes: function () {
        if (game.enemy.picks) {
          game.enemy.mana = 0;
          game.enemy.heroesDeck = game.deck.build({
            name: 'heroes',
            filter: game.enemy.picks,
            cb: function (deck) {
              deck.addClass('enemy').hide().appendTo(game.states.table.el);
              var x = 0, y = 5;
              $.each(deck.data('cards'), function (i, card) {
                var p = game.enemy.picks.indexOf(card.data('hero'));
                card.addClass('enemy hero').data('side', 'enemy').on('click.select', game.card.select);
                card.place(game.map.mirrorPosition(game.map.toId(x + p, y)));
                game.enemy.mana += card.data('mana');
                if (game.debug) {
                  if (p === 0) { card.place(game.map.mirrorPosition('F3')); }
                }
              });
            }
          });
        }
      },
      buildSkills: function () {
        game.player.manaBuild();
        game.player.skills = {};
        game.player.skills.hand = $('<div>').appendTo(game.states.table.el).addClass('player deck skills hand');
        game.player.skills.temp = $('<div>').hide().appendTo(game.states.table.el).addClass('player deck skills temp');
        game.player.skills.ult = $('<div>').hide().appendTo(game.states.table.el).addClass('player deck skills ult');
        game.player.skills.cemitery = $('<div>').hide().appendTo(game.states.table.el).addClass('player deck skills cemitery');
        game.player.skills.deck = game.deck.build({
          name: 'skills',
          multi: 'cards',
          filter: game.player.picks,
          cb: function (deck) {
            deck.addClass('player available').hide().appendTo(game.states.table.el);
            $.each(deck.data('cards'), function (i, skill) {
              skill.addClass('player skill').data('side', 'player').on('click.select', game.card.select);
              if (skill.data('deck') === game.ui.temp) {
                skill.appendTo(game.player.skills.temp);
              } else if (skill.data('type') === 'ult') {
                skill.appendTo(game.player.skills.ult);
              }
            });
          }
        });
        game.enemy.maxCards = Math.round(game.enemy.mana / 2);
        game.enemy.cardsPerTurn = 1 + Math.round(game.enemy.mana / 10);
        game.enemy.hand = 0;
        game.enemy.skills = {};
        game.enemy.skills.deck = game.deck.build({
          name: 'skills',
          filter: game.enemy.picks,
          cb: function (deck) {
            deck.addClass('enemy hand cemitery free').appendTo(game.states.table.el);
            $.each(deck.data('cards'), function (i, skill) {
              skill.hide().addClass('enemy skill').data('side', 'enemy');
            });
          }
        });
      },
      sendMoves: function () {
        $('.card.heroes').each(function () {
          var hero = $(this);
          hero.trigger('playerturnend', { target: hero });
        });
        game.message.text(game.ui.uploadingturn);
        game.loader.addClass('loading');
        game.map.unhighlight();
        $('.card .damaged').remove();
        $('.card .heal').remove();
        game.status = 'unturn';
        setTimeout(function () {
          game.states.table.el.removeClass('turn');
        }, 2000);
        game.match.sendData();
      },
      getMoves: function () {
        game.message.text(game.ui.loadingturn);
        game.loader.addClass('loading');
        game.tries = 1;
        game.states.table.el.removeClass('unturn');
        setTimeout(game.match.getData, 1000);
      },
      sendData: function () {
        game.player.turn += 1;
        game.currentData[game.player.type + 'Turn'] = game.player.turn;
        game.currentData.moves = game.currentData.moves.join('|');
        game.db({
          'set': game.id,
          'data': game.currentData
        }, function () {
          setTimeout(game.turn.begin, 1000);
        });
      },
      getData: function () {
        clearTimeout(game.timeout);
        game.db({ 'get': game.id }, function (data) {
          if (data[game.enemy.type + 'Turn'] === game.enemy.turn + 1) {
            game.triesCounter.text('');
            game.currentData = data;
            game.enemy.turn += 1;
            game.enemy.move();
          } else {
            game.tries += 1;
            game.triesCounter.text(game.tries);
            if (game.tries > game.connectionLimit) {
              game.states.load.reset();
            } else { game.timeout = setTimeout(game.match.getData, 1000); }
          }
        });
      },
      win: function () {
        game.winner = game.player.name;
        game.states.table.el.addClass('turn');
        game.message.text(game.ui.win);
        game.match.sendData();
        game.status = 'over';
        game.states.table.showResults();
      },
      lose: function () {
        game.winner = game.enemy.name;
        game.states.table.el.addClass('unturn');
        game.message.text(game.ui.lose);
        game.loader.removeClass('loading');
        game.status = 'over';
        game.states.table.showResults();
      },
      end: function () {
        game.match.started = false;
      }
    },
    turn: {
      first: function () {
        game.currentData = {};
        game.player.kills = 0;
        game.enemy.kills = 0;
        game.turn.begin();
      },
      build: function () {
        game.time = 0;
        game.player.turn = 0;
        game.enemy.turn = 0;
        game.currentData.moves = [];
        if (game.player.type === 'challenged') { game.status = 'turn'; }
        if (game.player.type === 'challenger') { game.status = 'unturn'; }
      },
      begin: function () {
        if (game.status !== 'over') {
          game.currentData.moves = [];
          game.states.table.el.addClass(game.status);
          if (game.status === 'turn') { game.message.text(game.ui.yourturn); }
          if (game.status === 'unturn') { game.message.text(game.ui.enemyturn); }
          $('.card .damaged').remove();
          $('.card .heal').remove();
          $('.card.dead').each(function () {
            var dead = $(this);
            if (game.time > dead.data('reborn')) { dead.reborn(); }
          });
          if (game.turn === 6) { $('.card', game.states.table.playerUlts).appendTo(game.player.skills.deck); }
          if (game.status === 'turn') {
            $('.map .card.player').removeClass('done');
            game.player.buyHand();
            game.states.table.towerAutoAttack();
            game.map.highlight();
          } else {
            $('.map .card.enemy').removeClass('done');
            game.enemy.buyHand();
          }
          $('.card.heroes').each(function () {
            var hero = $(this);
            if (hero.data('channeling')) { hero.trigger('channel', { target: hero }); }
          });
          $('.card').each(function () {
            var card = $(this);
            card.trigger('turnstart', { target: card });
            if (game.status === 'turn') {
              card.trigger('playerturnstart', { target: card });
            } else { card.trigger('enemyturnstart', { target: card }); }
            card.reduceStun();
          });
          game.time = game.player.turn + game.enemy.turn;
          game.turn.counter = game.timeToPlay;
          game.loader.removeClass('loading');
          setTimeout(game.turn.count, 1000);
        }
      },
      count: function () {
        clearTimeout(game.timeout);
        game.states.table.time.text(game.ui.time + ': ' + game.turn.hours() + ' ' + game.turn.dayNight());
        game.states.table.turns.text(game.ui.turns + ': ' + game.player.turn + '/' + game.enemy.turn + ' (' + parseInt(game.time, 10) + ')');
        if (game.status === 'turn') {
          game.message.text(game.ui.yourturncount + ' ' + game.turn.counter + ' ' + game.ui.seconds);
        } else if (game.status === 'unturn') {
          game.message.text(game.ui.enemyturncount + ' ' + game.turn.counter + ' ' + game.ui.seconds);
        }
        if (game.turn.counter < 1) {
          $('.card.heroes').each(function () {
            var hero = $(this);
            hero.trigger('turnend', { target: hero });
          });
          if (game.status === 'turn') {
            game.match.sendMoves();
          } else if (game.status === 'unturn') {
            game.match.getMoves();
          }
        } else {
          game.timeout = setTimeout(game.turn.count, 1000);
        }
        game.time += 0.9 / game.timeToPlay;
        game.turn.counter -= 1;
      },
      hours: function () {
        var convertedMin, intMin, stringMin,
          hours = game.time % game.dayLength,
          perCentHours = hours / game.dayLength,
          convertedHours = perCentHours * 24,
          intHours = parseInt(convertedHours, 10),
          minutes = convertedHours - intHours;
        if (minutes < 0) { minutes = 0; }
        convertedMin = minutes * 60;
        intMin = parseInt(convertedMin, 10);
        stringMin = intMin < 10 ? '0' + intMin : intMin;
        return intHours + ':' + stringMin;
      },
      dayNight: function () {
        var hours = game.time % game.dayLength;
        if (hours < game.dayLength / 2) {
          return game.ui.day;
        } else { return game.ui.night; }
      }
    },
    audio: {
      buffers: {},
      count: 0,
      load: function (name) {
        var ajax = new XMLHttpRequest();
        ajax.open('GET', '/audio/' + name + '.mp3', true);
        ajax.responseType = 'arraybuffer';
        ajax.onload = function () {
          var buffer = ajax.response;
          if (typeof ajax.response === 'string') { buffer = game.audio.str2ab(ajax.response); }
          game.audio.context.decodeAudioData(ajax.response, function (buffer) {
            game.audio.buffers[name] = buffer;
            game.audio.count -= 1;
          });
        };
        ajax.send();
      },
      play: function (name) {
        var sound = game.audio.context.createBufferSource();
        sound.buffer = game.audio.buffers[name];
        sound.connect(game.mute);
        sound.start();
      }
    },
    chat: {
      build: function () {
        game.chat.el = $('<div>').addClass('chat').appendTo(game.states.menu.el).html('<h1>Chat</h1>').hover(function () {
          game.chat.input.focus();
        });
        game.chat.messages = $('<div>').addClass('messages').appendTo(game.chat.el);
        game.chat.input = $('<input>').appendTo(game.chat.el).attr({
          type: 'text',
          maxlength: 42
        }).keydown(function (e) {
          if (e.which === 13) { game.chat.button.click(); }
        });
        game.chat.button = $('<button>').addClass('fa fa-comment-o').appendTo(game.chat.el).click(function () {
          var msg = game.chat.input.val();
          if (!msg) {
            game.chat.input.focus();
          } else {
            game.chat.button.attr('disabled', true);
            game.loader.addClass('loading');
            game.chat.input.val('');
            game.db({
              'set': 'chat',
              'data': game.player.name + ': ' + msg
            }, function (chat) {
              game.chat.update(chat);
              setTimeout(function () {
                game.loader.removeClass('loading');
                game.chat.button.attr('disabled', false);
              }, 2000);
            });
          }
        });
        game.chat.icon = $('<span>').addClass('chat-icon fa fa-comment-o').appendTo(game.chat.el);
        setInterval(function () {
          game.db({ 'get': 'chat' }, function (chat) {
            game.chat.update(chat);
          });
        }, 5000);
        game.db({
          'set': 'chat',
          'data': ':bust_in_silhouette:' + game.player.name + ' ' + game.ui.joined
        }, function (chat) {
          game.chat.update(chat);
        });
        game.chat.el.appendTo(game.states.menu.el);
        game.chat.builded = true;
      },
      update: function (chat) {
        var down = false,
          height = game.chat.messages[0].scrollHeight - game.chat.messages.height();
        if (game.chat.messages.scrollTop() === height) { down = true; }
        game.chat.messages.empty();
        $.each(chat.messages, function () {
          var msg = $('<p>').text(this).prependTo(game.chat.messages).emojify();
        });
        if (down) { game.chat.messages.scrollTop(game.chat.messages[0].scrollHeight); }
      }
    },
    map: {
      lettersStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      build: function (opt) {
        game.map.letters = game.map.lettersStr.split('');
        game.spot = [];
        var map = $('<div>').attr({ 'class': 'map' }), w, h, tr;
        for (h = 0; h < opt.height; h += 1) {
          game.spot[h] = [];
          tr = $('<div>').addClass('row').appendTo(map);
          for (w = 0; w < opt.width; w += 1) {
            game.spot[h][w] = $('<div>').attr({ 'id': game.map.toId(w, h) }).addClass('free spot').appendTo(tr).on('contextmenu', game.nomenu);
          }
        }
        game.map.builded = true;
        return map;
      },
      start: function () {
        game.scrollX = 40;
        game.states.table.camera = $('<div>').appendTo(game.states.table.el).addClass('camera').mousemove(function (event) {
          var offset = game.states.table.camera.offset(),
            x = event.clientX - offset.left;
          if (x < 40) {
            game.scrollingX = -1;
          } else if (x > 680) {
            game.scrollingX = 1;
          } else { game.scrollingX = 0; }
        }).hover(function () {
          game.scrollingX = 0;
        });
        game.states.table.map = game.map.build({
          'width': game.width,
          'height': game.height,
          'class': 'map'
        }).appendTo(game.states.table.camera);
        setInterval(game.map.scroll, 16);
      },
      scroll: function () {
        if (game.scrollingX) {
          game.scrollX += game.scrollspeed * game.scrollingX;
          if (game.scrollX < 40) { game.scrollX = 40; }
          if (game.scrollX > 43.5) { game.scrollX = 43.5; }
          game.states.table.map.css({ transform: 'rotateX(40deg) translate(-' + game.scrollX + '%, -58%)  scale3d(0.5,0.5,0.5)' });
        }
      },
      toId: function (w, h) {
        if (w >= 0 && h >= 0 && w < game.width && h < game.height) { return game.map.letters[w] + (h + 1); }
      },
      getX: function (spot) {
        if (spot) {
          var w = game.map.letters.indexOf(spot[0]);
          if (w >= 0 && w < game.width) { return w; }
        }
      },
      getY: function (spot) {
        if (spot) {
          var h = parseInt(spot[1], 10) - 1;
          if (h >= 0 && h < game.height) { return h; }
        }
      },
      getSpot: function (w, h) {
        if (game.spot[h] && game.spot[h][w]) { return game.spot[h][w]; }
      },
      getPosition: function (el) {
        if (el.hasClass('spot')) { return el.attr('id'); }
        return el.closest('.spot').attr('id');
      },
      mirrorPosition: function (spot) {
        var w = game.map.getX(spot), h = game.map.getY(spot),
          x = game.width - w - 1, y = game.height - h - 1;
        return game.map.toId(x, y);
      },
      rangeArray: [ 0.5, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4 ],
      atRange: function (spot, range, cb, filter) {
        if (range < 0 || range > game.map.rangeArray.length) { return; }
        var radius, x, y, r, r2, l,
          fil = function (x, y) {
            var spot = game.map.getSpot(x, y);
            if (spot) {
              if (filter) {
                if (!spot.hasClasses(filter)) { cb(spot); }
              } else { cb(spot); }
            }
          },
          w = game.map.getX(spot),
          h = game.map.getY(spot);
        if (range === 0) {
          fil(w, h);
        } else {
          radius = game.map.rangeArray[range];
          r = Math.round(radius);
          r2 = radius * radius;
          l = Math.ceil(radius) * Math.cos(Math.PI / 4);
          fil(w, h + r);
          fil(w, h - r);
          fil(w - r, h);
          fil(w + r, h);
          if (range === 2 || range === 3) {
            for (x = 1; x <= l; x += 1) {
              y = Math.round(Math.sqrt(r2 - x * x));
              fil(w + x, h + y);
              fil(w + x, h - y);
              fil(w - x, h + y);
              fil(w - x, h - y);
            }
          } else if (range > 3) {
            for (x = 1; x <= l; x += 1) {
              y = Math.round(Math.sqrt(r2 - x * x));
              fil(w + x, h + y);
              fil(w + y, h + x);
              fil(w + x, h - y);
              fil(w + y, h - x);
              fil(w - x, h + y);
              fil(w - y, h + x);
              fil(w - x, h - y);
              fil(w - y, h - x);
            }
          }
        }
      },
      atMovementRange: function (card, range, cb, filter) {
        if (range < 0 || range > game.map.rangeArray.length) { return; }
        var radius, x, y, r, r2, l, a, i, o, m, s,
          spot = game.map.getPosition(card),
          fil = function (x, y) {
            var spot = game.map.getSpot(x, y);
            if (spot) {
              if (filter) {
                if (!spot.hasClasses(filter)) { cb(spot); }
              } else { cb(spot); }
            }
          },
          w = game.map.getX(spot),
          h = game.map.getY(spot);
        if (range > 0) {
          radius = game.map.rangeArray[range];
          r = Math.round(radius);
          r2 = radius * radius;
          l = Math.ceil(radius) * Math.cos(Math.PI / 4);
          fil(w, h + 1);
          fil(w, h - 1);
          fil(w - 1, h);
          fil(w + 1, h);
          if (range === 2 || range === 3) {
            for (x = 1; x <= l; x += 1) {
              y = Math.round(Math.sqrt(r2 - x * x));
              fil(w + x, h + y);
              fil(w + x, h - y);
              fil(w - x, h + y);
              fil(w - x, h - y);
            }
          }
          if (range === 3 && !card.hasClass('phased')) {
            a = [{ a: w, b: h + 2, c: w, d: h + 1, e: w + 1, f: h + 1, g: w - 1, h: h + 1 },
                 { a: w, b: h - 2, c: w, d: h - 1, e: w + 1, f: h - 1, g: w - 1, h: h - 1 },
                 { a: w - 2, b: h, c: w - 1, d: h, e: w - 1, f: h + 1, g: w - 1, h: h - 1 },
                 { a: w + 2, b: h, c: w + 1, d: h, e: w + 1, f: h + 1, g: w + 1, h: h - 1 }
              ];
            for (i = 0; i < a.length; i += 1) {
              o = a[i];
              m = game.map.getSpot(o.a, o.b);
              s = game.map.getSpot(o.c, o.d);
              if (s && s.hasClass('free')) {
                if (m) { m.data('detour', false); }
                fil(o.a, o.b);
              } else {
                s = game.map.getSpot(o.e, o.f);
                if (s && s.hasClass('free')) {
                  if (m) { m.data('detour', s); }
                  fil(o.a, o.b);
                } else {
                  s = game.map.getSpot(o.g, o.h);
                  if (s && s.hasClass('free')) {
                    if (m) { m.data('detour', s); }
                    fil(o.a, o.b);
                  }
                }
              }
            }
          }
        }
      },
      inRange: function (spot, r, cb) {
        game.map.atRange(spot, 0, cb);
        game.map.around(spot, r, cb);
      },
      around: function (spot, r, cb) {
        game.map.atRange(spot, r, cb);
        if (r === 3) { game.map.atRange(spot, 1, cb); }
        if (r === 4) { game.map.atRange(spot, 2, cb); }
        if (r === 5) {
          game.map.atRange(spot, 1, cb);
          game.map.atRange(spot, 3, cb);
        }
      },
      stroke: function (spot, range, cl) {
        var radius, x, y, r, r2, l,
          fil = function (x, y, border) {
            var spot = game.map.getSpot(x, y);
            if (spot) { spot.addClass(cl + ' stroke ' + border); }
          },
          w = game.map.letters.indexOf(spot[0]),
          h = parseInt(spot[1], 10) - 1;
        if (range === 0) { return fil(w, h, 'left right top bottom'); }
        radius = game.map.rangeArray[range];
        r = Math.round(radius);
        r2 = radius * radius;
        l = Math.ceil(radius) * Math.cos(Math.PI / 4);
        if (range % 2 === 0) {
          fil(w, h + r, 'bottom');
          fil(w, h - r, 'top');
          fil(w - r, h, 'left');
          fil(w + r, h, 'right');
        } else if (range % 2 === 1) {
          fil(w, h + r, 'bottom left right');
          fil(w, h - r, 'top  left right');
          fil(w - r, h, 'left top bottom');
          fil(w + r, h, 'right top bottom');
        }
        if (range === 2 || range === 3) {
          for (x = 1; x <= l; x += 1) {
            y = 1;
            fil(w + x, h + y, 'right bottom');
            fil(w + x, h - y, 'right top');
            fil(w - x, h + y, 'left bottom');
            fil(w - x, h - y, 'left top');
          }
        } else if (range === 4 || range === 6 || range === 8) {
          for (x = 1; x <= l; x += 1) {
            y = Math.round(Math.sqrt(r2 - x * x));
            fil(w + x, h + y, 'right bottom');
            fil(w + y, h + x, 'right bottom');
            fil(w + x, h - y, 'right top');
            fil(w + y, h - x, 'right top');
            fil(w - x, h + y, 'left bottom');
            fil(w - y, h + x, 'left bottom');
            fil(w - x, h - y, 'left top');
            fil(w - y, h - x, 'left top');
          }
        } else if (range >= 5) {
          for (x = 1; x <= l; x += 1) {
            y = Math.round(Math.sqrt(r2 - x * x));
            fil(w + x, h + y, 'bottom');
            fil(w - x, h + y, 'bottom');
            fil(w + x, h - y, 'top');
            fil(w - x, h - y, 'top');
            fil(w - y, h + x, 'left');
            fil(w - y, h - x, 'left');
            fil(w + y, h - x, 'right');
            fil(w + y, h + x, 'right');
          }
        }
        if (range === 7) {
          fil(w + 3, h + 2, 'bottom');
          fil(w - 3, h + 2, 'bottom');
          fil(w + 3, h - 2, 'top');
          fil(w - 3, h - 2, 'top');
          fil(w - 2, h + 3, 'left');
          fil(w - 2, h - 3, 'left');
          fil(w + 2, h + 3, 'right');
          fil(w + 2, h - 3, 'right');
        }
      },
      linear: function () {
        //
      },
      getRange: function (att) {
        var range = 1;
        if (att === game.ui.melee) { range = 2; }
        if (att === game.ui.short) { range = 3; }
        if (att === game.ui.ranged) { range = 4; }
        if (att === game.ui.long) { range = 5; }
        return range;
      },
      highlight: function () {
        if (game.selectedCard) {
          if (game.selectedCard.hasClasses('hero unit')) {
            game.selectedCard.strokeAttack();
            if (game.status === 'turn') {
              if (!game.tutorial.lessonAttack) { game.selectedCard.highlightMove(); }
              if (!game.tutorial.lessonSkill) { game.selectedCard.highlightAttack(); }
            }
          } else if (game.selectedCard.hasClass('skill')) {
            game.selectedCard.highlightSource();
            game.selectedCard.strokeSkill();
            if (game.status === 'turn') {
              game.selectedCard.highlightTargets();
            }
          } else if (game.selectedCard.hasClass('tower')) {
            game.selectedCard.strokeAttack();
          }
        }
      },
      unhighlight: function () {
        $('.map .card').off('contextmenu.attack contextmenu.cast contextmenu.passive mouseenter mouseleave').removeClass('attacktarget casttarget targetarea');
        $('.map .spot').off('contextmenu.movearea contextmenu.castarea mouseenter mouseleave').removeClass('movearea targetarea stroke playerattack enemyattack skillcast skillarea top bottom left right');
      }
    },
    states: {
      currentstate: 'load',
      preBuild: [
        'intro',
        'login',
        'menu',
        'options',
        'choose',
        'table'
      ],
      build: function () {
        this.el = $('<div>').addClass('states frame').appendTo(game.container).hide();
        game.topbar = $('<div>').addClass('topbar').append(game.loader, game.message, game.triesCounter);
        $.each(game.states.preBuild, function () {
          game.states[this].el = $('<div>').addClass('state ' + this).appendTo(game.states.el).hide();
          if (game.states[this].build) {
            game.states[this].build();
            game.states[this].builded = true;
          }
        });
        game.states.changeTo('intro');
      },
      changeTo: function (state) {
        if (this === game.states.currentstate) { return; }
        var newstate,
          pre = game.states.currentstate,
          oldstate = game.states[pre];
        if (oldstate.el) { oldstate.el.fadeOut(400); }
        if (oldstate.end) { oldstate.end(); }
        newstate = this[state];
        if (newstate.build && !newstate.builded) {
          newstate.build();
          newstate.builded = true;
        }
        this.el.removeClass(pre);
        if (newstate.el) { newstate.el.append(game.topbar).delay(400).fadeIn(400); }
        game.states.currentstate = state;
        game.backstate = pre;
        if (newstate.start) { newstate.start(); }
      },
      backState: function () {
        game.states.changeTo(game.backstate);
      },
      //state
      load: {
        build: function () {
          game.states.load.video();
          game.states.load.audio();
          game.states.load.images();
          game.states.load.language(function () {
            game.states.load.data();
            setTimeout(game.states.load.poll, 500);
          });
          game.states.load.ping(function () {
            if (!game.offline && !game.debug) {
              game.states.load.analytics();
            }
          });
        },
        language: function (cb) {
          var currentlang = [
            'en-US',
            'pt-BR'
          ];
          game.lang = currentlang[0];
          game.langDir = '';
          game.db({ 'get': 'lang' }, function (data) {
            if (data.lang) {
              game.player.plang = data.lang.split(';')[0].split(',')[0];
              if (currentlang.indexOf(game.player.plang) >= 0) {
                game.lang = game.player.plang;
                game.langDir = game.lang + '/';
              }
            }
            if (cb) { cb(); }
          });
        },
        json: function (name, cb) {
          $.ajax({
            type: 'GET',
            url: 'json/' + game.langDir + name + '.json',
            complete: function (response) {
              var data = JSON.parse(response.responseText);
              game[name] = data;
              if (cb) {
                cb(data);
              }
            }
          });
        },
        data: function () {
          game.states.load.json('ui');
          game.states.load.json('heroes');
          game.states.load.json('units');
          game.states.load.json('skills', function () {
            var hero, skill;
            for (hero in game.skills) {
              if (game.skills.hasOwnProperty(hero)) {
                for (skill in game.skills[hero]) {
                  if (game.skills[hero].hasOwnProperty(skill)) {
                    game.skills[hero][skill].buff = hero + '-' + skill;
                    game.skills[hero][skill].hero = hero;
                    game.skills[hero][skill].skill = skill;
                  }
                }
              }
            }
          });
          game.states.load.json('buffs', function () {
            var hero, buff;
            for (hero in game.buffs) {
              if (game.buffs.hasOwnProperty(hero)) {
                for (buff in game.buffs[hero]) {
                  if (game.buffs[hero].hasOwnProperty(buff)) {
                    game.buffs[hero][buff].buff = hero + '-' + buff;
                    game.buffs[hero][buff].hero = hero;
                    game.buffs[hero][buff].skill = buff;
                  }
                }
              }
            }
          });
        },
        audio: function () {
          game.audio.context = new AudioContext();
          game.mute = game.audio.context.createGain();
          game.mute.connect(game.audio.context.destination);
          var sounds = [
            'activate',
            'crit',
            'horn',
            'battle',
            'pick',
            'tower',
            'tutorial/axehere',
            'tutorial/axebattle',
            'tutorial/axemove',
            'tutorial/axeattack',
            'tutorial/axetime',
            'tutorial/axewait',
            'tutorial/axeah'
          ], i;
          for (i = 0; i < sounds.length; i += 1) { game.audio.load(sounds[i]); }
          game.audio.count = sounds.length;
        },
        video: function () {
          if (!game.debug) {
            game.states.intro.player = $('<div>').addClass('player');
            var ratio = 16 / 9,
              width = $('.frame').width() * 1.1,
              height = Math.ceil(width / ratio);
            game.states.intro.video = $('<video>').attr({
              id: 'introvideo',
              autobuffer: true,
              preload: true
            }).css({
              width: width,
              height: height
            }).appendTo(game.states.intro.player).on('canplay', function () {
              game.videoplayer = game.states.intro.video[0];
            });
            game.states.intro.mp4 = $('<source>').attr({
              type: 'video/mp4',
              src: '/video/intro.mp4'
            }).appendTo(game.states.intro.video);
            game.states.intro.webm = $('<source>').attr({
              type: 'video/webm',
              src: '/video/intro.webm'
            }).appendTo(game.states.intro.video);
          } else { game.videoplayer = {}; }
        },
        images: function () {
          var imgUrls, thisSheetRules, baseURL, baseURLarr, csshref, cssPile,  arr, i, j,
            sheets = document.styleSheets,
            allImgs = [], k = 0,
            mkImg = function (k, t) {
              allImgs[k] = new Image();
              allImgs[k].src = t[0] === '/' || t.match('http://') ? t : baseURL + t;
            };
          for (i = 0; i < sheets.length; i += 1) {
            cssPile = '';
            csshref = sheets[i].href || 'window.location.href';
            baseURLarr = csshref.split('/');
            baseURLarr.pop();
            baseURL = baseURLarr.join('/');
            if (baseURL !== '') { baseURL += '/'; }
            if (document.styleSheets[i].cssRules) {
              thisSheetRules = document.styleSheets[i].cssRules;
              for (j = 0; j < thisSheetRules.length; j += 1) {
                cssPile += thisSheetRules[j].cssText;
              }
            } else { cssPile += document.styleSheets[i].cssText; }
            imgUrls = cssPile.match(/[^(]+.(gif|jpg|jpeg|png)/g);
            if (imgUrls !== null && imgUrls.length > 0 && imgUrls !== '') {
              arr = $.makeArray(imgUrls);
              $.each(arr, mkImg);
            }
          }
          return allImgs;
        },
        ping: function (cb) {
          var start = new Date();
          $.ajax({
            type: 'GET',
            url: 'http://dotacard.herokuapp.com',
            complete: function (response) {
              game.ping = new Date() - start;
              if (response.readyState === 4) {
                game.offline = false;
              } else { game.offline = true; }
              if (cb) { cb(); }
            }
          });
        },
        analytics: function () {
          if (!game.debug) { $('<script src="browser_modules/google.analytics.min.js">').appendTo('body'); }
        },
        poll: function () {
          clearTimeout(game.timeout);
          if (game.ui && game.heroes && game.buffs && game.skills && game.units && game.videoplayer && game.audio.count < 1) {
            game.status = 'loaded';
            game.states.build();
          } else {
            game.timeout = setTimeout(game.states.load.poll, 500);
          }
        },
        end: function () {
          if (!game.debug) {
            window.oncontextmenu = game.nomenu;
            window.onbeforeunload = function () {
              return game.ui.leave;
            };
          }
        },
        reset: function () {
          if (game.debug) {
            console.log('Internal error: ', game);
          } else {
            alert(game.ui.error);
            location.reload(true);
          }
        }
      },
      intro: {
        build: function () {
          if (!game.debug) { this.player.appendTo(this.el).hide(); }
          this.divskip = $('<div>').addClass('skip').appendTo(this.el).click(function () {
            game.states.changeTo('login');
          }).contextmenu(game.nomenu);
          this.box = $('<div>').hide().appendTo(this.el).addClass('box');
          this.text = $('<h1>').appendTo(this.box).addClass('introheader').html('DotaCard <a target="_blank" href="https://github.com/rafaelcastrocouto/dotacard/commits/gh-pages">alpha ' + game.vs + '</a>');
        },
        start: function () {
          $('.frame.welcome').hide();
          game.states.el.show();
          game.states.intro.box.fadeIn(2000).fadeOut(1000);
          if (!game.debug) {
            game.videoplayer.play();
            game.states.intro.player.delay(1000).fadeIn(1000);
            setTimeout(game.states.intro.skip, 102400);
          } else {
            setTimeout(game.states.intro.skip, 2000);
          }
        },
        skip: function () {
          if (game.states.currentstate === 'intro') { game.states.changeTo('login'); }
        },
        end: function () {
          if (!game.debug && game.videoplayer) { game.videoplayer.pause(); }
        }
      },
      login: {
        remembername: true,
        build: function () {
          this.menu = $('<div>').appendTo(this.el).addClass('box');
          this.title = $('<h1>').appendTo(this.menu).text(game.ui.choosename);
          this.input = $('<input>').appendTo(this.menu).attr({
            placeholder: game.ui.logintype,
            type: 'text',
            maxlength: 24
          }).keydown(function (e) {
            if (e.which === 13) { game.states.login.button.click(); }
          });
          this.button = $('<button>').appendTo(this.menu).text(game.ui.login).attr({
            placeholder: game.ui.choosename,
            title: game.ui.choosename
          }).click(function () {
            var name = game.states.login.input.val();
            if (!name) {
              game.states.login.input.focus();
            } else {
              game.player.name = name;
              if (game.states.login.remembername) {
                $.cookie('name', name);
              } else {
                $.removeCookie('name');
              }
              game.states.login.button.attr('disabled', true);
              game.loader.addClass('loading');
              game.db({ 'get': 'server' }, function (server) {
                if (server.status === 'online') {
                  game.states.changeTo('menu');
                } else { game.states.load.reset(); }
              });
            }
          });
          this.rememberlabel = $('<label>').appendTo(this.menu).text(game.ui.remember);
          this.remembercheck = $('<input>').attr({
            type: 'checkbox',
            name: 'remember',
            checked: true
          }).change(this.remember).appendTo(this.rememberlabel);
          var rememberedname = $.cookie('name');
          if (rememberedname) { this.input.val(rememberedname); }
        },
        start: function () {
          game.message.text('');
          this.input.focus();
          game.loader.removeClass('loading');
          if (game.debug) {
            this.input.val('Bot' + parseInt(Math.random() * 100, 10));
          }
          game.states.options.opt.hide();
          $('.forklink').show();
        },
        end: function () {
          this.button.attr('disabled', false);
        },
        remember: function () {
          game.states.login.remembername = !game.states.login.remembername;
        }
      },
      menu: {
        build: function () {
          this.menu = $('<div>').appendTo(this.el).addClass('box');
          this.title = $('<h1>').appendTo(this.menu).text(game.ui.choosemode);
          this.tutorial = $('<button>').appendTo(this.menu).attr({ 'title': game.ui.tutorial }).text(game.ui.tutorial).click(function () {
            game.tutorial.build();
            game.states.changeTo('choose');
          });
          this.online = $('<button>').appendTo(this.menu).attr({ 'title': game.ui.chooseonline }).text(game.ui.online).click(function () {
            game.match.online();
            game.states.changeTo('choose');
          });
          this.friend = $('<button>').appendTo(this.menu).attr({
            'title': game.ui.choosefriend,
            'disabled': true
          }).text(game.ui.friend);
          this.bot = $('<button>').appendTo(this.menu).attr({
            'title': game.ui.choosebot,
            'disabled': true
          }).text(game.ui.bot);
          this.options = $('<button>').appendTo(this.menu).attr({ 'title': game.ui.chooseoptions }).text(game.ui.options).click(function () {
            game.states.changeTo('options');
          });
          this.credits = $('<button>').appendTo(this.menu).attr({
            'title': game.ui.choosecredits,
            'disabled': true
          }).text(game.ui.credits);
        },
        start: function () {
          game.states.options.opt.hide();
          $('.forklink').show();
          game.loader.removeClass('loading');
          game.triesCounter.text('');
          game.message.html(game.ui.welcome + ' <b>' + game.player.name + '</b>!');
          $('<small>').addClass('logout').appendTo(game.message).text(game.ui.logout).click(function () {
            game.states.changeTo('login');
          });
          if (!game.chat.builded) { game.chat.build(); }
        }
      },
      options: {
        build: function () {
          this.menu = $('<div>').appendTo(this.el).addClass('box');
          this.title = $('<h1>').appendTo(this.menu).text(game.ui.options);
          this.resolution = $('<div>').appendTo(this.menu).attr({ 'title': game.ui.screenres }).addClass('screenresolution');
          $('<h2>').appendTo(this.resolution).text(game.ui.screenres);
          this.high = $('<label>').text(game.ui.high).appendTo(this.resolution).append($('<input>').attr({
            type: 'radio',
            name: 'resolution',
            value: 'high'
          }).change(this.changeResolution));
          $('<label>').text(game.ui.medium).appendTo(this.resolution).append($('<input>').attr({
            type: 'radio',
            name: 'resolution',
            checked: true
          }).change(this.changeResolution));
          this.low = $('<label>').text(game.ui.low).appendTo(this.resolution).append($('<input>').attr({
            type: 'radio',
            name: 'resolution',
            value: 'low'
          }).change(this.changeResolution));
          var rememberedvol, vol,
            rememberedres = $.cookie('resolution');
          if (rememberedres && this[rememberedres]) { this[rememberedres].click(); }
          this.audio = $('<div>').appendTo(this.menu).attr({ 'title': game.ui.audioconfig }).addClass('audioconfig');
          $('<h2>').appendTo(this.audio).text(game.ui.audioconfig);
          this.muteinput = $('<input>').attr({
            type: 'checkbox',
            name: 'mute'
          }).change(this.mute);
          $('<label>').text('Mute').appendTo(this.audio).append(this.muteinput);
          this.volumecontrol = $('<div>').addClass('volumecontrol');
          this.volumeinput = $('<div>').addClass('volume').on('mousedown.volume', this.volumedown).append(this.volumecontrol);
          $('<label>').text(game.ui.volume).appendTo(this.audio).append(this.volumeinput);
          $(document).on('mouseup.volume', game.states.options.volumeup);
          rememberedvol = $.cookie('volume');
          if (rememberedvol) {
            vol = parseFloat(rememberedvol);
            if (vol === 0) { this.muteinput.prop('checked', true); }
            game.mute.gain.value = vol;
            game.states.options.volumecontrol.css('transform', 'scale(' + rememberedvol + ')');
          }
          this.back = $('<button>').appendTo(this.menu).attr({ 'title': game.ui.back }).text(game.ui.back).click(game.states.backState);
          this.opt = $('<span>').appendTo(game.topbar).addClass('opt fa fa-cogs').hide().on('click.opt', function () {
            game.states.changeTo('options');
          });
        },
        start: function () {
          $('.forklink').show();
          game.states.options.opt.hide();
        },
        mute: function () {
          var vol = game.unmutedvolume || 1;
          if (this.checked) { vol = 0; }
          $.cookie('volume', vol);
          game.mute.gain.value = vol;
          game.states.options.volumecontrol.css('transform', 'scale(' + vol + ')');
        },
        volumedown: function (event) {
          game.states.options.volumechange(event);
          game.states.options.volumeinput.on('mousemove.volume', game.states.options.volumechange);
        },
        volumeup: function () {
          game.states.options.volumeinput.off('mousemove.volume');
        },
        volumechange: function (event) {
          var volume = parseInt((event.clientX - game.states.options.volumecontrol.offset().left) / 4.8, 10) / 10;
          if (volume > 1) { volume = 1; }
          if (volume <= 0) {
            volume = 0;
            game.states.options.muteinput.prop('checked', true);
          } else { game.states.options.muteinput.prop('checked', false); }
          game.states.options.volumecontrol.css('transform', 'scale(' + volume + ')');
          game.mute.gain.value = volume;
          game.unmutedvolume = volume;
          $.cookie('volume', volume);
        },
        changeResolution: function () {
          var resolution = $('input[name=resolution]:checked', '.screenresolution').val();
          game.states.el.removeClass('low high').addClass(resolution);
          $.cookie('resolution', resolution);
        },
        end: function () {
          game.states.options.opt.off('click.back').on('click.opt', game.states.backState);
        }
      },
      choose: {
        build: function () {
          this.pickbox = $('<div>').appendTo(this.el).addClass('pickbox').attr('title', game.ui.chooseheroes);
          this.pickedbox = $('<div>').appendTo(this.el).addClass('pickedbox').hide().on('contextmenu', game.nomenu);
          var slot;
          for (slot = 0; slot < 5; slot += 1) {
            $('<div>').appendTo(this.pickedbox).attr({ title: game.ui.rightpick }).data('slot', slot).addClass('slot available').on('contextmenu.pick', game.states.choose.pick);
          }
          this.prepickbox = $('<div>').appendTo(this.el).addClass('prepickbox').html(game.ui.customdecks).hide();
          this.counter = $('<p>').appendTo(this.pickedbox).addClass('counter').hide();
          this.pickDeck = game.deck.build({
            name: 'heroes',
            cb: function (pickDeck) {
              pickDeck.addClass('pickdeck').appendTo(game.states.choose.pickbox);
              game.states.choose.size = 100;
              $.each(pickDeck.data('cards'), function (id, card) {
                card.on('click.active', game.states.choose.active);
                $.each(game.skills[card.data('hero')], function () {
                  if (this.display) { card.addBuff(card, this); }
                });
              });
              pickDeck.width(100 + $('.card').width() * pickDeck.children().length);
            }
          });
        },
        start: function () {
          game.loader.addClass('loading');
          game.states.options.opt.show();
          if (game.mode !== 'tutorial') { game.chat.el.appendTo(this.el); }
          $('.forklink').hide();
          if ($('.choose .card.active').length === 0) { this.pickDeck.children().first().click(); }
        },
        active: function () {
          var card = $(this);
          $('.choose .card.active').removeClass('active');
          card.addClass('active');
          game.states.choose.pickDeck.css('margin-left', card.index() * card.width() / 2 * -1);
        },
        enablePick: function () {
          this.pickedbox.show();
          game.player.picks = [];
          if (game.mode !== 'tutorial') { this.prepickbox.show(); }
        },
        disablePick: function () {
          $('.slot').off('contextmenu.pick', game.states.choose.pick);
        },
        pick: function () {
          game.audio.play('activate');
          var card,
            slot = $(this).closest('.slot'),
            pick = $('.pickbox .card.active');
          if (slot.hasClass('available')) {
            slot.removeClass('available');
            if (pick.next().length) {
              card = pick.next();
            } else { card = pick.prev(); }
          } else {
            card = slot.children('.card');
            card.on('click.active', game.states.choose.active).insertBefore(pick);
          }
          card.addClass('active');
          game.states.choose.pickDeck.css('margin-left', card.index() * card.width() / 2 * -1);
          pick.removeClass('active').appendTo(slot).off('click.active');
          game.player.picks[slot.data('slot')] = pick.data('hero');
          game.player.manaBuild();
          if (game.mode === 'tutorial') {
            game.tutorial.pick();
          } else { game.match.pick(); }
          return false;
        },
        reset: function () {
          $('.pickedbox .card').appendTo(this.pickDeck).on('click.active', game.states.choose.active);
          $('.slot').addClass('available');
          game.states.choose.counter.hide();
        },
        end: function () {
          this.pickedbox.hide();
          this.prepickbox.hide();
        }
      },
      table: {
        build: function () {
          this.time = $('<p>').appendTo(game.topbar).addClass('time').text(game.ui.time + ': 0:00 Day').hide();
          this.turns = $('<p>').appendTo(game.topbar).addClass('turns').text(game.ui.turns + ': 0/0 (0)').hide();
          this.selectedArea = $('<div>').appendTo(this.el).addClass('selectedarea');
          game.map.start();
        },
        start: function () {
          if (game.mode === 'tutorial' && !game.tutorial.started) {
            game.tutorial.start();
          } else if (game.mode === 'online' && !game.match.started) {
            game.match.start();
          }
          $('.forklink').hide();
          if (game.mode !== 'tutorial') { game.chat.el.appendTo(this.el); }
          this.time.show();
          this.turns.show();
          this.camera.show();
          this.selectedArea.show();
          game.states.options.opt.show();
        },
        createTower: function (side, pos) {
          var tower = game.card.build({
            className: 'tower towers static ' + side,
            side: side,
            name: game.ui.tower,
            attribute: game.ui.building,
            range: game.ui.ranged,
            damage: 15,
            hp: 80
          });
          tower.on('click.select', game.card.select).place(pos);
          game.map.around(pos, game.map.getRange(game.ui.ranged), function (spot) {
            spot.addClass(side + 'area');
          });
          return tower;
        },
        placeTowers: function () {
          game.player.tower = this.createTower('player', 'C5');
          game.enemy.tower = this.createTower('enemy', 'J2');
        },
        towerAutoAttack: function () {
          var fromSpot, toSpot,
            lowestHp = {
              notfound: true,
              data: function (c) { return Infinity; }
            };
          $('.map .playerarea .card.enemy').each(function () {
            var target = $(this);
            if (target.data('currenthp') < lowestHp.data('currenthp')) {
              lowestHp = target;
            }
          });
          if (!lowestHp.notfound) {
            game.audio.play('tower');
            game.player.tower.attack(lowestHp);
            fromSpot = game.map.getPosition(game.player.tower);
            toSpot = game.map.getPosition(lowestHp);
            game.currentData.moves.push('A:' + fromSpot + ':' + toSpot);
          }
        },
        createTree: function (spot) {
          var tree = game.card.build({
            className: 'tree static neutral',
            name: game.ui.tree,
            attribute: game.ui.forest
          });
          tree.on('click.select', game.card.select).place(spot);
          return tree;
        },
        placeTrees: function () {
          var treeSpots = 'A2 A3 B3';
          $.each(treeSpots.split(' '), function () {
            game.states.table.createTree(this);
            game.states.table.createTree(game.map.mirrorPosition(this));
          });
        },
        buildUnits: function () {
          $('#A1').addClass('camp');
          $('#L6').addClass('camp');
          game.neutrals = {};
          game.neutrals.unitsDeck = game.deck.build({
            name: 'units',
            filter: ['forest'],
            cb: function (deck) {
              deck.addClass('neutral units cemitery').hide().appendTo(game.states.table.el);
              $.each(deck.data('cards'), function (i, card) {
                card.addClass('neutral unit').data('side', 'neutral').on('click.select', game.card.select);
              });
            }
          });
          game.player.unitsDeck = game.deck.build({
            name: 'units',
            filter: game.player.picks,
            cb: function (deck) {
              deck.addClass('player units cemitery').hide().appendTo(game.states.table.el);
              $.each(deck.data('cards'), function (i, card) {
                card.addClass('player unit').data('side', 'player').on('click.select', game.card.select);
              });
            }
          });
          game.enemy.unitsDeck = game.deck.build({
            name: 'units',
            filter: game.enemy.picks,
            cb: function (deck) {
              deck.addClass('enemy units cemitery').hide().appendTo(game.states.table.el);
              $.each(deck.data('cards'), function (i, card) {
                card.addClass('enemy unit').data('side', 'enemy').on('click.select', game.card.select);
              });
            }
          });
        },
        animateCast: function (skill, target) {
          if (typeof target === 'string') { target = $('#' + target); }
          var t = skill.offset(), d = target.offset();
          skill.css({
            top: d.top - t.top + 30,
            left: d.left - t.left + 20,
            transform: 'translate(-50%, -50%) scale(0.3)'
          });
          setTimeout(function () {
            $(this.skill).css({
              top: '',
              left: '',
              transform: ''
            });
          }.bind({ skill: skill }), 500);
        },
        showResults: function () {
          game.states.table.selectedArea.hide();
          game.states.table.camera.hide();
          $('.table .deck').hide();
          game.states.table.resultsbox = $('<div>').appendTo(game.states.table.el).attr({ 'class': 'resultsbox box' });
          $('<h1>').appendTo(this.resultsbox).addClass('result').text(game.winner + ' ' + game.ui.victory);
          $('<h1>').appendTo(this.resultsbox).text(game.ui.towers + ' HP: ' + game.player.tower.data('currenthp') + ' / ' + game.enemy.tower.data('currenthp'));
          $('<h1>').appendTo(this.resultsbox).text(game.ui.heroes + ' ' + game.ui.kd + ': ' + game.player.kills + ' / ' + game.enemy.kills);
          game.states.table.playerResults = $('<div>').appendTo(game.states.table.resultsbox).attr({ 'class': 'results' });
          game.states.table.enemyResults = $('<div>').appendTo(game.states.table.resultsbox).attr({ 'class': 'results' });
          $('.player.heroes.card').not('.zoom').each(function () {
            var hero = $(this), heroid = $(this).data('hero'),
              img = $('<div>').addClass('portrait').append($('<div>').addClass('img')),
              text = $('<span>').text(hero.data('name') + ': ' + hero.data('kills') + ' / ' + hero.data('deaths'));
            $('<p>').appendTo(game.states.table.playerResults).addClass(heroid).append(img, text);
          });
          $('.enemy.heroes.card').not('.zoom').each(function () {
            var hero = $(this), heroid = $(this).data('hero'),
              img = $('<div>').addClass('portrait').append($('<div>').addClass('img')),
              text = $('<span>').text(hero.data('name') + ': ' + hero.data('kills') + ' / ' + hero.data('deaths'));
            $('<p>').appendTo(game.states.table.enemyResults).addClass(heroid).append(img, text);
          });
          $('<button>').appendTo(game.states.table.resultsbox).text(game.ui.close).click(function () {
            game.states.table.clear();
            if (game.mode === 'tutorial') { game.tutorial.clear(); }
            game.states.changeTo('menu');
          });
        },
        clear: function () {
          $('.table .card').remove();
          $('.table .deck').remove();
          game.states.table.time.hide();
          game.states.table.turns.hide();
          game.states.table.resultsbox.remove();
          game.match.end();
        },
        end: function () {
          this.time.hide();
          this.turns.hide();
        }
      }
    }
  };
}());
game.start();
