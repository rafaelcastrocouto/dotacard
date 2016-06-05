game.language = {
  current: 'en-US',
  available: ['en-US', 'pt-BR'],
  dir: '',
  load: function (cb) {    
    game.db({ 'get': 'lang' }, function (data) {
      game.load.updating += 1;
      if (data.lang) {
        var language = data.lang.split(';')[0].split(',')[0],
            detectLanguage = game.language.available.indexOf(language);
        if (detectLanguage > 0) {
          game.language.current = game.language.available[detectLanguage];
          game.language.dir = game.language.current + '/';
        }
      }
      if (cb) { cb(); }
    });
  },
};