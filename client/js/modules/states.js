game.states = {
  el: $('.states').first(),
  valid: ['log', 'menu', 'options', 'choose', 'table'],
  build: function () {
    var l = 0;
    var count = function () {
      l++;
      if (l === game.states.valid.length) game.history.recover();
    };
    for (var i=0; i<game.states.valid.length; i++) {
      game.states.buildState(game.states.valid[i], count);
    }
    game.chat.build();
  },
  buildState: function (name, cb) {
    var state = game.states[name];
    if (state && !state.builded) {
      state.builded = true;
      state.el = $('<div>').addClass('hidden state ' + name);
      if (state.build) state.build();
      state.el.appendTo(game.states.el);
    }
    if (cb) cb();
  },
  changeTo: function (state, recover) {
    if (state !== game.currentState) {
      game.clearTimeouts();
      game.states.buildState(state);
      var newstate,
        pre = game.currentState,
        oldstate = game.states[pre];
      if (oldstate) {
        setTimeout(function () {
          if (this.el) this.el.addClass('hidden');
          if (this.end) this.end();
        }.bind(oldstate), 100);
      }
      
      newstate = game.states[state];
      if (newstate.el) {
        setTimeout(function () {
          localStorage.setItem('state', state);
          if (newstate.chat && game.backState !== 'log') game.chat.el.appendTo(newstate.el);
          newstate.el.append(game.topbar).removeClass('hidden');
        }, 305);
      }
      game.currentState = state;
      if (pre != 'loading' && pre != 'noscript') {
        localStorage.setItem('backstate', pre);
        game.backState = pre;
      }
      if (newstate.start) newstate.start(recover);
    }
  },
  backState: function () {
    if (!game.backState) game.backState = localStorage.getItem('backstate');
    game.states.changeTo(game.backState);
  }
};
