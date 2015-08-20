/* by rafælcastrocouto */
/*jslint browser: true, white: true, sloppy: true, vars: true */
/*global game, $, alert, console */

//Types: Active (ex. nyx stun, cristal frostbite, ...)
//       Passive (ex. cystal aura, ...)
//       Toggle (ex. pudge rot, morph agi/str, troll melee/ranged, medusa split, witch doctor heal and leshrac ult)
//       Channel (ex. kotl illuminate, pugna ult...)
//       Automatic (wk ult and abaddon ult)
//Tatgets: self, player, enemy, spot, free
//Damage = lvl15 damage * 0.1
//HP = lvl15 hp * 0.05
//Regen = Card HP * 0.03
//Mana = lvl15 mana * 0.005
//ATS = (1 + ATS%) / BAT  (avarage BAT = 1.7)
//Skills = lvl4
//Ults = lvl2
//Skill card count = 50/cooldown + 50/manacost
//..function (cool,mana) {return Math.round((50/cool)+(50/mana))}
//CPT 10 to 14 = 2 cards; 15 to 20 = 3 cards
//MC 5 to 10
//
// RANGES:
//
//        0     1       2       3         4          5           6          7           8
// atk range:     |  Melee |  Short  | Ranged  |   Long
// speed:    Slow | Normal |  Fast                                          ▒          ▒▒▒
//                                                   ▒          ▒▒▒       ▒▒░▒▒       ▒░░░▒
//                              ▒        ▒▒▒       ▒▒░▒▒       ▒░░░▒     ▒░░░░░▒     ▒░░░░░▒
//              ▒     ▒▒▒      ▒░▒      ▒░░░▒      ▒░░░▒      ▒░░░░░▒    ▒░░░░░▒    ▒░░░░░░░▒
//        ▓    ▒▓▒    ▒▓▒     ▒░▓░▒     ▒░▓░▒     ▒░░▓░░▒     ▒░░▓░░▒   ▒░░░▓░░░▒   ▒░░░▓░░░▒
//              ▒     ▒▒▒      ▒░▒      ▒░░░▒      ▒░░░▒      ▒░░░░░▒    ▒░░░░░▒    ▒░░░░░░░▒
//                              ▒        ▒▒▒       ▒▒░▒▒       ▒░░░▒     ▒░░░░░▒     ▒░░░░░▒
//                                                   ▒          ▒▒▒       ▒▒░▒▒       ▒░░░▒
//                                                                          ▒          ▒▒▒

