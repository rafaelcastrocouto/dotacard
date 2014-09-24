/* jQuery tubular plugin
|* by Sean McCambridge
|* http://www.seanmccambridge.com/tubular
|* version: 1.0
|* updated: October 1, 2012
|* since 2010
|* licensed under the MIT License
|* Enjoy.
|* 
|* Thanks,
|* Sean */

(function ($, window) {

  // test for feature support and return if failure

  // defaults
  var defaults = {
    ratio: 16/9, // usually either 4/3 or 16/9 -- tweak as needed
    videoId: '-cSFPIwMEq4', // dota2 teaser is a good default, no?
    mute: false,
    repeat: false,
    autoStart: false,/*
    playButtonClass: 'tubular-play',
    pauseButtonClass: 'tubular-pause',
    muteButtonClass: 'tubular-mute',
    volumeUpClass: 'tubular-volume-up',
    volumeDownClass: 'tubular-volume-down',
    increaseVolumeBy: 10,*/
    start: 0
  };

  // methods

  var tubular = function(node, options) { // should be called on the wrapper div
    var options = $.extend({}, defaults, options),
        $body = $('body'), // cache body node
        $node = $(node); // cache wrapper node

    if(!options.width) options.width = $node.width();

    // build elements
    var tubularContainer = $('<div class="tubular tubular-container" style="width: 100%; height: 100%; overflow: hidden;"></div>');
    var tubularPlayer    = $('<div class="tubular tubular-player" id="tubular-player" style="width: 100%; height: 100%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) scale('+options.scale+');"></div>');
    var tubularShield    = $('<div class="tubular tubular-shield" style="width: 100%; height: 100%; position: absolute; top: 0;   left: 0;"></div>');

    $node.prepend(tubularContainer);
    tubularContainer.append(tubularPlayer);
    tubularShield.insertAfter(tubularContainer);

    if(options.onBeforeLoad){options.onBeforeLoad($node)};

    var onPlayerReady = function(e) {
      //resize();
      if (options.mute) e.target.mute();
      e.target.seekTo(options.start);
      if(options.autoStart) e.target.playVideo();
      if(options.onReady) options.onReady(this);
    };

    var onPlayerStateChange = function(e) {
      // video ended and repeat option is set true
      if (e.data === 0 && options.repeat) { 
        e.seekTo(options.start); // restart
      }
      if(options.onStateChange) options.onStateChange(this);
    };

    // set up iframe player
    var player;
    window.onYouTubeIframeAPIReady = function() {
      player = new YT.Player('tubular-player', {
        width: options.width,
        height: Math.ceil(options.width / options.ratio),
        videoId: options.videoId,
        playerVars: {
          controls: 0,
          showinfo: 0,
          modestbranding: 1,
          wmode: 'transparent'
        },
        events: {
          'onReady': onPlayerReady.bind($node),
          'onStateChange': onPlayerStateChange.bind($node)
        }
      });

      $node.data('tubular-player', player);

    };   

    // events
    /*
    // resize handler updates width, height and offset of player after resize/init
    var resize = function() {
        var $tubularPlayer = $('#tubular-player'),
            width = $tubularPlayer.width(),
            pWidth, // player width, to be defined
            height = $tubularPlayer.height(),
            pHeight; // player height, tbd                

        // when screen aspect ratio differs from video, video must center and underlay one dimension

        if (width / options.ratio < height) { // if new video height < window height (gap underneath)
            pWidth = Math.ceil(height * options.ratio); // get new player width
            $tubularPlayer.width(pWidth).height(height).css({left: (width - pWidth) / 2, top: 0}); // player width is greater, offset left; reset top
        } else { // new video width < window width (gap to right)
            pHeight = Math.ceil(width / options.ratio); // get new player height
            $tubularPlayer.width(width).height(pHeight).css({left: 0, top: (height - pHeight) / 2}); // player height is greater, offset top; reset left
        }

    }

    $(window).on('resize.tubular', function() {
        resize();
    })

    $('body').on('click','.' + options.playButtonClass, function(e) { // play button
        e.preventDefault();
        player.playVideo();
    }).on('click', '.' + options.pauseButtonClass, function(e) { // pause button
        e.preventDefault();
        player.pauseVideo();
    }).on('click', '.' + options.muteButtonClass, function(e) { // mute button
        e.preventDefault();
        (player.isMuted()) ? player.unMute() : player.mute();
    }).on('click', '.' + options.volumeDownClass, function(e) { // volume down button
        e.preventDefault();
        var currentVolume = player.getVolume();
        if (currentVolume < options.increaseVolumeBy) currentVolume = options.increaseVolumeBy;
        player.setVolume(currentVolume - options.increaseVolumeBy);
    }).on('click', '.' + options.volumeUpClass, function(e) { // volume up button
        e.preventDefault();
        if (player.isMuted()) player.unMute(); // if mute is on, unmute
        var currentVolume = player.getVolume();
        if (currentVolume > 100 - options.increaseVolumeBy) currentVolume = 100 - options.increaseVolumeBy;
        player.setVolume(currentVolume + options.increaseVolumeBy);
    })
    */

    return $node;

  };

  // load yt iframe js api
  /*
  var tag = document.createElement('script');
  tag.src = "//www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  */

  // create plugin
  $.fn.tubular = function (options) {
    var player;
    if (!this.data('tubular-instantiated')) { 
      player = tubular(this, options);
      this.data('tubular-instantiated', true);
    } else player = this.data('tubular-player')
    return player;
  }

})(jQuery, window);