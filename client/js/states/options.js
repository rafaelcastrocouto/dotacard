game.states.options = {
  build: function () {
    this.menu = $('<div>').appendTo(this.el).addClass('box');
    this.title = $('<h1>').appendTo(this.menu).text(game.data.ui.options);
    this.resolution = $('<div>').appendTo(this.menu).addClass('screenresolution').attr({
      title: game.data.ui.screenres
    });
    $('<h2>').appendTo(this.resolution).text(game.data.ui.screenres);
    this.high = $('<label>').appendTo(this.resolution).append($('<input>').attr({
      type: 'radio',
      name: 'resolution',
      value: 'high'
    }).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui.high + ' 1920x1080'));
    $('<label>').appendTo(this.resolution).append($('<input>').attr({
      type: 'radio',
      name: 'resolution',
      value: 'medium'
    }).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui.medium + ' 1366x768'));
    $('<label>').appendTo(this.resolution).append($('<input>').attr({
      type: 'radio',
      name: 'resolution',
      checked: true,
      value: 'default'
    }).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui['default'] + ' 1024x768'));
    this.low = $('<label>').appendTo(this.resolution).append($('<input>').attr({
      type: 'radio',
      name: 'resolution',
      value: 'low'
    }).change(game.screen.changeResolution)).append($('<span>').text(game.data.ui.low + ' 800x600'));
    game.screen.rememberResolution();
    this.audio = $('<div>').appendTo(this.menu).addClass('audioconfig').attr({
      title: game.data.ui.audioconfig
    });
    $('<h2>').appendTo(this.audio).text(game.data.ui.audioconfig);
    this.muteinput = $('<input>').attr({
      type: 'checkbox',
      name: 'mute'
    }).change(game.audio.mute);
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
    this.back = $('<div>').addClass('button back').text(game.data.ui.back).appendTo(this.menu).attr({
      title: game.data.ui.back
    }).on('mouseup touchend', game.states.backState);
    this.opt = $('<small>').addClass('opt').text('Options').hide().appendTo(game.topbar).on('mouseup touchend', function () {
      game.states.changeTo('options');
    });
  },
  start: function () {
    game.states.options.opt.hide();
    game.chat.el.appendTo(this.el);
  },
  end: function () {
    game.states.options.opt.show();
  }
};
