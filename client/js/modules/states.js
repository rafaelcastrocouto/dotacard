game.states = {
  el: $('.states').first(),
  build: function () {
    var preBuild = ['log', 'menu', 'options', 'choose', 'table'];
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
  changeTo: function (state, recover) {
    if (state !== game.currentState) {
      game.clearTimeouts();
      game.states.buildState(state);
      var newstate,
        pre = game.currentState,
        oldstate = game.states[pre];
      if (oldstate && oldstate.el) oldstate.el.fadeOut(100);
      if (oldstate && oldstate.end) oldstate.end();
      newstate = game.states[state];
      if (newstate.el) {
        setTimeout(function () {
          newstate.el.append(game.topbar).fadeIn(100);
        }, 105);
      }
      game.currentState = state;
      if (pre != 'loading' && pre != 'noscript') {
        localStorage.setItem('backstate', pre);
        game.backState = pre;
      }
      if (newstate.start) newstate.start(recover);
      location.hash = state;
    }
  },
  backState: function () {
    if (!game.backState) game.backState = localStorage.getItem('backstate');
    game.states.changeTo(game.backState);
  }
};
