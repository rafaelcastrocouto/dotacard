game.turn = {
  build: function () {
    game.time = 0;
    game.player.turn = 0;
    game.enemy.turn = 0;
    game.player.kills = 0;
    game.enemy.kills = 0;
    game.turn.msg = $('<p>').appendTo(game.topbar).addClass('turns').text(game.data.ui.turns + ': 0/0 (0)').hide();
    game.turn.el = $('<h1>').addClass('turntitle').appendTo(game.states.table.el);
  },
  beginPlayer: function () {
    if (!game.states.table.el.hasClass('over')) {
      game.player.turn += 1;
      game.message.text(game.data.ui.yourturn);
      game.loader.removeClass('loading');
      game.turn.el.text(game.data.ui.yourturn).addClass('show');
      $('.map .card.player').removeClass('done');
      game.tower.attack();
      game.player.buyHand();
      game.turn.start('turn');
    }
  },
  beginEnemy: function () {
    if (!game.states.table.el.hasClass('over')) {
      game.enemy.turn += 1;
      game.message.text(game.data.ui.enemyturn);
      $('.map .card.enemy').removeClass('done');
      game.enemy.buyHand();
      game.turn.start('unturn');
    }
  },
  start: function (unturn) {
    game.time = game.player.turn + game.enemy.turn;
    game.turn.msg.text(game.data.ui.turns + ': ' + game.player.turn + '/' + game.enemy.turn + ' (' + parseInt(game.time, 10) + ')');
    $('.card.dead').each(function () {
      var dead = $(this);
      if (game.time > dead.data('reborn')) { dead.reborn(); }
    });
    $('.card').each(function () {
      var card = $(this);
      card.trigger('turnstart', { target: card });
      if (!game.states.table.el.hasClass('unturn')) {
        card.trigger('playerturnstart', { target: card });
      } else { card.trigger('enemyturnstart', { target: card }); }
      card.reduceStun();
    });
    var ms = 800;
    if (unturn === 'unturn' && game.mode === 'library') ms = 200;
    game.timeout(ms, function () {
      game.turn.el.removeClass('show');
      if (unturn === 'turn') {
        game.states.table.el.removeClass('unturn');
        game.states.table.skip.attr('disabled', false);
        game.highlight.map();
      }
      if (game[game.mode].startTurn) game[game.mode].startTurn(unturn);
    });
  },
  count: function (unturn) {
    if (game.turn.counter >= 0) {
      game.states.table.time.text(game.data.ui.time + ': ' + game.turn.hours() + ' ' + game.turn.dayNight());
      game.turn.msg.text(game.data.ui.turns + ': ' + game.player.turn + '/' + game.enemy.turn + ' (' + Math.round(game.time) + ')');
      if (unturn !== 'unturn') {
        game.message.text(game.data.ui.yourturncount + ' ' + game.turn.counter + ' ' + game.data.ui.seconds);
      } else {
        game.message.text(game.data.ui.enemyturncount + ' ' + game.turn.counter + ' ' + game.data.ui.seconds);
        if (game.mode === 'online') game.online.preGetTurnData();
      }
      if (game.turn.counter === 0) game.turn.end(unturn); 
      else if (game.turn.counter > 0) {
        game.timeout(1000, game.turn.count.bind(this, unturn));
        game.time += 0.9 / game.timeToPlay;
        game.turn.counter -= 1;
      }
    }
  },
  end: function (unturn) {
    if (!game.states.table.el.hasClass('over')) {
      game.states.table.skip.attr('disabled', true);
      game.message.text(game.data.ui.turnend);
      $('.spot.fountain').find('.card').each(function () {
        var card = $(this),
          heal  = card.data('hp') * 0.1;
        card.heal(heal);
      });
      $('.card.heroes').each(function () {
        var hero = $(this);
        if (hero.data('channeling')) { hero.trigger('channel', { source: hero }); }
        hero.trigger('turnend', { target: hero });
      });
      if (unturn === 'unturn' &&
          game.mode !== 'library') {
        game.turn.el.text(game.data.ui.enemyturn).addClass('show');
        game.timeout(800, function () { game.turn.el.removeClass('show'); });
      }
      if (game[game.mode].endTurn) game[game.mode].endTurn(unturn);
    }
  },
  hours: function () {
    var convertedMin, intMin, stringMin,
      hours = game.time % game.dayLength,
      perCentHours = hours / game.dayLength,
      convertedHours = perCentHours * 24,
      intHours = parseInt(convertedHours, 10),
      minutes = convertedHours - intHours;
    if (minutes < 0) { minutes = 0; }
    convertedMin = minutes * 60;
    intMin = parseInt(convertedMin, 10);
    stringMin = intMin < 10 ? '0' + intMin : intMin;
    return intHours + ':' + stringMin;
  },
  dayNight: function () {
    var hours = game.time % game.dayLength;
    if (hours < game.dayLength / 2) {
      return game.data.ui.day;
    } else { return game.data.ui.night; }
  }
};
