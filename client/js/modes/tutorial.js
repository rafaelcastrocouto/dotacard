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
      game.enemy.picks = [ 'nyx', 'kotl', 'pud', 'ld', 'am' ];
      game.player.placeHeroes();
      game.enemy.placeHeroes();
      game.states.table.surrender.show();
      game.states.table.skip.show().attr('disabled', true);
      game.states.table.discard.attr('disabled', true).show();
      game.turn.build(6);
      game.tutorial.axe.removeClass('up').appendTo(game.states.table.el);
      game.tutorial.axebaloon.hide();
      game.player.kills = 0;
      game.enemy.kills = 0;
      game.tutorial.moveCountValue = 5;
      game.message.text(game.data.ui.yourturncount + ' ' + game.tutorial.moveCountValue);
      game.tutorial.axe.addClass('up left');
      game.states.table.el.removeClass('unturn');
      game.enemy.tower.addClass('tutorialblink').on('select', game.tutorial.selected);
      game.timeout(400, function () {
        game.skill.build('player');
        game.skill.build('enemy');
        game.tutorial.buyHand();
        game.enemy.buyHand();
        game.timeout(400, game.tutorial.selectEnemyLesson);
      });
    }
  },
  buyHand: function () {
    $('.player .available.skills .ld-rabid').first().appendTo(game.player.skills.hand);
    $('.player .available.skills .cm-slow').first().appendTo(game.player.skills.hand);
    $('.player .available.skills .am-shield').first().appendTo(game.player.skills.sidehand);
    $('.player .available.skills .pud-rot').first().appendTo(game.player.skills.sidehand);
  },
  selectEnemyLesson: function () {
    game.turn.time.text(game.data.ui.time + ': 1:00 ' + game.data.ui.day);
    game.turn.msg.text(game.data.ui.turns + ': 1/0 (1)');
    game.tutorial.axebaloon.fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeselectenemy);
  },
  selected: function (event, data) {
    var card = data.card;
    if (card.find('.tutorialblink')) {
      if (game.tutorial.lesson === 'Enemy')  game.tutorial.unselectLesson();
      if (game.tutorial.lesson === 'Move')   game.tutorial.selectedPlayer();
      if (game.tutorial.lesson === 'Skill')  game.tutorial.passiveLesson();
      if (game.tutorial.lesson === 'Toggle') game.tutorial.toggleCastLesson();
      if (game.tutorial.lesson === 'Cast')   game.tutorial.castSelectedLesson();
    }
    return card;
  },
  unselectLesson: function () {
    $('.map .towers.enemy').removeClass('tutorialblink').off('select');
    game.audio.play('tutorial/axeah');
    game.tutorial.lesson = 'Unselect';
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeunselect);
    game.states.table.enableUnselect();
  },
  unselected: function () {
    if (game.tutorial.lesson === 'Unselect') {
      game.tutorial.lesson = '';
      game.tutorial.moveLesson();
    }
  },
  moveLesson: function () {
    game.tutorial.lesson = 'Move';
    $('.map .player.heroes').addClass('tutorialblink');
    game.tutorial.axe.removeClass('left');
    game.audio.play('tutorial/axemove');
    game.tutorial.axebaloon.hide().delay(800).fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeselectplayer);
    game.tutorial.axebaloon.hide().fadeIn('slow');
    $('.spot.row5, .spot.row6').removeClass('free');
    $('.map .heroes.player').on('move', game.tutorial.moveCount);
  },
  selectedPlayer: function () {
    if (!this.once) {
      this.once = 1;
      game.tutorial.axebaloon.hide().fadeIn('slow');
      game.tutorial.message.html(game.data.ui.axemove);
    }
  },
  moveCount: function (event, data) {  //console.trace('moveCount', event, data);
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
  enemyTime: 6000,
  skip: function () {
    game.states.table.skip.removeClass('tutorialblink');
    $('.map .heroes.player').removeClass('tutorialblink');
    game.message.addClass('tutorialblink');
    if (!game.tutorial.waited) game.tutorial.moveCountValue = 4;
    else game.tutorial.moveCountValue = 2;
    game.tutorial.axebaloon.hide();
    game.tutorial.axe.addClass('left');
    game.message.text(game.data.ui.enemyturncount + ' ' + --game.tutorial.moveCountValue);
    game.loader.addClass('loading');
    game.turn.el.text(game.data.ui.enemyturn);
    game.turn.el.addClass('show');
    game.states.table.el.addClass('unturn');
    game.map.el.addClass('night');
    game.timeout(2000, function () {
      game.turn.el.removeClass('show');
      game.tutorial.axebaloon.fadeIn('slow');
      game.tutorial.message.html(game.data.ui.axedone);
      game.timeout(game.tutorial.enemyTime, game.tutorial.wait);
    });
  },
  wait: function () {
    game.message.removeClass('tutorialblink');
    game.turn.time.addClass('tutorialblink');
    game.tutorial.waited = true;
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axewait);
    game.message.text(game.data.ui.enemyturncount + ' ' + --game.tutorial.moveCountValue);
    game.audio.play('tutorial/axetime');
    game.turn.time.text(game.data.ui.time + ': 1:30 ' + game.data.ui.night);
    game.timeout(game.tutorial.enemyTime, game.tutorial.time);
  },
  time: function () {
    game.turn.time.removeClass('tutorialblink');
    game.turn.msg.addClass('tutorialblink');
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.message.text(game.data.ui.enemyturncount + ' ' + --game.tutorial.moveCountValue);
    game.tutorial.message.html(game.data.ui.axetime);
    game.turn.msg.text(game.data.ui.turns + ': 1/1 (2)');
    game.timeout(game.tutorial.enemyTime, game.tutorial.enemyMove);
  },
  enemyMove: function () {
    game.turn.msg.removeClass('tutorialblink');
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeenemymove);
    game.message.html(game.data.ui.enemymove);
    game.audio.play('tutorial/axewait');
    game.currentData.moves = [
      'M:'+game.map.mirrorPosition('D2')+':'+game.map.mirrorPosition('C3'),
      'M:'+game.map.mirrorPosition('F2')+':'+game.map.mirrorPosition('F3'),
      'M:'+game.map.mirrorPosition('H2')+':'+game.map.mirrorPosition('G3')
    ].join('|');
    game.enemy.move();
  },
  playerTurn: function () {
    game.map.el.removeClass('night');
    game.turn.time.text(game.data.ui.time + ': 1:30 ' + game.data.ui.day);
    $('.spot').removeClass('free');
    game.turn.el.text(game.data.ui.yourturn);
    game.turn.el.addClass('show');
    game.tutorial.axebaloon.hide();
    game.timeout(2000, game.tutorial.attack);
  },
  attack: function () {
    game.turn.msg.text(game.data.ui.turns + ': 2/1 (3)');
    game.card.unselect();
    game.turn.el.removeClass('show');
    game.tutorial.axe.removeClass('left');
    game.enemy.skills.deck.removeClass('slide');
    $('.enemy.skills .card').fadeOut(400);
    game.tutorial.lesson = 'Attack';
    $('.map .heroes').removeClass('done');
    $('.map .player.heroes').each(function (i, card) {
      var hero = $(card);
      var pos = game.map.getPosition(hero),
          range = game.map.getRange(hero.data('range'));
      game.map.around(pos, range, function (spot) {
        if (spot.find('.card.enemy.heroes').length) {
          hero.addClass('tutorialblink');
        }
      });
    });
    game.states.table.el.removeClass('unturn');
    game.tutorial.axebaloon.fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeattack);
    game.audio.play('tutorial/axeattack');
    game.message.text(game.data.ui.yourturncount + ' 5');
    game.tutorial.moveCountValue = 5;
    $('.player.heroes').on('attack.tutorial', function () {
      game.card.unselect();
      game.message.text(game.data.ui.yourturncount + ' ' + --game.tutorial.moveCountValue);
      game.tutorial.skillSelect();
    });
  },
  skillSelect: function () {
    game.tutorial.lesson = 'Skill';
    $('.map .player.heroes').removeClass('tutorialblink');
    $('.player .sidehand .am-shield').addClass('tutorialblink').on('select', game.tutorial.selected);
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeskillselect);
    game.timeout(200, function () {
      $('.player.heroes').removeClass('done');
    });
  },
  passiveLesson: function () {
    $('.map .player.heroes.am').addClass('tutorialblink');
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeskill);
    $('.card').on('passive.tutorial', game.tutorial.toggleLesson);
  },
  toggleLesson: function () {
    game.tutorial.lesson = 'Toggle';
    $('.player .sidehand .am-shield').removeClass('tutorialblink');
    $('.map .player.heroes.am').removeClass('tutorialblink');
    $('.player .sidehand .pud-rot').addClass('tutorialblink');
    $('.player .sidehand .pud-rot').on('select', game.tutorial.selected);
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axetoggle);
    game.message.text(game.data.ui.yourturncount + ' ' + --game.tutorial.moveCountValue);
  },
  toggleCastLesson: function () {
    $('.map .player.pud').addClass('tutorialblink');
    $('.card').on('toggle.tutorial', function () {
      game.card.unselect();
      game.tutorial.castLesson();
    });
  },
  castLesson: function () {
    game.timeout(1000, function () {
      game.tutorial.lesson = 'Cast';
      $('.player .sidehand .pud-rot').removeClass('tutorialblink');
      $('.map .player.pud').removeClass('tutorialblink');
      $('.player .hand').addClass('tutorialblink');
      $('.player .hand .cm-slow').on('select', game.tutorial.selected)
      $('.map .player.heroes.ld').addClass('done');
      game.tutorial.axebaloon.hide().fadeIn('slow');
      game.message.text(game.data.ui.yourturncount + ' ' + --game.tutorial.moveCountValue);
      game.tutorial.message.html(game.data.ui.axecast);
    });
  },
  castSelectedLesson: function () {
    $('.player .hand').removeClass('tutorialblink');
    $('.player .hand .cm-slow').addClass('tutorialblink');
    $('.card').on('cast.tutorial', function () {
      game.message.text(game.data.ui.yourturncount + ' ' + --game.tutorial.moveCountValue);
      game.timeout(2000, game.tutorial.end);
    });
  },
  surrender: function() {
    game.clear();
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
    game.chat.set(game.data.ui.completedtutorial);
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
