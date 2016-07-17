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
      var side = source.data('side');
      var otherSide = target.data('side');
      var mana = target.data('mana') || 0;
      game.audio.play('am/burn');
      if (hero) {
        var damage = source.data('current damage') + target.data('mana');
        source.data('current damage', damage);
      }
      var cards = $('.'+otherSide+' .hand .'+hero);
      if(cards.length > 0) {
        var card = game.deck.randomCard(cards);
        card.discard();
      }
    },
    afterattack: function (event, eventdata) {
      var source = eventdata.source;
      source.data('current damage', source.data('damage'));
    }
  },
  shield: {
    passive: function (skill, source) {
      source.addBuff(source, skill.data('buff'));
      var resistance = source.data('resistance') + skill.data('resistance bonus');
      source.setResistance(resistance);
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
      var range = skill.data('aoe range');
      var otherSide = game.otherSide(source);
      var damage = game[otherSide].maxCards - $('.'+otherSide+' .hand .card').length;
      damage *= skill.data('multiplier');
      game.map.inRange(spot, range, function (neighbor) {
        var card = neighbor.find('.card.'+otherSide);
        if (card.length) {
          source.damage(damage, card, skill.data('damage type'));
        }
      });
    }
  }
};
