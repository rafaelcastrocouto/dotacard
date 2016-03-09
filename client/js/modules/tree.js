game.tree = {
  build: function (spot) {
    var tree = game.card.build({
      className: 'tree static neutral',
      name: game.data.ui.tree,
      attribute: game.data.ui.forest + game.data.ui.tree
    });
    if (game.mode === 'match') {
      tree.onClickEvent(game.card.select);
    }
    tree.place(spot);
    return tree;
  },
  place: function () {
    var treeSpots = 'A2 A3 A4 B3';
    $.each(treeSpots.split(' '), function () {
      game.tree.build(this);
      game.tree.build(game.map.mirrorPosition(this));
    });
  }
};
