game.language = {
  current: 'en-US',
  available: ['en-US', 'pt-BR'],
  dir: '',
  load: function (cb) {
    var lang = localStorage.getItem('lang');
    if (lang) {
      game.language.set(lang);
      if (cb) { cb(); }
    } else game.db({ 'get': 'lang' }, function (data) {
      if (data.lang) {
        var language = data.lang.split(';')[0].split(',')[0],
            detectLanguage = game.language.available.indexOf(language);
        if (detectLanguage > 0) {
          var lang = game.language.available[detectLanguage];
          game.language.set(lang);
        }
      }
      if (cb) { cb(); }
    });
  },
  set: function (lang) {
    game.language.current = lang;
    game.language.dir = lang + '/';
    localStorage.setItem('lang', lang);
  }
};