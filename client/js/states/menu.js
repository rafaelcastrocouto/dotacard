game.states.menu = {
  build: function () {
    this.menu = $('<div>').appendTo(this.el).addClass('box');
    this.title = $('<h1>').appendTo(this.menu).text(game.data.ui.menu);
    this.tutorial = $('<div>').addClass('button').appendTo(this.menu).attr({
      title: game.data.ui.tutorial
    }).text(game.data.ui.tutorial).on('mouseup touchend', function () {
      game.mode = 'tutorial';
      game.states.changeTo('choose');
    });
    this.campain = $('<div>').addClass('button').appendTo(this.menu).attr({
      title: game.data.ui.choosecampain,
      disabled: true
    }).text(game.data.ui.campain);
    this.online = $('<div>').addClass('button').appendTo(this.menu).attr({
      title: game.data.ui.chooseonline
    }).text(game.data.ui.online).on('mouseup touchend', function () {
      game.mode = 'online';
      game.states.changeTo('choose');
    });
    this.library = $('<div>').addClass('button').appendTo(this.menu).attr({
      title: game.data.ui.chooselibrary
    }).text(game.data.ui.library).on('mouseup touchend', function () {
      game.mode = 'library';
      game.states.changeTo('choose');
    });
    this.options = $('<div>').addClass('button').appendTo(this.menu).attr({
      title: game.data.ui.chooseoptions
    }).text(game.data.ui.options).on('mouseup touchend', function () {
      game.states.changeTo('options');
    });
    this.credits = $('<a>').addClass('button').appendTo(this.menu).attr({
      title: game.data.ui.choosecredits,
      href: 'https://github.com/rafaelcastrocouto/dotacard/graphs/contributors',
      target: '_blank'
    }).text(game.data.ui.credits);
  },
  start: function () {
    game.loader.removeClass('loading');
    game.triesCounter.text('');
    game.message.text(game.data.ui.welcome + ' ' + game.player.name + '!');
    if (!game.chat.builded) { game.chat.build(); }
    game.chat.el.appendTo(this.el);
  }
};
