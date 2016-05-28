var game = {
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
  timeoutArray: [],
  skills: {}, //bundle from ./skills
  data: {}, //json {buffs, heroes, skills, ui, units}
  mode: '', //online, tutorial, campain
  status: '', //turn, unturn, over
  currentData: {}, // moves data
  currentState: 'noscript', //unsupported, load, log, menu, options, choose, table
  start: function () {
    if (window.$ &&
        window.JSON &&
        window.localStorage &&
        window.btoa && window.atob &&
        window.XMLHttpRequest) {
      game.events.savedHash = location.hash.slice(1);
      var mode = localStorage.getItem('mode');
      if (mode) game.mode = mode;
      game.events.build();
      game.topbar = $('<div>').addClass('topbar').append(game.loader, game.message, game.triesCounter);
      game.states.changeTo('loading');
    } else game.states.changeTo('unsupported');
  },
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
  setMode: function (mode) {
    game.mode = mode;
    localStorage.setItem('mode', mode);
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
  }
};
