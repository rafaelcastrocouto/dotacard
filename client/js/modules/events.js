game.events = {
  build: function () {
    game.card.bindJquery();
    $.fn.onClickEvent = game.events.onClickEvent;
    $.fn.onEventStart = game.events.onEventStart;
    $.fn.clearEvents = game.events.clearEvents;
    game.container.on('mousedown touchstart', game.events.hit)
                  .on('mousemove touchmove', game.events.move)
                  .on('mouseup touchend', game.events.end)
                  .on('contextmenu', game.events.cancel)
                  .on('beforeunload ', game.events.leave);
  },
  getCoordinates: function (event) {
    var position = {
      left: event.clientX,
      top: event.clientY
    };
    if (event.originalEvent.changedTouches) {
      position.left = event.originalEvent.changedTouches[0].clientX;
      position.top = event.originalEvent.changedTouches[0].clientY;
    }
    return position;
  },
  hit: function (event) {
   var target = $(event.target),
       card = target.closest('.card');
   if (card && card.hasClass('draggable')) {
     game.events.dragging = card;
     card.clone().removeClass('dragTarget').hide().addClass('dragTargetClone ' + game.currentState).appendTo(game.container);
     var position = game.events.getCoordinates(event),
         containerOffset = game.container.offset(),
         cardOffset = card.offset();
     game.events.dragOffset = {
       left: containerOffset.left + (position.left - cardOffset.left),
       top: containerOffset.top + (position.top - cardOffset.top)
     };
   }
  },
  move: function (event) {
    if (event.preventDefault) event.preventDefault();
    if (game.events.dragging) {
      game.events.dragging.addClass('dragTarget');
      var position = game.events.getCoordinates(event);
      $('.dragTargetClone').show().css({
        left: (position.left - game.events.dragOffset.left) + 'px',
        top: (position.top - game.events.dragOffset.top) + 'px'
      });
    }
  },
  end: function (event) {
    if  (event.type === 'touchend') { // fix touchend target
      var position = game.events.getCoordinates(event),
          target = $(document.elementFromPoint(position.left, position.top));
      target.trigger('mouseup');
    } else if (game.events.dragging) {
      game.events.dragging = false;
      $('.dragTarget').removeClass('dragTarget');
      $('.dragTargetClone').remove();
    }
  },
  onEventStart: function (cb) {
    this.on('mousedown touchstart', cb);
    return this;
  },
  onClickEvent: function (cb) {
    this.on('mouseup touchend', cb);
    return this;
  },
  clearEvents: function () {
    this.off('mousedown mouseup touchstart touchend');
    return this;
  },
  cancel: function (e) {
    if (e && e.preventDefault) e.preventDefault();
    return false;
  },
  leave: function () {
    if (game.mode == 'match') {
      return game.data.ui.leave;
    }
  }
};
