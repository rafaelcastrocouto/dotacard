game.skills.am = {
  burn: {
    passive: function (skill, source) {
      source.on('attack.burn', this.attack).data('am-burn', skill);
      source.addBuff(source, skill.data('buff'));
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
    }
  },
  shield: {
    passive: function (skill, source) {
      source.data('resistance', skill.data('percentage') / 100);
      source.addBuff(source, skill.data('buff'));
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
};
