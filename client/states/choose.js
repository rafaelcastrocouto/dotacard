game.states.choose = {
  build: function () {
    this.pickbox = $('<div>').appendTo(this.el).addClass('pickbox').attr('title', game.data.ui.chooseheroes);
    this.pickedbox = $('<div>').appendTo(this.el).addClass('pickedbox').hide().onrightClick(game.events.cancel);
    var slot;
    for (slot = 0; slot < 5; slot += 1) {
      $('<div>').appendTo(this.pickedbox)
      .attr({ title: game.data.ui.rightpick })
      .data('slot', slot).addClass('slot available')
      .onrightClick(game.states.choose.pick);
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
  }
};