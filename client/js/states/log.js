game.states.log = {
  remembername: true,
  build: function () {
    this.box = $('<div>').addClass('box');
    this.logo = $('<div>').appendTo(this.box).addClass('logo slide');
    this.title = $('<img>').appendTo(this.logo).attr({alt: 'DOTA', src: 'img/title.png'}).addClass('h1');
    this.subtitle = $('<img>').appendTo(this.logo).attr({alt: 'CARD', src: 'img/subtitle.png'}).addClass('h2');
    this.title = $('<h1>').appendTo(this.box).text(game.data.ui.choosename);
    this.form = $('<form>').appendTo(this.box).on('submit', function (event) { event.preventDefault(); return false; });
    this.input = $('<input>').appendTo(this.form).attr({placeholder: game.data.ui.logtype, type: 'text', required: 'required', minlength: 3, maxlength: 24, tabindex: 1}).keydown(function (event) { if (event.which === 13) { game.states.log.login(); } });
    this.button = $('<input>').addClass('button').appendTo(this.form).val(game.data.ui.log).attr({title: game.data.ui.choosename, type: 'submit'}).on('mouseup touchend', this.login);
    this.rememberlabel = $('<label>').addClass('remembername').appendTo(this.form).append($('<span>').text(game.data.ui.remember));
    this.remembercheck = $('<input>').attr({type: 'checkbox', name: 'remember', checked: true}).change(this.remember).appendTo(this.rememberlabel);
    this.out = $('<small>').addClass('logout').hide().insertAfter(game.message).text(game.data.ui.logout).on('mouseup touchend', this.logout);
    var rememberedname = localStorage.getItem('name');
    if (rememberedname) { this.input.val(rememberedname); }
    this.el.append(this.box);
  },
  start: function () {
    game.message.html('');
    game.alert(game.data.ui.alphaalert + game.version + '</small>');
    game.states.log.out.hide();
    game.states.options.opt.show();
    game.loader.removeClass('loading');
    game.triesCounter.text('');
    game.clear();
    game.timeout(200, function () { game.states.log.input.focus(); });
  },
  login: function () {
    var valid = game.states.log.input[0].checkValidity(),
        name = game.states.log.input.val();
    if (name && valid) {
      game.player.name = name;
      if (game.states.log.remembername) {
        localStorage.setItem('name', name);
      } else {
        localStorage.removeItem('name');
      }
      localStorage.setItem('log', name);
      localStorage.setItem('logged', 'true');
      game.states.log.button.attr('disabled', true);
      game.chat.set(game.data.ui.joined);
      game.chat.build();
      game.states.changeTo('menu');
    } else {
      game.states.log.input.focus();
    }
  },
  logout: function () {
    game.confirm(function (confirmed) {
      if (confirmed) {
        localStorage.setItem('logged', 'false');
        game.clear();
        location.reload();
      }
    });
  },
  end: function () {
    this.button.attr('disabled', false);
  },
  remember: function () {
    game.states.log.remembername = !game.states.log.remembername;
    if (!game.states.log.remembername) { localStorage.getItem('name'); }
  }
};