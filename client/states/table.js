game.states.table = {
  build: function () {
    this.time = $('<p>').appendTo(game.topbar).addClass('time').text(game.data.ui.time + ': 0:00 Day').hide();
    this.turns = $('<p>').appendTo(game.topbar).addClass('turns').text(game.data.ui.turns + ': 0/0 (0)').hide();
    game.map.start();
    this.selectedArea = $('<div>').appendTo(this.el).addClass('selectedarea').append($('<div>').addClass('cardback'));
    this.neutrals = $('<div>').appendTo(this.el).addClass('neutraldecks');
    this.player = $('<div>').appendTo(this.el).addClass('playerdecks');
    this.enemy = $('<div>').appendTo(this.el).addClass('enemydecks');
    this.skip = $('<div>').appendTo(this.el).addClass('skip button').attr({disabled: true}).leftClickEvent(game.turn.skip).text(game.data.ui.skip);
    this.surrender = $('<div>').appendTo(this.el).addClass('surrender button').text(game.data.ui.surrender).leftClickEvent(function () {
      if(confirm(game.data.ui.leave)) game[game.mode].surrender();
    });
  },
  start: function () {
    game[game.mode].setTable();
    game.fork.hide();
    game.chat.el.appendTo(this.el);
    this.time.show();
    this.turns.show();
    this.camera.show();
    this.selectedArea.show();
  },
  buildUnits: function () {
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
          card.addClass('neutral unit').data('side', 'neutral').on('mousedown.select', game.card.select);
        });
      }
    });
    game.player.unitsDeck = game.deck.build({
      name: 'units',
      filter: game.player.picks,
      cb: function (deck) {
        deck.addClass('player units cemitery').hide().appendTo(game.states.table.player);
        $.each(deck.data('cards'), function (i, card) {
          card.addClass('player unit').data('side', 'player').on('mousedown.select', game.card.select);
        });
      }
    });
    game.enemy.unitsDeck = game.deck.build({
      name: 'units',
      filter: game.enemy.picks,
      cb: function (deck) {
        deck.addClass('enemy units cemitery').hide().appendTo(game.states.table.enemy);
        $.each(deck.data('cards'), function (i, card) {
          card.addClass('enemy unit').data('side', 'enemy').on('mousedown.select', game.card.select);
        });
      }
    });
  },
  animateCast: function (skill, target) {
    //todo: remove 'top/left', use only 'transform' to improve performance
    if (typeof target === 'string') { target = $('#' + target); }
    var t = skill.offset(), d = target.offset();
    skill.css({
      top: d.top - t.top + 30,
      left: d.left - t.left + 20,
      transform: 'translate(-50%, -50%) scale(0.3)'
    });
    setTimeout(function () {
      $(this.skill).css({
        top: '',
        left: '',
        transform: ''
      });
    }.bind({ skill: skill }), 500);
  },
  showResults: function () {
    game.states.table.selectedArea.hide();
    game.states.table.camera.hide();
    $('.table > .button').hide();
    $('.table .deck').hide();
    game.states.table.resultsbox = $('<div>').appendTo(game.states.table.el).addClass('resultsbox box');
    $('<h1>').appendTo(this.resultsbox).addClass('result').text(game.winner + ' ' + game.data.ui.victory);
    $('<h1>').appendTo(this.resultsbox).text(game.data.ui.towers + ' HP: ' + game.player.tower.data('current hp') + ' / ' + game.enemy.tower.data('current hp'));
    $('<h1>').appendTo(this.resultsbox).text(game.data.ui.heroes + ' ' + game.data.ui.kd + ': ' + game.player.kills + ' / ' + game.enemy.kills);
    game.states.table.playerResults = $('<div>').appendTo(game.states.table.resultsbox).addClass('results');
    game.states.table.enemyResults = $('<div>').appendTo(game.states.table.resultsbox).addClass('results');
    $('.player.heroes.card').not('.zoom').each(function () {
      var hero = $(this), heroid = $(this).data('hero'),
        img = $('<div>').addClass('portrait').append($('<div>').addClass('img')),
        text = $('<span>').text(hero.data('name') + ': ' + hero.data('kills') + ' / ' + hero.data('deaths'));
      $('<p>').appendTo(game.states.table.playerResults).addClass(heroid+' heroes').append(img, text);
    });
    $('.enemy.heroes.card').not('.zoom').each(function () {
      var hero = $(this), heroid = $(this).data('hero'),
        img = $('<div>').addClass('portrait').append($('<div>').addClass('img')),
        text = $('<span>').text(hero.data('name') + ': ' + hero.data('kills') + ' / ' + hero.data('deaths'));
      $('<p>').appendTo(game.states.table.enemyResults).addClass(heroid+' heroes').append(img, text);
    });
    $('<div>').addClass('button close').appendTo(game.states.table.resultsbox).text(game.data.ui.close).leftClickEvent(game.states.table.clear);
  },
  clear: function () {
    game[game.mode].clear();
    game.map.clear();
    $('.table .card').remove();
    $('.table .deck').remove();
    $('.table .resultsbox').remove();
    game.clearTimeouts();
    game.mode = '';
    game.states.changeTo('menu');
  },
  end: function () {
    this.time.hide();
    this.turns.hide();
    game.fork.show();
  }
};
