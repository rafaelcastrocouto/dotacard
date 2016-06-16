game.states.choose = {
  size: 100,
  chat: true,
  build: function () {
    this.pickbox = $('<div>').addClass('pickbox').attr('title', game.data.ui.chooseheroes).appendTo(this.el);
    this.pickedbox = $('<div>').addClass('pickedbox').hide();
    this.slots = this.buildSlots();
    this.counter = $('<p>').addClass('counter').hide().appendTo(this.pickedbox);
    this.pickDeck = game.deck.build({name: 'heroes', cb: this.buildDeck});
    this.buttonbox = $('<div>').addClass('buttonbox');
    this.randombt = $('<div>').addClass('random button').text(game.data.ui.random).attr({title: game.data.ui.randomtitle}).on('mouseup touchend', function () { if (!$(this).attr('disabled')) this.random(); }).appendTo(this.buttonbox);
    this.librarytest = $('<div>').addClass('librarytest button').text(game.data.ui.librarytest).attr({title: game.data.ui.librarytesttitle}).on('mouseup touchend', this.testHero).appendTo(this.buttonbox);
    this.mydeck = $('<div>').addClass('mydeck button').text(game.data.ui.mydeck).attr({title: game.data.ui.mydecktitle}).on('mouseup touchend', this.savedDeck).appendTo(this.buttonbox);
    this.back = $('<div>').addClass('back button').text(game.data.ui.back).attr({title: game.data.ui.backtomenu}).on('mouseup touchend', this.backClick).appendTo(this.buttonbox);
    this.el.append(this.pickedbox).append(this.buttonbox);
  },
  start: function () {
    var hero = localStorage.getItem('choose');
    if (game.mode == 'library' && hero) game.states.choose.selectHero(hero);
    else game.states.choose.selectFirst();
    if (game.mode != 'online') this.pickedbox.show();
    else game.online.chooseStart();
  },
  buildDeck: function (pickDeck) {
    pickDeck.addClass('pickdeck').appendTo(game.states.choose.pickbox);
    $.each(pickDeck.data('cards'), function (i, card) {
      card[0].dataset.index = i;
      if (card.data('disable')) card.addClass('dead');
      card.on('mousedown.choose touchstart.choose', game.states.choose.select);
      $.each(game.data.skills[card.data('hero')], function () {
        if (this.display) { card.addBuff(card, this); }
      });
    });
    pickDeck.width(game.states.choose.size + $('.card').width() * pickDeck.children().length);
  },
  buildSlots: function () {
    var slots = [];
    for (var slot = 0; slot < 5; slot += 1) {
      slots.push($('<div>').appendTo(this.pickedbox).attr({ title: game.data.ui.rightpick }).data('slot', slot).addClass('slot available').on('mouseup touchend', this.pick));
    }
    return slots;
  },
  select: function (recover) {
    var card = $(this);
    if (card.hasClass && card.hasClass('heroes')) {
      $('.choose .selected').removeClass('selected draggable');
      card.addClass('selected');
      if (game.mode !== 'library') card.addClass('draggable');
      else game.library.select(card, recover);
      game.states.choose.pickDeck.css('margin-left', card.index() * card.width() / 2 * -1);
      if (!card.hasClass('dead')) localStorage.setItem('choose', card.data('hero'));
    }
  },
  enablePick: function () {
    game.states.choose.pickEnabled = true;
    game.states.choose.pickedbox.show();
    game.player.picks = [];
  },
  disablePick: function () {
    game.states.choose.pickEnabled = false;
  },
  pick: function () {
    var card,
      slot = $(this).closest('.slot'),
      pick = $('.pickbox .card.selected');
    if (!pick.data('disable') &&
        game.states.choose.pickEnabled &&
        game.mode !== 'library') {
      game.audio.play('activate');
      if (slot.hasClass('available')) {
        slot.removeClass('available');
        if (pick.prev().length) {
          card = pick.prev();
        } else { card = pick.next(); }
      } else {
        card = slot.children('.card');
        card.on('mousedown.choose touchstart.choose', game.states.choose.select).insertBefore(pick);
      }
      pick.appendTo(slot).clearEvents('choose');
      game.states.choose.sort();
      game.states.choose.select.call(card);
      game.player.picks[slot.data('slot')] = pick.data('hero');
      pick.trigger('pick');
      game.player.manaBuild();
      if (game[game.mode].pick) game[game.mode].pick();
    }
  },
  selectFirst: function () {
    var first = game.states.choose.pickDeck.children().first();
    this.select.call(first, true);
  },
  selectHero: function (hero) {
    var card = game.states.choose.pickDeck.children('.'+hero);
    this.select.call(card, true);
  },
  mana: function () {
    var mana = 0;
    $('.pickedbox .heroes').each(function () {
      mana += $(this).data('mana');
    });
    return mana;
  },
  sort: function () {
    $('.pickdeck .card').sort(function (a, b) {
      return a.dataset.index - b.dataset.index;
    }).appendTo('.pickdeck');
  },
  savedDeck:  function () {
    var deck = localStorage.getItem('mydeck').split(',');
    if (deck && deck.length == 5 && !$(this).attr('disabled')) {
      game.states.choose.remember(deck);
    }
  },
  remember: function (deck) {
    $('.slot').each(function (i) {
      var slot = $(this),
          hero = deck[i],
          card = $('.pickbox .card.'+hero);
      if (card && slot.hasClass('available')) {
        slot.append(card).removeClass('available selected');
        game.player.picks[slot.data('slot')] = card.data('hero');
      }
      if ($('.choose .card.selected').length === 0) { game.states.choose.selectFirst(); }
      if (game.player.picks.length === 5) { 
        if (game[game.mode].sendDeck) game[game.mode].sendDeck(); 
      }
    });
  },
  randomFill: function (cb) {
    $('.slot').each(function () {
      var slot = $(this), card;
      if (slot.hasClass('available')) {
        card = game.deck.randomCard($('.pickbox .card').not('.dead'), 'noseed');
        slot.append(card).removeClass('available selected');
        game.player.picks[slot.data('slot')] = card.data('hero');
      }
      if ($('.choose .card.selected').length === 0) { game.states.choose.selectFirst(); }
      if (game.player.picks.length === 5 && cb) cb();
    });
  },
  testHero: function () {
    game.states.choose.clear(); 
    game.states.changeTo('table');
  },
  backClick: function () {
    if (game.mode == 'online') {
      game.db({
        'set': 'back',
        'data': game.id
      }, function () {
        game.seed = 0;
        localStorage.setItem('seed', '');
        game.states.choose.toMenu();
      });
    } else game.states.choose.toMenu();
  },
  toMenu: function () {
    game.clear();
    game.states.changeTo('menu');  
  },
  clear: function () {
    $('.slot .card.heroes').prependTo(this.pickDeck).on('mousedown.choose touchstart.choose', game.states.choose.select);
    if (game.library.skills) $('.slot .card.skills').appendTo(game.library.skills);
    $('.slot').addClass('available').show();
    this.counter.hide();
    this.pickedbox.hide();
    game.states.choose.sort();
  },
  end: function () {
    this.pickedbox.hide();
  }
};
