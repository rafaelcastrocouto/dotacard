game.tower = {
  build: function (side, pos) {
    var tower = game.card.build({
      className: 'tower towers static ' + side,
      side: side,
      name: game.data.ui.tower,
      attribute: game.data.ui.building,
      range: game.data.ui.ranged,
      damage: 15,
      hp: 80
    });
    if (game.mode === 'match') {
      tower.on('mousedown touchstart', game.card.select);
    }
    tower.place(pos);
    game.map.around(pos, game.map.getRange(game.data.ui.ranged), function (spot) {
      spot.addClass(side + 'area');
    });
    return tower;
  },
  place: function () {
    var p = 'C6';
    game.player.tower = game.tower.build('player', p);
    game.enemy.tower = game.tower.build('enemy', game.map.mirrorPosition(p));
    p = 'A6';
    $('#' + p).addClass('fountain player').attr({title: 'Player Fountain'});
    $('#' + game.map.mirrorPosition(p)).addClass('fountain enemy').attr({title: 'Enemy Fountain'});
  },
  attack: function () {
    var from, to,
      lowestHp = {
        notfound: true,
        data: function (c) { return Infinity; }
      };
    $('.map .playerarea .card.enemy').each(function () {
      var target = $(this);
      if (target.data('current hp') < lowestHp.data('current hp')) {
        lowestHp = target;
      }
    });
    if (!lowestHp.notfound) {
      game.player.tower.attack(lowestHp);
      from = game.map.getPosition(game.player.tower);
      to = game.map.getPosition(lowestHp);
      game.currentData.moves.push('A:' + from + ':' + to);
    }
  }
};
