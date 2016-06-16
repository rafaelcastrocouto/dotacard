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
    }
    game.library.start();
  },
  start: function () {
    game.loader.removeClass('loading');
    game.seed = new Date().valueOf();
    game.id = btoa(game.seed);
    game.message.text(game.data.ui.library);
    game.states.choose.counter.show().text(game.data.ui.clickpick);
    game.enemy.name = 'axe';
    game.enemy.type = 'challenger';
    game.player.type = 'challenged';
    game.states.choose.pickedbox.show();
    game.states.choose.librarytest.show();
    game.states.choose.randombt.hide();
    game.states.choose.mydeck.hide();
    game.states.choose.counter.text(game.data.ui.skills);
    $('.slot').removeClass('available');
  },
  select: function (card, build) { 
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
      if (!game.library.hero) {
        var hero = localStorage.getItem('choose');
        game.library.hero = $('.pickbox .'+hero);
        game.player.picks = [hero];
      }
      game.library.placePlayerHeroes();
      game.library.placeEnemyHeroes();
      game.library.buildSkills();
      game.states.table.enableUnselect();
      game.states.table.surrender.hide();
      game.states.table.back.show();
      game.states.table.time.text(game.data.ui.time + ': 0:00 ' + game.data.ui.day);
      game.player.kills = 0;
      game.enemy.kills = 0;
      game.turn.build();
      game.timeout(400, function () {
        game.turn.beginPlayer();
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
        game.library.hero = card.addClass('player hero').data('side', 'player').on('mousedown touchstart', game.card.select);
        card.place(game.map.toId(4, 4));        
        game.player.mana = card.data('mana');
        card.on('action', game.library.action).on('death', function (e, evt) {
          game.timeout(450, function (e) {
            var card = $(this), o = $('#E5');
            card.unselect();
            if (!card.hasBuff('wk-ult')) {
              if (o.hasClass('free')) card.place(o);
              else card.place(e.spot);
              card.removeClass('dead').setCurrentHp(card.data('hp'));
            } else {
              game.skills.wk.ult.reborn(card);
            }
            //card.select();
          }.bind(this, evt));
        });
      }
    });
  },
  placeEnemyHeroes: function () {
    game.enemy.mana = 0;
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
          game.enemy.mana += card.data('mana');
        });
      }
    });
  },
  buildSkills: function () {
    game.player.manaBuild();
    game.player.skills.hand = $('<div>').appendTo(game.states.table.player).addClass('player deck skills hand');
    var hero = game.library.hero.data('hero');
    $('.library.skills .'+hero+'.skill').each(function (i, skill) {
      var card = $(skill).clone(true).off().appendTo(game.player.skills.hand).data('side', 'player').on('mousedown touchstart', game.card.select);
      if (card.data('type') === game.data.ui.toggle) {
        game.timeout(800, function () {
          card.appendTo(game.player.skills.sidehand);
        });
      } else if (card.data('type') === game.data.ui.automatic) {
        game.timeout(100, function () {
          var to = game.map.getPosition(game.library.hero);
          card.passive(to);
        });
      }
    });
    game.player.skills.sidehand = $('<div>').appendTo(game.states.table.player).addClass('player deck skills sidehand');
    game.player.skills.cemitery = $('<div>').appendTo(game.states.table.player).addClass('player deck skills cemitery');
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
  startTurn: function (unturn) {
    if (unturn === 'turn') {
      game.timeout(750, function () {
        game.states.table.el.removeClass('unturn');
        game.highlight.map();
      });
    } else {
      game.turn.end(unturn);
    }
  },
  action: function () {
    $(this).addClass('done');
    var done = false;
    if ($('.map .player.card:not(.tower)').length == $('.map .player.card.done:not(.tower)').length) {
      game.states.table.el.addClass('unturn');
      game.turn.end('turn');
    }
  },
  skip: function () {console.log('click skip')
    if (!game.states.table.el.hasClass('unturn')) {
      game.states.table.el.addClass('unturn');
      game.turn.end('turn');
    }
  },
  endTurn: function (unturn) {
    if (unturn === 'unturn') {
      game.turn.beginPlayer();
    } else {
      game.turn.beginEnemy();
    }
  },
  clear: function () {
    game.library.started = false;
  }
};
