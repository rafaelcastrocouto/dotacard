game.states.result = {
  chat: true,
  build: function () {
    this.resultsbox = $('<div>').addClass('resultsbox box');
    this.title = $('<h1>').appendTo(this.resultsbox).addClass('resultTitle');
    this.towers = $('<h1>').appendTo(this.resultsbox);
    this.kd = $('<h1>').appendTo(this.resultsbox);
    this.playerResults = $('<div>').appendTo(this.resultsbox).addClass('results');
    this.enemyResults = $('<div>').appendTo(this.resultsbox).addClass('results enemy');
    $('<div>').addClass('button close').appendTo(this.resultsbox).text(game.data.ui.close).on('mouseup touchend', this.close);
    this.el.append(this.resultsbox);
  },
  playerHeroResult: function () {
    var hero = $(this), heroid = hero.data('hero'),
      img = $('<div>').addClass('portrait').append($('<div>').addClass('img')),
      text = $('<span>').text(hero.data('name') + ': ' + hero.data('kills') + ' / ' + hero.data('deaths'));
    $('<p>').addClass(heroid+' heroes').append(img, text).appendTo(game.states.result.playerResults);
  },
  enemyHeroResult: function () {
    var hero = $(this), heroid = hero.data('hero'),
      img = $('<div>').addClass('portrait').append($('<div>').addClass('img')),
      text = $('<span>').text(hero.data('name') + ': ' + hero.data('kills') + ' / ' + hero.data('deaths'));
    $('<p>').addClass(heroid+' heroes').append(img, text).appendTo(game.states.result.enemyResults);
  },
  start: function (recover) {
    if (recover) {
      this.close();
    } else {
      if (game.mode == 'tutorial') game.tutorial.axe.addClass('show');
      if (!game.winner)  game.winner = game.player.name;
      if (game.winner == game.player.name) game.message.text(game.data.ui.win);
      else game.message.text(game.data.ui.lose);
      if (this.updateOnce) {
        this.updateOnce = false;
        this.update();
      }
    }
  },
  update: function () {
    $('.result .results .heroes').remove();
    $('.map .player.heroes.card').each(this.playerHeroResult);
    $('.map .enemy.heroes.card').each(this.enemyHeroResult);
    this.title.text(game.winner + ' ' + game.data.ui.victory);
    this.towers.text(game.data.ui.towers + ' HP: ' + game.player.tower.data('current hp') + ' / ' + game.enemy.tower.data('current hp'));
    this.kd.text(game.data.ui.heroes + ' ' + game.data.ui.kd + ': ' + game.player.kills + ' / ' + game.enemy.kills);
  },
  close: function () {
    game.clear();
    if (game.mode == 'tutorial') game.chat.set(game.data.ui.completedtutorial);
    game.states.changeTo('menu');
  },
  end: function () {
  }
};