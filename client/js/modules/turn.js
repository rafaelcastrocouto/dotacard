game.turn = {
  build: function () {
    game.time = 0;
    game.player.turn = 0;
    game.enemy.turn = 0;
    game.player.kills = 0;
    game.enemy.kills = 0;
    game.currentData.moves = [];
    game.currentData = {};
    game.turn.msg = $('<p>').appendTo(game.topbar).addClass('turns').text(game.data.ui.turns + ': 0/0 (0)').hide();
    game.turn.el = $('<h1>').addClass('turntitle').appendTo(game.states.table.el);
  },
  begin: function () {
    if (!game.states.table.el.hasClass('over')) {
      game.message.text(game.data.ui.yourturn);
      game.loader.removeClass('loading');
      if (!game.states.table.el.hasClass('unturn')) {
        game.turn.el.text(game.data.ui.yourturn).addClass('show');
      }
      if (game.mode == 'online') game.online.beginTurn();
      $('.card.dead').each(function () {
        var dead = $(this);
        if (game.time > dead.data('reborn')) { dead.reborn(); }
      });
      game.time = game.player.turn + game.enemy.turn;
      setTimeout(game.turn.startCount, 800);
    }
  },
  startCount: function () {
    if (!game.states.table.el.hasClass('unturn')) {
      game.message.text(game.data.ui.yourturn);
      game.player.turn += 1;
      $('.map .card.player').removeClass('done');
      game.tower.attack();
      game.player.buyHand();
    } else if (game.states.table.el.hasClass('unturn')) {
      game.message.text(game.data.ui.enemyturn);
      game.enemy.turn += 1;
      $('.map .card.enemy').removeClass('done');
      game.enemy.buyHand();
    }
    $('.card').each(function () {
      var card = $(this);
      card.trigger('turnstart', { target: card });
      if (!game.states.table.el.hasClass('unturn')) {
        card.trigger('playerturnstart', { target: card });
      } else { card.trigger('enemyturnstart', { target: card }); }
      card.reduceStun();
    });
    game.turn.el.removeClass('show');
    if (game.mode == 'online') game.online.startTurnCount();
  },
  count: function () {
    game.states.table.time.text(game.data.ui.time + ': ' + game.turn.hours() + ' ' + game.turn.dayNight());
    game.turn.msg.text(game.data.ui.turns + ': ' + game.player.turn + '/' + game.enemy.turn + ' (' + parseInt(game.time, 10) + ')');
    if (!game.states.table.el.hasClass('unturn')) {
      game.message.text(game.data.ui.yourturncount + ' ' + game.turn.counter + ' ' + game.data.ui.seconds);
    } else if (ggame.states.table.el.hasClass('unturn')) {
      game.message.text(game.data.ui.enemyturncount + ' ' + game.turn.counter + ' ' + game.data.ui.seconds);
    }
    if (game.turn.counter < 1) { game.turn.end(); } else { game.timeout = setTimeout(game.turn.count, 1000); }
    game.time += 0.9 / game.timeToPlay;
    game.turn.counter -= 1;
  },
  skip: function (e) {
    if (!$(this).attr('disabled')) {
      if (game.mode == 'tutorial') game.tutorial.skip();
      game.turn.counter = 0;
    }
  },
  end: function () {
    if (!game.states.table.el.hasClass('over')) {
      game.message.text(game.data.ui.turnend);
      game.highlight.clearMap();
      if (game.states.table.el.hasClass('unturn') &&
          game.mode !== 'library') {
        game.turn.el.text(game.data.ui.enemyturn).addClass('show');
        game.timeout(800, function () {
          game.turn.el.removeClass('show');
        });
      }
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
      if (game.mode == 'online') game.online.endTurn();
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
