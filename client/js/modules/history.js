game.history = {
  build: function () {
    game.history.state = localStorage.getItem('state');
    game.history.mode  = localStorage.getItem('mode');
    game.history.data  = localStorage.getItem('data');
    game.history.seed  = localStorage.getItem('seed');
    game.history.last  = localStorage.getItem('last-activity');
  },
  validState: function (state) {
    return (
      state && 
      game.states[state] && game.states.valid.indexOf(state) >= 0 &&
      state !== game.currentState
    );
  },
  recover: function () {
    var mode = game.history.mode,
        state = game.history.state,
        valid = game.history.validState(state),
        log = localStorage.getItem('log'),
        logged = (localStorage.getItem('logged') === 'true');
    var delay = 1000 * 60 * 60 * 4;
    var recent = (new Date().valueOf() - game.history.last) < delay; // 4 hours
    var recovering = logged && log && valid && recent;
    if (recovering) {
      game.states.log.out.show();
      game.states.options.opt.show();
      game.player.name = log;
      game.chat.build();
      game.chat.set(game.data.ui.reconnected);
      if (mode) game.setMode(mode, recovering);
      if (state == 'table') state = 'vs';
      game.history.jumpTo(state, recovering);
    } else {
      game.history.jumpTo('log');
    }
  },
  jumpTo: function (state, recover) {
    localStorage.setItem('last-activity', new Date().valueOf());
    if (!recover) game.clear();
    game.db({ 'get': 'server' }, function (server) {
      if (server.status === 'online') {
        game.states.changeTo(state, recover);
      } else { game.reset(); }
    });
  }
};
