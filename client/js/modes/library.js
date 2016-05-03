game.library = {
  build: function () {
    if (!game.library.builded) {
      game.library.builded = true;
      game.library.skills = game.deck.build({
        name: 'skills',
        display: true,
        cb: function (deck) {
          deck.addClass('library').hide().appendTo(game.states.choose.el);
          $.each(deck.data('cards'), function (i, skill) {
            skill.addClass('player skill');
          });
        }
      });
//       game.library.axe = $('<div>').addClass('axe library');      
//       game.library.axeimg = $('<div>').addClass('img').appendTo(game.library.axe);
//       game.library.axebaloon = $('<div>').addClass('baloon').appendTo(game.library.axe);
//       game.library.message = $('<div>').addClass('txt').appendTo(game.library.axebaloon);
//       game.library.axe.appendTo(game.states.choose.el);
    }
    game.library.start();
  },


  start: function () {
    game.loader.removeClass('loading');
    game.mode = 'library';
    game.seed = new Date().valueOf();
    game.id = btoa(game.seed);
    game.message.text(game.data.ui.library);
    game.states.choose.counter.show().text(game.data.ui.clickpick);
    game.enemy.name = 'axe';
    game.enemy.type = 'challenged';
    game.player.type = 'challenger';
    game.states.choose.pickedbox.show();
    game.states.choose.librarytest.show();
    game.states.choose.randombt.hide();
    game.states.choose.mydeck.hide();
    game.states.choose.counter.text(game.data.ui.skills);
    game.library.choose(game.states.choose.pickDeck.children().first(), true);

//    game.library.message.html(game.data.ui.axepick);
//    game.library.axeshow();
  },
//   axeshow: function () {
//     game.timeout(2000, function () {
//       game.library.axe.addClass('up');
//       game.timeout(400, function () {
//         game.audio.play('library/axehere');
//         game.library.axebaloon.fadeIn('slow');
//         game.message.text(game.data.ui.librarystart);
//         game.loader.removeClass('loading');
//       });
//     });
//   },

  choose: function (card, build) {    
    var hero = card.data('hero'),
        heroSkills;
    if (build || hero !== $('.choose .card.selected').data('hero')) {
      game.states.choose.counter.text(card.data('name') + ' ' + game.data.ui.skills);      
      $('.slot .card.skills').appendTo(game.library.skills);
      $('.library.skills .'+hero+'.skill').each(function (i) {
        $(game.states.choose.pickedbox.children()[i]).show().append(this);
      });
      game.states.choose.pickedbox.hide();
      game.states.choose.pickedbox.fadeIn('slow');
      $('.slot:empty').hide();
    }
  },
  heroesdeck: function () {
    game.player.picks = [];
    $('.slot').each(function () {
      var slot = $(this), card = slot.find('.card');
      game.player.picks[slot.data('slot')] = card.data('hero');
      if (game.player.picks.length === 5) {
        game.states.choose.clear();
        game.states.changeTo('table');
      }
    });
  },
  setTable: function () {
    if (!game.library.started) {
      game.library.started = true;
      game.message.text(game.data.ui.battle);
      game.loader.removeClass('loading');
      game.audio.play('horn');
      game.tower.place();
      game.tree.place();
      game.library.placePlayerHeroes();
      game.library.placeEnemyHeroes();
      game.states.table.buildUnits();
      game.library.axe.removeClass('up').appendTo(game.states.table.el);
      game.library.axebaloon.hide();
      game.states.table.time.text(game.data.ui.time + ': 0:00 ' + game.data.ui.day);
      game.player.kills = 0;
      game.enemy.kills = 0;
      game.timeout(400, function () {
        game.message.text(game.data.ui.yourturncount + ' 10');
        game.library.axe.addClass('up');
        game.timeout(800, game.library.selectEnemyLesson);
      });
    }
  },
  placePlayerHeroes: function () {
    game.player.mana = 0;
    game.player.heroesDeck = game.deck.build({
      name: 'heroes',
      filter: game.player.picks,
      cb: function (deck) {
        deck.addClass('player').appendTo(game.states.table.player);
        var x = 1, y = 4;
        $.each(deck.data('cards'), function (i, card) {
          var p = game.player.picks.indexOf(card.data('hero'));
          card.addClass('player hero').data('side', 'player').on('select', game.library.selected);
          card.place(game.map.toId(x + p, y));
          game.player.mana += card.data('mana');
        });
      }
    });
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
          card.addClass('enemy hero').data('side', 'enemy').on('select', game.library.selected);
          card.place(game.map.mirrorPosition(game.map.toId(x + p, y)));
        });
      }
    });
  },
  selectEnemyLesson: function () {
    game.library.lesson = 'Enemy';
    game.library.axebaloon.fadeIn('slow');
    game.library.message.html(game.data.ui.axeselectenemy);
    game.message.text(game.data.ui.yourturncount + ' 9');
    $('.map .enemy.tower').addClass('libraryblink').on('mousedown touchstart', game.card.select).on('select', game.library.selected);
  },
  selected: function (event, data) { 
    var card = data.card; //console.log('library select', card[0]);
    if (card.hasClass('libraryblink')) {
      if (game.library.lesson === 'Enemy') {
        game.library.hoverLesson();
      }
      if (game.library.lesson === 'Player') {
        game.library.moveLesson();
      }
      if (game.library.lesson === 'Skill') {
        game.library.skillLesson();
      }
    }
    return card;
  },
  hoverLesson: function () {
    game.library.lesson = 'Hover';
    game.library.axebaloon.hide().fadeIn('slow');
    game.library.message.html(game.data.ui.axezoom);
    game.message.text(game.data.ui.yourturncount + ' 8');
    game.states.table.selectedArea.addClass('libraryblink');
    game.states.table.selectedArea.on('mouseover touchstart', '.card', game.library.hovered);
    $('.map .enemy.tower').removeClass('libraryblink').clearEvents();
    $('.map .card').on('mousedown touchstart', game.card.select);   //console.log('library hover');
  },
  hovered: function () {
    if (game.library.lesson === 'Hover') {
      game.library.lesson = '';
      var card = $(this);
      game.states.table.selectedArea.removeClass('libraryblink').off('mouseover touchstart');
      $('.map .enemy.tower').removeClass('libraryblink');      
      game.library.unselectLesson();
    }
  },
  unselectLesson: function () {
    game.library.lesson = 'Unselect';
    game.library.axebaloon.hide().fadeIn('slow');
    game.library.message.html(game.data.ui.axeunselect);
    game.message.text(game.data.ui.yourturncount + ' 7');
    game.states.table.enableUnselect();
  },
  unselected: function () {
    if (game.library.lesson === 'Unselect') {
      game.library.lesson = '';
      game.library.selectPlayerLesson();
    }
  },
  selectPlayerLesson: function () {
    game.library.lesson = 'Player';
    $('.map .player.hero').addClass('libraryblink');
    game.library.axe.removeClass('left');
    game.library.axebaloon.hide().fadeIn('slow');
    game.library.message.html(game.data.ui.axeselectplayer);
    game.message.text(game.data.ui.yourturncount + ' 6');
    game.status = 'turn';
    //game.timeout(100, game.card.unselect);
  },
  moveLesson: function () {
    game.library.axebaloon.hide().fadeIn('slow');
    game.library.message.html(game.data.ui.axemove);
    if (game.library.lesson !== 'Move') {
      game.library.lesson = 'Move';
      game.audio.play('library/axemove');
      game.message.text(game.data.ui.yourturncount + ' 5');
      game.library.moveCountValue = 5;
      $('.map .hero.player').on('move', game.library.moveCount);
    }
  },
  moveCount: function (event, data) {//console.log('moveCount', event, data);
    data.card.removeClass('libraryblink');
    game.library.moveCountValue--;
    game.message.text(game.data.ui.yourturncount + ' ' + game.library.moveCountValue);
    if (game.library.moveCountValue === 0) game.library.moveDone();
  },
  moveDone: function () {
    if (!game.turn.el) {
      game.turn.el = $('<h1>').addClass('turntitle').appendTo(game.states.table.el);
    }
    game.timeout(1000, function () {
      game.turn.el.text(game.data.ui.enemyturn);
      game.turn.el.addClass('show');
      game.timeout(3000, function () {
        game.turn.el.removeClass('show');
        game.library.axe.addClass('left');
        game.library.axebaloon.hide().fadeIn('slow');
        game.library.message.html(game.data.ui.axedone);
        game.message.text(game.data.ui.enemyturncount + ' 3');
        game.message.addClass('libraryblink');
        game.loader.addClass('loading');
        game.status = 'unturn';
        game.timeout(5000, game.library.wait);
      });
    });
  },
  wait: function () {
    game.library.axebaloon.hide().fadeIn('slow');
    game.library.message.html(game.data.ui.axewait);
    game.message.text(game.data.ui.enemyturncount + ' 2');
    game.audio.play('library/axetime');
    game.states.table.time.text(game.data.ui.time + ': 1:30 ' + game.data.ui.night);
    game.message.removeClass('libraryblink');
    game.states.table.time.addClass('libraryblink');
    game.timeout(5000, game.library.time);
  },
  time: function () {
    game.library.axebaloon.hide().fadeIn('slow');
    game.message.text(game.data.ui.enemyturncount + ' 1');
    game.library.message.html(game.data.ui.axetime);
    game.states.table.time.removeClass('libraryblink');
    game.states.table.turns.addClass('libraryblink');
    game.states.table.turns.text(game.data.ui.turns + ': 1/1 (2)');
    game.timeout(5000, game.library.enemyMove);
    game.library.buildSkills();
  },
  enemyMove: function () {
    game.library.axebaloon.hide().fadeIn('slow');
    game.library.message.html(game.data.ui.axeenemymove);
    game.message.html(game.data.ui.enemymove);
    game.audio.play('library/axewait');
    game.states.table.turns.removeClass('libraryblink');
    game.currentData = {
      moves: [
        'M:'+game.map.mirrorPosition('D2')+':'+game.map.mirrorPosition('C3'),
        'M:'+game.map.mirrorPosition('F2')+':'+game.map.mirrorPosition('F3'),
        'M:'+game.map.mirrorPosition('H2')+':'+game.map.mirrorPosition('G3'),
        'M:'+game.map.mirrorPosition('F3')+':'+game.map.mirrorPosition('E4')
      ].join('|')
    };
    game.enemy.move();
    game.timeout(2000, function () {
      game.turn.el.text(game.data.ui.yourturn);
      game.turn.el.addClass('show');
      game.timeout(3000, game.library.attack);
    });
  },
  attack: function () {
    game.turn.el.removeClass('show');
    game.library.axe.removeClass('left');
    game.enemy.skills.deck.removeClass('slide');
    $('.enemy.skills .card').fadeOut(400);
    game.library.lesson = 'Attack';
    $('.map .hero').removeClass('done');
    var pos = game.map.getPosition($('.map .enemy.am')),
      range = game.map.getRange(game.data.ui.ranged);
    game.map.around(pos, range, function (spot) {
      spot.find('.card.player.hero').addClass('libraryblink');
    });
    pos = game.map.getPosition($('.map .enemy.pud'));
    game.map.around(pos, range, function (spot) {
      spot.find('.card.player.hero').addClass('libraryblink');
    });
    var heroes = $('.card.libraryblink');
    if (heroes.length === 0) $('.map .card.player.hero').addClass('libraryblink');
    game.status = 'turn';
    game.library.axebaloon.hide().fadeIn('slow');
    game.library.message.html(game.data.ui.axeattack);
    game.audio.play('library/axeattack');
    game.message.text(game.data.ui.yourturncount + ' 5');
    game.library.moveCountValue = 5;
    $('.player.hero').on('attack.library', game.library.skillSelect);
  },
  buildSkills: function () {
    game.player.skills = {};
    game.player.skills.hand = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills hand');
    game.player.skills.sidehand = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills sidehand');
    game.player.skills.temp = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills temp');
    game.player.skills.ult = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills ult');
    game.player.skills.cemitery = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills cemitery');
    game.player.skills.deck = game.deck.build({
      name: 'skills',
      filter: [game.player.picks[3], game.player.picks[4]],
      cb: function (deck) {
        deck.addClass('player available').hide().appendTo(game.states.table.player);
        $.each(deck.data('cards'), function (i, skill) {
          skill.addClass('player skill').data('side', 'player').on('mousedown touchstart', game.card.select).on('select', game.library.selected);
        });
      }
    });
    game.enemy.skills = {};
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
  skillSelect: function () {
    game.library.lesson = 'Skill';
    $('.card.enemy.done').removeClass('done');
    game.library.axebaloon.hide().fadeIn('slow');
    game.library.message.html(game.data.ui.axeskillselect);
    game.player.buyHand();
    game.player.skills.hand.show();
    game.player.skills.sidehand.show();
    $('.player.hero').removeClass('libraryblink');
    $('.player.skill').addClass('libraryblink');
    game.timeout(200, function () {
      $('.player.hero').removeClass('done');
    });
  },
  skillLesson: function () {
    game.library.axebaloon.hide().fadeIn('slow');
    game.library.message.html(game.data.ui.axeskill);
    $('.card').on('cast.library', game.library.end);
    $('.card').on('passive.library', game.library.end);
    $('.card').on('toggle.library', game.library.end);
  },
  surrender: function () {
    game.states.table.clear();
  },
  end: function () {
    game.library.axebaloon.hide().fadeIn('slow');
    game.library.message.html(game.data.ui.axeend);
    game.audio.play('library/axeah');
    game.message.text(game.data.ui.win);
    game.winner = game.player.name;
    game.states.table.showResults();
    game.status = 'over';
    game.db({
      'set': 'chat',
      'data': game.player.name + ' ' + game.data.ui.completedlibrary
    }, function (chat) {
      game.chat.update(chat);
    });
  },
  clear: function () {
    game.library.lesson = '';
    game.library.started = false;
//     game.library.axe.removeClass('up');
//     game.library.axe.removeClass('left');
//     game.library.axebaloon.hide();
  }
};
