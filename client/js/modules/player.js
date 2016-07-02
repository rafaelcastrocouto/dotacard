game.player = {
  manaBuild: function () {
    game.player.maxCards = Math.round(game.player.mana / 2);
    game.player.cardsPerTurn = Math.round(game.player.mana / 5);
    game.player.skills = {};
  },
  buyCard: function () {
    if (game.player.turn === 6) {
      $('.card', game.player.skills.ult).appendTo(game.player.skills.deck);
    }
    var availableSkills = $('.skills.available.player.deck .card'),
      card = game.deck.randomCard(availableSkills),
      heroid,
      hero,
      to,
      skillid;
    if (availableSkills.length < game.player.cardsPerTurn) {
      $('.player.deck.skills.cemitery .card').appendTo(game.player.skills.deck);
      availableSkills = $('.skills.available.player.deck .card');
    }
    if (card.data('type') === game.data.ui.toggle) {
      card.appendTo(game.player.skills.sidehand);
    } else if (card.data('type') === game.data.ui.automatic) {
      heroid = card.data('hero');
      hero = $('.map .player.heroes.' + heroid);
      to = game.map.getPosition(hero);
      skillid = card.data('skill');
      card.passive(to);
      if (game.mode == 'online') game.currentMoves.push('P:' + to + ':' + skillid + ':' + heroid);
      card.appendTo(game.player.skills.sidehand);
    } else {
      card.appendTo(game.player.skills.hand);
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
      if (card.hasClass('player')) card.addClass('done');
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
      if (source.hasClass('player')) source.addClass('done');
      if (game.mode == 'online') game.currentMoves.push('A:' + from + ':' + to);
    }
    //game.timeout(300, game.card.unselect(null, true));
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
      if (game.mode == 'online') game.currentMoves.push('P:' + to + ':' + skillid + ':' + hero);
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
      if (source.hasClass('player')) skill.addClass('done');
      if (game.mode == 'online') game.currentMoves.push('T:' + to + ':' + skillid + ':' + hero);
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
      if (source.hasClass('player')) source.addClass('done');
      if (game.mode == 'online') game.currentMoves.push('C:' + from + ':' + to + ':' + skillid + ':' + hero);
      game.states.table.animateCast(skill, to);
    }
  }
};