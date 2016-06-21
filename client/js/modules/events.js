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
      position.left = event.originalEvent.changedTouches[0].clientX;
      position.top = event.originalEvent.changedTouches[0].clientY;
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
      game.events.dragClone = card.clone().removeClass('dragTarget').hide().addClass('dragTargetClone ' + game.currentState + fromMap).appendTo(game.container);
      game.events.dragOffset = {
        left: game.offset.left + (position.left - cardOffset.left),
        top: game.offset.top + (position.top - cardOffset.top)
      };
    }
  },
  move: function(event) {
    if (game.events.dragging) {
      var position = game.events.getCoordinates(event);
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
    if (name) this.off('mousedown.' + name + ' mouseup.' + name + ' touchstart.' + name + ' touchend.' + name + ' mouseenter.' + name + ' mouseleave.' + name);
    else this.off('mousedown mouseup touchstart touchend mouseenter mouseleave');
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
