game.states.options = {
  chat: true,
  build: function () {
    this.menu = $('<div>').addClass('box');
    this.title = $('<h1>').appendTo(this.menu).text(game.data.ui.options);
    //screen
    this.resolution = $('<div>').appendTo(this.menu).addClass('screenresolution').attr({title: game.data.ui.screenres}).append($('<h2>').text(game.data.ui.screenres));
    $('<label>').appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'high'}).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui.high + ' 1920x1080'));
    $('<label>').appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'medium'}).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui.medium + ' 1366x768'));
    $('<label>').appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', checked: true, value: 'default'}).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui['default'] + ' 1024x768'));
    $('<label>').appendTo(this.resolution).append($('<input>').attr({type: 'radio', name: 'resolution', value: 'low'}).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui.low + ' 800x600'));
    game.screen.rememberResolution();
    //audio
    this.audio = $('<div>').appendTo(this.menu).addClass('audioconfig').attr({title: game.data.ui.audioconfig}).append($('<h2>').text(game.data.ui.audioconfig));
    this.muteinput = $('<input>').attr({type: 'checkbox', name: 'mute'}).change(game.audio.mute);
    $('<label>').appendTo(this.audio).append(this.muteinput).append($('<span>').text(game.data.ui.mute));
    //main volume
    this.volumecontrol = $('<div>').addClass('volumecontrol');
    this.volumeinput = $('<div>').addClass('volume').data('volume', 'volume').on('mousedown.volume', game.audio.volumeMouseDown).append(this.volumecontrol);
    $('<label>').appendTo(this.audio).append($('<span>').text(game.data.ui.volume)).append(this.volumeinput);
    //music volume
    this.musiccontrol = $('<div>').addClass('volumecontrol');
    this.musicinput = $('<div>').addClass('volume').data('volume', 'music').on('mousedown.volume', game.audio.volumeMouseDown).append(this.musiccontrol);
    $('<label>').appendTo(this.audio).append($('<span>').text(game.data.ui.music)).append(this.musicinput);
    //sounds volume
    this.soundscontrol = $('<div>').addClass('volumecontrol');
    this.soundsinput = $('<div>').addClass('volume').data('volume', 'sounds').on('mousedown.volume', game.audio.volumeMouseDown).append(this.soundscontrol);
    $('<label>').appendTo(this.audio).append($('<span>').text(game.data.ui.sounds)).append(this.soundsinput);
    $(document).on('mouseup.volume', game.audio.volumeMouseUp);
    game.audio.rememberVolume();
    this.back = $('<div>').addClass('button back').text(game.data.ui.back).appendTo(this.menu).attr({title: game.data.ui.back}).on('mouseup touchend', game.states.backState);
    this.opt = $('<small>').addClass('opt').hide().text('Options').appendTo(game.topbar).on('mouseup touchend', function () {game.states.changeTo('options');});
    this.el.append(this.menu);
  },
  start: function () {
    game.states.options.opt.hide();
  },
  end: function () {
    game.states.options.opt.show();
  }
};
