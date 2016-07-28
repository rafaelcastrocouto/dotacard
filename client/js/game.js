var game = {
  staticHost: 'http://rafaelcastrocouto.github.io/dotacard/client/',
  dynamicHost: 'http://dotacard.herokuapp.com/',
  container: $('.game-container'),
  loader: $('<span>').addClass('loader'),
  message: $('<span>').addClass('message').html('<b>ALERT</b>: This game is in pre-alpha and bugs may (will) happen.'),
  triesCounter: $('<small>').addClass('triescounter'),
  timeToPick: 40,
  timeToPlay: 60,
  waitLimit: 300,
  connectionLimit: 120,
  dayLength: 12,
  deadLength: 8,
  width: 9,
  height: 6,
  tries: 0,
  seed: 0,
  id: null,
  timeoutArray: [],
  skills: {},
  data: {}, //json {heroes, skills, ui}
  mode: '', //online, tutorial, campain
  currentData: {}, // current game data
  currentState: 'noscript', //unsupported, load, log, menu, options, choose, table
  start: function () {
    if (window.JSON &&
        window.localStorage &&
        window.btoa && window.atob &&
        window.XMLHttpRequest) {
      game.debug = (localStorage.getItem('debug') || location.hostname == 'localhost');
      if (game.debug) {
        game.staticHost = '';
        game.dynamicHost = '';
      }
      game.utils();
      game.events.build();
      game.history.build();
      game.topbar = $('<div>').addClass('topbar').append(game.loader, game.message, game.triesCounter);
      game.states.changeTo('loading');
    } else game.states.changeTo('unsupported');
  },
  isPlayerTurn: function () {
    return !game.states.table.el.hasClass('unturn');
  },
  opponent: function (side) {
    return (side == 'player') ? 'enemy' : 'player';
  },
  db: function (send, cb) {
    if (typeof send.data !== 'string') {
      send.data = JSON.stringify(send.data);
    }
    $.ajax({
      async: true,
      type: 'GET',
      url: game.dynamicHost + 'db',
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
  setMode: function (mode, recover) {
    if (mode) {
      game.mode = mode;
      localStorage.setItem('mode', mode);
      game[mode].build(recover);
    }
  },
  clear: function () {
    if (game.mode && game[game.mode].clear) game[game.mode].clear();
    if (game.states[game.currentState].clear) game.states[game.currentState].clear();
    game.mode = false;
    localStorage.removeItem('mode');
  },
  confirm: function (cb, text) {
    swal({
      title: text || game.data.ui.sure,
      type: 'warning',
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: game.data.ui.yes,
      cancelButtonText: game.data.ui.no,
    }).then(cb);
  },
  error: function (cb) {
    swal({
      title: game.data.ui.error,
      text: game.data.ui.reload,
      type: 'error',
      showCancelButton: true,
      buttonsStyling: false,
      confirmButtonText: game.data.ui.yes,
      cancelButtonText: game.data.ui.no,
    }).then(cb);
  },
  reset: function () {
    game.error(function(confirmed) { 
      if (confirmed) {
        game.clear();
        localStorage.setItem('state', 'menu');
        location.reload(true);
      }
    });
  }
};
