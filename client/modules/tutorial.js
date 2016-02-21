game.tutorial = {
  build: function () {
    game.mode = 'tutorial';
    game.seed = new Date().valueOf();
    game.id = btoa(game.seed);
    game.message.text(game.data.ui.waiting);
    game.states.choose.counter.show().text(game.data.ui.rightpick);
    game.enemy.name = 'axe';
    game.enemy.type = 'challenged';
    game.player.type = 'challenger';
    game.states.choose.enablePick();
    if (!game.tutorial.axe) {
      game.tutorial.axe = $('<div>').addClass('axe tutorial');
      game.tutorial.axeimg = $('<div>').addClass('img').appendTo(game.tutorial.axe);
      game.tutorial.axebaloon = $('<div>').addClass('baloon').appendTo(game.tutorial.axe);
      game.tutorial.message = $('<div>').addClass('txt').appendTo(game.tutorial.axebaloon);
    }
    game.tutorial.message.html(game.data.ui.axepick);
    game.tutorial.axe.appendTo(game.states.choose.el);
    game.tutorial.axeshow();
  },
  axeshow: function () {
    setTimeout(function () {
      game.tutorial.axe.addClass('up');
    }, 2000);
    setTimeout(function () {
      game.audio.play('tutorial/axehere');
      game.tutorial.axebaloon.fadeIn('slow');
      game.message.text(game.data.ui.tutorialstart);
      game.loader.removeClass('loading');
    }, 2400);
  },
  pick: function () {
    game.tutorial.oldAvailableSlots = 5;
    var availableSlots = $('.slot.available').length;
    if (availableSlots === 4) {
      game.tutorial.message.html(game.data.ui.axeheroes);
    } else if (availableSlots === 3) {
      game.tutorial.message.html(game.data.ui.axemaxcards);
    } else if (availableSlots === 2) {
      game.tutorial.message.html(game.data.ui.axecardsperturn);
    } else if (availableSlots === 1) {
      game.tutorial.message.html(game.data.ui.axeautodeck);
    }
    if (availableSlots < game.tutorial.oldAvailableSlots) {
      game.tutorial.axebaloon.hide().fadeIn('slow');
    }
    if (availableSlots) {
      game.states.choose.counter.text(availableSlots + ' ' + game.data.ui.togo + '. ' + game.data.ui.cardsperturn + ': ' + game.player.cardsPerTurn);
    } else {
      game.message.text(game.data.ui.getready);
      game.states.choose.counter.text(game.data.ui.cardsperturn + ': ' + game.player.cardsPerTurn);
      game.tutorial.axe.addClass('left');
      game.audio.play('tutorial/axebattle');
      game.tutorial.message.html(game.data.ui.axebattle);
      setTimeout(function () {
        game.tutorial.heroesdeck();
      }, 2000);
    }
    game.tutorial.oldAvailableSlots = availableSlots;
  },
  heroesdeck: function () {
    game.player.picks = [];
    $('.slot').each(function () {
      var slot = $(this), card = slot.find('.card');
      game.player.picks[slot.data('slot')] = card.data('hero');
      if (game.player.picks.length === 5) {
        game.states.choose.reset();
        game.states.changeTo('table');
      }
    });
  },
  start: function () {
    game.status = 'learning';
    game.message.text(game.data.ui.battle);
    game.loader.removeClass('loading');
    game.audio.play('horn');
    game.tower.place();
    game.tree.place();
    game.tutorial.placePlayerHeroes();
    game.tutorial.placeEnemyHeroes();
    game.states.table.buildUnits();
    game.tutorial.started = true;
    game.tutorial.axe.removeClass('up').appendTo(game.states.table.el);
    game.tutorial.axebaloon.hide();
    game.tutorial.lessonSelectEnemy = true;
    game.states.table.time.text(game.data.ui.time + ': 0:00 ' + game.data.ui.day);
    setTimeout(function () {
      game.tutorial.axe.addClass('up');
    }, 500);
    setTimeout(game.tutorial.selectEnemy, 1000);
    game.player.kills = 0;
    game.enemy.kills = 0;
  },
  placePlayerHeroes: function () {
    game.player.mana = 0;
    game.player.heroesDeck = game.deck.build({
      name: 'heroes',
      filter: game.player.picks,
      cb: function (deck) {
        deck.addClass('player').appendTo(game.states.table.player);
        var x = 0, y = 6;
        $.each(deck.data('cards'), function (i, card) {
          var p = game.player.picks.indexOf(card.data('hero'));
          card.addClass('player hero').data('side', 'player').on('click.select', game.tutorial.select);
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
        var x = 0, y = 6;
        $.each(deck.data('cards'), function (i, card) {
          var p = game.enemy.picks.indexOf(card.data('hero'));
          card.addClass('enemy hero').data('side', 'enemy').on('click.select', game.tutorial.select);
          card.place(game.map.mirrorPosition(game.map.toId(x + p, y)));
        });
      }
    });
  },
  selectEnemy: function () {
    game.tutorial.axebaloon.fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeselectenemy);
    game.message.text(game.data.ui.yourturncount + ' 5');
    $('.map .enemy.tower').addClass('tutorialblink').on('click.tutorialselect', game.card.select);
  },
  select: function () {
    var card = $(this).removeClass('tutorialblink');
    if (game.tutorial.lessonSelectEnemy) {
      if (card.hasAllClasses('tower enemy')) {
        $('.map .enemy.tower').removeClass('tutorialblink');
        game.tutorial.lessonSelectEnemy = false;
        game.tutorial.zoom();
      }
    }
    if (game.tutorial.lessonSelectPlayer) {
      if (card.hasAllClasses('hero player')) {
        $('.map .player.hero').removeClass('tutorialblink');
        game.tutorial.lessonSelectPlayer = false;
        game.tutorial.move();
      }
    }
    if (game.tutorial.lessonSkill) {
      if (card.hasAllClasses('skill player')) {
        $('.player.skill').removeClass('tutorialblink');
        game.tutorial.lessonSkill = false;
        game.tutorial.skill();
      }
    }
  },
  zoom: function () {
    game.tutorial.lessonZoom = true;
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axezoom);
    game.message.text(game.data.ui.yourturncount + ' 4');
    game.states.table.selectedArea.addClass('tutorialblink');
    game.states.table.selectedArea.on('mouseover.tutorial', '.card', game.tutorial.over);
    $('.map .enemy.tower').off('click.tutorialselect');
    $('.map .card').on('click.select', game.card.select);
  },
  over: function () {
    if (game.tutorial.lessonZoom) {
      var card = $(this);
      game.states.table.selectedArea.removeClass('tutorialblink');
      game.tutorial.unselect();
      game.tutorial.lessonZoom = false;
    }
  },
  unselect: function () {
    game.states.table.el.click(function (event) {
      var target = $(event.target);
      if (!target.closest('.selected').length && !target.closest('.selectedarea').length) { game.card.unselect(); }
    });
    game.tutorial.lessonUnselect = true;
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeunselect);
    game.message.text(game.data.ui.yourturncount + ' 3');
    game.states.table.selectedArea.on('unselect.tutorial', game.tutorial.unselected);
  },
  unselected: function () {
    if (game.tutorial.lessonUnselect) {
      game.tutorial.selectPlayer();
      game.tutorial.lessonUnselect = false;
    }
  },
  selectPlayer: function () {
    game.tutorial.lessonSelectPlayer = true;
    $('.map .player.hero').addClass('tutorialblink');
    game.tutorial.axe.removeClass('left');
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeselectplayer);
    game.message.text(game.data.ui.yourturncount + ' 2');
    setTimeout(game.card.unselect);
    game.status = 'turn';
  },
  move: function () {
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axemove);
    game.audio.play('tutorial/axemove');
    game.message.text(game.data.ui.yourturncount + ' 1');
    $('.map .hero.player').on('move', game.tutorial.done);
  },
  done: function () {
    if (!game.turn.el) {
      game.turn.el = $('<h1>').addClass('turntitle').appendTo(game.states.table.el);
    }
    setTimeout(function () {
      game.turn.el.text(game.data.ui.enemyturn);
      game.turn.el.addClass('show');
    }, 1000);
    setTimeout(function () {
      game.turn.el.removeClass('show');
      game.tutorial.axe.addClass('left');
      game.tutorial.axebaloon.hide().fadeIn('slow');
      game.tutorial.message.html(game.data.ui.axedone);
      game.message.text(game.data.ui.enemyturn);
      game.message.addClass('tutorialblink');
      game.status = 'unturn';
      setTimeout(game.tutorial.wait, 5000);
    }, 4000);
  },
  wait: function () {
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axewait);
    game.message.text(game.data.ui.enemyturncount + ' 2');
    game.audio.play('tutorial/axetime');
    game.states.table.time.text(game.data.ui.time + ': 1:30 ' + game.data.ui.night);
    game.message.removeClass('tutorialblink');
    game.states.table.time.addClass('tutorialblink');
    setTimeout(game.tutorial.time, 5000);
  },
  time: function () {
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.message.text(game.data.ui.enemyturncount + ' 1');
    game.tutorial.message.html(game.data.ui.axetime);
    game.states.table.time.removeClass('tutorialblink');
    game.states.table.turns.addClass('tutorialblink');
    game.states.table.turns.text(game.data.ui.turns + ': 1/1 (2)');
    setTimeout(game.tutorial.enemyMove, 5000);
    game.tutorial.buildSkills();
  },
  enemyMove: function () {
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeenemymove);
    game.message.html(game.data.ui.enemymove);
    game.audio.play('tutorial/axewait');
    game.states.table.turns.removeClass('tutorialblink');
    var from = 'E7', to = 'G2';
    if ($('#' + game.map.mirrorPosition(to)).hasClass('block')) { to = 'G1'; }
    game.currentData = { moves: 'C:' + from + ':' + to + ':blink:am' };
    game.enemy.move();
    setTimeout(function () {
      game.turn.el.text(game.data.ui.yourturn);
      game.turn.el.addClass('show');
    }, 2000);
    setTimeout(game.tutorial.attack, 5000);

  },
  attack: function () {
    game.turn.el.removeClass('show');
    game.tutorial.axe.removeClass('left');
    game.enemy.skills.deck.removeClass('slide');
    $('.enemy.skills .card').fadeOut(400);
    game.tutorial.lessonAttack = true;
    $('.map .hero').removeClass('done');
    var pos = game.map.getPosition($('.map .enemy.am')),
      range = game.map.getRange(game.data.ui.ranged);
    game.map.around(pos, range, function (spot) {
      spot.find('.card.player.hero').addClass('tutorialblink');
    });
    game.status = 'turn';
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeattack);
    game.audio.play('tutorial/axeattack');
    game.message.html(game.data.ui.yourturn);
    if (game.selectedCard) { game.selectedCard.select(); }
    $('.player.hero').on('attack.tutorial', game.tutorial.skillSelect);
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
          skill.addClass('player skill').data('side', 'player').on('click.tutorial', game.tutorial.select).on('click.select', game.card.select);
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
    $('.card.enemy.done').removeClass('done');
    game.tutorial.lessonSkill = true;
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeskillselect);
    game.player.buyHand();
    game.player.skills.hand.show();
    game.player.skills.sidehand.show();
    $('.player.hero').removeClass('tutorialblink');
    $('.player.skill').addClass('tutorialblink');
    setTimeout(function () {
      $('.player.hero').removeClass('done');
    }, 200);
  },
  skill: function () {
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeskill);
    $('.card').on('cast.tutorial', game.tutorial.end);
    $('.card').on('passive.tutorial', game.tutorial.end);
    $('.card').on('toggle.tutorial', game.tutorial.end);
  },
  end: function () {
    game.tutorial.lessonAttack = false;
    game.tutorial.lessonSkill = false;
    game.tutorial.axebaloon.hide().fadeIn('slow');
    game.tutorial.message.html(game.data.ui.axeend);
    game.audio.play('tutorial/axeah');
    game.message.text(game.data.ui.lose);
    game.winner = game.player.name;
    game.states.table.showResults();
    game.tutorial.started = false;
    game.status = 'tutorialcompleted';
  },
  clear: function () {
    game.tutorial.axe.removeClass('up');
    game.tutorial.axe.removeClass('left');
    game.tutorial.axebaloon.hide();
    game.db({
      'set': 'chat',
      'data': game.player.name + ' ' + game.data.ui.completedtutorial
    }, function (chat) {
      game.chat.update(chat);
    });
  }
};