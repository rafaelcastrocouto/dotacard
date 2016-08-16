game.states.vs = {
  chat: true,
  build: function () {
    this.player = $('<div>').addClass('vsplayer');
    this.playername = $('<h1>').appendTo(this.player);
    this.playerdeck = $('<div>').addClass('vsdeckplayer').appendTo(this.player);
    this.vs = $('<p>').text('VS').addClass('versus').appendTo(this.el);
    this.enemy = $('<div>').addClass('vsenemy');
    this.enemyname = $('<h1>').appendTo(this.enemy);
    this.enemydeck = $('<div>').addClass('vsdeckenemy').appendTo(this.enemy);
    this.el.append(this.player).append(this.enemy);
  },
  start: function (recover) {
    if (recover) game.states.changeTo('menu');
    if (game.mode == 'tutorial') game.tutorial.axe.addClass('show');
    this.playername.text(game.player.name);
    this.enemyname.text(game.enemy.name);
    if (!game.player.picks || !game.player.picks.length) {
      if (game.mode == 'library') game.player.picks = [localStorage.getItem('choose')];
      if (game.mode == 'online' || game.mode == 'tutorial') game.player.picks = localStorage.getItem('mydeck').split(',');
    }
    game.deck.build({
      name: 'heroes',
      filter: game.player.picks,
      cb: function (deck) {
        deck.addClass('vsplayerdeck').appendTo(game.states.vs.playerdeck);
      }
    });
    if (game.mode !== 'online') {
      game.enemy.name = 'axe';
      game.enemy.type = 'challenger';
      game.player.type = 'challenged';
      game.enemy.picks = [ 'nyx', 'kotl', 'pud', 'ld', 'am' ];
    }
    game.deck.build({
      name: 'heroes',
      filter: game.enemy.picks,
      cb: function (deck) {
        deck.addClass('vsenemyrdeck').appendTo(game.states.vs.enemydeck);
      }
    });
    localStorage.setItem('enemydeck', game.enemy.picks);
    var t = 3000;
    if (game.mode == 'library') t = 1200;
    game.timeout(t, this.toTable);
  },
  toTable: function () {
    game.states.changeTo('table');
  },
  end: function () {
    $('.card', game.states.vs.el).remove();
  }
};
