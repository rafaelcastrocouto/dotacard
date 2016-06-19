game.states.table = {
  chat: true,
  build: function () {
    this.time = $('<p>').appendTo(game.topbar).addClass('time').text(game.data.ui.time + ': 0:00 Day').hide();
    this.camera = $('<div>').addClass('camera');
    this.map = game.map.build({'width': game.width, 'height': game.height}).appendTo(this.camera);
    this.selectedArea = $('<div>').addClass('selectedarea').append($('<div>').addClass('cardback'));
    //this.neutrals = $('<div>').appendTo(this.el).addClass('neutraldecks');
    this.player = $('<div>').addClass('playerdecks');
    this.enemy = $('<div>').addClass('enemydecks');
    this.buttonbox = $('<div>').addClass('buttonbox');
    this.skip = $('<div>').appendTo(this.buttonbox).addClass('skip button').attr({disabled: true}).text(game.data.ui.skip).on('mouseup touchend', this.skipClick);
    this.surrender = $('<div>').appendTo(this.buttonbox).addClass('surrender button').text(game.data.ui.surrender).on('mouseup touchend', this.surrenderClick);
    this.back = $('<div>').hide().appendTo(this.buttonbox).addClass('back button').text(game.data.ui.back).on('mouseup touchend', this.backClick);
    this.el.append(this.camera).append(this.selectedArea).append(this.buttonbox).append(this.player).append(this.enemy);
  },
  start: function (recover) {
    if (recover && game.mode) game[game.mode].build(true);
    game.tower.place();
    game.tree.place();
    game.units.place();
    if (game.mode) game[game.mode].setTable();
    game.chat.build();
    game.chat.el.appendTo(this.el);
    if (game.turn.msg) game.turn.msg.show();
    this.time.show();
    this.camera.show();
    this.selectedArea.show();
  },
  enableUnselect: function () {
    game.states.table.el.on('mousedown touchstart', function (event) { 
      var target = $(event.target); 
      if (!target.closest('.selected').length && 
          !target.closest('.selectedarea').length &&
          !target.closest('.movearea').length &&
          !target.closest('.attacktarget').length &&
          !target.closest('.targetarea').length &&
          !target.closest('.casttarget').length &&
          !target.closest('.button').length) {
        game.card.unselect(event);
        if (game[game.mode].unselected) game[game.mode].unselected(event);
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
    game.states.table.enemyResults = $('<div>').appendTo(game.states.table.resultsbox).addClass('results enemy');
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
    $('<div>').addClass('button close').appendTo(game.states.table.resultsbox).text(game.data.ui.close).on('mouseup touchend', function () {
      game.clear();
      game.states.changeTo('menu');
    });
  },
  skipClick: function () {
    if (!game.states.table.skip.attr('disabled')) {
      game.highlight.clearMap()
      if (game.mode == 'online') game.turn.counter = 0;
      if (game.mode == 'tutorial') game.tutorial.skip();
      if (game.mode == 'library') game.library.skip();
    }
  },
  surrenderClick: function () {
    game.confirm(function(confirmed) {
      if (confirmed && game.mode && game[game.mode].surrender) game[game.mode].surrender();
      else game.reset();
    });
  },
  backClick: function () {
    game.clear();
    game.setMode(game.mode);
    game.states.changeTo('choose');
  },
  clear: function () {
    game.map.clear();
    $('.table .card').remove();
    $('.table .deck').remove();
    $('.table .resultsbox').remove();
    this.selectedArea.removeClass('flip');
    game.clearTimeouts();
  },
  end: function () {
    this.time.hide();
    game.turn.msg.hide();
  }
};
