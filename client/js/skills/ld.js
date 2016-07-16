game.skills.ld = {
  summon: {
    cast: function (skill, source, target) {
      var side = source.data('side');
      var bear = $('.table .'+side+'.unit.ld.spiritbear');
      if(!bear.hasClass('summoned')) {
        bear.addClass('summoned');
        source.data('bear', bear);
        bear.addBuff(bear, game.data.buffs.ld.demolish);
        bear.data(game.data.ui.sumonner, source);
        bear.data('ld-demolish', skill.data('demolish percentage'));
        bear.on('attack', this.demolish);
        bear.addBuff(bear, game.data.buffs.ld.entangle);
        bear.on('attack', this.entangle);
        bear.data('ld-entangle-skill', skill);
        bear.data('ld-return-cooldown', skill.data('return cooldown'));
        bear.on('damage', game.skills.ld.bearreturn.breakreturn);
        bear.on('death', game.skills.ld.summon.death);
      }
      var returnskillcard = $('.table .'+side+'.skills.ld-bearreturn');
      returnskillcard.appendTo(game.player.skills.sidehand);
      bear.setCurrentHp(bear.data('hp'));
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
      if(game.random() < chance && !target.hasClass('rooted')) {
        source.addBuff(target, game.data.buffs.ld.entangle);
        target.addClass('rooted');
        target.data('ld-entangle', {
          duration: skill.data('entangle duration'),
          source: source,
          skill: skill
        });
        target.on('turnend.ld-entangle', game.skills.ld.summon.entangling);
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
        target.removeClass('rooted');
        target.off('turnend.ld-entangle');
        target.data('ld-entangle', null);
        target.removeBuff('ld-entangle');
      }
    },
    death: function (event, eventdata) {
      var bear = eventdata.target;
      var killer = eventdata.source;
      var side = target.data('side');
      var ld = $('.table .'+target+'.heroes.ld');
      killer.damage(ld, ld.data('hp') * 0.1, 'Pure');
    }
  },
  bearreturn: {
     cast: function (skill, source, target) {
      var side = source.data('side');
      var ld = $('.table .'+side+'.heroes.ld');
      var bear = ld.data('bear');
      bear.css({opacity: 0});
      if (!game.states.table.el.hasClass('unturn')) { skill.css({opacity: 0}); }
      setTimeout(function () {
        this.bear.place(this.target).css({opacity: 1});
        this.ld.select();
      }.bind({ld: ld, bear: bear, target: target }), 400);
    },
    breakreturn: function (event, eventdata) {
      var bear = eventdata.target;
      var side = bear.data('side');
      var returnskillcard = $('.table .'+side+'.skills.ld-return');
      returnskillcard.appendTo(game.states.table.playerTemp);
      bear.data('current-return-cooldown', bear.data('ld-return-cooldown'));
      bear.on('turnstart.ld-return', game.skills.ld.bearreturn.turnstart);
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
      if (!source.hasBuff('ld-rabid')) {
        source.addBuff(source, skill.data('buff'));
        var damage = source.data('current damage');
        source.setDamage(damage + skill.data('damage bonus'));
        var speed = source.data('current speed');
        source.data('current speed', speed + 1);
        source.data('ld-rabid', skill.data('duration'));
        source.data('ld-rabid-damage-bonus', skill.data('damage bonus'));
        source.on('turnstart.ld-rabid', game.skills.ld.rabid.turnstart);
      }
      var bear = source.data('bear');
      if(bear && !bear.hasClass('dead') && !bear.hasClass('rabid')) {
        bear.addClass('rabid');
        var beardamage = bear.data('current damage');
        bear.setDamage(beardamage + skill.data('damage bonus'));
        var bearspeed = bear.data('current speed');
        bear.data('current speed', bearspeed + 1);
        source.addBuff(bear, skill.data('buff'));
      }
    },
    turnstart: function (event, eventdata) {
      var target = eventdata.target;
      var duration = target.data('ld-rabid');
      if(duration > 0) {
        duration -= 1;
        target.data('ld-rabid', duration);
      } else {
        var damage = target.data('current damage');
        target.setDamage(damage - target.data('ld-rabid-damage-bonus'));
        var speed = target.data('current speed');
        target.data('current speed', speed - 1);
        target.off('turnstart.ld-rabid');
        target.data('ld-rabid', null);
        target.removeBuff('ld-rabid');
        var bear = target.data('bear');
        if(bear && bear.hasBuff('ld-rabid') && bear.hasClass('rabid')) {
          var beardamage = bear.data('current damage');
          bear.setDamage(beardamage - target.data('ld-rabid-damage-bonus'));
          var bearspeed = bear.data('current speed');
          bear.data('current speed', bearspeed - 1);
          bear.removeBuff('ld-rabid');
        }
      }
    }
  },
  roar: {
    cast: function (skill, source) {
      game.skills.ld.roar.scare(source, skill);
      var bear = source.data('bear');
      if (bear) game.skills.ld.roar.scare(bear, skill);
    },
    scare: function (source, skill) {
      var otherSide = game.otherSide(source);
      var spot = game.map.getPosition(source);
      var aoerange = game.map.getRange(skill.data('aoe range'));
      game.map.inRange(spot, aoerange, function (neighbor) {
        var card = neighbor.find('.card.' + otherSide);
        if(card.length) {
          source.addBuff(card, skill.data('buff'));
          card.on('turnstart.ld-roar', game.skills.ld.roar.turnstart);
          var cardSpot = game.map.getPosition(card);
          var x = game.map.getX(cardSpot),
              y = game.map.getY(cardSpot) - 1;
          var upSpot = game.map.getSpot(x, y);
          if (upSpot.hasClass && upSpot.hasClass('free')) card.place(upSpot);
          else {
            var upRight = game.map.getSpot(x + 1, y);
            if (upRight.hasClass && upRight.hasClass('free')) card.place(upRight);
          }
        }
      });
    },
    turnstart: function (event, eventdata) {
      var target = eventdata.target;
      target.off('turnstart.ld-roar');
      target.removeBuff('ld-roar');
    }
  },
  ult: {
    toggle: function (skill, source) {
      if (!source.hasClass('transformed')) {
        game.skills.ld.ult.cast(skill, source);
      } else {
        game.skills.ld.transform.cast(skill, source);
      }
    },
    cast: function (skill, source) {
      skill.appendTo(game.player.skills.temp);
      var side = source.data('side');
      var transform = $('.table .'+side+'.skills.ld-transform');
      transform.appendTo(game.player.skills.sidehand);
      var cry = $('.table .'+side+'.skills.ld-cry');
      cry.appendTo(game.player.skills.sidehand);
      var ldhp = source.data('hp');
      var relativehp = source.data('current hp') / ldhp;
      source.setHp(ldhp + skill.data('hp bonus'));
      source.setCurrentHp(source.data('hp') * relativehp);
      source.setArmor(source.data('armor') + skill.data('armor bonus'));
      source.data('range', game.data.ui.melee);
      source.addClass('transformed');
    }
  },
  transform: {
    toggle: function (skill, source) {
      game.skills.ld.ult.toggle(skill, source);
    },
    cast: function (skill, source) {
      skill.appendTo(game.player.skills.temp);
      var side = source.data('side');
      var ult = $('.table .'+side+'.skills.ld-ult');
      ult.appendTo(game.player.skills.sidehand);
      var cry = $('.table .'+side+'.skills.ld-cry');
      cry.appendTo(game.player.skills.temp);
      var ldhp = source.data('hp');
      var relativehp = source.data('current hp') / ldhp;
      source.setHp(ldhp - ult.data('hp bonus'));
      source.setCurrentHp(source.data('hp') * relativehp);
      source.setArmor(source.data('armor') - ult.data('armor bonus'));
      source.data('range', game.data.ui.short);
      source.removeClass('transformed');
    }
  },
  cry: {
    cast: function (skill, source) {
      if (!source.hasBuff('ld-cry')) {
        source.addBuff(source, skill.data('buff'));
        var armor = source.data('armor');
        source.data('armor', + skill.data('armor bonus'));
        var damage = source.data('current damage');
        source.setDamage(damage + skill.data('damage bonus'));
        var bear = source.data('bear');
        if(bear) {
          source.addBuff(bear, skill.data('buff'));
          var beararmor = bear.data('armor');
          bear.data('armor', beararmor + skill.data('armor bonus'));
          var beardamage = bear.data('current damage');
          bear.setDamage(beardamage + skill.data('damage bonus'));
        }
        source.data('ld-cry', skill.data('duration'));
        source.data('ld-cry-damage-bonus', skill.data('damage bonus'));
        source.data('ld-cry-armor-bonus', skill.data('armor bonus'));
        source.on('turnstart.ld-cry', game.skills.ld.cry.turnstart);
      }
      skill.appendTo(game.player.skills.sidehand);
    },
    turnstart: function (event, eventdata) {
      var target = eventdata.target;
      var duration = target.data('ld-cry');
      if(duration > 0) {
        duration -= 1;
        target.data('ld-cry', duration);
      } else {
        var damage = target.data('current damage');
        target.setDamage(damage - target.data('ld-cry-damage-bonus'));
        var armor = target.data('armor');
        target.data('armor', armor - target.data('ld-cry-armor-bonus'));
        target.off('turnstart.ld-cry');
        target.data('ld-cry', null);
        target.removeBuff('ld-cry');
        var bear = target.data('bear');
        if(bear && bear.hasBuff('ld-cry')) {
          var beardamage = bear.data('current damage');
          bear.setDamage(beardamage - target.data('ld-cry-damage-bonus'));
          var beararmor = bear.data('armor bonus');
          bear.data('armor bonus', beararmor - target.data('ld-cry-armor-bonus'));
          bear.removeBuff('ld-rabid');
        }
      }
    }
  }
};
