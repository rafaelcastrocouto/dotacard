game.history = {
  validState: function (state) {
    if (state && 
        game.states[state] &&
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
  recovering: function () {
    var hash = game.events.savedHash,
        valid = game.history.validState(hash), 
        log = localStorage.getItem('log'),
        recovering = (log && valid);
    if (recovering) {
      game.states.log.out.show();
      game.states.options.opt.show();
      game.player.name = log;
      game.history.jumpTo(hash, recovering);
    }
    return recovering;
  },
  jumpTo: function (state, recover) {
    if (game.mode && game[game.mode].clear) game[game.mode].clear();
    if (game.states[game.currentState].clear) game.states[game.currentState].clear();
    game.loader.addClass('loading');
    game.db({ 'get': 'server' }, function (server) {
      if (server.status === 'online') {
        game.loader.removeClass('loading');
        game.states.changeTo(state, recover);
      } else { game.reset(); }
    }.bind());
  },
  stateChange: function (event) {
    //console.log('e',location.hash, game.currentState);
    var hash = location.hash.slice(1);
    var change = game.history.validState(hash);
    if (change) {
      if (game.mode && game[game.mode].clear) game[game.mode].clear();
      if (game.states[game.currentState].clear) game.states[game.currentState].clear();
      if (hash == 'log' || hash == 'menu') game.setMode('');
      game.history.jumpTo(hash);
      return true;
    } else {
      location.hash = game.currentState;
      return false;
    }
  }
};