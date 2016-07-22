game.skills.wk = {
  stun: {
    cast: function (skill, source, target) {
      var source = source;
      source.addStun(target, skill);
      source.damage(skill.data('damage'), target, skill.data('damage type'));
      target.data('wk-dot-count', 3);
      target.on('turnend.wk-stun', this.turnend);
    },
    turnend: function (event, eventdata) {
      var target = eventdata.target;
      var count = target.data('wk-dot-count');
      console.log(count)
      if (target.hasBuff('wk-stun')) {
        var buff = target.getBuff('wk-stun');
        var source = buff.data('source');
        var skill = buff.data('skill');
        source.damage(buff.data('dot'), target, buff.data('damage type'));
      }
      if (count == 2) {
        var buff = target.getBuff('stun');
        var source = buff.data('source');
        var skill = buff.data('skill');
        source.addBuff(target, skill);
      }
      if (count == 0) {
        target.data('wk-dot-count', null);
        target.off('turnend.wk-stun');
      }
      target.data('wk-dot-count', count - 1);
    }
  },
  lifesteal: {
    passive: function (skill, source) {
      var side = source.side();
      var team = $('.table .card.heroes.'+side);
      team.on('attack.wk-lifesteal', this.attack);
      source.addBuff(team, skill);
      source.on('death.wk-lifesteal', this.death);
      source.on('reborn.wk-lifesteal', this.reborn);
      source.data('wk-lifesteal', skill);
    },
    attack: function (event, eventdata) { 
      var source = eventdata.source;
      var target = eventdata.target;
      var damage = source.data('current damage');
      var buff = source.getBuff('wk-lifesteal');
      var bonus = buff.data('percentage') / 100;
      source.heal(damage * bonus);
    },
    death: function (event, eventdata) {
      var source = eventdata.target;
      var side = source.side();
      var team = $('.table .card.heroes.'+side);
      team.removeBuff('wk-lifesteal');
      team.off('attack.wk-lifesteal');
    },
    reborn: function (event, eventdata) {
      var source = eventdata.target;
      var skill = source.data('wk-lifesteal');
      var side = source.side();
      var team = $('.table .card.heroes.'+side);
      source.addBuff(team, skill);
      team.on('attack.wk-lifesteal', this.attack);
    }
  },
  crit: {
    passive: function (skill, source) {
      source.selfBuff(skill);
      source.on('attack.wk-crit', this.attack);
    },
    attack: function (event, eventdata) {
      var source = eventdata.source;
      var target = eventdata.target;
      var buff = source.getBuff('wk-crit');
      var damage = source.data('current damage');
      var chance = buff.data('chance') / 100;
      var bonus = (buff.data('percentage') / 100);
      if (game.random() < chance) {
        damage *= bonus;
        source.damage(damage, target, 'critical');
      }
    }
  },
  ult: {
    passive: function (skill, source) {
      source.selfBuff(skill);
      source.on('death.wk-ult', this.death);
    },
    death: function (event, eventdata) {
      var wk = eventdata.target;
      var spot = eventdata.spot;
      spot.addClass('cript block');
      wk.on('turnstart.wk-ult', game.skills.wk.ult.turnstart);
      wk.data('wk-ult-spot', spot);
      wk.off('death.wk-ult');
    },
    turnstart: function (event, eventdata) {
      var wk = eventdata.target;
      var spot = wk.data('wk-ult-spot');
      if (game.isUnitTurn(wk)) {
        spot.removeClass('cript');
        wk.removeBuff('wk-ult');
        wk.off('turnstart.wk-ult');
        wk.data('wk-ult-spot', null);
        wk.reborn(spot);
      }
    }
  }
};
