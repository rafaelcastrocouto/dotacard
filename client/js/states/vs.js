game.states.vs = {
  chat: true,
  build: function () {
    this.player = $('<div>').addClass('vsplayer slide');
    this.playername = $('<h1>').appendTo(this.player);
    this.playerdeck = $('<div>').addClass('vsdeckplayer').appendTo(this.player);
    this.vs = $('<p>').text('VS').addClass('versus').appendTo(this.el);
    this.enemy = $('<div>').addClass('vsenemy slide');
    this.enemyname = $('<h1>').appendTo(this.enemy);
    this.enemydeck = $('<div>').addClass('vsdeckenemy').appendTo(this.enemy);
    this.el.append(this.player).append(this.enemy);
  },
  start: function (recover) {
    this.clear();
    if (recover && game.mode == 'online') {
      game.states.changeTo('log');
    } else {
      this.playername.text(game.player.name);
      if (!game.player.type) game.player.type = 'challenged';
      if (game.mode == 'library') game.player.picks = [localStorage.getItem('choose')];
      else game.player.picks = localStorage.getItem('mydeck').split(',');
      game.deck.build({
        name: 'heroes',
        filter: game.player.picks,
        cb: function (deck) {
          deck.addClass('vsplayerdeck').appendTo(game.states.vs.playerdeck);
        }
      });
      if (game.mode == 'tutorial') game.enemy.name = game.data.ui.tutorial;
      if (game.mode == 'library') game.enemy.name = game.data.ui.library;
      this.enemyname.text(game.enemy.name);
      if (!game.enemy.type) game.enemy.type = 'challenger';
      game.enemy.picks = [ 'nyx', 'kotl', 'pud', 'ld', 'am' ];
      game.deck.build({
        name: 'heroes',
        filter: game.enemy.picks,
        cb: function (deck) {
          deck.addClass('vsenemyrdeck').appendTo(game.states.vs.enemydeck);
        }
      });
      //localStorage.setItem('enemydeck', game.enemy.picks);
      var t = 3600;
      if (game.mode == 'library') t = 2000;
      game.states.options.opt.addClass('disabled');
      game.states.vs.player.removeClass('slide');
      game.states.vs.enemy.removeClass('slide');
      game.timeout(t - 300, function () {
        game.states.vs.player.addClass('slide');
        game.states.vs.enemy.addClass('slide');
      });
      game.timeout(t, this.toTable);
    }
  },
  toTable: function () {
    game.states.vs.clear();
    game.states.changeTo('table');
  },
  clear: function () {
    $('.card', game.states.vs.el).remove();
  },
  end: function () {
    game.states.options.opt.removeClass('disabled');
  }
};
