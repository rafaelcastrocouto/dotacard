game.audio = {
  defaultVolume: 0.25,
  build: function () {
    game.audio.context = new AudioContext();
    game.audio.volumeNode = game.audio.context.createGain();
    game.audio.volumeNode.connect(game.audio.context.destination);
    game.audio.soundsNode = game.audio.context.createGain();
    game.audio.soundsNode.connect(game.audio.volumeNode);
    game.audio.musicNode = game.audio.context.createGain();
    game.audio.musicNode.connect(game.audio.volumeNode);
    game.audio.volumeNode.gain.value = game.audio.defaultVolume;
    game.audio.loadMusic();
    game.audio.loadSounds();
  },
  buffers: {},
  load: function (name, cb) {
    var ajax = new XMLHttpRequest();
    ajax.open('GET', game.dynamicHost + 'audio/' + name + '.mp3', /*async*/true);
    ajax.responseType = 'arraybuffer';
    ajax.onload = function () {
      game.audio.context.decodeAudioData(ajax.response, function (buffer) {
        game.audio.buffers[name] = buffer;
        if (cb) { cb(); }
      });
    };
    ajax.send();
  },
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
    'pud/ult-channel',
    'wk/attack',
    'wk/stun',
    'wk/ult',
    'crit'
  ],
  loadSounds: function () {
    $(game.audio.sounds).each(function (a, b) {
      game.audio.load(b);
    });
  },
  loadMusic: function () {
    game.audio.song = 'SneakyAdventure';
    game.audio.load(game.audio.song, function () {
      game.audio.play(game.audio.song);
      setInterval(function () {
        game.audio.play(game.audio.song);
      }, game.audio.buffers[game.audio.song].duration * 1000);
    });
  },
  play: function (name) {
    if (game.audio.context && 
        game.audio.context.createBufferSource &&
        game.audio.buffers[name] &&
        game.audio.buffers[name].duration) {
      var audio = game.audio.context.createBufferSource();
      //console.log(name, game.audio.buffers[name]);
      audio.buffer = game.audio.buffers[name];
      if (name === game.audio.song) {
        audio.connect(game.audio.musicNode);
      } else {
        audio.connect(game.audio.soundsNode);
      }
      audio.start();
    }
  },
  mute: function () {
    var vol = game.audio.unmutedvolume || game.audio.volumeNode.gain.value || game.audio.defaultVolume;
    if (this.checked) { vol = 0; }
    game.audio.setVolume('volume', vol);
  },
  setVolume: function (target , v) {
    if (v === undefined || v === null) {
      v = '0.25';
      if (target == 'music') v = '0.5';
    }
    var vol = parseFloat(v);
    if (vol <= 0) {
      vol = 0;
      if (target === 'volume') game.states.options.muteinput.prop('checked', true);
    } else {
      if (target === 'volume') {
        game.audio.unmutedvolume = vol;
        game.states.options.muteinput.prop('checked', false);
      }
    }
    if (vol > 1) { vol = 1; }
    game.audio[target + 'Node'].gain.value = vol;
    localStorage.setItem(target, vol);
    game.states.options[target + 'control'].css('transform', 'scale(' + vol + ')');
  },
  rememberVolume: function () {
    game.audio.setVolume('volume', localStorage.getItem('volume'));
    game.audio.setVolume('music', localStorage.getItem('music'));
    game.audio.setVolume('sounds', localStorage.getItem('sounds'));
  },
  volumeMouseDown: function (event) {
    var target = $(event.target).data('volume');
    if (!target) { target = $(event.target).parent().data('volume'); }
    game.audio.volumetarget = target;
    game.audio.volumeMouseMove(event);
    game.states.options[target + 'input'].on('mousemove.volume', game.audio.volumeMouseMove);
  },
  volumeMouseUp: function () {
    if (game.audio.volumetarget) {
      game.states.options[game.audio.volumetarget + 'input'].off('mousemove.volume');
      game.audio.volumetarget = false;
    }
  },
  volumeMouseMove: function (event) {
    var x = event.clientX - game.states.options.volumecontrol.offset().left,
        v = parseInt(x / 0.48, 10) / 100;
    //console.log(x, v)
    game.audio.setVolume(game.audio.volumetarget, v);
  },
  volumeControl: function (name) {
    game.states.options[name+'control'] = $('<div>').addClass('volumecontrol');
    game.states.options[name+'input'] = $('<div>').addClass('volume').data('volume', name).on('mousedown.volume', game.audio.volumeMouseDown).append(game.states.options[name+'control']);
    $('<label>').appendTo(game.states.options.audio).append($('<span>').text(game.data.ui[name])).append(game.states.options[name+'input']);
  }
};
