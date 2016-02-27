/* by rafælcastrocouto */
/*jslint browser: true, regexp: true */
/*global AudioContext, btoa, atob, $, Modernizr, alert, confirm, prompt, console*/

//todo
//projectiles
//end turn button

var game = {
  start: function () {
    game.topbar = $('<div>').addClass('topbar').append(game.loader, game.message, game.triesCounter);
    if (window.$ &&
        window.JSON &&
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
  fork: $('.forklink'),
  scrollspeed: 0.4,
  timeToPick: 25,
  timeToPlay: 30,
  waitLimit: 90,
  connectionLimit: 60,
  dayLength: 12,
  deadLength: 10,
  width: 12,
  height: 8,
  tries: 0,
  id: null,
  seed: null,
  skills: {}, //bundle from ./skills
  data: {}, //json {buffs, heroes, skills, ui, units}
  mode: '', //match, tutorial
  status: '', //turn, unturn, over  
  currentData: {}, // match moves data  
  language: {
    current: 'en-US',
    available: ['en-US', 'pt-BR'],
    dir: ''// ./json
  },
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
  cancelEvent: function (e) {
    if (e && e.preventDefault) e.preventDefault();
    return false;
  },
  events: function () {
    game.card.bindJquery();
    $.fn.leftClickEvent = game.leftClickEvent;
    $.fn.rightClickEvent = game.rightClickEvent; 
    $.fn.clearEvents = game.clearEvents; 
    window.ontouchstart = function (e) {
     var t = $(e.target);
     if (t.is('input[type=text]')) t.focus();
     if (t.is('input[type=radio], input[type=checkbox], a')) t.click();
     if (e.preventDefault) e.preventDefault();
     return false;
    };
    window.oncontextmenu = game.cancelEvent;
    window.onbeforeunload = function () {
      if (game.mode == 'match') {
        return game.data.ui.leave;
      }
    };
  },
  leftClickEvent: function (cb) {
    this.on('click touchstart', cb);
    return this;
  },
  rightClickEvent: function (cb) {
    this.on('contextmenu taphold drop dragdrop', cb).on('dragenter dragover', game.cancelEvent);
    return this;
  },
  clearEvents: function () {
    this.off('click touchstart');
    this.off('contextmenu taphold drop dragdrop');
  },
  timeoutArray: [],
  timeout: function (ms, cb, arg) {
    var t = setTimeout(function (arg) {
        cb(arg);
        game.timeoutArray.erase(t);
    }, ms, arg);
    game.timeoutArray.push(t);
    return t;
  },
  clearTimeouts: function () {
    for (var i=0; i < game.timeoutArray.length; i++) {
      clearTimeout(game.timeoutArray[i]);
    }
    game.timeoutArray = [];
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
