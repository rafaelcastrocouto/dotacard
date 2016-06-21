game.online = {
  build: function (recover) {
    game.loader.addClass('loading');
    game.currentData = {};
    if (!recover && !game.online.builded) {
      game.online.builded = true;
      game.online.newId();
      game.online.setData('id', game.id);
      game.db({ // tell player wants to play
        'set': 'waiting',
        'data': game.currentData
      }, function (waiting) {
        if (game.id !== waiting.id) game.online.found(waiting);
        else game.online.wait();
      });
    } else game.online.recover();
  },
  newId: function () {
    game.seed = new Date().valueOf() + parseInt(Math.random() * 1000);
    game.id = btoa(game.seed);
    localStorage.setItem('seed', game.seed);
  },
  setId: function (id) {
    game.id = id;
    game.seed = parseInt(atob(id), 10);
    localStorage.setItem('seed', game.seed);
  },
  recover: function () { 
    game.id = btoa(game.history.seed);
    if (game.history.data) {
      game.currentData = JSON.parse(game.history.data);
      if (game.currentData.challenged === game.player.name) {
        game.online.wait();
      }
    }
    // todo
  },
  setData: function (item, data) {
    game.currentData[item] = data;
    localStorage.setItem('data', JSON.stringify(game.currentData));
  },
  chooseStart: function () {
    if (!game.online.chooseStarted) {
      game.online.chooseStarted = true;
      game.states.choose.pickedbox.hide();
      game.states.choose.librarytest.hide();
      game.states.choose.randombt.show().attr({disabled: true});
      game.states.choose.mydeck.show().attr({disabled: true});
    }
  },
  wait: function () {
    game.loader.addClass('loading');
    game.player.type = /* will be */ 'challenged';
    game.online.setData('challenged', game.player.name);
    game.db({ // tell challenged name
      'set': game.id,
      'data': game.currentData
    }, function () {
      game.message.text(game.data.ui.waiting);
      game.tries = 0;
      game.online.searching();
    });
  },
  searching: function () {
    game.db({ 'get': game.id }, function (found) {
      // asking challenger name
      if (found.challenger) {
        game.triesCounter.text('');
        game.online.setData('challenger', found.challenger);
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
  found: function (waiting) {
    game.message.text(game.data.ui.gamefound);
    game.player.type = 'challenger';
    game.online.setId(waiting.id);
    // ask challenged name
    game.db({ 'get': waiting.id }, function (found) {
      game.online.setData('challenged', found.challenged);
      game.online.setData('challenger', game.player.name);
      // tell challenger name
      game.db({
        'set': game.id,
        'data': game.currentData
      }, function () {
        game.online.battle(found.challenged, 'challenged');
      });
    });
  },
  battle: function (enemy, challenge) {
    game.loader.removeClass('loading');
    game.tries = 0;
    game.online.picked = false;
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
      if (!game.online.picked) {
        game.online.picked = true;
        game.player.mana = game.states.choose.mana();
        game.player.manaBuild();
        game.states.choose.disablePick();
        game.online.sendDeck();
      }
      game.states.choose.counter.text(game.data.ui.startsin + ': ' + game.states.choose.count + ' ' + game.data.ui.cardsperturn + ': ' + game.player.cardsPerTurn);
    } else { game.states.choose.counter.text(game.data.ui.pickdeck + ': ' + game.states.choose.count); }
  },
  pickCount: function () {
    game.states.choose.count -= 1;
    if ($('.slot.available').length !== 0) {
      game.states.choose.counter.text(game.data.ui.pickdeck + ': ' + game.states.choose.count);
    } else {
      game.states.choose.counter.text(game.data.ui.startsin + ': ' + game.states.choose.count + ' ' + game.data.ui.cardsperturn + ': ' + game.player.cardsPerTurn);
    }
    if (game.states.choose.count < 0) {
      game.states.choose.counter.text(game.data.ui.getready);
      if (!game.online.picked) {
        game.states.choose.disablePick();
        game.states.choose.randomFill(game.online.sendDeck);
      }
    } else { game.timeout(1000, game.online.pickCount); }
  },
  sendDeck: function () {
    game.states.choose.pickDeck.css('margin-left', 0);
    localStorage.setItem('mydeck', game.player.picks);
    var picks = game.player.picks.join('|');
    // check if enemy picked
    game.db({ 'get': game.id }, function (found) {
      if (game.player.type === 'challenged') {
        game.online.setData('challengedDeck', picks);
        if (found.challengerDeck) {
          game.db({
            'set': game.id,
            'data': game.currentData
          });
          game.online.foundChallengerDeck(found);
        } else game.db({
          'set': game.id,
          'data': game.currentData
        }, game.online.getChallengerDeck);
      } else if (game.player.type === 'challenger') {
        game.online.setData('challengerDeck', picks);
        if (found.challengedDeck) {
          game.db({
            'set': game.id,
            'data': game.currentData
          });
          game.online.foundChallengedDeck(found);
        } else game.db({
          'set': game.id,
          'data': game.currentData
        }, game.online.getChallengedDeck);
      }
    });
  },
  getChallengerDeck: function () {
    game.message.text(game.data.ui.loadingdeck);
    game.loader.addClass('loading');
    game.db({ 'get': game.id }, function (found) {
      if (found.challengerDeck) {
        game.online.foundChallengerDeck(found);
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
        game.online.foundChallengedDeck(found);
      } else {
        game.triesCounter.text(game.tries += 1);
        if (game.tries > game.connectionLimit) {
          game.reset();
        } else { game.timeout(1000, game.online.getChallengedDeck); }
      }
    });
  },
  foundChallengerDeck: function (found) {
    game.triesCounter.text('');
    game.online.setData('challengerDeck', found.challengerDeck);
    game.enemy.picks = found.challengerDeck.split('|');
    game.states.choose.clear();
    game.states.changeTo('table');
  },
  foundChallengedDeck: function (found) {
    game.triesCounter.text('');
    game.online.setData('challengedDeck', found.challengedDeck);
    game.enemy.picks = found.challengedDeck.split('|');
    game.states.choose.clear();
    game.states.changeTo('table');
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
        game.turn.el.text(game.data.ui.enemyturn).addClass('show');
        game.states.table.el.addClass('unturn');
        game.timeout(2000, game.turn.beginEnemy);
      } else {
        game.timeout(2000, game.online.beginPlayer);
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
            card.addClass('player hero').data('side', 'player').on('mousedown touchstart', game.card.select).on('action', game.online.action);
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
  beginPlayer: function () {
    game.currentMoves = [];
    game.turn.beginPlayer();
  },
  startTurn: function (unturn) {
    $('.card .damaged').remove();
    $('.card .heal').remove();
    game.turn.counter = game.timeToPlay;
    if (game.turn === 6) {
      $('.card', game.states.table.playerUlts).appendTo(game.player.skills.deck); 
    }
    game.timeout(1000, function () { game.turn.count(unturn); });
  },
  action: function () {
    $(this).addClass('done');
    if ($('.map .player.card:not(.tower)').length == $('.map .player.card.done:not(.tower)').length) {
      game.online.endPlayerTurn();
    }
  },
  preGetData: function () {
    game.db({ 'get': game.id }, function (data) {
      var challengeTurn = game.enemy.type + 'Turn';
      if (data[challengeTurn] === game.enemy.turn) {
        game.turn.counter = -1;
        game.online.setData(challengeTurn, data[challengeTurn]);
        game.online.setData('moves', data.moves);
        game.turn.end('unturn'); 
      }
    });
  },
  skip: function () {
    if (!game.states.table.el.hasClass('unturn')) {
      game.online.endPlayerTurn();
    }
  },
  endPlayerTurn: function () {
    game.turn.counter = -1;
    game.states.table.el.addClass('unturn');
    game.turn.end('turn');
  },
  endTurn: function (unturn) {
    $('.card .damaged').remove();
    $('.card .heal').remove();
    if (unturn === 'unturn') {
      game.loader.addClass('loading');
      game.message.text(game.data.ui.loadingturn);
      game.tries = 0;
      setTimeout(game.online.getData, 1000);
    } else game.timeout(1000, game.online.sendData);
  },
  getData: function () {
    game.db({ 'get': game.id }, function (data) {
      var challengeTurn = game.enemy.type + 'Turn';
      if (data[challengeTurn] === game.enemy.turn) {
        game.triesCounter.text('');
        game.online.setData(challengeTurn, data[challengeTurn]);
        game.online.setData('moves', data.moves);
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
      game.online.beginPlayer();
    }
  },
  sendData: function () {
    var challengeTurn = game.player.type + 'Turn';
    game.message.text(game.data.ui.uploadingturn);
    game.online.setData(challengeTurn, game.player.turn);
    game.online.setData('moves', game.currentMoves.join('|'));
    game.db({
      'set': game.id,
      'data': game.currentData
    }, game.turn.beginEnemy);
  },
  win: function () {
    game.winner = game.player.name;
    game.states.table.el.removeClass('unturn');
    game.message.text(game.data.ui.win);
    game.online.sendData();
    game.states.table.el.addClass('over');
    game.states.table.showResults();
  },
  surrender: function () {
    game.db({
      'set': 'surrender',
      'data': game.id
    }, game.online.lose);
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
    game.online.chooseStarted = false;
    game.online.started = false;
    game.seed = 0;
    game.id = null;
    localStorage.setItem('data', '');
    localStorage.setItem('seed', '');
  }
};
