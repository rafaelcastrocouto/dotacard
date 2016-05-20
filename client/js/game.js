var game = {
  start: function () {
    game.events.savedHash = location.hash.slice(1);
    game.events.build();
    game.topbar = $('<div>').addClass('topbar').append(game.loader, game.message, game.triesCounter);
    if (window.$ &&
        window.JSON &&
        window.localStorage &&
        window.btoa && window.atob &&
        window.XMLHttpRequest) {
      game.states.changeTo('loading');
    } else game.states.changeTo('unsupported');
  },
  container: $('.game-container'),
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
  width: 9,
  height: 6,
  tries: 0,
  id: null,
  seed: null,
  skills: {}, //bundle from ./skills
  data: {}, //json {buffs, heroes, skills, ui, units}
  mode: '', //online, tutorial, campain
  status: '', //turn, unturn, over
  currentData: {}, // moves data
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
    swal({
      title: game.data.ui.error,
      text: game.data.ui.reload,
      type: 'error',
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: game.data.ui.yes,
      cancelButtonText: game.data.ui.no,
    }).then(function(isConfirm) {
      if (isConfirm === true) {
        location.reload(true);
      }
    });
  },
  test: function () {
    game.states.log.input.val('TestBot');
    setTimeout(function () { game.states.log.button.mouseup(); }, 2000);
    setTimeout(function () { game.states.menu.tutorial.mouseup(); }, 4000);
    setTimeout(function () { $('.pickedbox div:nth-child(1)').mouseup(); }, 5000);
    setTimeout(function () { $('.pickedbox div:nth-child(2)').mouseup(); }, 5100);
    setTimeout(function () { $('.pickedbox div:nth-child(3)').mouseup(); }, 5200);
    setTimeout(function () { $('.pickedbox div:nth-child(4)').mouseup(); }, 5300);
    setTimeout(function () { $('.pickedbox div:nth-child(5)').mouseup(); }, 5400);
    //setTimeout(function () { game.tutorial.axe.css({opacity: 0}); }, 2500);
    //setTimeout(function () { game.online.buildSkills('single'); }, 3000);
    //setTimeout(function () { $('.wk-stun.skills').appendTo('.player.hand'); }, 4000);
    //setTimeout(function () {$('.map .hero.wk.player').place('G2'); game.status = 'turn'; }, 5000);
  }
};
