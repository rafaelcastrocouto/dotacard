game.history = {
  build: function () {
    game.history.state = localStorage.getItem('state');
    game.history.mode = localStorage.getItem('mode');
  },
  validState: function (state) {
    return (
      state && 
      game.states[state] && game.states[state].start &&
      state !== game.currentState
    );
  },
  recover: function () {
    var mode = game.history.mode,
        state = game.history.state,
        valid = game.history.validState(state),
        log = localStorage.getItem('log'),
        recovering = (log && valid);
    if (recovering) {
      game.states.log.out.show();
      game.states.options.opt.show();
      game.player.name = log;
      if (mode) game.setMode(mode, recovering);
      game.history.jumpTo(state, recovering);
    } else {
      game.history.jumpTo('log');
    }
  },
  jumpTo: function (state, recover) {
    game.clear();
    game.loader.addClass('loading');
    game.states.buildState(state);
    game.db({ 'get': 'server' }, function (server) {
      if (server.status === 'online') {
        game.states.changeTo(state, recover);
      } else { game.reset(); }
    });
  }
};
