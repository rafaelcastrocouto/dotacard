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
      location.hash = state;
    }
  },
  backState: function () {
    game.states.changeTo(game.backState);
  }
};
