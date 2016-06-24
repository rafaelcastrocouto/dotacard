game.states.loading = {
  updating: 0,
  totalUpdate: 7, // language + ui.json + heroes.json + skills.json + buffs.json + package.json
  build: function () {
    this.box = $('<div>').addClass('box');
    this.logo = $('<div>').appendTo(this.box).addClass('logo slide');
    this.title = $('<img>').appendTo(this.logo).attr({alt: 'DOTA', src: 'img/title.png'}).addClass('h1');
    this.subtitle = $('<img>').appendTo(this.logo).attr({alt: 'CARD', src: 'img/subtitle.png'}).addClass('h2');
    this.h2 = $('<p>').appendTo(this.box).addClass('loadtext').html('<span class="loader loading"></span><span class="message">Updating: </span><span class="progress">0%</span>');
    this.el.append(this.box);
  },
  start: function () {
    game.states.loading.package();
    if (window.AudioContext) game.audio.build();
    game.language.load(function () {
      game.states.loading.updated();
      game.states.loading.data();
    });
    game.states.loading.ping(function () {
      if (!game.offline) game.states.loading.analytics();
    });
    game.states.loading.progress();
  },
  progress: function () {
    var loading = Number.parseInt(game.states.loading.updating / game.states.loading.totalUpdate * 100);
    $('.progress').text(loading + '%');
    if (game.states.loading.updating < game.states.loading.totalUpdate) {
      game.timeout(800, game.states.loading.progress);
    } else if (game.states.loading.updating === game.states.loading.totalUpdate) {
      game.timeout(800, function () {
        game.states.build();
      });
    }
  },
  updated: function () {
    game.states.loading.updating += 1;
  },
  json: function (name, cb) {
    $.ajax({
      type: 'GET',
      url: game.dynamicHost + 'json/' + game.language.dir + name + '.json',
      complete: function (response) {
        game.states.loading.updated();
        var data = JSON.parse(response.responseText);
        game.data[name] = data;
        if (cb) {
          cb(data);
        }
      }
    });
  },
  package: function () {
    $.ajax({
      type: 'GET',
      url: game.dynamicHost + 'package.json',
      complete: function (response) {
        game.states.loading.updated();
        var data = JSON.parse(response.responseText);
        $.each(data, function (name) {
          game[name] = this;
        });
      }
    });
  },
  data: function () {
    game.states.loading.json('ui');
    game.states.loading.json('heroes');
    game.states.loading.json('units');
    game.states.loading.json('skills', function () {
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
    game.states.loading.json('buffs', function () {
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
      url: game.dynamicHost,
      complete: function (response) {
        game.ping = new Date() - start;
        if (response.readyState === 4 && location.host.search('localhost') < 0) {
          game.offline = false;
        } else { game.offline = true; }
        if (cb) { cb(); }
      }
    });
  },
  analytics: function () {
    $('<script src="analytics/google.analytics.min.js">').appendTo('body');
  }
};
