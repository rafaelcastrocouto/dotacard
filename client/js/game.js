var game = {
  start: function () {
    game.events.build();
    game.topbar = $('<div>').addClass('topbar').append(game.loader, game.message, game.triesCounter);
    if (window.$ &&
        window.JSON &&
        window.localStorage &&
        window.btoa && window.atob &&
        window.XMLHttpRequest &&
        Modernizr.backgroundsize &&
        Modernizr.csstransforms &&
        Modernizr.generatedcontent &&
        Modernizr.rgba &&
        Modernizr.opacity) {
      game.states.changeTo('loading');
    } else game.states.changeTo('unsupported');
  },
  container: $('.container'),
  loader: $('<span>').addClass('loader'),
  message: $('<span>').addClass('message'),
  triesCounter: $('<small>').addClass('triescounter'),
  scrollspeed: 0.4,
  timeToPick: 25,
  timeToPlay: 30,
  waitLimit: 90,
  connectionLimit: 60,
  dayLength: 12,
  deadLength: 10,
  width: 11,
  height: 6,
  tries: 0,
  id: null,
  seed: null,
  skills: {}, //bundle from ./skills
  data: {}, //json {buffs, heroes, skills, ui, units}
  mode: '', //match, tutorial, campain
  status: '', //turn, unturn, over
  currentData: {}, // match moves data
  currentState: 'noscript', //unsupported, load, log, menu, options, choose, table
  db: function (send, cb) {
    if (typeof send.data !== 'string') {
      send.data = JSON.stringify(send.data);
    }
    $.ajax({
      async: true,
      type: 'GET',
      url: '/db',
      data: send,
      timeout: 4000,
      complete: function (receive) {
        var data;
        if (receive.responseText) {
          data = JSON.parse(receive.responseText);
        }
        if (cb) {
          cb(data || {});
        }
      }
    });
  },
  random: function () {
    game.seed += 1;
    return parseFloat('0.' + Math.sin(game.seed).toString().substr(6));
  },
  reset: function () {
    console.error('Internal error: ', game);
    var r = confirm(game.data.ui.error);
    if (r) { location.reload(true); }
  },
  test: function () {
    game.states.log.input.val('TestBot');
    setTimeout(function () { game.states.log.button.click(); });
    setTimeout(function () { game.states.menu.tutorial.click(); }, 1000);
    setTimeout(function () { $('.pickedbox div:nth-child(1)').contextmenu(); }, 2000);
    setTimeout(function () { $('.pickedbox div:nth-child(2)').contextmenu(); }, 2100);
    setTimeout(function () { $('.pickedbox div:nth-child(3)').contextmenu(); }, 2200);
    setTimeout(function () { $('.pickedbox div:nth-child(4)').contextmenu(); }, 2300);
    setTimeout(function () { $('.pickedbox div:nth-child(5)').contextmenu(); }, 2400);
    setTimeout(function () { game.tutorial.axe.css({opacity: 0}); }, 2500);
    setTimeout(function () { game.match.buildSkills('single'); }, 3000);
    setTimeout(function () { $('.wk-stun.skills').appendTo('.player.hand'); }, 4000);
    setTimeout(function () {$('.map .hero.wk.player').place('G2'); game.status = 'turn'; }, 5000);
  }
};
