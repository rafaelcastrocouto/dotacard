game.skills.nyx = {
  stun: {
    cast: function (skill, source, target) {
      var range = skill.data('aoe range');
      var width = skill.data('aoe width');
      var damage = skill.data('damage');
      var dmgType = skill.data('damage type');
      game.shake();
      source.opponentsInLine(target, range, width, function (card) {
        source.damage(damage, card, dmgType);
        source.addBuff(card, skill);
      });
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
};
