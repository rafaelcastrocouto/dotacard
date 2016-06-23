game.skills.am = {
  burn: {
    passive: function (skill, source) {
      source.addBuff(source, skill.data('buff'));
      source.on({
        'attack.burn': this.attack, 
        'afterattack.burn': this.afterattack
      }).data('am-burn', skill);
    },
    attack: function (event, eventdata) { 
      var source = eventdata.source;
      var target = eventdata.target;
      var hero = target.data('hero');
      var side = source.data('side'); console.log(target.data('mana'));
      game.audio.play('am/burn');
      if (hero) {
        var damage = source.data('current damage') + target.data('mana');
        source.data('current damage', damage);
      }
      if (side === 'enemy' && hero) {
        var cards = game.states.table.playerHand.children('.'+hero);
        if(cards.length > 0) {
          var card = game.deck.randomCard(cards, 'noseed');
          card.discard();
        }
      }
    },
    afterattack: function (event, eventdata) {
      var source = eventdata.source;
      source.data('current damage', source.data('damage'));
    }
  },
  shield: {
    passive: function (skill, source) {
      source.data('resistance', skill.data('percentage') / 100);
      source.addBuff(source, skill.data('buff'));
      source.find('.resistance').text(game.data.ui.resistance + ': ' + (source.data('resistance') * 100) + '%');
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
      if (!game.states.table.el.hasClass('unturn')) { game.states.table.animateCast(skill, spot, game.states.table.playerCemitery); }
      var otherSide = game.otherSide(source);
      var damage = game.enemy.maxCards - game.enemy.hand;
      damage *= skill.data('multiplier');
      game.map.inRange(spot, game.map.getRange(skill.data('aoe range')), function (neighbor) {
        var card = neighbor.find('.card.'+otherSide);
        if(card.length) {
          source.damage(damage, card, skill.data('damage type'));
        }
      });
    }
  }
};
