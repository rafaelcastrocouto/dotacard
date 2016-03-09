game.screen = {
  rememberResolution: function () {
    var res, rememberedres = localStorage.getItem('resolution');
    if (rememberedres && game.states.options[rememberedres])
      res = rememberedres;
    else if (window.innerWidth < 970) {
      res = 'low';
    }
    game.screen.changeResolution(res);
  },
  changeResolution: function (resolution) {
    if (!resolution || resolution.constructor.name !== 'String')
      resolution = $('input[name=resolution]:checked', '.screenresolution').val();
    game.states.el.removeClass('low high medium default').addClass(resolution);
    localStorage.setItem('resolution', resolution);
  }
};
