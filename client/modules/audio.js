game.audio = {
  sounds: [
    'activate',
    'crit',
    'horn',
    'battle',
    'pick',
    'tower/attack',
    'tutorial/axehere',
    'tutorial/axebattle',
    'tutorial/axemove',
    'tutorial/axeattack',
    'tutorial/axetime',
    'tutorial/axewait',
    'tutorial/axeah',
    'am/attack',
    'am/burn',
    'am/blink',
    'am/ult',
    'cm/attack',
    'cm/freeze',
    'cm/slow',
    'cm/ult',
    'ld/attack',
    'ld/bear',
    'ld/cry',
    'ld/entangle',
    'ld/rabid',
    'ld/return',
    'ld/transform',
    'ld/ult',
    'pud/attack',
    'pud/hook',
    'pud/rot',
    'pud/ult',
    'wk/attack',
    'wk/stun',
    'wk/ult',
    'crit'
  ],
  buffers: {},
  build: function () {
    game.audio.context = new AudioContext();
    game.mute = game.audio.context.createGain();
    game.mute.connect(game.audio.context.destination);
    game.audio.soundsNode = game.audio.context.createGain();
    game.audio.soundsNode.connect(game.mute);
    game.audio.trackNode = game.audio.context.createGain();
    game.audio.trackNode.connect(game.mute);
    game.mute.gain.value = 0.6;
  },
  play: function (name) {
    if (game.audio.context && game.audio.context.createBufferSource) {
      var audio = game.audio.context.createBufferSource();
      //console.log(name, game.audio.buffers[name]);
      audio.buffer = game.audio.buffers[name];
      if (name === game.song) {
        audio.connect(game.audio.trackNode);
      } else {
        audio.connect(game.audio.soundsNode);
      }
      audio.start();
    }
  },
  mute: function () {
    var vol = game.unmutedvolume || game.mute.gain.value || 0.6;
    if (this.checked) { vol = 0; }
    $.cookie('volume', vol);
    game.mute.gain.value = vol;
    game.states.options.volumecontrol.css('transform', 'scale(' + vol + ')');
  },
  volumedown: function (event) {
    var target = $(event.target).data('volume');
    if (!target) { target = $(event.target).parent().data('volume'); }
    game.audio.volumetarget = target;
    game.audio.volumechange(event);
    game.states.options[target + 'input'].on('mousemove.volume', game.audio.volumechange);
  },
  volumeup: function () {
    if (game.audio.volumetarget) {
      game.states.options[game.audio.volumetarget + 'input'].off('mousemove.volume');
      game.audio.volumetarget = false;
    }
  },
  volumechange: function (event) {
    var volume = parseInt((event.clientX - game.states.options.volumecontrol.offset().left) / 4.8, 10) / 10;
    if (volume > 1) { volume = 1; }
    if (volume <= 0) {
      volume = 0;
      if (game.audio.volumetarget === 'volume') {
        game.states.options.muteinput.prop('checked', true);
      }
    } else if (game.audio.volumetarget === 'volume') {
      game.states.options.muteinput.prop('checked', false);
    }
    game.states.options[game.audio.volumetarget + 'control'].css('transform', 'scale(' + volume + ')');
    if (game.audio.volumetarget === 'volume') {
      game.mute.gain.value = volume;
      $.cookie('volume', volume);
      game.unmutedvolume = volume;
    } else if (game.audio.volumetarget === 'music') {
      game.audio.trackNode.gain.value = volume;
    } else if (game.audio.volumetarget === 'sounds') {
      game.audio.soundsNode.gain.value = volume;
    }
  }
};