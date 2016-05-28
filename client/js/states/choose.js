game.states.choose = {
  size: 100,
  build: function () {
    this.pickbox = $('<div>').appendTo(this.el).addClass('pickbox').attr('title', game.data.ui.chooseheroes);
    this.pickedbox = $('<div>').appendTo(this.el).addClass('pickedbox').hide();
    this.slots = this.buildSlots();
    this.buttonbox = $('<div>').appendTo(this.el).addClass('buttonbox');
    this.counter = $('<p>').appendTo(this.pickedbox).addClass('counter').hide();
    this.pickDeck = game.deck.build({name: 'heroes', cb: this.buildDeck});
    this.randombt = $('<div>').appendTo(this.buttonbox).addClass('random button').text(game.data.ui.random).attr({title: game.data.ui.randomtitle}).on('mouseup touchend', function () { if (!$(this).attr('disabled')) this.random(); });
    this.librarytest = $('<div>').appendTo(this.buttonbox).addClass('librarytest button').text(game.data.ui.librarytest).attr({title: game.data.ui.librarytesttitle}).on('mouseup touchend', this.test);
    this.mydeck = $('<div>').appendTo(this.buttonbox).addClass('mydeck button').text(game.data.ui.mydeck).attr({title: game.data.ui.mydecktitle}).on('mouseup touchend', this.savedDeck);
    this.back = $('<div>').appendTo(this.buttonbox).addClass('back button').text(game.data.ui.back).attr({title: game.data.ui.backtomenu}).on('mouseup touchend', this.back);
  },
  start: function (recover) {
    game.loader.addClass('loading');
    if (game[game.mode].build) game[game.mode].build(recover);
    game.chat.el.appendTo(this.el);
    game.states.choose.selectFirst(true);
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
      localStorage.setItem('choose', card.data('hero'));
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
  selectFirst: function (recover) {
    var saved = localStorage.getItem('choose');
    if (saved) this.select.call($('.pickdeck .'+saved), recover);
    else this.select.call(game.states.choose.pickDeck.children().first());
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
  random: function () {
    $('.slot').each(function () {
      var slot = $(this), card;
      if (slot.hasClass('available')) {
        card = game.deck.randomCard($('.pickbox .card').not('.dead'), 'noseed');
        slot.append(card).removeClass('available selected');
        game.player.picks[slot.data('slot')] = card.data('hero');
      }
      if ($('.choose .card.selected').length === 0) { game.states.choose.selectFirst(); }
      if (game.player.picks.length === 5) { 
        if (game[game.mode].sendDeck) game[game.mode].sendDeck();
      }
    });
  },
  test: function () {
    game.states.choose.clear(); 
    game.states.changeTo('table');
  },
  back: function () {
    if (game.mode && game[game.mode].clear) game[game.mode].clear();
    game.states.choose.clear();
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
