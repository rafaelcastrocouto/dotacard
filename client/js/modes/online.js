game.online = {
  build: function () {
    game.loader.addClass('loading');
    if (!game.online.builded) {
      game.online.builded = true;
      game.seed = new Date().valueOf();
      game.id = btoa(game.seed);
      game.db({
        'set': 'waiting',
        'data': { id: game.id }
      }, function (waiting) {
        if (game.id === waiting.id) {
          game.player.type = 'challenged';
          game.online.wait();
        } else {
          game.id = waiting.id;
          game.seed = parseInt(atob(game.id), 10);
          game.player.type = 'challenger';
          game.online.found();
        }
      });
    }
    game.online.start();
  },
  start: function () {
    game.states.choose.librarytest.hide();
    game.states.choose.randombt.show().attr({disabled: true});
    game.states.choose.mydeck.show().attr({disabled: true});
  },
  wait: function () {
    game.currentData.challenged = game.player.name;
    game.db({
      'set': game.id,
      'data': game.currentData
    }, function () {
      game.message.text(game.data.ui.waiting);
      game.tries = 1;
      game.online.searching();
    });
  },
  searching: function () {
    game.db({ 'get': game.id }, function (found) {
      if (found.challenger) {
        game.triesCounter.text('');
        game.currentData = found;
        game.online.battle(found.challenger, 'challenger');
      } else {
        game.triesCounter.text(game.tries += 1);
        if (game.tries > game.waitLimit) {
          game.message.text(game.data.ui.noenemy);
          game.timeout(2000, game.states.changeTo ,'menu');
        } else { game.timeout(1000, game.online.searching); }
      }
    });
  },
  found: function () {
    game.message.text(game.data.ui.gamefound);
    game.db({ 'get': game.id }, function (found) {
      if (found.challenged) {
        game.loader.removeClass('loading');
        game.triesCounter.text('');
        game.currentData = found;
        game.currentData.challenger = game.player.name;
        game.db({
          'set': game.id,
          'data': game.currentData
        }, function () {
          game.online.battle(found.challenged, 'challenged');
        });
      } else { game.reset(); }
    });
  },
  battle: function (enemy, challenge) {
    game.loader.removeClass('loading');
    game.enemy.name = enemy;
    game.enemy.type = challenge;
    game.message.html(game.data.ui.battlefound + ' <b>' + game.player.name + '</b> vs <b class="enemy">' + game.enemy.name + '</b>');
    game.states.choose.counter.show();
    game.audio.play('battle');
    game.states.choose.count = game.timeToPick;
    game.states.choose.randombt.attr({disabled: false});
    if (localStorage.getItem('mydeck')) game.states.choose.mydeck.attr({disabled: false});
    game.states.choose.enablePick();
    game.timeout(1000, game.online.pickCount);
  },
  pick: function () {
    if ($('.slot.available').length === 0) {
      game.states.choose.counter.text(game.data.ui.startsin + ': ' + game.states.choose.count + ' ' + game.data.ui.cardsperturn + ': ' + game.player.cardsPerTurn);
    } else { game.states.choose.counter.text(game.data.ui.pickdeck + ': ' + game.states.choose.count); }
  },
  pickCount: function () {
    game.states.choose.count -= 1;
    if ($('.slot.available').length !== 0) {
      game.states.choose.counter.text(game.data.ui.pickdeck + ': ' + game.states.choose.count);
    } else { 
      game.states.choose.mana();
      game.player.manaBuild();
      game.states.choose.counter.text(game.data.ui.startsin + ': ' + game.states.choose.count + ' ' + game.data.ui.cardsperturn + ': ' + game.player.cardsPerTurn); 
    }
    if (game.states.choose.count < 0) {
      game.states.choose.counter.text(game.data.ui.getready);
      game.states.choose.disablePick();
      game.states.choose.random();
    } else { game.timeout(1000, game.online.pickCount); }
  },
  sendDeck: function () {
    game.states.choose.pickDeck.css('margin-left', 0);
    game.states.choose.tries = 1;
    if (game.player.type === 'challenged') {
      game.currentData.challengedDeck = game.player.picks.join('|');
      game.db({
        'set': game.id,
        'data': game.currentData
      }, function () {
        game.online.getChallengerDeck();
      });
    }
    if (game.player.type === 'challenger') { game.online.getChallengedDeck(); }
  },
  getChallengerDeck: function () {
    game.message.text(game.data.ui.loadingdeck);
    game.loader.addClass('loading');
    game.db({ 'get': game.id }, function (found) {
      if (found.challengerDeck) {
        game.triesCounter.text('');
        game.currentData = found;
        game.enemy.picks = game.currentData.challengerDeck.split('|');
        game.states.choose.clear();
        game.states.changeTo('table');
      } else {
        game.triesCounter.text(game.tries += 1);
        if (game.tries > game.connectionLimit) {
          game.reset();
        } else { game.timeout(1000, game.online.getChallengerDeck); }
      }
    });
  },
  getChallengedDeck: function () {
    game.message.text(game.data.ui.loadingdeck);
    game.loader.addClass('loading');
    game.db({ 'get': game.id }, function (found) {
      if (found.challengedDeck) {
        game.triesCounter.text('');
        game.currentData = found;
        game.currentData.challengerDeck = game.player.picks.join('|');
        game.enemy.picks = game.currentData.challengedDeck.split('|');
        game.db({
          'set': game.id,
          'data': game.currentData
        }, function () {
          game.states.choose.clear();
          game.states.changeTo('table');
        });
      } else {
        game.triesCounter.text(game.tries += 1);
        if (game.tries > game.connectionLimit) {
          game.reset();
        } else { game.timeout(1000, game.online.getChallengedDeck); }
      }
    });
  },
  setTable: function () {
    if (!game.online.started) {
      game.online.started = true;
      game.states.table.enableUnselect();
      game.loader.addClass('loading');
      game.message.text(game.data.ui.battle);
      game.audio.play('horn');
      game.online.placePlayerHeroes();
      game.online.placeEnemyHeroes();
      game.online.buildSkills();
      game.states.table.surrender.show();
      game.states.table.back.hide();
      game.turn.build();
      if (game.player.type === 'challenger') {
        game.states.table.el.addClass('unturn');
        game.timeout(2000, game.turn.beginEnemy);
      } else {
        game.timeout(2000, game.turn.beginPlayer);
      }
    }
  },
  placePlayerHeroes: function () {
    if (game.player.picks) {
      game.player.mana = 0;
      game.player.heroesDeck = game.deck.build({
        name: 'heroes',
        filter: game.player.picks,
        cb: function (deck) {
          deck.addClass('player').appendTo(game.states.table.player);
          var x = 1, y = 4;
          $.each(deck.data('cards'), function (i, card) {
            var p = game.player.picks.indexOf(card.data('hero'));
            card.addClass('player hero').data('side', 'player').on('mousedown touchstart', game.card.select);
            card.place(game.map.toId(x + p, y));
            game.player.mana += card.data('mana');
          });
        }
      });
    }
  },
  placeEnemyHeroes: function () {
    if (game.enemy.picks) {
      game.enemy.mana = 0;
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
    }
  },
  buildSkills: function (single) {
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
          } else if (skill.data('deck') === game.data.ui.temp) {
            skill.appendTo(game.player.skills.sidehand);
          }
        });
      }
    });
    game.enemy.manaBuild();
    game.enemy.skills.deck = game.deck.build({
      name: 'skills',
      filter: game.enemy.picks,
      cb: function (deck) {
        deck.addClass('enemy hand cemitery toggle').appendTo(game.states.table.enemy);
        $.each(deck.data('cards'), function (i, skill) {
          skill.hide().addClass('enemy skill').data('side', 'enemy');
        });
      }
    });
  },
  beginTurn: function () {
    game.currentData.moves = [];
    $('.card .damaged').remove();
    $('.card .heal').remove();
    game.turn.counter = game.timeToPlay;
    if (game.turn === 6) {
      $('.card', game.states.table.playerUlts).appendTo(game.player.skills.deck); 
    }
  },
  startTurnCount: function () {
    game.timeout(1000, function () {
      if (game.states.table.el.hasClass('unturn')) {
        game.states.table.el.removeClass('unturn');
        game.highlight.map();
        game.states.table.skip.attr({disabled: false});
      }
      game.turn.count();
    });
  },
  endTurn: function () {
    $('.card .damaged').remove();
    $('.card .heal').remove();
    if (game.states.table.el.hasClass('unturn')) {
      game.tries = 1;
      setTimeout(game.online.getData, 1000);
    } else {
      game.states.table.skip.attr({disabled: true});
      setTimeout(game.online.sendData, 1000);
    }
  },
  getData: function () {
    game.message.text(game.data.ui.loadingturn);
    game.db({ 'get': game.id }, function (data) {
      if (data[game.enemy.type + 'Turn'] === game.enemy.turn) {
        game.triesCounter.text('');
        game.currentData = data;
        game.enemy.move();
      } else {
        game.tries += 1;
        game.triesCounter.text(game.tries);
        if (game.tries > game.connectionLimit) {
          game.reset();
        } else { game.timeout(1000, game.online.getData); }
      }
    });
  },
  endEnemyTurn: function () {
    if (!game.states.table.el.hasClass('over')) {
      game.enemy.skills.deck.removeClass('slide');
      $('.card.enemy.heroes').removeClass('done');
      $('.enemy.skills .card').hide();
      game.states.table.el.removeClass('unturn');
      game.turn.beginPlayer();
      if (game.selectedCard) { game.selectedCard.select(); }
    }
  },
  sendData: function () {
    game.message.text(game.data.ui.uploadingturn);
    game.currentData[game.player.type + 'Turn'] = game.player.turn;
    game.currentData.moves = game.currentData.moves.join('|');
    game.db({
      'set': game.id,
      'data': game.currentData
    }, game.online.endPlayerTurn);
  },
  endPlayerTurn: function () {
    game.states.table.el.addClass('unturn');
    game.timeout(1000, game.turn.beginEnemy);
  },
  win: function () {
    game.winner = game.player.name;
    game.states.table.el.removeClass('unturn');
    game.message.text(game.data.ui.win);
    //game.online.sendData();
    game.states.table.el.addClass('over');
    game.states.table.showResults();
  },
  surrender: function () {
    game.clearTimeouts();
    game.online.clear();
    game.states.table.clear();
    game.online.lose();
  },
  lose: function () {
    game.winner = game.enemy.name;
    game.states.table.el.addClass('unturn');
    game.message.text(game.data.ui.lose);
    game.loader.removeClass('loading');
    game.states.table.el.addClass('over');
    game.states.table.showResults();
  },
  clear: function () {
    game.online.builded = false;
    game.online.started = false;
  }
};
