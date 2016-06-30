game.events = {
  build: function() {
    game.offset = game.container.offset();
    $.fn.clearEvents = game.events.clearEvents;
    game.card.bindJquery();
    game.skill.bindJquery();
    game.highlight.bindJquery();
    $(window).on('resize', game.screen.resize);
    game.container.on('mousedown touchstart', game.events.hit)
                  .on('mousemove', game.events.move)
                  .on('touchmove', function(event) {
                    game.events.move.call(this, event);
                    if (event.preventDefault) event.preventDefault(); //prevent touch scroll
                  })
                  .on('mouseup touchend', game.events.end)
                  .on('contextmenu', game.events.cancel)
                  .on('beforeunload ', game.events.leave);
  },
  getCoordinates: function(event) {
    var position = {
      left: event.clientX,
      top: event.clientY
    };
    if (event.originalEvent && event.originalEvent.changedTouches) {
      var last = event.originalEvent.changedTouches.length - 1;
      position.left = event.originalEvent.changedTouches[last].clientX;
      position.top = event.originalEvent.changedTouches[last].clientY;
    }
    return position;
  },
  hit: function(event) {
    var target = $(event.target), 
        card = target.closest('.card');
    if (card && card.hasClass('draggable')) {
      var position = game.events.getCoordinates(event),
          cardOffset = card.offset(), fromMap = '';
      if (card.closest('.map').length) fromMap = ' fromMap';
      game.events.dragging = card;
      game.events.draggingPosition = position;
      game.events.dragClone = card.clone().hide().removeClass('dragTarget').addClass('dragTargetClone ' + game.currentState + fromMap).appendTo(game.container);
      game.events.dragOffset = {
        left: game.offset.left + (position.left - cardOffset.left),
        top: game.offset.top + (position.top - cardOffset.top)
      };
    }
  },
  move: function(event) {
    var position = game.events.getCoordinates(event);
    if (game.events.dragging && 
        position.left !== game.events.draggingPosition.left &&
        position.top !== game.events.draggingPosition.top) {
      game.events.dragging.addClass('dragTarget');
      game.events.dragClone.css({
        left: (position.left - game.events.dragOffset.left) + 'px',
        top: (position.top - game.events.dragOffset.top) + 'px'
      }).show();
    }
  },
  end: function(event) {
    if (event && event.type === 'touchend') {
      // fix touchend target
      var position = game.events.getCoordinates(event), 
          target = $(document.elementFromPoint(position.left, position.top));
      target.mouseup();
    } else if (game.events.dragging) {
      game.events.dragClone.remove();
      game.events.dragging.removeClass('dragTarget');
      game.events.dragging = false;
    }
  },
  clearEvents: function(name) {
    //console.trace('clear', name);
    var events = 'mousedown mouseup touchstart touchend mouseenter mouseleave';
    if (name) {
      var n = '.'+name+' ',
          events_dot_name = events.split(' ').join(n) + n;
      this.off(events_dot_name);
    }
    else this.off(events);
    return this;
  },
  cancel: function(event) {
    if (event && event.preventDefault) event.preventDefault();
    return false;
  },
  leave: function() {
    if (game.mode == 'online') return game.data.ui.leave;
  }
};
