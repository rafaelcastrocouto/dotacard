game.states.log = {
  remembername: true,
  build: function () {
    this.box = $('<div>').appendTo(this.el).addClass('box');
    $('.logo').clone().prependTo(this.box);
    this.title = $('<h1>').appendTo(this.box).text(game.data.ui.choosename);
    this.input = $('<input>').appendTo(this.box).attr({
      placeholder: game.data.ui.logtype,
      type: 'text',
      maxlength: 24
    }).keydown(function (e) {
      if (e.which === 13) { game.states.log.login(); }
    });
    this.button = $('<div>').addClass('button').appendTo(this.box).text(game.data.ui.log).attr({
      title: game.data.ui.choosename
    }).leftClickEvent(this.login);
    this.rememberlabel = $('<label>').appendTo(this.box).append($('<span>').text(game.data.ui.remember));
    this.remembercheck = $('<input>').attr({
      type: 'checkbox',
      name: 'remember',
      checked: true
    }).change(this.remember).appendTo(this.rememberlabel);
    var rememberedname = $.cookie('name');
    if (rememberedname) { this.input.val(rememberedname); }
    this.out = $('<small>').addClass('logout').insertAfter(game.message).text(game.data.ui.logout).leftClickEvent(this.logout);
  },
  start: function () {
    game.message.html('Version <small class="version">' + game.version + '</small>');
    game.states.log.out.hide();
    this.input.focus();
    game.states.options.opt.show();
  },
  login: function () {
    var name = game.states.log.input.val();
    if (name) {
      game.player.name = name;
      if (game.states.log.remembername) {
        $.cookie('name', name);
      } else {
        $.removeCookie('name');
      }
      game.states.log.button.attr('disabled', true);
      game.loader.addClass('loading');
      game.db({ 'get': 'server' }, function (server) {
        if (server.status === 'online') {
          game.states.log.out.show();
          game.states.changeTo('menu');
        } else { game.reset(); }
      });
    } else {
      game.states.log.input.focus();
    }
  },
  logout:function () {
    if (game.mode) {
      if (game.states[game.currentState].clear) game.states[game.currentState].clear();
      game[game.mode].clear();
      game.clearTimeouts();
    }
    game.states.changeTo('log');
  },
  end: function () {
    this.button.attr('disabled', false);
  },
  remember: function () {
    game.states.log.remembername = !game.states.log.remembername;
    if (!game.states.log.remembername) { $.removeCookie('name'); }
  }
};