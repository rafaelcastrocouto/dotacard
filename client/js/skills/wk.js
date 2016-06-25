game.skills.wk = {
  stun: {
    cast: function (skill, source, target) {
      var wk = source;
      var stun = skill.data('stun duration');
      var dot = skill.data('dot duration');
      if(!game.states.table.el.hasClass('unturn')) {
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
        if(duration === dotduration + 1) {
          source.addBuff(target, skill.data('buff'), dotduration);
          speed = target.data('speed') - 1;
          target.data('current speed', speed);
        }
        if(duration <= dotduration) {
          source.damage(skill.data('dot'), target, skill.data('damage type')); 
        }
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
      var team = $('.table .card.heroes.'+side);
      team.on('attack.wk-lifesteal', this.attack);
      team.data('wk-lifesteal', skill);
      source.addBuff(team, skill.data('buff'));
      source.on('death.wk-lifesteal', this.death);
      source.on('reborn.wk-lifesteal', this.reborn);
    },
    attack: function (event, eventdata) { 
      var source = eventdata.source;
      var target = eventdata.target;
      var damage = source.data('current damage');
      var skill = source.data('wk-lifesteal');
      var bonus = skill.data('percentage') / 100;
      window.temp = skill;
      source.heal(damage * bonus);
    },
    death: function (event, eventdata) {
      var source = eventdata.target;
      var side = source.data('side');
      var team = $('.table .card.heroes.'+side);
      team.removeBuff('wk-lifesteal');
      team.off('attack.wk-lifesteal');
      team.data('wk-lifesteal', null);
    },
    reborn: function (event, eventdata) {
      var source = eventdata.target;
      var skill = source.data('wk-lifesteal');
      var side = source.data('side');
      var team = $('.table .card.heroes.'+side);
      source.addBuff(team, skill.data('buff'));
      team.on('attack.wk-lifesteal', this.attack);
      team.data('wk-lifesteal', skill);
    }
  },
  crit: {
    passive: function (skill, source) {
      source.addBuff(source, skill.data('buff'));
      source.on({
        'attack.crit': this.attack,
        'afterattack.crit': this.afterattack
      }).data('wk-crit', skill);
    },
    attack: function (event, eventdata) {
      var source = eventdata.source;
      var target = eventdata.target;
      var skill = source.data('wk-crit');
      var damage = source.data('current damage');
      var chance = skill.data('chance') / 100;
      var bonus = skill.data('percentage') / 100;
      if (/*game.random() < chance*/1) {
        game.audio.play('crit');
        damage *= bonus;
        source.data({
          'crit': true,
          'crit damage': damage
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
      source.addBuff(source, skill.data('buff'));
      source.on('death.wk-ult', this.death);
      source.data('wk-ult-skill', skill);
    },
    death: function (event, eventdata) {
      var wk = eventdata.target;
      var spot = eventdata.spot;
      var skill = wk.data('wk-ult-skill');
      spot.addClass('cript block');
      wk.on('turnstart.wk-ult', game.skills.wk.ult.resurrect).data('wk-ult', {
        skill: skill,
        spot: spot,
        duration: skill.data('delay')
      });
      game.map.inRange(spot, game.map.getRange(skill.data('aoe range')), function (neighbor) {
        var otherSide = game.otherSide(wk);
        var card = neighbor.find('.card.'+otherSide);
        if(card.length) {
          wk.addBuff(card, skill.data('buff'));
          var speed = card.data('speed') - 1;
          card.data('current speed', speed);
          card.on('turnstart.wk-ult', game.skills.wk.ult.turnstart);
          card.data('wk-ult', skill.data('duration'));
        }
      });
      wk.off('death.wk-ult');
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
        game.skills.wk.ult.reborn(wk, spot);
      }
    },
    reborn: function (wk, spot) {
      if (!spot) {
        spot = $('.table .cript')[0].id;
      }

      $('#'+spot).removeClass('cript');
      wk.reborn(spot).data('wk-ult', null);
      wk.off('turnstart.wk-ult');
      wk.removeBuff('wk-ult');
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
};
