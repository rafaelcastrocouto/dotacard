/* by rafælcastrocouto */
/*jslint browser: true, regexp: true */
/*global AudioContext, btoa, atob, $, Modernizr, alert, confirm, prompt, console*/

//todo
//projectiles
//end turn button

var game = {
  container: $('.container').first(),
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
  width: 12,
  height: 8,
  tries: 0,
  id: null,
  seed: null,
  data: {}, //json {buffs, heroes, skills, ui, units}
  currentData: {}, 
  mode: '', //online, tutorial
  status: '', //search, picking, turn, unturn, over
  currentState: 'noscript', //unsupported, load, log, menu, options, choose, table
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
  language: {
    current: 'en-US',
    available: ['en-US', 'pt-BR'],
    dir: ''
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
  utils: function () {
    if (!Number.prototype.map) { Number.prototype.map = function (a, b, c, d) { return c + (d - c) * ((this - a) / (b - a)); }; }
    if (!Number.prototype.limit) { Number.prototype.limit = function (a, b) { return Math.min(b, Math.max(a, this)); }; }
    if (!Number.prototype.round) { Number.prototype.round = function (a) { return Math.round(this); }; }
    if (!Number.prototype.floor) { Number.prototype.floor = function () { return Math.floor(this); }; }
    if (!Number.prototype.ceil) { Number.prototype.ceil = function () { return Math.ceil(this); }; }
    if (!Number.prototype.toInt) { Number.prototype.toInt = function () { return Number.parseInt(this); }; }
    if (!Number.prototype.toRad) { Number.prototype.toRad = function () { return this / 180 * Math.PI; }; }
    if (!Number.prototype.toDeg) { Number.prototype.toDeg = function () { return 180 * this / Math.PI; }; }
    if (!Array.prototype.random) { Array.prototype.random = function () { return this[Math.floor(Math.random() * this.length)]; }; }
    if (!Array.prototype.erase) {
      Array.prototype.erase = function (a) {
        var b;
        for (b = this.length - 1; b > -1; b -= 1) {
          if (this[b] === a) {
            this.splice(b, 1);
          }
        }
        return this;
      };
    }
    if (!Function.prototype.bind) {
      Function.prototype.bind = Function.prototype.bind || function (a) {
        var b = this;
        return function () {
          var c = Array.prototype.slice.call(arguments);
          return b.apply(a || null, c);
        };
      };
    }
    $.fn.hasClasses = function (list) {
      var classes = list.split(' '), i;
      for (i = 0; i < classes.length; i += 1) {
        if (this.hasClass(classes[i])) {
          return true;
        }
      }
      return false;
    };
    $.fn.hasAllClasses = function (list) {
      var classes = list.split(' '), i;
      for (i = 0; i < classes.length; i += 1) {
        if (!this.hasClass(classes[i])) {
          return false;
        }
      }
      return true;
    };
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
    window.ontouchstart = game.cancelEvent;
    window.oncontextmenu = game.cancelEvent;
    window.onbeforeunload = function () {
      if (game.mode == 'online') {
        return game.data.ui.leave;
      }
    };
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
