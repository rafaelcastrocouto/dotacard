game.library = {
  build: function (recover) {
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
    }
    game.library.start(recover);
  },
  start: function (recover) {
    game.loader.removeClass('loading');
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
    if (!recover) game.library.choose(game.states.choose.pickDeck.children().first(), true);
  },
  choose: function (card, build) {    
    var hero = card.data('hero'),
        heroSkills,
        disabled;
    if (build || hero !== $('.choose .card.selected').data('hero')) {
      game.player.picks = [hero];
      game.library.hero = card;
      disabled = card.hasClass('dead');
      game.states.choose.counter.text(card.data('name') + ' ' + game.data.ui.skills);      
      $('.slot .card.skills').appendTo(game.library.skills);
      $('.library.skills .'+hero+'.skill').each(function (i) {
        $(game.states.choose.pickedbox.children()[i]).show().append(this);
        if (disabled) $(this).addClass('dead');
      });
      game.states.choose.pickedbox.hide();
      game.states.choose.pickedbox.fadeIn('slow');
      $('.slot:empty').hide();
    }
  },
  setTable: function () {
    if (!game.library.started) {
      game.library.started = true;      
      game.loader.removeClass('loading');      
      game.audio.play('horn');
      game.tower.place();
      game.tree.place();      
      if (!game.library.hero) {
        var hero = localStorage.getItem('library');
        game.library.hero = $('.pickbox .'+hero);
        game.player.picks = [hero];
      }
      game.library.placePlayerHeroes();
      game.library.placeEnemyHeroes();
      game.library.buildSkills();
      game.states.table.buildUnits();
      game.states.table.time.text(game.data.ui.time + ': 0:00 ' + game.data.ui.day);
      game.player.kills = 0;
      game.enemy.kills = 0;
      game.timeout(400, function () {
        game.status = 'turn';
        game.message.text(game.data.ui.library +' '+ game.library.hero.data('name'));
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
        var card = deck.data('cards')[0];
        card.addClass('player hero').data('side', 'player').on('mousedown touchstart', game.card.select);
        card.place(game.map.toId(4, 4));
        game.player.mana = card.data('mana');
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
          card.addClass('enemy hero').data('side', 'enemy').on('mousedown touchstart', game.card.select);
          card.place(game.map.mirrorPosition(game.map.toId(x + p, y)));
        });
      }
    });
  },
  buildSkills: function () {
    game.player.skills = {};
    game.player.skills.hand = $('<div>').appendTo(game.states.table.player).addClass('player deck skills hand');
    var hero = game.library.hero.data('hero');
    $('.library.skills .'+hero+'.skill').each(function (i, skill) {
      $(skill).clone(true).off().appendTo(game.player.skills.hand).data('side', 'player').on('mousedown touchstart', game.card.select);
    });
    game.player.skills.sidehand = $('<div>').appendTo(game.states.table.player).addClass('player deck skills sidehand');
    game.player.skills.temp = $('<div>').appendTo(game.states.table.player).addClass('player deck skills temp');
    game.player.skills.cemitery = $('<div>').appendTo(game.states.table.player).addClass('player deck skills cemitery');
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
  turnDone: function () {
    if (!game.turn.el) {
      game.turn.el = $('<h1>').addClass('turntitle').appendTo(game.states.table.el);
    }
    game.timeout(1000, function () {
      game.turn.el.text(game.data.ui.enemyturn);
      game.turn.el.addClass('show');
      game.timeout(3000, function () {
        game.turn.el.removeClass('show');
        game.library.message.html(game.data.ui.axedone);
        game.message.text(game.data.ui.enemyturncount + ' 3');
        game.message.addClass('libraryblink');
        game.loader.addClass('loading');
        game.status = 'unturn';
        game.timeout(5000, game.library.newTurn);
      });
    });
  },
  newTurn: function () {
    game.library.axebaloon.hide().fadeIn('slow');
    game.library.message.html(game.data.ui.axeenemymove);
    game.message.html(game.data.ui.enemymove);
    game.audio.play('library/axewait');
    game.states.table.turns.removeClass('libraryblink');
//     game.currentData = {
//       moves: [
//         'M:'+game.map.mirrorPosition('D2')+':'+game.map.mirrorPosition('C3'),
//         'M:'+game.map.mirrorPosition('F2')+':'+game.map.mirrorPosition('F3'),
//         'M:'+game.map.mirrorPosition('H2')+':'+game.map.mirrorPosition('G3'),
//         'M:'+game.map.mirrorPosition('F3')+':'+game.map.mirrorPosition('E4')
//       ].join('|')
//     };
//     game.enemy.move();
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
  surrender: function () {
    game.library.clear();
    game.states.table.clear();
    game.states.changeTo('menu');
  },
  end: function () {
//    game.message.text(game.data.ui.library);
//     game.library.axebaloon.hide().fadeIn('slow');
//     game.library.message.html(game.data.ui.axeend);
//     game.audio.play('library/axeah');
//     game.message.text(game.data.ui.win);
//     game.winner = game.player.name;
//     game.states.table.showResults();
     game.status = 'over';
//     game.db({
//       'set': 'chat',
//       'data': game.player.name + ' ' + game.data.ui.completedlibrary
//     }, function (chat) {
//       game.chat.update(chat);
//     });
  },
  clear: function () {
    game.library.started = false;
  }
};
