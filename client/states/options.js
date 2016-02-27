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
    }).change(this.changeResolution)).append($('<span>').text(game.data.ui.high + ' 1920x1080'));
    $('<label>').appendTo(this.resolution).append($('<input>').attr({
      type: 'radio',
      name: 'resolution',
      value: 'medium'
    }).change(this.changeResolution)).append($('<span>').text(game.data.ui.medium + ' 1366x768'));
    $('<label>').appendTo(this.resolution).append($('<input>').attr({
      type: 'radio',
      name: 'resolution',
      checked: true,
      value: 'default'
    }).change(this.changeResolution)).append($('<span>').text(game.data.ui['default'] + ' 1024x768'));
    this.low = $('<label>').appendTo(this.resolution).append($('<input>').attr({
      type: 'radio',
      name: 'resolution',
      value: 'low'
    }).change(this.changeResolution)).append($('<span>').text(game.data.ui.low + ' 800x600'));
    var rememberedvol, vol,
      rememberedres = $.cookie('resolution');
    if (rememberedres && this[rememberedres]) { this.changeResolution.call(this[rememberedres]); }
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
    this.volumeinput = $('<div>').addClass('volume').data('volume', 'volume').on('mousedown.volume', game.audio.volumedown).append(this.volumecontrol);
    $('<label>').appendTo(this.audio).append($('<span>').text(game.data.ui.volume)).append(this.volumeinput);
    //music volume
    this.musiccontrol = $('<div>').addClass('volumecontrol');
    this.musicinput = $('<div>').addClass('volume').data('volume', 'music').on('mousedown.volume', game.audio.volumedown).append(this.musiccontrol);
    $('<label>').appendTo(this.audio).append($('<span>').text(game.data.ui.music)).append(this.musicinput);
    //sounds volume
    this.soundscontrol = $('<div>').addClass('volumecontrol');
    this.soundsinput = $('<div>').addClass('volume').data('volume', 'sounds').on('mousedown.volume', game.audio.volumedown).append(this.soundscontrol);
    $('<label>').appendTo(this.audio).append($('<span>').text(game.data.ui.sounds)).append(this.soundsinput);
    $(document).on('mouseup.volume', game.audio.volumeup);
    rememberedvol = $.cookie('volume');
    if (rememberedvol) {
      vol = parseFloat(rememberedvol);
      if (vol === 0) { this.muteinput.prop('checked', true); }
      game.mute.gain.value = vol;
      game.states.options.volumecontrol.css('transform', 'scale(' + rememberedvol + ')');
    }
    this.back = $('<div>').addClass('button back').text(game.data.ui.back).appendTo(this.menu).attr({
      title: game.data.ui.back
    }).leftClickEvent(game.states.backState);
    this.opt = $('<small>').addClass('opt').text('Options').hide().leftClickEvent(game.states.changeTo, 'options').appendTo(game.topbar);
  },
  start: function () {
    game.states.options.opt.hide();
    game.chat.el.appendTo(this.el);
  },
  changeResolution: function () {
    var resolution = $('input[name=resolution]:checked', '.screenresolution').val();
    game.states.el.removeClass('low high medium default').addClass(resolution);
    $.cookie('resolution', resolution);
  },
  end: function () {
    game.states.options.opt.show();
  }
};