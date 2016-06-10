game.history = {
  validState: function (state) {
    if (state && 
        game.states[state] && game.states[state].start &&
        state != game.currentState) {
      if (game.mode == 'library' || 
          game.mode == 'tutorial') {
        if (state != 'unsupported' &&
            state != 'loading')  return true;
      } else {
        if (state != 'unsupported' &&
            state != 'loading' &&
            state != 'choose' &&
            state != 'table')  return true;
      }
    }
    return false;
  },
  recover: function () {
    var mode = localStorage.getItem('mode');
    if (mode) game.setMode(mode);
    var hash = game.history.hash,
        valid = game.history.validState(hash),
        log = localStorage.getItem('log'),
        recovering = (log && valid);
    if (recovering) {
      game.states.log.out.show();
      game.states.options.opt.show();
      game.player.name = log;
      game.history.jumpTo(hash, recovering);
    } else {
      game.history.jumpTo('log');
    }
  },
  jumpTo: function (state, recover) {
    game.clear();
    game.loader.addClass('loading');
    game.db({ 'get': 'server' }, function (server) {
      if (server.status === 'online') {
        game.loader.removeClass('loading');
        game.states.changeTo(state, recover);
      } else { game.reset(); }
    });
  },
  stateChange: function (event) {
    //console.log('e',location.hash, game.currentState);
    var hash = location.hash.slice(1);
    var change = game.history.validState(hash);
    if (change) {
      game.clear();
      if (hash == 'log' || hash == 'menu') game.setMode('');
      else if (hash == 'choose' || hash == 'table') game.setMode(game.mode);
      game.history.jumpTo(hash);
      return true;
    } else {
      location.hash = game.currentState;
      return false;
    }
  }
};
