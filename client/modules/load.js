game.load = {
  updating: 0,
  totalUpdate: 7, // 5 json + lang + pack
  start: function () {
    game.status = 'loading';
    $('.loadtext .message').text('Updating: ');
    $('.loadtext .progress').text('0%');
    game.load.images.preload();
    game.load.pack();
    if (window.AudioContext) {
      game.audio.build();
      game.load.track();
      game.load.sounds();
    }
    game.load.language(function () {
      game.load.data();
    });
    game.load.ping(function () {
      if (!game.offline && location.host !== 'localhost') { game.load.analytics(); }
    });
    setTimeout(game.load.progress);
  },
  progress: function () {
    clearTimeout(game.timeout);
    var loading = Number.parseInt(game.load.updating / game.load.totalUpdate * 100);
    $('.progress').text(loading + '%');
    if (game.load.updating < game.load.totalUpdate) {
      // loading
      game.status = 'loading';            
      game.timeout = setTimeout(game.load.progress, 10);
    } else if (game.version && game.load.updating === game.load.totalUpdate) {
      game.states.build();
      setTimeout(function () {
        game.states.changeTo('log');
      }, 1000);
    }
  },
  images: {
    array: [
      'tutorial/axe.png',
      'bkg/polygon-dark.jpg',
      'heroes/crystal_maiden_full.jpg',
      'heroes/keeper_of_the_light_full.jpg',
      'heroes/skeleton_king_full.jpg',
      'heroes/lone_druid_full.jpg',
      'heroes/antimage_full.jpg',
      'heroes/nyx_assassin_full.jpg',
      'heroes/pudge_full.jpg',
      'fx/hook.png',
      'bkg/map_vectorized.jpg',
      'cardback.jpg'
    ],
    preload: function () {
      var pre = $('<div>').addClass('preload hidden').appendTo(document.body);
      $(game.load.images.array).each(function () {
        $('<img/>').attr('src', 'img/' + this).appendTo(pre);
      });
    }
  },
  json: function (name, cb) {
    $.ajax({
      async: true,
      type: 'GET',
      url: 'json/' + game.language.dir + name + '.json',
      complete: function (response) {
        game.load.updating += 1;
        var data = JSON.parse(response.responseText);
        game.data[name] = data;
        if (cb) {
          cb(data);
        }
      }
    });
  },
  language: function (cb) {
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
  pack: function () {
    $.ajax({
      async: true,
      type: 'GET',
      url: 'package.json',
      complete: function (response) {
        game.load.updating += 1;
        var data = JSON.parse(response.responseText);
        $.each(data, function (name) {
          game[name] = this;
        });
      }
    });
  },
  data: function () {
    game.load.json('ui');
    game.load.json('heroes');
    game.load.json('units');
    game.load.json('skills', function () {
      var hero, skill;
      for (hero in game.data.skills) {
        if (game.data.skills.hasOwnProperty(hero)) {
          for (skill in game.data.skills[hero]) {
            if (game.data.skills[hero].hasOwnProperty(skill)) {
              game.data.skills[hero][skill].buff = hero + '-' + skill;
              game.data.skills[hero][skill].hero = hero;
              game.data.skills[hero][skill].skill = skill;
            }
          }
        }
      }
    });
    game.load.json('buffs', function () {
      var hero, buff;
      for (hero in game.data.buffs) {
        if (game.data.buffs.hasOwnProperty(hero)) {
          for (buff in game.data.buffs[hero]) {
            if (game.data.buffs[hero].hasOwnProperty(buff)) {
              game.data.buffs[hero][buff].buff = hero + '-' + buff;
              game.data.buffs[hero][buff].hero = hero;
              game.data.buffs[hero][buff].skill = buff;
            }
          }
        }
      }
    });
  },
  audio: function (name, cb) {
    var ajax = new XMLHttpRequest();
    ajax.open('GET', '/audio/' + name + '.mp3', true);
    ajax.responseType = 'arraybuffer';
    ajax.onload = function () {
      game.audio.context.decodeAudioData(ajax.response, function (buffer) {
        game.audio.buffers[name] = buffer;
        //game.load.updating += 1;
        if (cb) { cb(); }
      });
    };
    ajax.send();
  },
  sounds: function () {
    //game.load.totalUpdate += game.audio.sounds.length;
    $(game.audio.sounds).each(function (a, b) {
      game.load.audio(b);
    });
  },
  track: function () {
    game.song = 'doomhammer';
    //game.load.totalUpdate += 1;
    game.load.audio(game.song, function () {
      game.audio.play(game.song);
      setInterval(function () {
        game.audio.play(game.song);
      }, game.audio.buffers[game.song].duration * 1000);
    });
  },
  ping: function (cb) {
    var start = new Date();
    $.ajax({
      async: true,
      type: 'GET',
      url: game.homepage,
      complete: function (response) {
        game.ping = new Date() - start;
        if (response.readyState === 4) {
          game.offline = false;
        } else { game.offline = true; }
        if (cb) { cb(); }
      }
    });
  },
  analytics: function () {
    $('<script src="analytics/google.analytics.min.js">').appendTo('body');
  },
  reset: function () {
    console.log('Internal error: ', game);
    var r = confirm(game.data.ui.error);
    if (r) { location.reload(true); }
  }
};
