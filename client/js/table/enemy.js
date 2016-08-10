game.enemy = {
  placeHeroes: function () {
    game.enemy.heroesDeck = game.deck.build({
      name: 'heroes',
      filter: game.enemy.picks,
      cb: function (deck) {
        deck.addClass('enemy').hide().appendTo(game.states.table.enemy);
        var x = 1, y = 4;
        $.each(deck.data('cards'), function (i, card) {
          var p = game.enemy.picks.indexOf(card.data('hero'));
          card.addClass('enemy').on('mousedown touchstart', game.card.select);
          card.place(game.map.mirrorPosition(game.map.toPosition(x + p, y)));
          if (game.mode == 'tutorial') card.on('select', game.tutorial.selected);
        });
      }
    });
  },
  buyCard: function () {
    var availableSkills = $('.table .enemy .available .card'),
      card,
      heroid,
      hero,
      to,
      skillid;
    if (availableSkills.length < game.enemy.cardsPerTurn) {
      $('.table .enemy .cemitery .card').appendTo(game.enemy.skills.deck);
      availableSkills = $('.table .enemy .available .card');
    }
    card = availableSkills.randomCard();
    if (card.data('hand') === game.data.ui.right) {
      card.appendTo(game.enemy.skills.hand);
    } else {
      card.appendTo(game.enemy.skills.sidehand);
    }
  },
  buyCards: function (n) {
    for (var i=0; i<n; i++) {
      if (game.enemy.skills.hand.children().length < game.enemy.maxCards) {
        game.enemy.buyCard();
      }
    }
  },
  buyHand: function () {
    for (var i = 0; i < game.enemy.cardsPerTurn; i += 1) {
      if (game.enemy.skills.hand.children().length < game.enemy.maxCards) {
        game.enemy.buyCard();
      }
    }
  },
  autoMove: function () {
    var move = game.currentMoves[game.enemy.autoMoveCount].split(':');
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
        s = hero + '-' + skillid;
        skill = $('.enemydecks .hand .skills.'+s+', .enemydecks .sidehand .skills.'+s).first();
        skill.clone().appendTo(game.enemy.skills.showMoves);
        targets = skill.data('targets');
        if (targets) {
          if (targets.indexOf(game.data.ui.enemy) >= 0 ||
            targets.indexOf(game.data.ui.ally)  >= 0 ||
            targets.indexOf(game.data.ui.self)  >= 0) { target = $('#' + to + ' .card'); }
        }
        if (game.skills[hero][skillid].cast && skill && !source.hasClass('done') && source.hasClass('enemy') && source.cast) {
          source.cast(skill, target);
        }
      }
      if (move[0] === 'P') {
        to = game.map.mirrorPosition(move[1]);
        skillid = move[2];
        hero = move[3];
        target = $('#' + to + ' .card');
        s = hero + '-' + skillid;
        skill = $('.enemydecks .hand .skills.'+s+', .enemydecks .sidehand .skills.'+s).first();
        skill.clone().appendTo(game.enemy.skills.showMoves);
        if (game.skills[hero][skillid].passive && skill && target.hasClass('enemy') && skill.passive) {
          skill.passive(skill, target);
        }
      }
      if (move[0] === 'T') {
        to = game.map.mirrorPosition(move[1]);
        skillid = move[2];
        hero = move[3];
        target = $('#' + to + ' .card');
        s = hero + '-' + skillid;
        skill = $('.enemydecks .hand .skills.'+s+', .enemydecks .sidehand .skills.'+s).first();
        skill.clone().appendTo(game.enemy.skills.showMoves);
        if (game.skills[hero][skillid].toggle && skill && target.hasClass('enemy') && skill.toggle) {
          skill.toggle(skill, target);
        }
      }
      if (move[0] === 'D') {
        skillid = move[1];
        hero = move[2];
        s = hero + '-' + skillid;
        skill = $('.enemydecks .hand .skills.'+s).first();
        skill.clone().appendTo(game.enemy.skills.showMoves);
        if (skill.discard) {
          skill.discard();
        }
      }
    }
    game.enemy.autoMoveCount++;
    if (game.enemy.autoMoveCount < game.currentMoves.length) {
      game.timeout(1000, game.enemy.autoMove);
    } else game.timeout(1000, game.enemy.movesEnd);
  },
  move: function () {
    game.message.text(game.data.ui.enemymove);
    game.enemy.skills.showMoves.addClass('slide');
    var from, to, m, move, source, target, targets, hero, skillid, skill, s,
        moves = game.currentData.moves.split('|');
    game.currentMoves = moves;
    game.enemy.autoMoveCount = 0;
    game.enemy.autoMove();
  },
  movesEnd: function () {
    game.enemy.skills.showMoves.removeClass('slide');
    game.timeout(400, function () {
      game.enemy.skills.showMoves.empty();
      if (game.mode == 'tutorial') game.tutorial.playerTurn();
      if (game.mode == 'online') game.online.endTurn('unturn');
    });
  },
  cardsInHand: function () {
    return game.enemy.skills.hand.children().length;
  },
  maxSkillCards: function () {
    return game.enemy.maxCards;
  }
};