var Skills = {

  pud: {
    hook: {
      cast: function (skill, source, target) {
        var cw = game.map.getX(source.parent()),
          ch = game.map.getY(source.parent()),
          w = game.map.getX(target),
          h = game.map.getY(target),
          range = skill.data('aoe range'),
          x = 0, y = 0,
          hooked,
          r,
          dx,
          dy;
        if (ch - h > 0) { y = -1; }
        if (ch - h < 0) { y = 1; }
        if (cw - w > 0) { x = -1; }
        if (cw - w < 0) { x = 1; }
        target = game.map.getSpot(cw + x, ch + y);
        for (r = 1; r <= range; r += 1) {
          var spot = game.map.getSpot(cw + (r * x), ch + (r * y));
          if (spot) {
            var card = spot.find('.card');
            if (card.length) {
              hooked = card;
              break;
            }
          }
        }
        if(hooked && hooked.hasClasses('hero unit')) {
          source.damage(skill.data('damage'), hooked, skill.data('damage type'));
          w = game.map.getX(hooked.parent());
          h = game.map.getY(hooked.parent());
          dx = -212 * x * (Math.abs(cw - w) - 1);
          dy = -313 * y * (Math.abs(ch - h) - 1);
          //if (!source.data('hook fx')) { Skills.pud.hook.fx(source, dx, dy); }
          setTimeout(function () {
            if (x) {
              hooked.css({left: 'calc(50% + ' + dx + 'px)'});
            } else if (y) {
              hooked.css({top: 'calc(50% + ' + dy + 'px)'});
            }
          }.bind({hooked: hooked, dx: dx, dy: dy, x: x, y: y}), 600);
          setTimeout(function () {
            this.hooked.place(this.target).css({
              transition: 'all 0.4s',
              top: '50%',
              left: '50%'
            });
            this.source.select();
          }.bind({source: source, hooked: hooked, target: target}), 1200);
        }
      },
      fx: function (card, x, y) {
//        var fx = game.fx.build(card, 'hook fx');
//        game.fx.image(fx);
//        fx.create('hook.png', 1200, 1000, x, y);
      }
    },
    rot: {
      toggle: function (skill, source) {
        if(skill.hasClass('on')) {
          //turn off
          skill.removeClass('on');
          source.off('turnend.rot');
          source.data('pud-rot', null);
          source.removeClass('pud-rot');
          //source.data('rot fx').stop();
        }
        else {
          //turn on
          skill.addClass('on');
          source.on('turnend.rot', Skills.pud.rot.turnendcast);
          source.data('pud-rot', skill);
          source.addClass('pud-rot');
          //if (!source.data('rot fx')) { Skills.pud.rot.fx(source); }
          //source.data('rot fx').animate();
        }
      },
      turnendcast: function (event, eventdata) {
        var source = eventdata.target;
        var spot = game.map.getPosition(source);
        var side = source.data('side');
        var otherside = (side === 'enemy') ? 'player' : 'enemy';
        var skill = source.data('pud-rot');
        source.damage(skill.data('damage'), source, skill.data('damage type'));
        game.map.inRange(spot, game.map.getRange(skill.data('aoe range')), function (neighbor) {
          var card = neighbor.find('.card.'+otherside);
          if(card.length) {
            source.damage(skill.data('damage'), card, skill.data('damage type'));
            if(card.data('pud-rot')) {
              card.data('pud-rot', skill.data('duration'));
            } else {
              card.data('pud-rot', skill.data('duration'));
              source.addBuff(card, skill.data('buff'));
              var speed = card.data('speed') - 1;
              card.data('currentspeed', speed);
              card.on('turnend.rot', Skills.pud.rot.turnend);
            }
          }
        });
      },
      turnend: function (event, eventdata) {
        var target = eventdata.target;
        var duration = target.data('pud-rot');
        if(duration > 0) {
          duration -= 1;
          target.data('pud-rot', duration);
        } else {
          var speed = target.data('current speed') + 1;
          target.data('currentspeed', speed);
          target.off('turnend.rot');
          target.data('pud-rot', null);
          target.removeBuff('pud-rot');
        }
      },
      fx: function (card) {
//        var fx = game.fx.build(card, 'rot fx');
//        game.fx.particles(fx);
//        fx.create(100, {
//          radius: function () { return 10 + Math.random() * 30; },
//          speed: function () { return 4 + Math.random() * 2; },
//          x: function () { return 1100; },
//          y: function () { return 1150; },
//          color: function () { return 'yellowgreen'; },
//          dir: function () { return Math.random() * Math.PI * 2; }
//        });
      }
    },
    passive: {
      passive: function (skill, source) {
        var resistance = source.data('resistance') + skill.data('resistance bonus');
        source.data('resistance', resistance);
        Skills.pud.passive.kill.call({skill: skill, source: source});
        source.on('kill', Skills.pud.passive.kill.bind({skill: skill, source: source}));
      },
      kill: function () {
        var skill = this.skill;
        var source = this.source;
        var kills = source.data('kills');
        var damage = source.data('damage');
        var bonusDamage = (skill.data('damage bonus') * kills);
        source.changedamage(damage + bonusDamage);
        var hp = source.data('hp');
        var bonusHp = (skill.data('hp bonus') * kills);
        source.changehp(hp + bonusHp);
      }
    },
    ult: {
      cast: function (skill, source, target) {
        var channelDuration = skill.data('channel');
        source.addClass('channeling').data('channeling', channelDuration);
        source.data('dismember', {
          target: target,
          skill: skill
        });
        source.on('channel', Skills.pud.ult.channel);
        target.addClass('disabled');
      },
      channel: function (event, eventData) {
        var source = eventData.source;
        var data = source.data('dismember');
        var target = data.target;
        var skill = data.skill;
        var duration = source.data('channeling');
        if (duration) {
          var type = skill.data('type');
          var dot = skill.data('dot');
          source.damage(dot, target, type);
        } else {
          target.removeClass('disabled');
        }
      }
    }
  },

  cm: {
    slow: {
      cast: function (skill, source, target) {
        var spot = game.map.getPosition(target);
        if(game.status === 'turn') { game.states.table.animateCast(skill, spot, game.states.table.playerCemitery); }
        var side = source.data('side');
        var otherside = (side === 'enemy') ? 'player': 'enemy';
        game.map.inRange(spot, game.map.getRange(skill.data('aoe range')), function (neighbor) {
          var card = neighbor.find('.card.'+otherside);
          if(card.length) {
            source.damage(skill.data('damage'), card, skill.data('damage type'));
            if(card.data('cm-slow')) {
              card.data('cm-slow', skill.data('duration'));
            } else {
              card.data('cm-slow', skill.data('duration'));
              source.addBuff(card, skill.data('buff'));
              var speed = card.data('speed') - 1;
              card.data('current speed', speed);
              card.on('turnstart.cm-slow', Skills.cm.slow.turnstart);
            }
          }
        });
      },
      turnstart: function (event, eventdata) {
        var target = eventdata.target;
        var duration = target.data('cm-slow');
        if(duration > 0) {
          duration -= 1;
          target.data('cm-slow', duration);
        } else {
          var speed = target.data('current speed') + 1;
          target.data('current speed', speed);
          target.off('turnstart.cm-slow');
          target.data('cm-slow', null);
          target.removeBuff('cm-slow');
        }
      }
    },
    aura: {
      passive: function (skill, source) {
        var side = source.data('side');
        game[side].cardsPerTurn += 1;
        source.on('die.cm-aura');
        source.on('reborn.cm-aura');
        source.addBuff(source, skill.data('buff'));
      },
      die: function (event, eventdata) {
        var cm = eventdata.target;
        var side = cm.data('side');
        game[side].cardsPerTurn -= 1;
      },
      reborn: function (event, eventdata) {
        var cm = eventdata.target;
        var side = cm.data('side');
        game[side].cardsPerTurn += 1;
      }
    },
    freeze: {
      cast: function (skill, source, target) {
        source.addBuff(target, skill.data('buff'));
        target.addClass('frozen');
        target.data('cm-freeze', {
          source: source,
          skill: skill,
          duration: skill.data('duration')
        });
        target.on('turnend.cm-freeze', this.dot);
      },
      dot: function (event, eventdata) {
        var target = eventdata.target;
        var data = target.data('cm-freeze');
        var source = data.source;
        var skill = data.skill;
        var duration = data.duration;
        if(duration > 0) {
          source.damage(skill.data('dot'), target, skill.data('damage type'));
          duration -= 1;
          data.duration = duration;
          target.data('cm-freeze', data);
        } else {
          target.removeClass('frozen');
          target.data('cm-freeze', null);
          target.off('turnend.cm-freeze');
          target.removeBuff('cm-freeze');
        }
      }
    },
    ult: {
      cast: function (skill, source) {
        var spot = game.map.getPosition(source);
        if(game.status === 'turn') {
            game.states.table.animateCast(skill, spot, game.states.table.playerCemitery);
        }
        source.on('channel', Skills.cm.ult.channel).data('cm-ult', skill);
        source.trigger('channel', {target: source});
      },
      channel: function (event, eventdata) {
        var cm = eventdata.target;
        var skill = cm.data('cm-ult');
        var spot = game.map.getPosition(cm);
        var side = cm.data('side');
        var otherside = (side === 'enemy') ? 'player': 'enemy';
        game.map.inRange(spot, game.map.getRange(skill.data('aoe range')), function (neighbor) {
          var card = neighbor.find('.card.'+otherside);
          if(card.length) {
            cm.damage(skill.data('damage'), card, skill.data('damage type'));
            if(card.data('cm-ult')) {
              card.data('cm-ult', skill.data('duration'));
            } else {
              card.data('cm-ult', skill.data('duration'));
              cm.addBuff(card, skill.data('buff'));
              var speed = card.data('speed') - 1;
              card.data('current speed', speed);
              card.on('turnstart.cm-ult', Skills.cm.ult.turnstart);
            }
          }
        });
      },
      turnstart: function (event, eventdata) {
        var target = eventdata.target;
        var duration = target.data('cm-ult');
        if(duration > 0) {
          duration -= 1;
          target.data('cm-ult', duration);
        } else {
          var speed = target.data('current speed') + 1;
          target.data('current speed', speed);
          target.off('turnstart.cm-ult');
          target.data('cm-ult', null);
          target.removeBuff('cm-ult');
        }
      }
    }
  },

  ktol: {
    illuminate: {
      cast: function (skill, source, target) {

      },
      release: function () {}
    },
    illuminateult: {
      cast: function (skill, source, target) {},
      release: function () {}
    },
    leak: {
      cast: function (skill, source, target) {
      },
      movement: function () {}
    },
    mana: {
      cast: function (skill, source, target) {
      }
    },
    ult: {
      cast: function (skill, source) {
      }
    },
    blind: {
      cast: function (skill, source, target) {
      },
      hit: function () {}
    },
    recall: {
      cast: function (skill, source, target) {},
      damage: function () {}
    }
  },

  nyx: {
    stun: {
      cast: function (skill, source, target) {

      }
    },
    burn: {
      cast: function (skill, source, target) {},
      damage: function () {}
    },
    spike: {
      cast: function (skill, source) {},
      damage: function () {}
    },
    ult: {
      cast: function (skill, source) {},
      damage: function () {}
    }
  },

  ld: {
    summon: {
      cast: function (skill, source, target) {
        var side = source.data('side');
        var bear = $('.'+side+'.unit.ld.spiritbear');
        if(!bear.hasClass('summoned')) {
          source.data('bear', bear);
          bear.addBuff(bear, game.buffs.ld.demolish);
          bear.data('ld', source);
          bear.data('ld-demolish', skill.data('demolish percentage'));
          bear.on('attack', this.demolish);
          bear.addBuff(bear, game.buffs.ld.entangle);
          bear.on('attack', this.entangle);
          bear.data('ld-entangle-skill', skill);
          bear.data('ld-return-cooldown', skill.data('return cooldown'));
          bear.on('damage', Skills.ld.bearreturn.breakreturn);
          bear.on('death', Skills.ld.summon.death);
        } else { bear.addClass('summoned'); }
        var returnskillcard = $('.'+side+'.skill.ld-return');
        returnskillcard.appendTo(game.player.skills.temp);
        bear.changehp(bear.data('hp'));
        bear.place(target);
        if(side === 'player') { bear.select(); }
      },
      demolish: function (event, eventdata) {
        var source = eventdata.source;
        var target = eventdata.target;
        if(target.hasClass('tower')) {
          var damage = source.data('current damage') * source.data('ld-demolish') / 100;
          source.damage(damage, target, 'Physical');
        }
      },
      entangle: function (event, eventdata) {
        var source = eventdata.source;
        var target = eventdata.target;
        var skill = source.data('ld-entangle-skill');
        var chance = skill.data('entangle chance') / 100;
        if(game.random() < chance && !target.hasClass('entangled')) {
          source.addBuff(target, game.buffs.ld.entangle);
          target.addClass('entangled');
          target.data('ld-entangle', {
            duration: skill.data('entangle duration'),
            source: source,
            skill: skill
          });
          target.on('turnend.ld-entangle', Skills.ld.summon.entangling);
        }
      },
      entangling: function (event, eventdata) {
        var target = eventdata.target;
        var data = target.data('ld-entangle');
        var skill = data.skill;
        var source = data.source;
        if(data.duration > 0) {
          data.duration -= 1;
          target.data('ld-entangle', data);
          source.damage(skill.data('entangle damage'), target, 'Physical');
        } else {
          target.removeClass('entangled');
          target.off('turnend.ld-entangle');
          target.data('ld-entangle', null);
          target.removeBuff('ld-entangle');
        }
      },
      death: function () {

      }
    },
    bearreturn: {
       cast: function (skill, source, target) {
        var side = source.data('side');
        var ld = $('.'+side+'.hero.ld');
        var bear = ld.data('bear');
        bear.css({opacity: 0});
        if(game.status === 'turn') { skill.css({opacity: 0}); }
        setTimeout(function () {
          this.bear.place(this.target).css({opacity: 1});
          this.ld.select();
        }.bind({ld: ld, bear: bear, target: target }), 400);
      },
      breakreturn: function (event, eventdata) {
        var bear = eventdata.target;
        var side = bear.data('side');
        var returnskillcard = $('.'+side+'.skill.ld-return');
        returnskillcard.appendTo(game.states.table.playerTemp);
        bear.data('current-return-cooldown', bear.data('ld-return-cooldown'));
        bear.on('turnstart.ld-return', Skills.ld.bearreturn.turnstart);
      },
      turnstart: function (event, eventdata) {
        var bear = eventdata.target;
        var side = bear.data('side');
        var duration = bear.data('current-return-cooldown');
        if(duration > 0) {
          duration -= 1;
        } else {
          bear.data('current-return-cooldown', null);
          bear.off('turnstart.ld-return');
        }
      }
    },
    rabid: {
      cast: function (skill, source) {
        var side = source.data('side');
        var ld = $('.'+side+'.hero.ld');
        ld.addBuff(ld, skill.data('buff'));
        var damage = ld.data('current damage');
        ld.changedamage(damage + skill.data('damage bonus'));
        var speed = ld.data('current speed');
        ld.data('current speed', speed + 1);
        var bear = ld.data('bear');
        if(bear && !bear.hasClass('dead')) {
          var beardamage = bear.data('current damage');
          bear.changedamage(beardamage + skill.data('damage bonus'));
          var bearspeed = bear.data('current speed');
          bear.data('current speed', bearspeed + 1);
          ld.addBuff(bear, skill.data('buff'));
        }
        ld.data('ld-rabid', skill.data('duration'));
        ld.data('ld-rabid-damage-bonus', skill.data('damage bonus'));
        ld.on('turnstart.ld-rabid', Skills.ld.rabid.turnstart);
      },
      turnstart: function (event, eventdata) {
        var target = eventdata.target;
        var duration = target.data('ld-rabid');
        if(duration > 0) {
          duration -= 1;
          target.data('ld-rabid', duration);
        } else {
          var damage = target.data('current damage');
          target.changedamage(damage - target.data('ld-rabid-damage-bonus'));
          var speed = target.data('current speed');
          target.data('current speed', speed - 1);
          target.off('turnstart.ld-rabid');
          target.data('ld-rabid', null);
          target.removeBuff('ld-rabid');
          var bear = target.data('bear');
          if(bear && bear.hasBuff('ld-rabid')) {
            var beardamage = bear.data('current damage');
            bear.changedamage(beardamage - target.data('ld-rabid-damage-bonus'));
            var bearspeed = bear.data('current speed');
            bear.data('current speed', bearspeed - 1);
            bear.removeBuff('ld-rabid');
          }
        }
      }
    },
    passive: {
      passive: function (skill, source) {
        var side = source.data('side');
        var ld = $('.'+side+'.hero.ld');
        ld.addBuff(ld, skill.data('buff'));
        var rabids = $('.'+side+'.skill.ld-rabid');
        var duration = rabids.data('duration');
        rabids.data('duration', duration + skill.data('rabid bonus'));
        var ults = $('.'+side+'.skill.ld-ult');
        var hpbonus = ults.data('hp bonus');
        ults.data('hp bonus', hpbonus + skill.data('ult bonus'));
        var bear = ld.data('bear');
        if(bear) {
          ld.addBuff(bear, skill.data('buff'));
          var beardamage = bear.data('current damage');
          bear.changedamage(beardamage + skill.data('bear bonus'));
          var bearhp = bear.data('hp');
          var currenthp = bear.data('current hp');
          var relativehp = currenthp / bearhp;
          bear.data('hp', bearhp + skill.data('hp bonus'));
          bear.data('current hp', bear.data('hp') * relativehp);
        }
      }
    },
    ult: {
      cast: function (skill, source) {
        var side = source.data('side');
        var transform = $('.'+side+'.skill.ld-transform');
        transform.appendTo(game.player.skills.permanent);
        var cry = $('.'+side+'.skill.ld-cry');
        cry.appendTo(game.player.skills.permanent);
        skill.appendTo(game.player.skills.temp);
        var ldhp = source.data('hp');
        var currenthp = source.data('current hp');
        var relativehp = currenthp / ldhp;
        source.data('hp', ldhp + skill.data('hp bonus'));
        source.data('current hp', source.data('hp') * relativehp);
        var armor = source.data('armor');
        source.data('armor', + skill.data('armor bonus'));
        source.data('range', game.ui.melee);
        source.addClass('transformed');
      }
    },
    transform: {
      cast: function (skill, source) {
        var side = source.data('side');
        var ult = $('.'+side+'.skill.ld-ult');
        ult.appendTo(game.player.skills.permanent);
        skill.appendTo(game.player.skills.temp);
        var cry = $('.'+side+'.skill.ld-cry');
        cry.appendTo(game.player.skills.temp);
        var ldhp = source.data('hp');
        var currenthp = source.data('current hp');
        var relativehp = currenthp / ldhp;
        source.data('hp', ldhp - skill.data('hp bonus'));
        source.data('current hp', source.data('hp') * relativehp);
        var armor = source.data('armor');
        source.data('armor', - skill.data('armor bonus'));
        source.data('range', game.ui.short);
        source.removeClass('transformed');
      }
    },
    cry: {
      cast: function (skill, source) {
        source.addBuff(source, skill.data('buff'));
        var armor = source.data('armor');
        source.data('armor', + skill.data('armor bonus'));
        var damage = source.data('current damage');
        source.changedamage(damage + skill.data('damage bonus'));
        var bear = source.data('bear');
        if(bear) {
          source.addBuff(bear, skill.data('buff'));
          var beararmor = bear.data('armor');
          bear.data('armor', beararmor + skill.data('armor bonus'));
          var beardamage = bear.data('current damage');
          bear.changedamage(beardamage + skill.data('damage bonus'));
        }
        source.data('ld-cry', skill.data('duration'));
        source.data('ld-cry-damage-bonus', skill.data('damage bonus'));
        source.data('ld-cry-armor-bonus', skill.data('armor bonus'));
        source.on('turnstart.ld-cry', Skills.ld.cry.turnstart);
        skill.appendTo(game.player.skills.temp);
      },
      turnstart: function (event, eventdata) {
        var target = eventdata.target;
        var duration = target.data('ld-cry');
        if(duration > 0) {
          duration -= 1;
          target.data('ld-cry', duration);
        } else {
          var damage = target.data('current damage');
          target.changedamage(damage - target.data('ld-cry-damage-bonus'));
          var armor = target.data('armor');
          target.data('armor', armor - target.data('ld-cry-armor-bonus'));
          target.off('turnstart.ld-cry');
          target.data('ld-cry', null);
          target.removeBuff('ld-cry');
          var bear = target.data('bear');
          if(bear && bear.hasBuff('ld-cry')) {
            var beardamage = bear.data('current damage');
            bear.changedamage(beardamage - target.data('ld-cry-damage-bonus'));
            var beararmor = bear.data('armor bonus');
            bear.data('armor bonus', beararmor - target.data('ld-cry-armor-bonus'));
            bear.removeBuff('ld-rabid');
          }
        }
      }

    }

  },

  wk: {
    stun: {
      cast: function (skill, source, target) {
        var wk = source;
        var stun = skill.data('stun duration');
        var dot = skill.data('dot duration');
        if(game.status === 'turn') {
            game.states.table.animateCast(skill, target, game.states.table.playerCemitery);
        }
        wk.damage(skill.data('damage'), target, skill.data('damage type'));
        wk.addStun(target, stun);
        target.on('turnend.wk-stun', this.dot).data('wk-stun', {
          duration: stun + dot,
          source: source,
          skill: skill
        });
      },
      dot: function (event, eventdata) {
        var target = eventdata.target;
        var data = target.data('wk-stun');
        var source = data.source;
        var skill = data.skill;
        var dotduration = skill.data('dot duration');
        var duration = data.duration;
        var speed;
        if(duration > 0) {
          if(duration === dotduration) {
            source.addBuff(target, skill.data('buff'), dotduration);
            speed = target.data('speed') - 1;
            target.data('current speed', speed);
          }
          if(duration <= dotduration) { source.damage(skill.data('dot'), target, skill.data('damage type')); }
          data.duration -= 1;
          target.data('wk-stun', data);
        } else {
          speed = target.data('speed') + 1;
          target.data('current speed', speed);
          target.removeBuff('wk-stun');
          target.off('turnend.wk-stun');
          target.data('wk-stun', null);
        }
      }
    },
    lifesteal: {
      passive: function (skill, source) {
        var side = source.data('side');
        var team = $('.card.heroes.'+side);
        team.on('attack.wk-lifesteal', this.attack);
        team.data('wk-lifesteal', skill);
        source.addBuff(team, skill.data('buff'));
        source.on('die.wk-lifesteal', this.die);
        source.on('reborn.wk-lifesteal', this.reborn);
      },
      attack: function (event, eventdata) {
        var source = eventdata.source;
        var target = eventdata.target;
        var damage = source.data('current damage');
        var skill = source.data('wk-lifesteal');
        var bonus = skill.data('percentage') / 100;
        source.heal(damage * bonus);
      },
      die: function (event, eventdata) {
        var source = eventdata.target;
        var side = source.data('side');
        var team = $('.card.heroes.'+side);
        team.removeBuff('wk-lifesteal');
        team.off('attack.wk-lifesteal');
        team.data('wk-lifesteal', null);
      },
      reborn: function (event, eventdata) {
        var source = eventdata.target;
        var skill = source.data('wk-lifesteal');
        var side = source.data('side');
        var team = $('.card.heroes.'+side);
        source.addBuff(team, skill.data('buff'));
        team.on('attack.wk-lifesteal', this.attack);
        team.data('wk-lifesteal', skill);
      }
    },
    crit: {
      passive: function (skill, source) {
        source.addBuff(source, skill.data('buff'));
        source.on({
          'attack.wk': this.attack,
          'afterattack.wk': this.afterattack
        }).data('wk-crit', skill);
      },
      attack: function (event, eventdata) {
        var source = eventdata.source;
        var target = eventdata.target;
        var skill = source.data('wk-crit');
        var damage = source.data('current damage');
        var chance = skill.data('chance') / 100;
        var bonus = skill.data('percentage') / 100;
        if(game.random() < chance) {
          game.audio.play('crit');
          damage *= bonus;
          source.data({
            'crit': true,
            'currentdamage': damage
          });
        }
      },
      afterattack: function (event, eventdata) {
        var source = eventdata.source;
        source.data('current damage', source.data('damage'));
      }
    },
    ult: {
      passive: function (skill, source) {
        source.on('die.wk-ult', this.die);
        source.data('wk-ult-skill', skill);
      },
      die: function (event, eventdata) {
        var wk = eventdata.target;
        var spot = eventdata.spot;
        var skill = wk.data('wk-ult-skill');
        $('#'+spot).addClass('cript');
        wk.on('turnstart.wk-ult', Skills.wk.ult.resurrect).data('wk-ult', {
          skill: skill,
          spot: spot,
          duration: skill.data('delay')
        });
        game.map.inRange(spot, game.map.getRange(skill.data('aoe range')), function (neighbor) {
          var otherside = 'enemy';
          var side = wk.data('side');
          if(side === 'enemy') { otherside = 'player'; }
          var card = neighbor.find('.card.'+otherside);
          if(card.length) {
            wk.addBuff(card, skill.data('buff'));
            var speed = card.data('speed') - 1;
            card.data('current speed', speed);
            card.on('turnstart.wk-ult', Skills.wk.ult.turnstart);
            card.data('wk-ult', skill.data('duration'));
          }
        });
        wk.off('die.wk-ult');
      },
      resurrect: function (event, eventdata) {
        var wk = eventdata.target;
        var data = wk.data('wk-ult');
        var skill = data.skill;
        var spot = data.spot;
        var duration = data.duration;
        var side = wk.data('side');
        if(duration > 0) {
          data.duration -= 1;
          wk.data('wk-ult', data);
        } else {
          $('#'+spot).removeClass('cript');
          wk.reborn(spot).data('wk-ult', null);
          wk.off('turnstart.wk-ult');
        }
      },
      turnstart: function (event, eventdata) {
        var target = eventdata.target;
        var duration = target.data('wk-ult');
        if(duration > 0) {
          duration -= 1;
          target.data('wk-ult', duration);
        } else {
          var speed = target.data('current speed') + 1;
          target.data('current speed', speed);
          target.off('turnstart.wk-ult');
          target.data('wk-ult', null);
          target.removeBuff('wk-ult');
        }
      }
    }
  },

  am: {
    burn: {
      passive: function (skill, source) {
        source.on('attack.burn', this.attack).data('am-burn', skill);
        source.addBuff(source, skill.data('buff'));
        source.on('die.am-burn', this.die);
        source.on('reborn.am-burn', this.reborn);
      },
      attack: function (event, eventdata) {
        var source = eventdata.source;
        var target = eventdata.target;
        var hero = target.data('hero');
        var side = source.data('side');
        game.audio.play('am/burn');
        if(side === 'enemy' && hero) {
          var cards = game.states.table.playerHand.children('.'+hero);
          if(cards.length > 0) {
            var card = game.deck.randomCard(cards, 'noseed');
            card.discard();
          }
        }
      },
      die: function (event, eventdata) {
        var source = eventdata.target;
        source.removeBuff('am-burn');
        source.off('attack.am-burn').data('am-burn', null);
      },
      reborn: function (event, eventdata) {
        var source = eventdata.target;
        var skill = source.data('am-burn');
        source.addBuff(source, skill.data('buff'));
        source.on('attack.am-burn', this.attack).data('am-burn', skill);
      }
    },
    passive: {
      passive: function (skill, source) {
        source.data('resistance', skill.data('percentage') / 100);
      }
    },
    blink: {
      cast: function (skill, source, target) {
        source.css({opacity: 0});
        setTimeout(function () {
          this.source.place(this.target).css({opacity: 1});
          this.source.select();
        }.bind({source: source, target: target}), 400);
      }
    },
    ult: {
      cast: function (skill, source, target) {
        var spot = game.map.getPosition(target);
        if(game.status === 'turn') { game.states.table.animateCast(skill, spot, game.states.table.playerCemitery); }
        var side = source.data('side');
        var otherside = (side === 'enemy') ? 'player': 'enemy';
        var damage = game.enemy.maxCards - game.enemy.hand;
        damage *= skill.data('multiplier');
        game.map.inRange(spot, game.map.getRange(skill.data('aoe range')), function (neighbor) {
          var card = neighbor.find('.card.'+otherside);
          if(card.length) {
            source.damage(damage, card, skill.data('damage type'));
          }
        });
      }
    }
  }

};
