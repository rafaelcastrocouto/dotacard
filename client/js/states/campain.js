game.states.campain = {
  build: function () {
    this.stage = localStorage.getItem('stage') || 1;
    this.map = $('<div>').addClass('campain-map');
    this.desc = $('<div>').addClass('campain-box box');
    game.states.loading.json('campain', this.stageOne);
    this.startStage = $('<div>').addClass('stages start enabled blink').appendTo(this.map);
    this.et = $('<div>').addClass('stages easy top').appendTo(this.map);
    this.em = $('<div>').addClass('stages easy mid').appendTo(this.map);
    this.eb = $('<div>').addClass('stages easy bot').appendTo(this.map);
    this.ru = $('<div>').addClass('stages rune').appendTo(this.map);
    this.ro = $('<div>').addClass('stages roshan').appendTo(this.map);
    this.sh = $('<div>').addClass('stages shop').appendTo(this.map);
    this.nm = $('<div>').addClass('stages normal mid').appendTo(this.map);
    this.ht = $('<div>').addClass('stages hard top').appendTo(this.map);
    this.hm = $('<div>').addClass('stages hard mid').appendTo(this.map);
    this.hb = $('<div>').addClass('stages hard bot').appendTo(this.map);
    this.fi = $('<div>').addClass('stages final').appendTo(this.map);
    this.buttonbox = $('<div>').addClass('buttonbox');
    this.back = $('<div>').addClass('back button').text(game.data.ui.back).attr({title: game.data.ui.backtomenu}).on('mouseup touchend', this.backClick).appendTo(this.buttonbox);
    this.toChoose = $('<div>').addClass('campain-play button highlight').text(game.data.ui.battle).attr({title: game.data.ui.battle}).on('mouseup touchend', this.toChoose).appendTo(this.buttonbox);
    this.el.append(this.map).append(this.desc).append(this.buttonbox);
  },
  start: function (recover) {
    this.clear();
    this.createStartPaths();
    game.message.text(game.data.ui.campain);
    if (recover && game.mode == 'online') {
      game.states.changeTo('log');
    } else {
      if (this.stage == 2) this.stageTwoShow();
    }
  },
  stageOne: function () {
    game.states.campain.stage = 1;
    game.states.campain.buildDesc(game.data.campain.start);
  },
  stageTwo: function () {
    game.states.campain.stage = 2;
    game.states.campain.buildDesc(game.data.campain.easy);
  },
  stageTwoShow: function () {
    this.startStage.removeClass('blink').on('mouseup touchend', this.stageOne);
    $('.campain-path').css('opacity', 1);
    $('.stages.easy').addClass('enabled blink').on('mouseup touchend', this.stageTwo);
    this.createPath(this.et, this.ru, 'et-ru');
    this.createPath(this.em, this.ru, 'em-ru');
    this.createPath(this.eb, this.ru, 'eb-ru');
    this.buildDesc(game.data.campain.easy);
  },
  buildDesc: function (data) {
    this.desc.html('');
    $('<h2>').text(data.name).appendTo(this.desc);
    $('<div>').addClass('campain-img '+data.img).appendTo(this.desc);
    $('<p>').text(data.title).appendTo(this.desc);
    $(data.desc).each(function (i, txt) {
      $('<p>').addClass('achieve').text(txt).appendTo(game.states.campain.desc);
    });
    var ch = $('<div>').addClass('campain-heroes').appendTo(this.desc);
    game.enemy.picks = data.picks;
    localStorage.setItem('enemydeck', data.picks);
    for (var i = 0; i < game.enemy.picks.length; i++) {
      var hero = game.enemy.picks[i];
      $('<div>').addClass('heroes '+ hero).attr({title: hero}).append($('<div>').addClass('img')).appendTo(ch);
    }
  },
  createStartPaths: function () {
    if (!this.pathsCreated) {
      this.pathsCreated = true;
      this.createPath(this.startStage, this.et, 'et');
      this.createPath(this.startStage, this.em, 'em');
      this.createPath(this.startStage, this.eb, 'eb');
    }
  },
  createPath: function (source, target, cl) {
    var dash = 18, size = 4;
    var s = source.position(), t = target.position();
    var sourcesize = source.width() / 2;
    s.left += (sourcesize - size);
    s.top += (sourcesize - size);
    var targetsize = target.width() / 2;
    t.left += (targetsize - size);
    t.top += (targetsize - size);
    var mx = t.left - s.left, 
        my = t.top - s.top;
    var a = Math.atan2(my, mx);
    var d = Math.pow( Math.pow(mx,2) + Math.pow(my,2) , 1/2);
    var toff = sourcesize + targetsize + (dash/2);
    d -= toff;
    var n = Math.floor(d/dash), x, y;
    for (var i = 0; i < n; i++) {
      x = s.left + (toff * Math.cos(a)) + (i * dash * Math.cos(a));
      y = s.top + (toff * Math.sin(a)) + (i * dash * Math.sin(a));
      $('<div>').addClass('campain-path '+cl).css({left: x, top: y}).appendTo(game.states.campain.map);
    }
  },
  clearPaths: function () {
    $('.campain-path', game.states.campain.map).remove();
  },
  toChoose: function () {
    if (game.states.campain.stage == 1) {
      game.enemy.name = 'Stage 1';
      game.states.changeTo('choose');
    }
    if (game.states.campain.stage == 2) {
      game.ai.mode = 'hard';
      game.alert('Coming soon!');
    }
  },
  backClick: function () {
    game.clear();
    game.states.changeTo('menu');
  },
  clear: function () {
    $('.stage', game.states.campain.el).removeClass('enabled');
    this.startStage.addClass('enabled');
  },
  end: function () {
    game.states.options.opt.removeClass('disabled');
  }
};
