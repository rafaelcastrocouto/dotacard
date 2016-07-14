game.online = {
  build: function (recover) {
    game.loader.addClass('loading');
    game.states.choose.librarytest.hide();
    game.states.choose.randombt.show().attr({disabled: true});
    game.states.choose.mydeck.show().attr({disabled: true});
    game.states.choose.pickedbox.hide();
    if (recover) game.online.recover();
    else if (!game.online.builded) game.online.start();
  },
  start: function () {
    game.online.builded = true;
    game.currentData = {};
    game.online.newId();
    game.online.setData('id', game.id);
    game.db({ // tell player wants to play
      'set': 'waiting',
      'data': game.currentData
    }, function (waiting) {
      if (waiting.id == 'none') game.online.wait();
      else game.online.found(waiting);
    });
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
      game.online.setData('id', game.id);
      if (game.currentData.status === 'waiting') {
        game.online.wait();
      } else game.reset();
    }
    // todo
  },
  setData: function (item, data) {
    game.currentData[item] = data;
    localStorage.setItem('data', JSON.stringify(game.currentData));
  },
  chooseStart: function () {
    game.states.choose.selectFirst();
  },
  wait: function () {
    game.loader.addClass('loading');
    game.player.type = /* will be */ 'challenged';
    game.online.setData('challenged', game.player.name);
    game.online.setData('status', 'waiting');
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
    if (game.id && game.currentData.status == 'waiting') {
      game.db({ 'get': game.id }, function (found) {
        // asking challenger name
        var name = found.challenger;
        if (name) game.online.newChallenger(name);
        else {
          game.triesCounter.text(game.tries += 1);
          if (game.tries > game.waitLimit) {
            game.message.text(game.data.ui.noenemy);
            game.timeout(2000, game.states.changeTo ,'menu');
          } else { game.timeout(1000, game.online.searching); }
        }
      });
    }
  },
  newChallenger: function (name) {
      game.triesCounter.text('');
      game.online.setData('challenger', name);
      game.online.battle('challenger', name);
  },
  found: function (waiting) {
    game.message.text(game.data.ui.gamefound);
    game.player.type = 'challenger';
    game.online.setId(waiting.id);
    // ask challenged name
    game.db({ 'get': waiting.id }, function (found) {
      var name = found.challenged;
      game.online.setData('challenged', name);
      game.online.setData('challenger', game.player.name);
      // tell challenger name
      game.db({
        'set': game.id,
        'data': game.currentData
      }, function () {
        game.online.battle('challenged', name);
      });
    });
  },
  battle: function (type, name, recover) { //console.trace('battle')
    game.loader.removeClass('loading');
    game.tries = 0;
    game.online.picked = false;
    game.enemy.name = name;
    game.enemy.type = type;
    game.message.html(game.data.ui.battlefound + ' <b>' + game.player.name + '</b> vs <b class="enemy">' + game.enemy.name + '</b>');
    game.states.choose.counter.show();
    game.states.choose.randombt.attr({disabled: false});
    if (localStorage.getItem('mydeck')) game.states.choose.mydeck.attr({disabled: false});
    game.states.choose.enablePick();
    game.online.setData('status', 'battle');
    game.audio.play('battle');
    game.states.choose.count = game.timeToPick;
    game.online.setData('expire', new Date().valueOf() + (game.timeToPick*1000) );
    game.timeout(1000, game.online.pickCount);
  },
  pickCount: function () {
    game.states.choose.count -= 1;
    if ($('.slot.available').length) {
      game.states.choose.counter.text(game.data.ui.pickdeck + ': ' + game.states.choose.count);
    }
    if (game.states.choose.count < 0) {
      game.states.choose.counter.text(game.data.ui.getready);
      if (!game.online.picked) {
        game.states.choose.disablePick();
        game.states.choose.counter.text(game.data.ui.getready);
        game.states.choose.randomFill(game.online.chooseEnd);
      }
    } else { game.timeout(1000, game.online.pickCount); }
  },
  pick: function () {
    if ($('.slot.available').length === 0) {
      if (!game.online.picked) {
        game.online.picked = true;
        game.online.chooseEnd();
      }
    }
  },
  chooseEnd: function () {
    game.states.choose.disablePick();
    game.states.choose.counter.text(game.data.ui.getready);
    game.online.sendDeck(); 
  },
  sendDeck: function () {
    game.states.choose.pickDeck.css('margin-left', 0);
    localStorage.setItem('mydeck', game.player.picks);
    var picks = game.player.picks.join('|');
    // check if enemy picked
    game.db({ 'get': game.id }, function (found) {
      game.online.setData(game.player.type + 'Deck', picks);
      if (found[game.enemy.type + 'Deck']) {
        cb = function () { game.online.foundDeck(game.enemy.type, found); };
      } else cb = function () { game.online.loadDeck(game.enemy.type); };
      game.db({
        'set': game.id,
        'data': game.currentData
      }, cb);
    });
  },
  loadDeck: function (type) {
    game.message.text(game.data.ui.loadingdeck);
    game.loader.addClass('loading');
    game.db({ 'get': game.id }, function (found) {
      if (found[type + 'Deck']) {
        game.online.foundDeck(type, found);
      } else {
        game.triesCounter.text(game.tries += 1);
        if (game.tries > game.connectionLimit) {
          game.reset();
        } else { game.timeout(1000, game.online.loadDeck.bind(this, type)); }
      }
    });
  },
  foundDeck: function (type, found) {
    game.triesCounter.text('');
    var typeDeck = type + 'Deck';
    game.online.setData(typeDeck, found[typeDeck]);
    game.enemy.picks = found[typeDeck].split('|');
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
      game.states.table.surrender.show();
      game.states.table.back.hide();
      game.turn.build();
      game.timeout(100, function () {
        game.states.table.buildSkills('player');
        game.states.table.buildSkills('enemy');
      });
      if (game.player.type === 'challenger') {
        game.states.table.el.addClass('unturn');
        game.turn.el.text(game.data.ui.enemyturn).addClass('show');
        game.timeout(1000, game.online.beginEnemy);
      } else {
        game.states.table.el.removeClass('unturn');
        game.timeout(1000, game.online.beginPlayer);
      }
    }
  },
  placePlayerHeroes: function () {
    if (game.player.picks) {
      game.player.heroesDeck = game.deck.build({
        name: 'heroes',
        filter: game.player.picks,
        cb: function (deck) {
          deck.addClass('player').hide().appendTo(game.states.table.player);
          var x = 1, y = 4;
          $.each(deck.data('cards'), function (i, card) {
            var p = game.player.picks.indexOf(card.data('hero'));
            card.addClass('player').data('side', 'player').on('mousedown touchstart', game.card.select).on('action', game.online.action);
            card.place(game.map.toId(x + p, y));
          });
        }
      });
    }
  },
  placeEnemyHeroes: function () {
    if (game.enemy.picks) {
      game.enemy.heroesDeck = game.deck.build({
        name: 'heroes',
        filter: game.enemy.picks,
        cb: function (deck) {
          deck.addClass('enemy').hide().appendTo(game.states.table.enemy);
          var x = 1, y = 4;
          $.each(deck.data('cards'), function (i, card) {
            var p = game.enemy.picks.indexOf(card.data('hero'));
            card.addClass('enemy').data('side', 'enemy').on('mousedown touchstart', game.card.select);
            card.place(game.map.mirrorPosition(game.map.toId(x + p, y)));
          });
        }
      });
    }
  },
