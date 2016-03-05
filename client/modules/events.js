game.events = {
  build: function () {
    game.card.bindJquery();
    $.fn.onLeftClick = game.events.onLeftClick;
    $.fn.onrightClick = game.events.onrightClick; 
    $.fn.clearEvents = game.events.clear; 
    window.ontouchstart = function (e) {
     var t = $(e.target);
     if (t.is('input[type=text]')) t.focus();
     if (t.is('input[type=radio], input[type=checkbox], a')) t.click();
     if (e.preventDefault) e.preventDefault();
     return false;
    };
    window.oncontextmenu = game.events.cancel;
    window.onbeforeunload = function () {
      if (game.mode == 'match') {
        return game.data.ui.leave;
      }
    };
  },
  onLeftClick: function (cb) {
    this.on('click touchstart', cb);
    return this;
  },
  onrightClick: function (cb) {
    this.on('contextmenu taphold drop dragdrop', cb).on('dragenter dragover', game.events.cancel);
    return this;
  },
  clear: function () {
    this.off('click touchstart');
    this.off('contextmenu taphold drop dragdrop');
  },
  cancel: function (e) {
    if (e && e.preventDefault) e.preventDefault();
    return false;
  }
};