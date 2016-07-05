game.enemy = {
  playtime: 3,
  manaBuild: function () {
    game.enemy.mana = 0;
    $('.map .enemy.heroes').each(function (i, card) {
      game.enemy.mana += $(card).data('mana');
    });
    game.enemy.maxCards = Math.round(game.enemy.mana / 2);
    game.enemy.cardsPerTurn = Math.round(game.enemy.mana / 5);
    game.enemy.hand = 0;
    game.enemy.skills = {};
  },
  buyCard: function () {
    game.enemy.hand += 1;
    game.random();
  },
  buyHand: function () {
    var i;
    for (i = 0; i < game.enemy.cardsPerTurn; i += 1) {
      if (game.enemy.hand < game.enemy.maxCards) {
        game.enemy.buyCard();
      }
    }
  },
  move: function (cb) {
    game.message.text(game.data.ui.enemymove);
    game.enemy.skills.deck.addClass('slide');
    var from, to, m, move, source, target, targets, hero, skillid, skill,
      moves = game.currentMoves.split('|');
    if (game.moves) game.moves.push(game.currentData.moves);
    for (m = 0; m < moves.length; m += 1) {
      move = moves[m].split(':');
      if (move[1] && move[2]) {
        from = game.map.mirrorPosition(move[1]);
        to = game.map.mirrorPosition(move[2]);
        if (move[0] === 'M') {
          target = $('#' + from + ' .card');
          if (to && !target.hasClass('done') && target.hasClass('enemy') && target.move) {
            target.move(to);
          }
        }
        if (move[0] === 'A') {
          source = $('#' + from + ' .card');
          if (to && !source.hasClass('done') && source.hasClass('enemy') && source.attack) {
            source.attack(to);
          }
        }
        if (move[0] === 'C') {
          skillid = move[3];
          hero = move[4];
          source = $('#' + from + ' .card');
          target = $('#' + to);
          skill = $('.enemy.skills .' + hero + '-' + skillid).show();
          targets = skill.data('targets');
          if (targets) {
            if (targets.indexOf(game.data.ui.enemy) >= 0 ||
              targets.indexOf(game.data.ui.ally)  >= 0 ||
              targets.indexOf(game.data.ui.self)  >= 0) { target = $('#' + to + ' .card'); }
          }
          if (game.skills[hero][skillid].cast && skill && !source.hasClass('done') && source.hasClass('enemy') && source.cast) {
            source.cast(skill, target);
            game.enemy.hand -= 1;
          }
        }
        if (move[0] === 'P') {
          to = game.map.mirrorPosition(move[1]);
          skillid = move[2];
          hero = move[3];
          target = $('#' + to + ' .card');
          skill = $('.enemy.skills .' + hero + '-' + skillid).show();
          if (game.skills[hero][skillid].passive && skill && target.hasClass('enemy') && skill.passive) {
            skill.passive(skill, target);
            game.enemy.hand -= 1;
          }
        }
        if (move[0] === 'T') {
          to = game.map.mirrorPosition(move[1]);
          skillid = move[2];
          hero = move[3];
          target = $('#' + to + ' .card');
          skill = $('.enemy.skills .' + hero + '-' + skillid).show();
          if (game.skills[hero][skillid].toggle && skill && target.hasClass('enemy') && skill.toggle) {
            skill.toggle(skill, target);
            game.enemy.hand -= 1;
          }
        }
      }
    }
    if (cb) { setTimeout(cb, game.enemy.playtime * 1000); }
  }
};
