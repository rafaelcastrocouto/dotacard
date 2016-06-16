game.skills.cm = {
  slow: {
    cast: function (skill, source, target) {
      var spot = game.map.getPosition(target);
      if (!game.states.table.el.hasClass('unturn')) { game.states.table.animateCast(skill, spot, game.states.table.playerCemitery); }
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
            card.on('turnstart.cm-slow', game.skills.cm.slow.turnstart);
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
      source.on('death.cm-aura');
      source.on('reborn.cm-aura');
      source.addBuff(source, skill.data('buff'));
    },
    death: function (event, eventdata) {
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
      if (!game.states.table.el.hasClass('unturn')) {
          game.states.table.animateCast(skill, spot, game.states.table.playerCemitery);
      }
      source.on('channel', game.skills.cm.ult.channel).data('cm-ult', skill);
      source.trigger('channel', {source: source});
    },
    channel: function (event, eventdata) {
      var cm = eventdata.source;
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
            card.on('turnstart.cm-ult', game.skills.cm.ult.turnstart);
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
};
