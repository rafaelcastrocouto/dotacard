game.units = {
  place: function () {
    var j = 'A1';
    $('#' + j).addClass('jungle').attr({title: 'Jungle'});
    $('#' + game.map.mirrorPosition(j)).addClass('jungle').attr({title: 'Jungle'});
    game.neutrals = {};
    game.neutrals.unitsDeck = game.deck.build({
      name: 'units',
      filter: ['forest'],
      cb: function (deck) {
        deck.addClass('neutral units cemitery').hide().appendTo(game.states.table.neutrals);
        $.each(deck.data('cards'), function (i, card) {
          card.addClass('neutral unit').data('side', 'neutral').on('mousedown touchstart', game.card.select);
        });
      }
    });
    game.player.unitsDeck = game.deck.build({
      name: 'units',
      filter: game.player.picks,
      cb: function (deck) {
        deck.addClass('player units cemitery').hide().appendTo(game.states.table.player);
        $.each(deck.data('cards'), function (i, card) {
          card.addClass('player unit').data('side', 'player').on('mousedown touchstart', game.card.select);
          if (game.mode == 'library') card.on('action', game.library.action); 
        });
      }
    });
    game.enemy.unitsDeck = game.deck.build({
      name: 'units',
      filter: game.enemy.picks,
      cb: function (deck) {
        deck.addClass('enemy units cemitery').hide().appendTo(game.states.table.enemy);
        $.each(deck.data('cards'), function (i, card) {
          card.addClass('enemy unit').data('side', 'enemy').on('mousedown touchstart', game.card.select);
        });
      }
    });
  }
};