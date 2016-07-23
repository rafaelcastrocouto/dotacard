game.player = {
  placeHeroes: function () {
    game.player.heroesDeck = game.deck.build({
      name: 'heroes',
      filter: game.player.picks,
      cb: function (deck) {
        deck.addClass('player').appendTo(game.states.table.player).hide();
        if (game.mode == 'library') {
          var card = deck.data('cards')[0];
          game.library.hero = card.addClass('player').on('mousedown touchstart', game.card.select);
          card.place(game.map.toId(4, 4));
          card.on('action', game.library.action).on('death', game.library.action);
        } else {
          var x = 1, y = 4;
          $.each(deck.data('cards'), function (i, card) {
            var p = game.player.picks.indexOf(card.data('hero'));
            card.addClass('player').on('mousedown touchstart', game.card.select);
            card.place(game.map.toId(x + p, y));
            if (game.mode == 'online') card.on('action', game.online.action);
            if (game.mode == 'tutorial') card.on('select', game.tutorial.selected);
          });
        }
      }
    });
  },
  buyCard: function () {
    var availableSkills = $('.table .player .available .card'),
      card,
      heroid,
      hero,
      to,
      skillid;
    if (availableSkills.length < game.player.cardsPerTurn) {
      $('.table .player .cemitery .card').appendTo(game.player.skills.deck);
      availableSkills = $('.table .player .available .card');
    }
    card = availableSkills.randomCard();
    if (card.data('hand') === game.data.ui.right) {
      card.appendTo(game.player.skills.hand);
    } else {
      card.appendTo(game.player.skills.sidehand);
    }
  },
  buyHand: function () {
    var i;
    for (i = 0; i < game.player.cardsPerTurn; i += 1) {
      if (game.player.skills.hand.children().length < game.player.maxCards) {
        game.player.buyCard();
      }
    }
  },
  move: function () {
    var spot = $(this),
      card = game.selectedCard, 
      from = game.map.getPosition(card),
      to = game.map.getPosition(spot);
    if (!game.states.table.el.hasClass('unturn') && 
        spot.hasClass('free') && 
        from !== to && 
        !card.hasClass('done')) {
      card.move(to);
      if (card.hasClass('player')) card.addClass('done').removeClass('draggable');
      if (game.mode == 'online') game.currentMoves.push('M:' + from + ':' + to);
    }
  },
  attack: function () {
    var target = $(this),
      source = game.selectedCard,
      from = game.map.getPosition(source),
      to = game.map.getPosition(target);
    if (!game.states.table.el.hasClass('unturn') && 
        source.data('damage') && 
        from !== to && 
        !source.hasClass('done') && 
        target.data('current hp')) {
      source.attack(target);
      if (source.hasClass('player')) source.addClass('done').removeClass('draggable');
      if (game.mode == 'online') game.currentMoves.push('A:' + from + ':' + to);
    }
  },
  passive: function () {
    var target = $(this),
      skill = game.selectedCard,
      hero = skill.data('hero'),
      skillid = skill.data('skill'),
      to = game.map.getPosition(target);
    if (hero && skillid && 
       !game.states.table.el.hasClass('unturn')) {
      skill.passive(target);
      game.currentMoves.push('P:' + to + ':' + skillid + ':' + hero);
      game.states.table.animateCast(skill, target);
    }
  },
  toggle: function () {
    var target = $(this),
      skill = game.selectedCard,
      hero = skill.data('hero'),
      skillid = skill.data('skill'),
      to = game.map.getPosition(target);
    if (hero && skillid && 
        !game.states.table.el.hasClass('unturn')) {
      skill.toggle(target);
      game.currentMoves.push('T:' + to + ':' + skillid + ':' + hero);
      game.states.table.animateCast(skill, target);
    }
  },
  cast: function () {
    var target = $(this),
      skill = game.selectedCard,
      source = $('.map .source'),
      from = game.map.getPosition(source),
      to = game.map.getPosition(target),
      hero = skill.data('hero'),
      skillid = skill.data('skill');
    if (hero && skillid && from && to && 
       !game.states.table.el.hasClass('unturn') && 
       !source.hasClass('done')) {
      source.cast(skill, to);
      if (source.hasClass('player') &&
          skill.data('type') !== game.data.ui.instant) {
        source.addClass('done').removeClass('draggable');
      }
      game.currentMoves.push('C:' + from + ':' + to + ':' + skillid + ':' + hero);
      game.states.table.animateCast(skill, to);
    }
  },
  discard: function (skill) {
    var hero = skill.data('hero'),
        skillid = skill.data('skill');
    game.currentMoves.push('D:' + skillid + ':' + hero);
    game.states.table.discard.attr('disabled', true);
    skill.discard();
  },
  cardsInHand: function () {
    return game.player.skills.hand.children().length;
  },
  maxSkillCards: function () {
    return game.player.maxCards;
  }
};