game.load = {
  updating: 0,
  totalUpdate: 7, // 5 json + lang + pack
  start: function () {
    $('.loadtext .message').text('Updating: ');
    $('.loadtext .progress').text('0%');
    game.load.images.preload();
    game.load.pack();
    if (window.AudioContext) game.audio.build();
    game.language.load(function () {
      game.load.data();
    });
    game.load.ping(function () {
      if (!game.offline && location.host.search('localhost') < 0) {
        game.load.analytics();
      }
    });
    game.load.progress();
  },
  progress: function () {
    var loading = Number.parseInt(game.load.updating / game.load.totalUpdate * 100);
    $('.progress').text(loading + '%');
    if (game.load.updating < game.load.totalUpdate) {
      game.timeout(35, game.load.progress);
    } else if (game.version && game.load.updating === game.load.totalUpdate) {
      game.states.build();
      game.timeout(800, game.load.end);
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
  pack: function () {
    $.ajax({
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
  ping: function (cb) {
    var start = new Date();
    $.ajax({
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
  end: function () {
    if (!game.history.recovering())  game.states.changeTo('log');
  }
};
