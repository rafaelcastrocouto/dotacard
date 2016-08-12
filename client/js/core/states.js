game.states = {
  el: $('.states').first(),
  valid: ['log', 'menu', 'options', 'choose', 'table'],
  build: function (cb) {
    for (var i=0; i<game.states.valid.length; i++) {
      game.states.buildState(game.states.valid[i]);
    }
    if (cb) cb();
  },
  buildState: function (name) {
    var state = game.states[name];
    if (state && !state.builded) {
      state.builded = true;
      state.el = $('<div>').addClass('state ' + name).hide();
      if (state.build) state.build();
      state.el.appendTo(game.states.el);
    }
  },
  changeTo: function (state, recover) {
    game.timeout(100, function (state, recover) {
      if (state !== game.currentState) {
        game.clearTimeouts();
        game.states.buildState(state);
        var newstate,
          pre = game.currentState,
          oldstate = game.states[pre];
        if (oldstate) {
          if (oldstate.end) oldstate.end();
          if (oldstate.el) oldstate.el.hide();
        }
        newstate = game.states[state];
        if (newstate.el) {
          localStorage.setItem('state', state);
          if (newstate.chat && game.backState !== 'log' && game.chat.el) {
            game.chat.el.appendTo(newstate.el);
          }
          newstate.el.append(game.topbar);
          newstate.el.show();
        }
        game.currentState = state;
        if (pre != 'loading' && pre != 'noscript') {
          localStorage.setItem('backstate', pre);
          game.backState = pre;
        }
        if (newstate.start) newstate.start(recover);
      }
    }.bind(this, state, recover));
  },
  backState: function () {
    if (!game.backState) game.backState = localStorage.getItem('backstate');
    game.states.changeTo(game.backState);
  }
};
