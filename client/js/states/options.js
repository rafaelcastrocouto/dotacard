game.states.options = {
  chat: true,
  build: function () {
    this.menu = $('<div>').addClass('box');
    this.title = $('<h1>').appendTo(this.menu).text(game.data.ui.options);
    //screen
    this.resolution = $('<div>').appendTo(this.menu).addClass('screenresolution').attr({title: game.data.ui.screenres}).append($('<h2>').text(game.data.ui.screenres));
    this.high = $('<label>').appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'high'}).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui.high + ' 1920x1080'));
    this.medium = $('<label>').appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'medium'}).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui.medium + ' 1366x768'));
    this.default = $('<label>').appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', checked: true, value: 'default'}).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui['default'] + ' 1024x768'));
    this.low = $('<label>').appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'low'}).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui.low + ' 800x600'));
    //audio
    this.audio = $('<div>').appendTo(this.menu).addClass('audioconfig').attr({title: game.data.ui.audioconfig}).append($('<h2>').text(game.data.ui.audioconfig));
    this.muteinput = $('<input>').attr({type: 'checkbox', name: 'mute'}).change(game.audio.mute);
    $('<label>').appendTo(this.audio).append(this.muteinput).append($('<span>').text(game.data.ui.mute));
    game.audio.volumeControl('volume');
    game.audio.volumeControl('music');
    game.audio.volumeControl('sounds');
    $(document).on('mouseup.volume', game.audio.volumeMouseUp);
    // lang
    this.lang = $('<div>').appendTo(this.menu).addClass('lang').attr({title: game.data.ui.lang}).append($('<h2>').text(game.data.ui.lang));
    this.langSelect = game.language.select().appendTo(this.lang);
    
    this.back = $('<div>').addClass('button back').text(game.data.ui.back).appendTo(this.menu).attr({title: game.data.ui.back}).on('mouseup touchend', game.states.backState);
    this.opt = $('<small>').addClass('opt').hide().text(game.data.ui.options).appendTo(game.topbar).on('mouseup touchend', this.optClick);
    this.el.append(this.menu);
    game.screen.rememberResolution();
    game.audio.rememberVolume();
  },
  start: function () {
    game.states.options.opt.addClass('disabled');
  },
  optClick: function () {
    if (!$(this).hasClass('disabled')) game.states.changeTo('options');
  },
  end: function () {
    game.states.options.opt.removeClass('disabled');
  }
};
