game.language = {
  current: 'en-US',
  available: ['en-US', 'pt-BR'],
  dir: '', // ./json path
  load: function (cb) {
    game.db({ 'get': 'lang' }, function (data) {
      game.load.updating += 1;
      if (data.lang) {
        game.language.detected = data.lang.split(';')[0].split(',')[0];
        if (game.language.available.indexOf(game.language.detected) > 0) {
          game.language.current = game.language.detected;
          game.language.dir = game.language.current + '/';
        }
      }
      if (cb) { cb(); }
    });
  },
};