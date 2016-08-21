game.states = {
  el: $('.states').first(),
  valid: ['log', 'menu', 'options', 'choose', 'result', 'table', 'vs'],
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
    var oldstate = game.states[game.currentState];
    if (oldstate) {
      if (oldstate.end) oldstate.end();
      if (oldstate.el) oldstate.el.hide();
    }    
    game.timeout(10, function (state, recover) {
      if (state !== game.currentState) {
        game.clearTimeouts();
        game.states.buildState(state);
        var newstate, old = game.currentState;
        newstate = game.states[state];
        if (newstate.el) {
          localStorage.setItem('state', state);
          if (newstate.chat && game.backState !== 'log' && game.chat.el) {
            game.chat.el.appendTo(newstate.el);
          }
          newstate.el.append(game.topbar);
          newstate.el.fadeIn(400);
        }
        game.currentState = state;
        if (old != 'loading' && old != 'noscript') {
          localStorage.setItem('backstate', old);
          game.backState = old;
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
