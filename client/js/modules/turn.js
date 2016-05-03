game.turn = {
  build: function () {
    game.time = 0;
    game.player.turn = 0;
    game.enemy.turn = 0;
    game.player.kills = 0;
    game.enemy.kills = 0;
    game.currentData.moves = [];
    game.currentData = {};
    game.turn.el = $('<h1>').addClass('turntitle').appendTo(game.states.table.el);
    if (game.player.type === 'challenged') { game.status = 'turn'; }
    if (game.player.type === 'challenger') { game.status = 'unturn'; }
  },
  reset: function () {
    game.currentData.moves = [];
    $('.card .damaged').remove();
    $('.card .heal').remove();
  },
  begin: function () {
    if (game.status !== 'over') {
      game.turn.reset();
      $('.card.dead').each(function () {
        var dead = $(this);
        if (game.time > dead.data('reborn')) { dead.reborn(); }
      });
      if (game.turn === 6) { $('.card', game.states.table.playerUlts).appendTo(game.player.skills.deck); }
      game.time = game.player.turn + game.enemy.turn;
      game.turn.counter = game.timeToPlay;
      if (game.status === 'turn') {
        game.turn.el.text(game.data.ui.yourturn);
      } else if (game.status === 'unturn') {
        game.turn.el.text(game.data.ui.enemyturn);
        game.turn.counter += 1;
      }
      game.loader.removeClass('loading');
      game.turn.el.addClass('show');
      setTimeout(game.turn.start, 3000);
    }
  },
  start: function () {
    if (game.status === 'turn') {
      game.states.table.skip.attr({disabled: false});
      game.states.table.el.removeClass('unturn').addClass('turn');
      game.message.text(game.data.ui.yourturn);
      game.player.turn += 1;
      $('.map .card.player').removeClass('done');
      game.tower.attack();
      game.map.highlight();
      game.player.buyHand();
    } else {
      game.message.text(game.data.ui.enemyturn);
      game.enemy.turn += 1;
      $('.map .card.enemy').removeClass('done');
      game.enemy.buyHand();
    }
    $('.card').each(function () {
      var card = $(this);
      card.trigger('turnstart', { target: card });
      if (game.status === 'turn') {
        card.trigger('playerturnstart', { target: card });
      } else { card.trigger('enemyturnstart', { target: card }); }
      card.reduceStun();
    });
    game.turn.el.removeClass('show');
    setTimeout(game.turn.count, 1000);
  },
  count: function () {
    clearTimeout(game.timeout);
    game.states.table.time.text(game.data.ui.time + ': ' + game.turn.hours() + ' ' + game.turn.dayNight());
    game.states.table.turns.text(game.data.ui.turns + ': ' + game.player.turn + '/' + game.enemy.turn + ' (' + parseInt(game.time, 10) + ')');
    if (game.status === 'turn') {
      game.message.text(game.data.ui.yourturncount + ' ' + game.turn.counter + ' ' + game.data.ui.seconds);
    } else if (game.status === 'unturn') {
      game.message.text(game.data.ui.enemyturncount + ' ' + game.turn.counter + ' ' + game.data.ui.seconds);
    }
    if (game.turn.counter < 1) { game.turn.end(); } else { game.timeout = setTimeout(game.turn.count, 1000); }
    game.time += 0.9 / game.timeToPlay;
    game.turn.counter -= 1;
  },
  skip: function (e) {console.log(e, this);
    if (!$(this).attr('disabled')) {
      game.turn.counter = 0;
      console.log('skip');
    }
  },
  end: function () {
    game.message.text(game.data.ui.turnend);
    game.map.unhighlight();
    $('.card .damaged').remove();
    $('.card .heal').remove();
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
    if (game.status === 'turn') {
      game.states.table.skip.attr({disabled: true});
      game.states.table.el.removeClass('turn');
      game.states.table.el.addClass('unturn');
      game.status = 'unturn';
      if (game.mode == 'online') setTimeout(game.online.sendData, 1000);
    } else {
      game.tries = 1;
      if (game.mode == 'online') setTimeout(game.online.getData, 1000);
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
