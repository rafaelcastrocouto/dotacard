game.tutorial = {
  build: function () {
    if (!game.tutorial.builded) {
      game.tutorial.builded = true;
      game.tutorial.axe = $('<div>').addClass('axe tutorial');
      game.tutorial.axeimg = $('<div>').addClass('img').appendTo(game.tutorial.axe);
      game.tutorial.axebaloon = $('<div>').addClass('baloon').appendTo(game.tutorial.axe);
      game.tutorial.message = $('<div>').addClass('txt').appendTo(game.tutorial.axebaloon);
      game.tutorial.axe.appendTo(game.states.choose.el);
    }
    game.seed = new Date().valueOf();
    game.id = btoa(game.seed);
    game.message.text(game.data.ui.waiting);
    game.tutorial.message.html(game.data.ui.axepick);
    game.states.choose.counter.show().text(game.data.ui.clickpick);
    game.enemy.name = 'axe';
    game.enemy.type = 'challenger';
    game.player.type = 'challenged';
    game.states.choose.librarytest.hide();
    game.states.choose.randombt.hide();
    game.states.choose.mydeck.hide();
    game.states.choose.enablePick();
    game.tutorial.axeshow();
  },
  axeshow: function () {
    setTimeout(function () {
      if (game.mode == 'tutorial') {
        game.tutorial.axe.addClass('up');
        game.timeout(400, function () {
          if (game.mode == 'tutorial' && game.currentState == 'choose') {
            game.audio.play('tutorial/axehere');
            game.tutorial.axebaloon.fadeIn('slow');
            game.message.text(game.data.ui.tutorialstart);
            game.loader.removeClass('loading');
          }
        });
      }
    }, 400);
  },
  chooseStart: function () {
    game.states.choose.selectFirst();
  },
  pick: function () {
    var availableSlots = $('.slot.available').length;
    game.tutorial.axebaloon.hide().fadeIn('slow');
    if (availableSlots === 4) {
      game.tutorial.message.html(game.data.ui.axechooseorder);
    } else if (availableSlots === 3) {
      game.tutorial.message.html(game.data.ui.axeheroes);
    } else if (availableSlots === 2) {
      game.tutorial.message.html(game.data.ui.axeautodeck);
    } else if (availableSlots === 1) {
      game.tutorial.message.html(game.data.ui.axemana);
    }
    if (availableSlots) {
      game.states.choose.counter.text(availableSlots + ' ' + game.data.ui.togo);
    } else {
      game.loader.addClass('loading');
      game.message.text(game.data.ui.loadingdeck);
      game.states.choose.counter.text(game.data.ui.getready);
      game.audio.play('tutorial/axebattle');
      game.tutorial.message.html(game.data.ui.axebattle);
      game.timeout(2000, game.tutorial.heroesdeck);
    }
  },
  heroesdeck: function () {
    game.player.picks = [];
    $('.slot').each(function () {
      var slot = $(this), card = slot.find('.card');
      game.player.picks[slot.data('slot')] = card.data('hero');
      if (game.player.picks.length === 5) {
        localStorage.setItem('mydeck', game.player.picks);
        game.states.choose.clear();
        game.states.changeTo('table');
      }
    });
  },
  setTable: function () {
    if (!game.tutorial.started) {
      game.tutorial.started = true;
      game.tutorial.lesson = 'Enemy';
      game.message.text(game.data.ui.battle);
      game.loader.removeClass('loading');
      game.audio.play('horn');
      if (!game.player.picks.length) {
        game.player.picks = localStorage.getItem('mydeck').split(',');
      }
      game.tutorial.placePlayerHeroes();
      game.tutorial.placeEnemyHeroes();
      game.tutorial.buildSkills();
      game.states.table.surrender.show();
      game.states.table.back.hide();
      game.states.table.time.text(game.data.ui.time + ': 0:00 ' + game.data.ui.day);
      game.tutorial.axe.removeClass('up').appendTo(game.states.table.el);
      game.tutorial.axebaloon.hide();
      game.player.kills = 0;
      game.enemy.kills = 0;
      game.tutorial.moveCountValue = 10;
      game.message.text(game.data.ui.yourturncount + ' ' + game.tutorial.moveCountValue);
      game.tutorial.axe.addClass('up left');
      game.turn.build();
      game.states.table.skip.attr('disabled', true);
      game.states.table.el.removeClass('unturn');
      game.timeout(400, function () {
        game.tutorial.buyHand();
        game.message.text(game.data.ui.yourturncount + ' ' + --game.tutorial.moveCountValue);
        game.timeout(1000, game.tutorial.selectEnemyLesson);
      });
    }
  },
  placePlayerHeroes: function () {
    if (game.player.picks) {
      game.player.heroesDeck = game.deck.build({
        name: 'heroes',
        filter: game.player.picks,
        cb: function (deck) {
          deck.addClass('player').appendTo(game.states.table.player);
          var x = 1, y = 4;
          $.each(deck.data('cards'), function (i, card) {
            var p = game.player.picks.indexOf(card.data('hero'));
            card.addClass('player hero').data('side', 'player').on('mousedown touchstart', game.card.select).on('select', game.tutorial.selected);
            card.place(game.map.toId(x + p, y));
          });
        }
      });
    }
  },
  placeEnemyHeroes: function () {
    game.enemy.picks = [ 'nyx', 'kotl', 'pud', 'ld', 'am' ];
    game.enemy.heroesDeck = game.deck.build({
      name: 'heroes',
      filter: game.enemy.picks,
      cb: function (deck) {
        deck.addClass('enemy').hide().appendTo(game.states.table.enemy);
        var x = 1, y = 4;
        $.each(deck.data('cards'), function (i, card) {
          var p = game.enemy.picks.indexOf(card.data('hero'));
          card.addClass('enemy hero').data('side', 'enemy').on('mousedown touchstart', game.card.select).on('select', game.tutorial.selected);
          card.place(game.map.mirrorPosition(game.map.toId(x + p, y)));
        });
      }
    });
  },
  buildSkills: function () {
    game.player.manaBuild();
    game.player.skills.hand = $('<div>').appendTo(game.states.table.player).addClass('player deck skills hand');
    game.player.skills.sidehand = $('<div>').appendTo(game.states.table.player).addClass('player deck skills sidehand');
    game.player.skills.ult = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills ult');
    game.player.skills.cemitery = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills cemitery');
    game.player.skills.deck = game.deck.build({
      name: 'skills',
      multi: true,
      filter: game.player.picks,
      cb: function (deck) {
        deck.addClass('player available').hide().appendTo(game.states.table.player);
        $.each(deck.data('cards'), function (i, skill) {
          skill.addClass('player skill').data('side', 'player').on('mousedown touchstart', game.card.select);
          if (skill.data('skill') === 'ult') {
            skill.appendTo(game.player.skills.ult);
          }
        });
      }
    });
    game.enemy.manaBuild();
    game.enemy.skills.deck = game.deck.build({
      name: 'skills',
      filter: ['am'],
      cb: function (deck) {
        deck.addClass('enemy hand cemitery toggle').appendTo(game.states.table.enemy);
        $.each(deck.data('cards'), function (i, skill) {
          skill.hide().addClass('enemy skill').data('side', 'enemy');
        });
      }
    });
  },
  buyHand: function () {
    $('.skills.pud-rot').appendTo(game.player.skills.sidehand);
    $('.skills.cm-slow').first().appendTo(game.player.skills.hand);
    $('.skills.am-shield').first().appendTo(game.player.skills.hand);
  },
  selectEnemyLesson: function () {
    game.tutorial.axebaloon.fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeselectenemy);
    $('.map .enemy.tower').addClass('tutorialblink').on('select', game.tutorial.selected);
    game.message.text(game.data.ui.yourturncount + ' ' + --game.tutorial.moveCountValue);
  },
  selected: function (event, data) {
    var card = data.card;
    if (card.hasClass('tutorialblink')) {
      if (game.tutorial.lesson === 'Enemy') game.tutorial.unselectLesson();
      if (game.tutorial.lesson === 'Player') game.tutorial.moveLesson();
      if (game.tutorial.lesson === 'Skill')  game.tutorial.passiveLesson();
      if (game.tutorial.lesson === 'Toggle')  game.tutorial.toggleCastLesson();
    }
    return card;
  },
  unselectLesson: function () {
    $('.map .enemy.tower').removeClass('tutorialblink').off('select');
    game.audio.play('tutorial/axeah');
    game.tutorial.lesson = 'Unselect';
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeunselect);
    game.message.text(game.data.ui.yourturncount + ' ' + --game.tutorial.moveCountValue);
    game.states.table.enableUnselect();
  },
  unselected: function () {
    if (game.tutorial.lesson === 'Unselect') {
      game.tutorial.lesson = '';
      game.tutorial.selectPlayerLesson();
    }
  },
  selectPlayerLesson: function () {
    game.tutorial.lesson = 'Player';
    $('.map .player.hero').addClass('tutorialblink');
    game.tutorial.axe.removeClass('left');
    game.tutorial.axebaloon.hide().delay(800).fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeselectplayer);
    game.message.text(game.data.ui.yourturncount + ' ' + --game.tutorial.moveCountValue);
  },
  moveLesson: function () {
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axemove);
    if (game.tutorial.lesson !== 'Move') {
      $('.spot.row5, .spot.row6').addClass('block');
      game.tutorial.lesson = 'Move';
      game.audio.play('tutorial/axemove');
      game.message.text(game.data.ui.yourturncount + ' ' + --game.tutorial.moveCountValue);
      $('.map .hero.player').on('move', game.tutorial.moveCount);
    }
  },
  moveCount: function (event, data) {//console.log('moveCount', event, data);
    data.card.removeClass('tutorialblink');
    game.states.table.skip.attr('disabled', false);
    game.message.text(game.data.ui.yourturncount + ' ' + --game.tutorial.moveCountValue);
    if (game.tutorial.moveCountValue === 0) game.tutorial.endTurnLesson();
  },
  endTurnLesson: function () {
    game.states.table.skip.addClass('tutorialblink');
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.axe.addClass('left');
    game.tutorial.message.html(game.data.ui.axeendturn);
  },
  skip: function () {
    game.states.table.skip.attr('disabled', true).removeClass('tutorialblink');
    $('.map .hero.player').removeClass('tutorialblink');
    game.message.addClass('tutorialblink');
    if (!game.tutorial.waited) game.tutorial.moveCountValue = 4;
    else game.tutorial.moveCountValue = 2;
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.axe.addClass('left');
    game.tutorial.message.html(game.data.ui.axedone);
    game.message.text(game.data.ui.enemyturncount + ' ' + --game.tutorial.moveCountValue);
    game.loader.addClass('loading');
    game.turn.el.text(game.data.ui.enemyturn);
    game.turn.el.addClass('show');
    game.timeout(2500, function () {
      game.turn.el.removeClass('show');
      game.states.table.el.addClass('unturn');
      if (!game.tutorial.waited) game.timeout(1000, game.tutorial.wait);
      else game.timeout(1000, game.tutorial.attack);
    });
  },
  wait: function () {
    game.message.removeClass('tutorialblink');
    game.states.table.time.addClass('tutorialblink');
    game.tutorial.waited = true;
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axewait);
    game.message.text(game.data.ui.enemyturncount + ' ' + --game.tutorial.moveCountValue);
    game.audio.play('tutorial/axetime');
    game.states.table.time.text(game.data.ui.time + ': 1:30 ' + game.data.ui.night);
    game.timeout(4000, game.tutorial.time);
  },
  time: function () {
    game.states.table.time.removeClass('tutorialblink');
    game.turn.msg.addClass('tutorialblink');
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.message.text(game.data.ui.enemyturncount + ' ' + --game.tutorial.moveCountValue);
    game.tutorial.message.html(game.data.ui.axetime);
    game.turn.msg.text(game.data.ui.turns + ': 1/1 (2)');
    game.timeout(4000, game.tutorial.enemyMove);
  },
  enemyMove: function () {
    game.turn.msg.removeClass('tutorialblink');
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeenemymove);
    game.message.html(game.data.ui.enemymove);
    game.audio.play('tutorial/axewait');
    game.currentMoves = [
      'M:'+game.map.mirrorPosition('D2')+':'+game.map.mirrorPosition('C3'),
      'M:'+game.map.mirrorPosition('F2')+':'+game.map.mirrorPosition('F3'),
      'M:'+game.map.mirrorPosition('H2')+':'+game.map.mirrorPosition('G3'),
      'M:'+game.map.mirrorPosition('F3')+':'+game.map.mirrorPosition('E4')
    ].join('|');
    game.enemy.move();
    game.timeout(2000, function () {
      game.turn.el.text(game.data.ui.yourturn);
      game.turn.el.addClass('show');
      game.timeout(2000, game.tutorial.attack);
    });
  },
  attack: function () {
    game.turn.msg.removeClass('tutorialblink');
    game.turn.el.removeClass('show');
    game.tutorial.axe.removeClass('left');
    game.enemy.skills.deck.removeClass('slide');
    $('.enemy.skills .card').fadeOut(400);
    game.tutorial.lesson = 'Attack';
    $('.map .hero').removeClass('done');
    var pos = game.map.getPosition($('.map .enemy.am')),
      range = game.map.getRange(game.data.ui.melee);
    game.map.around(pos, range, function (spot) {
      spot.find('.card.player.hero').addClass('tutorialblink');
    });
    pos = game.map.getPosition($('.map .enemy.pud'));
    game.map.around(pos, range, function (spot) {
      spot.find('.card.player.hero').addClass('tutorialblink');
    });
    $('.map .player.cm').addClass('tutorialblink');
    game.states.table.el.removeClass('unturn');
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeattack);
    game.audio.play('tutorial/axeattack');
    game.message.text(game.data.ui.yourturncount + ' 5');
    game.tutorial.moveCountValue = 5;
    $('.player.hero').on('attack.tutorial', function () {
      game.card.unselect();
      game.tutorial.skillSelect();
    });
  },
  skillSelect: function () {
    game.tutorial.lesson = 'Skill';
    $('.player.hero').removeClass('tutorialblink');
    $('.player.am-shield').addClass('tutorialblink');
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeskillselect);
    $('.player.am-shield').on('select', game.tutorial.selected);
    game.timeout(200, function () {
      $('.player.hero').removeClass('done');
    });
  },
  passiveLesson: function () {
    $('.player.am-shield').removeClass('tutorialblink');
    $('.map .player.hero.am').addClass('tutorialblink');
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeskill);
    $('.card').on('passive.tutorial', game.tutorial.toggleLesson);
  },
  toggleLesson: function () {
    game.tutorial.lesson = 'Toggle';
    $('.map .player.hero.am').removeClass('tutorialblink');
    $('.player.pud-rot').addClass('tutorialblink');
    $('.player.pud-rot').on('select', game.tutorial.selected);
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axetoggle);
  },
  toggleCastLesson: function () {
    $('.player.pud-rot').removeClass('tutorialblink');
    $('.map .player.pud').addClass('tutorialblink');
    $('.card').on('toggle.tutorial', function () {
      game.card.unselect();
      game.tutorial.castLesson();
    });
  },
  castLesson: function () {
    game.tutorial.lesson = 'Cast';
    $('.map .player.pud').removeClass('tutorialblink');
    $('.player.cm-slow').addClass('tutorialblink');
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axecast);
    $('.card').on('cast.tutorial', function () {
      game.timeout(2000, game.tutorial.end);
    });
  },
  surrender: function() {
    game.states.changeTo('menu');
  },
  end: function () {
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeend);
    game.audio.play('tutorial/axeah');
    game.message.text(game.data.ui.win);
    game.winner = game.player.name;
    game.states.table.showResults();
    game.states.table.el.addClass('over');
    game.db({
      'set': 'chat',
      'data': game.player.name + ' ' + game.data.ui.completedtutorial
    }, function (chat) {
      game.chat.update(chat);
    });
  },
  clear: function () {
    game.tutorial.lesson = '';
    game.tutorial.started = false;
    game.tutorial.waited = false;
    localStorage.removeItem('mode');
    if (game.tutorial.axe) {
      game.tutorial.axe.appendTo(game.states.choose.el);
      game.tutorial.axe.removeClass('up');
      game.tutorial.axe.removeClass('left');
      game.tutorial.axebaloon.hide();
    }
  }
};
