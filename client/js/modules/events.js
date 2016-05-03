game.events = {
  build: function () {
    game.card.bindJquery();
    $.fn.clearEvents = game.events.clearEvents;
    game.container.on('mousedown touchstart', game.events.hit)
                  .on('mousemove', game.events.move)
                  .on('touchmove', function (event) {
                    game.events.move.call(this, event);
                    if (event.preventDefault) event.preventDefault(); //prevent scroll
                  })
                  .on('mouseup touchend', game.events.end)
                  .on('contextmenu', game.events.cancel)
                  .on('beforeunload ', game.events.leave);
  },
  getCoordinates: function (event) {
    var position = {
      left: event.clientX,
      top: event.clientY
    };
    if (event.originalEvent && event.originalEvent.changedTouches) {
      position.left = event.originalEvent.changedTouches[0].clientX;
      position.top = event.originalEvent.changedTouches[0].clientY;
    }
    return position;
  },
  hit: function (event) { 
   var target = $(event.target),
       card = target.closest('.card'); //console.log('hit', card[0] || event.target);
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
    if (game.events.dragging) {
      game.events.dragging.addClass('dragTarget');
      var position = game.events.getCoordinates(event);
      $('.dragTargetClone').show().css({
        left: (position.left - game.events.dragOffset.left) + 'px',
        top: (position.top - game.events.dragOffset.top) + 'px'
      });
    }
  },
  end: function (event) { //console.log('end');
    if  (event && event.type === 'touchend') { // fix touchend target
      var position = game.events.getCoordinates(event),
          target = $(document.elementFromPoint(position.left, position.top));
      target.mouseup();
    } else if (game.events.dragging) { 
      game.events.dragging = false;
      $('.dragTarget').removeClass('dragTarget');
      $('.dragTargetClone').remove();
    }
  },
  clearEvents: function (name) { //console.trace('clear', name);
    if (name) this.off('mousedown.'+name+' mouseup.'+name+' touchstart.'+name+' touchend.'+name);
    else this.off('mousedown mouseup touchstart touchend');
    return this;
  },
  cancel: function (event) {
    if (event && event.preventDefault) event.preventDefault();
    return false;
  },
  leave: function () {
    if (game.mode == 'online') {
      return game.data.ui.leave;
    }
  }
};
