game.match = {
  online: function () {
    game.mode = 'online';
    game.seed = new Date().valueOf();
    game.id = btoa(game.seed);
    game.db({
      'set': 'waiting',
      'data': { id: game.id }
    }, function (waiting) {
      if (game.id === waiting.id) {
        game.player.type = 'challenged';
        game.match.wait();
      } else {
        game.id = waiting.id;
        game.seed = parseInt(atob(game.id), 10);
        game.player.type = 'challenger';
        game.match.found();
      }
    });
  },
  wait: function () {
    game.loader.addClass('loading');
    game.currentData.challenged = game.player.name;
    game.db({
      'set': game.id,
      'data': game.currentData
    }, function () {
      game.message.text(game.data.ui.waiting);
      game.tries = 1;
      game.match.search();
    });
  },
  search: function () {
    clearTimeout(game.timeout);
    game.db({ 'get': game.id }, function (found) {
      if (found.challenger) {
        game.triesCounter.text('');
        game.currentData = found;
        game.match.battle.call(game.states.choose, found.challenger, 'challenger');
      } else {
        game.triesCounter.text(game.tries += 1);
        if (game.tries > game.waitLimit) {
          game.message.text(game.data.ui.noenemy);
          setTimeout(function () {
            game.states.changeTo('menu');
          }, 2000);
        } else { game.timeout = setTimeout(game.match.search, 1000); }
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
          game.match.battle(found.challenged, 'challenged');
        });
      } else { game.load.reset(); }
    });
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
    } else { game.states.choose.counter.text(game.data.ui.startsin + ': ' + game.states.choose.count + ' ' + game.data.ui.cardsperturn + ': ' + game.player.cardsPerTurn); }
    if (game.states.choose.count < 0) {
      game.states.choose.counter.text(game.data.ui.getready);
      game.states.choose.disablePick();
      game.match.fillDeck();
    } else { setTimeout(game.match.pickCount, 1000); }
  },
  fillDeck: function () {
    $('.slot').each(function () {
      var slot = $(this), card;
      if (slot.hasClass('available')) {
        card = game.deck.randomCard($('.pickbox .card').not('.dead'), 'noseed');
        slot.append(card).removeClass('available selected');
        game.player.picks[slot.data('slot')] = card.data('hero');
      }
      if ($('.choose .card.selected').length === 0) { game.states.choose.pickDeck.children().first().click(); }
      if (game.player.picks.length === 5) { game.match.sendDeck(); }
    });
  },
  sendDeck: function () {
    game.states.choose.el.removeClass('turn');
    game.states.choose.pickDeck.css('margin-left', 0);
    game.states.choose.tries = 1;
    if (game.player.type === 'challenged') {
      game.currentData.challengedDeck = game.player.picks.join('|');
      game.db({
        'set': game.id,
        'data': game.currentData
      }, function () {
        game.match.getChallengerDeck();
      });
    }
    if (game.player.type === 'challenger') { game.match.getChallengedDeck(); }
  },
  getChallengerDeck: function () {
    clearTimeout(game.timeout);
    game.message.text(game.data.ui.loadingdeck);
    game.loader.addClass('loading');
    game.db({ 'get': game.id }, function (found) {
      if (found.challengerDeck) {
        game.triesCounter.text('');
        game.currentData = found;
        game.enemy.picks = game.currentData.challengerDeck.split('|');
        game.states.choose.reset();
        game.states.changeTo('table');
      } else {
        game.triesCounter.text(game.tries += 1);
        if (game.tries > game.connectionLimit) {
          game.load.reset();
        } else { game.timeout = setTimeout(game.match.getChallengerDeck, 1000); }
      }
    });
  },
  getChallengedDeck: function () {
    clearTimeout(game.timeout);
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
          game.states.choose.reset();
          game.states.changeTo('table');
        });
      } else {
        game.triesCounter.text(game.tries += 1);
        if (game.tries > game.connectionLimit) {
          game.load.reset();
        } else { game.timeout = setTimeout(game.match.getChallengedDeck, 1000); }
      }
    });
  },
  battle: function (enemy, challenge) {
    game.status = 'picking';
    game.loader.removeClass('loading');
    game.states.choose.el.addClass('turn');
    game.enemy.name = enemy;
    game.enemy.type = challenge;
    game.message.html(game.data.ui.battlefound + ' <b>' + game.player.name + '</b> vs <b class="enemy">' + game.enemy.name + '</b>');
    game.states.choose.counter.show();
    game.audio.play('battle');
    game.states.choose.count = game.timeToPick;
    game.states.choose.enablePick();
    setTimeout(game.match.pickCount, 1000);
  },
  start: function () {
    game.states.table.el.click(function (event) {
      var target = $(event.target);
      if (!target.closest('.selected').length && !target.closest('.selectedarea').length) { game.card.unselect(); }
    });
    game.loader.addClass('loading');
    game.message.text(game.data.ui.battle);
    game.audio.play('horn');
    game.match.placePlayerHeroes();
    game.match.placeEnemyHeroes();
    game.match.buildSkills();
    game.tower.place();
    game.tree.place();
    game.states.table.buildUnits();
    game.match.started = true;
    game.turn.build();
    setTimeout(game.turn.begin, 3000);
  },
  placePlayerHeroes: function () {
    if (game.player.picks) {
      game.player.mana = 0;
      game.player.heroesDeck = game.deck.build({
        name: 'heroes',
        filter: game.player.picks,
        cb: function (deck) {
          deck.addClass('player').appendTo(game.states.table.player);
          var x = 0, y = 6;
          $.each(deck.data('cards'), function (i, card) {
            var p = game.player.picks.indexOf(card.data('hero'));
            card.addClass('player hero').data('side', 'player').on('click.select', game.card.select);
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
          var x = 0, y = 6;
          $.each(deck.data('cards'), function (i, card) {
            var p = game.enemy.picks.indexOf(card.data('hero'));
            card.addClass('enemy hero').data('side', 'enemy').on('click.select', game.card.select);
            card.place(game.map.mirrorPosition(game.map.toId(x + p, y)));
            game.enemy.mana += card.data('mana');
          });
        }
      });
    }
  },
  buildSkills: function (single) {
    game.player.manaBuild();
    game.player.skills = {};
    game.player.skills.hand = $('<div>').appendTo(game.states.table.player).addClass('player deck skills hand');
    game.player.skills.sidehand = $('<div>').appendTo(game.states.table.player).addClass('player deck skills sidehand');
    game.player.skills.temp = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills temp');
    game.player.skills.ult = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills ult');
    game.player.skills.cemitery = $('<div>').hide().appendTo(game.states.table.player).addClass('player deck skills cemitery');
    game.player.skills.deck = game.deck.build({
      name: 'skills',
      multi: single ? false : 'cards',
      filter: game.player.picks,
      cb: function (deck) {
        deck.addClass('player available').hide().appendTo(game.states.table.player);
        $.each(deck.data('cards'), function (i, skill) {
          skill.addClass('player skill').data('side', 'player').on('click.select', game.card.select);
          if (skill.data('skill') === 'ult') {
            skill.appendTo(game.player.skills.ult);
          } else if (skill.data('deck') === game.data.ui.temp) {
            skill.appendTo(game.player.skills.temp);
          }
        });
      }
    });
    game.enemy.maxCards = Math.round(game.enemy.mana / 2);
    game.enemy.cardsPerTurn = 1 + Math.round(game.enemy.mana / 10);
    game.enemy.hand = 0;
    game.enemy.skills = {};
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
  sendData: function () {
    game.message.text(game.data.ui.uploadingturn);
    game.currentData[game.player.type + 'Turn'] = game.player.turn;
    game.currentData.moves = game.currentData.moves.join('|');
    game.db({
      'set': game.id,
      'data': game.currentData
    }, function () {
      setTimeout(game.turn.begin, 1000);
    });
  },
  getData: function () {
    game.message.text(game.data.ui.loadingturn);
    clearTimeout(game.timeout);
    game.db({ 'get': game.id }, function (data) {
      if (data[game.enemy.type + 'Turn'] === game.enemy.turn) {
        game.triesCounter.text('');
        game.currentData = data;
        game.enemy.move();
      } else {
        game.tries += 1;
        game.triesCounter.text(game.tries);
        if (game.tries > game.connectionLimit) {
          game.load.reset();
        } else { game.timeout = setTimeout(game.match.getData, 1000); }
      }
    });
  },
  win: function () {
    game.winner = game.player.name;
    game.states.table.el.removeClass('unturn');
    game.states.table.el.addClass('turn');
    game.message.text(game.data.ui.win);
    game.match.sendData();
    game.status = 'over';
    game.states.table.showResults();
  },
  lose: function () {
    game.winner = game.enemy.name;
    game.states.table.el.removeClass('turn');
    game.states.table.el.addClass('unturn');
    game.message.text(game.data.ui.lose);
    game.loader.removeClass('loading');
    game.status = 'over';
    game.states.table.showResults();
  },
  end: function () {
    game.match.started = false;
  }
};
