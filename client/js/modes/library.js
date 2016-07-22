game.library = {
  build: function () {
    if (!game.library.skills) {
      game.library.skills = game.deck.build({
        name: 'skills',
        deckFilter: game.data.ui.buy,
        cb: function (deck) {
          deck.addClass('library').hide().appendTo(game.states.choose.el);
          $.each(deck.data('cards'), function (i, skill) {
            skill.addClass('player');
          });
        }
      });
    }
    game.states.choose.pickedbox.show();
    game.states.choose.librarytest.show();
    game.states.choose.randombt.hide();
    game.states.choose.mydeck.hide();
    game.states.choose.counter.show();
    game.loader.removeClass('loading');
    $('.slot').removeClass('available');
    game.library.start();
  },
  start: function () {
    game.message.text(game.data.ui.library);
    game.states.choose.counter.text(game.data.ui.skills);
    game.seed = new Date().valueOf();
    game.id = btoa(game.seed);
    game.enemy.name = 'axe';
    game.enemy.type = 'challenger';
    game.player.type = 'challenged';
  },
  chooseStart: function (hero) {
    if (hero) game.states.choose.selectHero(hero, 'force');
    else game.states.choose.selectFirst('force');
  },
  select: function (card, force) { 
    var hero = card.data('hero'),
        heroSkills,
        disabled;
    if (force || hero !== $('.choose .card.selected').data('hero')) {
      game.library.hero = card;
      disabled = card.hasClass('dead');
      game.states.choose.counter.text(card.data('name') + ' ' + game.data.ui.skills);
      $('.slot .card.skills').appendTo(game.library.skills);
      heroSkills = $('.library.skills .card.'+hero);
      $('.slot').each(function (i) {
        var skill = $(heroSkills[i]); 
        if (disabled) skill.addClass('dead');
        skill.appendTo(this);
      });
      game.states.choose.pickedbox.hide().fadeIn('slow');
      $('.slot:empty').hide();
    }
  },
  setTable: function () {
    game.library.hero = $('.pickbox .selected');
    var hero = game.library.hero.data('hero');
    if (!hero) hero = localStorage.getItem('choose');
    game.player.picks = [hero];
    game.enemy.picks = [ 'nyx', 'kotl', 'pud', 'ld', 'am' ];
    game.player.placeHeroes();
    game.enemy.placeHeroes();
    game.states.table.back.show();
    game.states.table.skip.attr('disabled', true).show();
    game.states.table.discard.attr('disabled', true).show();
    game.states.table.enableUnselect();
    game.player.kills = 0;
    game.enemy.kills = 0;
    game.library.firstSelect = false;
    game.turn.build(6);
    game.message.text(game.data.ui.library +' '+ game.library.hero.data('name'));    
    game.timeout(100, function () {
      game.skill.build('player', 'single');
      game.skill.build('enemy');
      game.turn.beginPlayer(function () {
        game.library.startTurn('turn');
      });
    });
  },
  startTurn: function (unturn) {
    if (unturn === 'turn') {
      if (!game.library.firstSelect) {
        game.library.firstSelect = true;
        $('.card', game.player.skills.ult).appendTo(game.player.skills.deck);
        $('.card', game.player.skills.deck).each(function () {
          var card = $(this);
          if (card.data('hand') === game.data.ui.right) {
            card.appendTo(game.player.skills.hand);
          } else {
            card.appendTo(game.player.skills.sidehand);
          }
          game.library.hero.select();
        });
      }
      game.tower.attack('enemy');
    } else {
      game.enemy.buyHand();
      game.tower.attack('player');
      game.turn.end('unturn', function () {
        game.library.endTurn('unturn');
      });
    }
  },
  action: function () {
    game.timeout(400, function () {
      if (game.turn.noAvailableMoves()) {
         game.library.endPlayerTurn();
      }
    });
  },
  skip: function () {
    if ( game.isPlayerTurn() ) {
      game.library.endPlayerTurn();
    }
  },
  endPlayerTurn: function () {
    game.states.table.el.addClass('unturn');
    game.turn.end('turn', function () {
      game.library.endTurn('turn');
    });
  },
  endTurn: function (unturn) {
    if (unturn === 'unturn') {
      game.turn.beginPlayer(function () {
        game.library.startTurn('turn');
      });
    } else {
      game.turn.beginEnemy(function () {
        game.library.startTurn('unturn');
      });
    }
  },
  clear: function () {
    game.seed = 0;
    game.id = null;
    game.moves = [];
  }
};
