game.skills.pud = {
  hook: {
    cast: function (skill, source, target) {
      var side = source.side(),
        range = skill.data('aoe range'),
        hooked = source.firstCardInLine(target, range);
      if (hooked && hooked.hasClasses('heroes units') && !hooked.hasClasses('ghost towers')) {
        if (hooked.side() !== side) {
          source.damage(skill.data('damage'), hooked, skill.data('damage type'));
          hooked.stopChanneling();
        }
        hooked.move(target);
      }
    }
  },
  rot: {
    toggle: function (skill, source) {
      if(skill.hasClass('on')) { //turn off
        skill.removeClass('on');
        source.off('turnend.rot');
        source.data('pud-rot', null);
        source.removeClass('pud-rot');
        source.removeBuff('pud-rot');
      } else { //turn on
        skill.addClass('on');
        source.on('turnend.rot', game.skills.pud.rot.turnend);
        source.data('pud-rot', skill);
        source.addClass('pud-rot');
        source.selfBuff(skill, 'rot-source');
      }
    },
    turnend: function (event, eventdata) {
      var source = eventdata.target;
      var skill = source.data('pud-rot');
      var range = skill.data('aoe range');
      source.damage(skill.data('damage'), source, skill.data('damage type'));
      source.opponentsInRange(range, function (target) {
        source.damage(skill.data('damage'), target, skill.data('damage type'));
        source.addBuff(target, skill, 'rot-targets');
      });
    }
  },
  passive: {
    passive: function (skill, source) {
      var buff = source.selfBuff(skill);
      var kills = source.data('kills');
      var damage = source.data('current damage') + (buff.data('damage per kill') * kills);
      source.setDamage(damage);
      var hp = source.data('hp') + (skill.data('hp per kill') * kills);
      source.setHp(hp);
      source.on('kill', this.kill);
    },
    kill: function (event, eventdata) {
      var source = eventdata.source;
      var buff = source.getBuff('pud-passive');
      var damage = source.data('current damage') + buff.data('damage per kill');
      source.setDamage(damage);
      var hp = source.data('hp') + skill.data('hp per kill');
      source.setHp(hp);
    }
  },
  ult: {
    cast: function (skill, source, target) {
      source.addClass('pud-ult');
      source.selfBuff(skill, 'ult-source');
      source.addBuff(target, skill, 'ult-target');
      target.addClass('disabled');
      target.stopChanneling();
      source.on('channel', this.channel);
      source.on('channelend', this.channelend);
    },
    channel: function (event, eventData) {
      var source = eventData.source;
      var target = eventData.target;
      var skill = eventData.skill;
      source.damage(skill.data('dot'), target, skill.data('damage type'));
      game.audio.play('pud/ult-channel');
    },
    channelend: function (event, eventData) {
      var source = eventData.source;
      var target = eventData.target;
      source.removeClass('pud-ult');
      target.removeClass('disabled');
    }
  }
};
