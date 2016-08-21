game.screen = {
  resize: function (event) {
    game.offset = game.container.offset();
  },
  rememberResolution: function () {
    var res, rememberedres = localStorage.getItem('resolution');
    if (rememberedres && game.states.options[rememberedres]) res = rememberedres;
    else if (window.innerWidth < 970 || window.innerHeight < 600) {
      res = 'low';
    }
    if (res) {
      game.screen.setResotution(res);
      game.screen.changeResolution(res);
    }
  },
  setResotution: function (res) {
    $('input[name=resolution][value='+res+']').attr('checked', true);
  },
  changeResolution: function (resolution) {
    if (!resolution || resolution.constructor.name !== 'String') {
      resolution = $('input[name=resolution]:checked', '.screenresolution').val();
    }
    game.container.removeClass('low high medium default').addClass(resolution);
    localStorage.setItem('resolution', resolution);
  },
};
