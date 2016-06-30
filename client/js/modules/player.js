game.player = {
  manaBuild: function () {
    game.player.maxCards = Math.round(game.player.mana / 2);
    game.player.cardsPerTurn = Math.round(game.player.mana / 5);
    game.player.skills = {};
  },
  buyCard: function () {
    if (game.player.turn === 6) {
      $('.player.deck.skills.ult .card').appendTo(game.player.skills.deck);
    }
    var availableSkills = $('.skills.available.player.deck .card'),
      card = game.deck.randomCard(availableSkills),
      heroid,
      hero,
      to,
      skillid;
    if (availableSkills.length === 0) {
      $('.player.deck.skills.cemitery .card').appendTo(game.player.skills.deck);
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
      if (game.mode == 'online') {
        game.currentMoves.push('M:' + from + ':' + to);
      }
      if (game.mode !== 'library') game.card.unselect(null, true);
      else if (!game.turn.noAvailableMoves()) game.card.unselect(null, true);
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
      if (game.mode == 'online') {
        game.currentMoves.push('A:' + from + ':' + to);
        source.addClass('done');
      }
      game.card.unselect(null, true);
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
      if (game.mode == 'online') game.currentMoves.push('P:' + to + ':' + skillid + ':' + hero);
      skill.passive(target);
      game.card.unselect(null, true);
      game.states.table.animateCast(skill, target);
      game.timeout(400, function () {
        this.select({force: true});
      }.bind(target));
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
      skill.addClass('done');
      if (game.mode == 'online') game.currentMoves.push('T:' + to + ':' + skillid + ':' + hero);
      game.states.table.animateCast(skill, target);
      game.card.unselect(null, true);
      game.timeout(400, function () {
        this.select({force: true});
      }.bind(target));
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
      if (game.mode == 'online') {
        game.currentMoves.push('C:' + from + ':' + to + ':' + skillid + ':' + hero);
        source.addClass('done');
      }
      if (source.hasClass('player')) source.addClass('done');
      game.states.table.animateCast(skill, to);
      game.card.unselect(null, true);
    }
  }
};