/*
  beginPlayer > turn.beginPlayer > startTurn > turn.count >
    * skip || no-moves-available > preEndPlayer >
    endTurn > game.turn.end > sendTurnData >

  beginEnemy > turn.beginEnemy > startTurn > turn.count >
    * preEndEnemy || getTurnData >
    beginEnemyMoves > endTurn > game.turn.end > beginPlayer...
*/
  beginPlayer: function () {
    game.turn.beginPlayer(function () {
      game.online.startTurn('turn');
      if (game.player.turn === 6) {
        $('.card', game.player.skills.ult).appendTo(game.player.skills.deck);
      } 
      game.player.buyHand();
      game.tower.attack('enemy');
    });
  },
  startTurn: function (unturn) {
    $('.card .damaged').remove();
    $('.card .heal').remove();
    game.turn.counter = game.timeToPlay;
    game.timeout(1000, function () { 
      game.turn.count(unturn, function (unturn) {
        /*every count*/
        if (unturn == 'unturn') game.online.preGetTurnData();
      }, function (unturn) {
        /*on count end*/
        if (unturn == 'unturn') {
          game.tries = 0;
          game.loader.addClass('loading');
          game.message.text(game.data.ui.loadingturn);
          game.online.getTurnData();
        } else game.online.endTurn('turn');
      }); 
    });
  },
  action: function () {
    game.timeout(400, function () {
      if (game.turn.noAvailableMoves()) {
        game.online.preEndPlayer();
      }
    });
  },
  skip: function () {
    if ( game.isPlayerTurn() ) {
      game.turn.counter = -1;
      game.online.preEndPlayer();
    }
  },
  preEndPlayer: function () {
    game.turn.counter = -1;
    game.states.table.el.addClass('unturn');
    game.online.endTurn('turn');
  },
  endTurn: function (unturn) { //console.trace('endturn')
    $('.card .damaged').remove();
    $('.card .heal').remove();
    game.turn.end(unturn, function (unturn) {
      if (unturn === 'unturn') {
        game.online.beginPlayer();
      } else {
        game.online.sendTurnData();
      }
    });
  },
  sendTurnData: function () {
    var challengeTurn = game.player.type + 'Turn';
    game.message.text(game.data.ui.uploadingturn);
    game.online.setData('moves', game.currentMoves.join('|'));
    game.online.setData(challengeTurn, game.player.turn);
    game.db({ 'get': game.id }, function (data) {
      if (data.surrender) {
        game.online.win();
      } else {
        game.db({
          'set': game.id,
          'data': game.currentData
        }, game.online.beginEnemy);
      }
    });
  },
  beginEnemy: function () {
    game.turn.beginEnemy(function () {
      game.online.startTurn('unturn');
      if (game.enemy.turn === 6) {
        $('.card', game.enemy.skills.ult).appendTo(game.enemy.skills.deck);
      }
      game.enemy.buyHand();
    });
  },
  preGetTurnData: function () {
    game.db({ 'get': game.id }, function (data) {
      var challengeTurn = game.enemy.type + 'Turn';
      if (data[challengeTurn] === game.enemy.turn) 
        game.online.preEndEnemy(data);
    });
  },
  preEndEnemy: function (data) {
    game.turn.counter = -1;
    game.online.beginEnemyMoves(data, 'pre');
  },
  getTurnData: function () {
    game.db({ 'get': game.id }, function (data) {
      var challengeTurn = game.enemy.type + 'Turn';
      if (data[challengeTurn] === game.enemy.turn) {
        game.online.beginEnemyMoves(data);
      } else {
        game.tries += 1;
        game.triesCounter.text(game.tries);
        if (game.tries > game.connectionLimit) {
          game.reset();
        } else { game.timeout(1000, game.online.getTurnData); }
      }
    });
  },
  beginEnemyMoves: function (data) {
    if (data.surrender) {
      game.online.win();
    } else {
      game.triesCounter.text('');
      game.online.setData(game.enemy.type, game.enemy.turn);
      game.online.setData('moves', data.moves);
      game.enemy.move();
    }
  },
  win: function () {
    game.winner = game.player.name;
    game.states.table.el.addClass('unturn');
    game.message.text(game.data.ui.win);
    game.online.sendTurnData('over');
    game.states.table.el.addClass('over win');
    game.states.table.showResults();
  },
  surrender: function () {
    game.turn.counter = -1;
    game.online.setData('surrender', true);
    game.online.setData(game.player.type+'Turn', game.player.turn);
    game.db({
      'set': game.id,
      'data': game.currentData
    }, game.online.lose);
  },
  lose: function () {
    game.winner = game.enemy.name;
    game.states.table.el.addClass('unturn');
    game.message.text(game.data.ui.lose);
    game.loader.removeClass('loading');
    game.states.table.el.addClass('over lose');
    game.states.table.showResults();
  },
  clear: function () {
    game.online.builded = false;
    game.online.started = false;
    game.seed = 0;
    game.id = null;
    game.moves = [];
    localStorage.removeItem('data');
    localStorage.removeItem('seed');
    localStorage.removeItem('challenge');
  }
};
