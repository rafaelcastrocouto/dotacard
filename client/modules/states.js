game.states = {
  el: $('.states').first(),
  build: function () {
    var preBuild = ['menu', 'options', 'choose', 'table'];
    for (var i=0; i<preBuild.length; i++) {
      game.states.buildState(preBuild[i]);
    }
  },
  buildState: function (name) {
    var state = game.states[name];
    if (state && !state.builded) {
      state.builded = true;
      state.el = $('<div>').addClass('state ' + name).hide().appendTo(game.states.el);
      if (state.build) state.build();
    }
  },
  changeTo: function (state) {
    if (state !== game.currentState) {
      game.states.buildState(state);
      var newstate,
        pre = game.currentState,
        oldstate = game.states[pre];
      if (oldstate && oldstate.el) { oldstate.el.fadeOut(100); }
      if (oldstate && oldstate.end) { oldstate.end(); }
      newstate = game.states[state];
      if (newstate.el) {
        setTimeout(function () {
          newstate.el.append(game.topbar).fadeIn(100);
        }, 120);
      }
      game.currentState = state;
      game.backState = pre;
      if (newstate.start) { newstate.start(); }
    }
  },
  backState: function () {
    game.states.changeTo(game.backState);
  },
  //states
  unsupported: {
    build: function () {
      this.box = $('<div>').appendTo(this.el).addClass('box');
      this.logo = $('<div>').appendTo(this.box).addClass('logo slide');
      this.title = $('<img>').appendTo(this.logo).attr({alt: 'DOTA', src: 'img/title.png'}).addClass('h1');
      this.subtitle = $('<img>').appendTo(this.logo).attr({alt: 'CARD', src: 'img/subtitle.png'}).addClass('h2');
      this.h2 = $('<h1>').appendTo(this.box).html('DotaCard requires a <i>modern browser</i>');
      this.p = $('<p>').appendTo(this.box).html('<a href="http://whatbrowser.org/" target="_blank">How can I get a <i>modern browser</i>?</a>');
    }
  },
  loading: {
    build: function () {
      this.box = $('<div>').appendTo(this.el).addClass('box');
      this.logo = $('<div>').appendTo(this.box).addClass('logo slide');
      this.title = $('<img>').appendTo(this.logo).attr({alt: 'DOTA', src: 'img/title.png'}).addClass('h1');
      this.subtitle = $('<img>').appendTo(this.logo).attr({alt: 'CARD', src: 'img/subtitle.png'}).addClass('h2');
      this.h2 = $('<p>').appendTo(this.box).addClass('loadtext').html('<span class="loader loading"></span><span class="message">Checking for updates</span><span class="progress"></span>');
    },
    start: function () {
      game.message.html('<b>ALERT</b>: This game is in development and bugs may (will) happen.</a>');
      game.utils();
      game.events();
      setTimeout(game.load.start, 1000);
    }
  },
  log: {
    remembername: true,
    build: function () {
      this.box = $('<div>').appendTo(this.el).addClass('box');
      $('.logo').clone().prependTo(this.box);
      this.title = $('<h1>').appendTo(this.box).text(game.data.ui.choosename);
      this.input = $('<input>').appendTo(this.box).attr({
        placeholder: game.data.ui.logtype,
        type: 'text',
        maxlength: 24
      }).keydown(function (e) {
        if (e.which === 13) { game.states.log.login(); }
      });
      this.button = $('<div>').addClass('button').appendTo(this.box).text(game.data.ui.log).attr({
        title: game.data.ui.choosename
      }).leftClickEvent(this.login);
      this.rememberlabel = $('<label>').appendTo(this.box).append($('<span>').text(game.data.ui.remember));
      this.remembercheck = $('<input>').attr({
        type: 'checkbox',
        name: 'remember',
        checked: true
      }).change(this.remember).appendTo(this.rememberlabel);
      var rememberedname = $.cookie('name');
      if (rememberedname) { this.input.val(rememberedname); }
      this.out = $('<small>').addClass('logout').insertAfter(game.message).text(game.data.ui.logout).leftClickEvent(this.logout);
    },
    start: function () {
      game.message.html('Version <small class="version">' + game.version + '</small>');
      game.states.log.out.hide();
      this.input.focus();
      game.states.options.opt.show();
    },
    login: function () {
      var name = game.states.log.input.val();
      if (name) {
        game.player.name = name;
        if (game.states.log.remembername) {
          $.cookie('name', name);
        } else {
          $.removeCookie('name');
        }
        game.states.log.button.attr('disabled', true);
        game.loader.addClass('loading');
        game.db({ 'get': 'server' }, function (server) {
          if (server.status === 'online') {
            game.states.log.out.show();
            game.states.changeTo('menu');
          } else { game.reset(); }
        });
      } else {
        game.states.log.input.focus();
      }
    },
    logout:function () {
      if (game.mode) {
        if (game.states[game.currentState].clear) game.states[game.currentState].clear();
        game[game.mode].clear();
        game.clearTimeouts();
      }
      game.states.changeTo('log');
    },
    end: function () {
      this.button.attr('disabled', false);
    },
    remember: function () {
      game.states.log.remembername = !game.states.log.remembername;
      if (!game.states.log.remembername) { $.removeCookie('name'); }
    }
  },
  menu: {
    build: function () {
      this.menu = $('<div>').appendTo(this.el).addClass('box');
      this.title = $('<h1>').appendTo(this.menu).text(game.data.ui.menu);
      this.tutorial = $('<div>').addClass('button').appendTo(this.menu).attr({
        title: game.data.ui.tutorial
      }).text(game.data.ui.tutorial).leftClickEvent(function () {
        game.mode = 'tutorial';
        game.states.changeTo('choose');
      });
      this.campain = $('<div>').addClass('button').appendTo(this.menu).attr({
        title: game.data.ui.choosecampain,
        disabled: true
      }).text(game.data.ui.campain);
      this.online = $('<div>').addClass('button').appendTo(this.menu).attr({
        title: game.data.ui.chooseonline
      }).text(game.data.ui.online).leftClickEvent(function () {
        game.mode = 'choose';
        game.states.changeTo('choose');
      });
      this.friend = $('<div>').addClass('button').appendTo(this.menu).attr({
        title: game.data.ui.choosefriend,
        disabled: true
      }).text(game.data.ui.friend);
      this.options = $('<div>').addClass('button').appendTo(this.menu).attr({
        title: game.data.ui.chooseoptions
      }).text(game.data.ui.options).leftClickEvent(function () {
        game.states.changeTo('options');
      });
      this.credits = $('<a>').addClass('button').appendTo(this.menu).attr({
        title: game.data.ui.choosecredits,
        href: 'https://github.com/rafaelcastrocouto/dotacard/graphs/contributors',
        target: '_blank'
      }).text(game.data.ui.credits);
    },
    start: function () {
      game.loader.removeClass('loading');
      game.triesCounter.text('');
      game.message.text(game.data.ui.welcome + ' ' + game.player.name + '!');
      if (!game.chat.builded) { game.chat.build(); }
      game.chat.el.appendTo(this.el);
    }
  },
  options: {
    build: function () {
      this.menu = $('<div>').appendTo(this.el).addClass('box');
      this.title = $('<h1>').appendTo(this.menu).text(game.data.ui.options);
      this.resolution = $('<div>').appendTo(this.menu).addClass('screenresolution').attr({
        title: game.data.ui.screenres
      });
      $('<h2>').appendTo(this.resolution).text(game.data.ui.screenres);
      this.high = $('<label>').appendTo(this.resolution).append($('<input>').attr({
        type: 'radio',
        name: 'resolution',
        value: 'high'
      }).change(this.changeResolution)).append($('<span>').text(game.data.ui.high + ' 1920x1080'));
      $('<label>').appendTo(this.resolution).append($('<input>').attr({
        type: 'radio',
        name: 'resolution',
        value: 'medium'
      }).change(this.changeResolution)).append($('<span>').text(game.data.ui.medium + ' 1366x768'));
      $('<label>').appendTo(this.resolution).append($('<input>').attr({
        type: 'radio',
        name: 'resolution',
        checked: true,
        value: 'default'
      }).change(this.changeResolution)).append($('<span>').text(game.data.ui['default'] + ' 1024x768'));
      this.low = $('<label>').appendTo(this.resolution).append($('<input>').attr({
        type: 'radio',
        name: 'resolution',
        value: 'low'
      }).change(this.changeResolution)).append($('<span>').text(game.data.ui.low + ' 800x600'));
      var rememberedvol, vol,
        rememberedres = $.cookie('resolution');
      if (rememberedres && this[rememberedres]) { this.changeResolution.call(this[rememberedres]); }
      this.audio = $('<div>').appendTo(this.menu).addClass('audioconfig').attr({
        title: game.data.ui.audioconfig
      });
      $('<h2>').appendTo(this.audio).text(game.data.ui.audioconfig);
      this.muteinput = $('<input>').attr({
        type: 'checkbox',
        name: 'mute'
      }).change(game.audio.mute);
      $('<label>').appendTo(this.audio).append(this.muteinput).append($('<span>').text(game.data.ui.mute));
      //main volume
      this.volumecontrol = $('<div>').addClass('volumecontrol');
      this.volumeinput = $('<div>').addClass('volume').data('volume', 'volume').on('mousedown.volume', game.audio.volumedown).append(this.volumecontrol);
      $('<label>').appendTo(this.audio).append($('<span>').text(game.data.ui.volume)).append(this.volumeinput);
      //music volume
      this.musiccontrol = $('<div>').addClass('volumecontrol');
      this.musicinput = $('<div>').addClass('volume').data('volume', 'music').on('mousedown.volume', game.audio.volumedown).append(this.musiccontrol);
      $('<label>').appendTo(this.audio).append($('<span>').text(game.data.ui.music)).append(this.musicinput);
      //sounds volume
      this.soundscontrol = $('<div>').addClass('volumecontrol');
      this.soundsinput = $('<div>').addClass('volume').data('volume', 'sounds').on('mousedown.volume', game.audio.volumedown).append(this.soundscontrol);
      $('<label>').appendTo(this.audio).append($('<span>').text(game.data.ui.sounds)).append(this.soundsinput);
      $(document).on('mouseup.volume', game.audio.volumeup);
      rememberedvol = $.cookie('volume');
      if (rememberedvol) {
        vol = parseFloat(rememberedvol);
        if (vol === 0) { this.muteinput.prop('checked', true); }
        game.mute.gain.value = vol;
        game.states.options.volumecontrol.css('transform', 'scale(' + rememberedvol + ')');
      }
      this.back = $('<div>').addClass('button back').text(game.data.ui.back).appendTo(this.menu).attr({
        title: game.data.ui.back
      }).leftClickEvent(game.states.backState);
      this.opt = $('<small>').addClass('opt').text('Options').hide().on('click.opt', function () {
        game.states.changeTo('options');
      }).appendTo(game.topbar);
    },
    start: function () {
      game.states.options.opt.hide();
      game.chat.el.appendTo(this.el);
    },
    changeResolution: function () {
      var resolution = $('input[name=resolution]:checked', '.screenresolution').val();
      game.states.el.removeClass('low high medium default').addClass(resolution);
      $.cookie('resolution', resolution);
    },
    end: function () {
      game.states.options.opt.show();
    }
  },
  choose: {
    build: function () {
      this.pickbox = $('<div>').appendTo(this.el).addClass('pickbox').attr('title', game.data.ui.chooseheroes);
      this.pickedbox = $('<div>').appendTo(this.el).addClass('pickedbox').hide().rightClickEvent(game.cancelEvent);
      var slot;
      for (slot = 0; slot < 5; slot += 1) {
        $('<div>').appendTo(this.pickedbox)
        .attr({ title: game.data.ui.rightpick })
        .data('slot', slot).addClass('slot available')
        .rightClickEvent(game.states.choose.pick);
      }
      this.prepickbox = $('<div>').appendTo(this.el).addClass('prepickbox').html(game.data.ui.customdecks).hide();
      this.counter = $('<p>').appendTo(this.pickedbox).addClass('counter').hide();
      this.pickDeck = game.deck.build({
        name: 'heroes',
        cb: function (pickDeck) {
          pickDeck.addClass('pickdeck').appendTo(game.states.choose.pickbox);
          game.states.choose.size = 100;
          $.each(pickDeck.data('cards'), function (id, card) {
            if (card.data('disable')) {
              card.addClass('dead');
            }
            card.on('mousedown.select', game.states.choose.select);
            $.each(game.data.skills[card.data('hero')], function () {
              if (this.display) { card.addBuff(card, this); }
            });
          });
          pickDeck.width(100 + $('.card').width() * pickDeck.children().length);
        }
      });
    },
    start: function () {
      game.loader.addClass('loading');
      game[game.mode].build();
      game.chat.el.appendTo(this.el);
      game.fork.hide();
      game.states.choose.selectFirst();
    },
    select: function () {
      var card = $(this);
      $('.choose .card.selected').removeClass('selected');
      card.addClass('selected');
      card.attr('draggable', 'true');
      game.states.choose.pickDeck.css('margin-left', card.index() * card.width() / 2 * -1);
    },
    enablePick: function () {
      game.states.choose.pickEnabled = true;
      game.states.choose.pickedbox.show();
      game.player.picks = [];
      if (game.mode !== 'tutorial') { game.states.choose.prepickbox.show(); }
    },
    disablePick: function () {
      game.states.choose.pickEnabled = false;
    },
    pick: function () {//console.log(this);
      var card,
        slot = $(this).closest('.slot'),
        pick = $('.pickbox .card.selected');
      if (!pick.data('disable') && game.states.choose.pickEnabled) {
        game.audio.play('activate');
        if (slot.hasClass('available')) {
          slot.removeClass('available');
          if (pick.prev().length) {
            card = pick.prev();
          } else { card = pick.next(); }
        } else {
          card = slot.children('.card');
          card.on('mousedown.select', game.states.choose.select).insertBefore(pick);
        }
        card.addClass('selected');
        card.attr('draggable', 'true');
        pick.removeClass('selected').appendTo(slot).off('mousedown.select').attr('draggable', 'false');
        game.states.choose.pickDeck.css('margin-left', card.index() * card.width() / 2 * -1);
        game.player.picks[slot.data('slot')] = pick.data('hero');
        pick.trigger('pick');
        game.player.manaBuild();
        game[game.mode].pick();
      }
      return false;
    },
    selectFirst: function () {
      game.states.choose.select.call(
        game.states.choose.pickDeck.children().first()
      );
    },
    reset: function () {
      $('.pickedbox .card').prependTo(this.pickDeck).on('mousedown.select', game.states.choose.select);
      $('.slot').addClass('available');
      game.states.choose.counter.hide();
    },
    end: function () {
      this.pickedbox.hide();
      this.prepickbox.hide();
      game.fork.show();
    }
  },
  table: {
    build: function () {
      this.time = $('<p>').appendTo(game.topbar).addClass('time').text(game.data.ui.time + ': 0:00 Day').hide();
      this.turns = $('<p>').appendTo(game.topbar).addClass('turns').text(game.data.ui.turns + ': 0/0 (0)').hide();
      game.map.start();
      this.selectedArea = $('<div>').appendTo(this.el).addClass('selectedarea').append($('<div>').addClass('cardback'));
      this.neutrals = $('<div>').appendTo(this.el).addClass('neutraldecks');
      this.player = $('<div>').appendTo(this.el).addClass('playerdecks');
      this.enemy = $('<div>').appendTo(this.el).addClass('enemydecks');
      this.skip = $('<div>').appendTo(this.el).addClass('skip button').attr({disabled: true}).leftClickEvent(game.turn.skip).text(game.data.ui.skip);
      this.surrender = $('<div>').appendTo(this.el).addClass('surrender button').text(game.data.ui.surrender).leftClickEvent(function () {
        if(confirm(game.data.ui.leave)) game[game.mode].surrender();
      });
    },
    start: function () {
      game[game.mode].setTable();
      game.fork.hide();
      game.chat.el.appendTo(this.el);
      this.time.show();
      this.turns.show();
      this.camera.show();
      this.selectedArea.show();
    },
    buildUnits: function () {
      var j = 'A1';
      $('#' + j).addClass('jungle').attr({title: 'Jungle'});
      $('#' + game.map.mirrorPosition(j)).addClass('jungle').attr({title: 'Jungle'});
      game.neutrals = {};
      game.neutrals.unitsDeck = game.deck.build({
        name: 'units',
        filter: ['forest'],
        cb: function (deck) {
          deck.addClass('neutral units cemitery').hide().appendTo(game.states.table.neutrals);
          $.each(deck.data('cards'), function (i, card) {
            card.addClass('neutral unit').data('side', 'neutral').on('mousedown.select', game.card.select);
          });
        }
      });
      game.player.unitsDeck = game.deck.build({
        name: 'units',
        filter: game.player.picks,
        cb: function (deck) {
          deck.addClass('player units cemitery').hide().appendTo(game.states.table.player);
          $.each(deck.data('cards'), function (i, card) {
            card.addClass('player unit').data('side', 'player').on('mousedown.select', game.card.select);
          });
        }
      });
      game.enemy.unitsDeck = game.deck.build({
        name: 'units',
        filter: game.enemy.picks,
        cb: function (deck) {
          deck.addClass('enemy units cemitery').hide().appendTo(game.states.table.enemy);
          $.each(deck.data('cards'), function (i, card) {
            card.addClass('enemy unit').data('side', 'enemy').on('mousedown.select', game.card.select);
          });
        }
      });
    },
    animateCast: function (skill, target) {
      //todo: remove 'top/left', use only 'transform' to improve performance
      if (typeof target === 'string') { target = $('#' + target); }
      var t = skill.offset(), d = target.offset();
      skill.css({
        top: d.top - t.top + 30,
        left: d.left - t.left + 20,
        transform: 'translate(-50%, -50%) scale(0.3)'
      });
      setTimeout(function () {
        $(this.skill).css({
          top: '',
          left: '',
          transform: ''
        });
      }.bind({ skill: skill }), 500);
    },
    showResults: function () {
      game.states.table.selectedArea.hide();
      game.states.table.camera.hide();
      $('.table > .button').hide();
      $('.table .deck').hide();
      game.states.table.resultsbox = $('<div>').appendTo(game.states.table.el).addClass('resultsbox box');
      $('<h1>').appendTo(this.resultsbox).addClass('result').text(game.winner + ' ' + game.data.ui.victory);
      $('<h1>').appendTo(this.resultsbox).text(game.data.ui.towers + ' HP: ' + game.player.tower.data('current hp') + ' / ' + game.enemy.tower.data('current hp'));
      $('<h1>').appendTo(this.resultsbox).text(game.data.ui.heroes + ' ' + game.data.ui.kd + ': ' + game.player.kills + ' / ' + game.enemy.kills);
      game.states.table.playerResults = $('<div>').appendTo(game.states.table.resultsbox).addClass('results');
      game.states.table.enemyResults = $('<div>').appendTo(game.states.table.resultsbox).addClass('results');
      $('.player.heroes.card').not('.zoom').each(function () {
        var hero = $(this), heroid = $(this).data('hero'),
          img = $('<div>').addClass('portrait').append($('<div>').addClass('img')),
          text = $('<span>').text(hero.data('name') + ': ' + hero.data('kills') + ' / ' + hero.data('deaths'));
        $('<p>').appendTo(game.states.table.playerResults).addClass(heroid+' heroes').append(img, text);
      });
      $('.enemy.heroes.card').not('.zoom').each(function () {
        var hero = $(this), heroid = $(this).data('hero'),
          img = $('<div>').addClass('portrait').append($('<div>').addClass('img')),
          text = $('<span>').text(hero.data('name') + ': ' + hero.data('kills') + ' / ' + hero.data('deaths'));
        $('<p>').appendTo(game.states.table.enemyResults).addClass(heroid+' heroes').append(img, text);
      });
      $('<div>').addClass('button close').appendTo(game.states.table.resultsbox).text(game.data.ui.close).leftClickEvent(game.states.table.clear);
    },
    clear: function () {
      game[game.mode].clear();
      game.map.clear();
      $('.table .card').remove();
      $('.table .deck').remove();
      $('.table .resultsbox').remove();
      game.clearTimeouts();
      game.mode = '';
      game.states.changeTo('menu');
    },
    end: function () {
      this.time.hide();
      this.turns.hide();
      game.fork.show();
    }
  }
};
