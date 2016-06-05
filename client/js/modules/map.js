game.map = {
  lettersStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  build: function (opt) {
    game.map.letters = game.map.lettersStr.split('');
    game.spot = [];
    var map = $('<div>').addClass('map').css({width: game.width * 212, height: game.height * 312}), w, h, tr;
    for (h = 0; h < opt.height; h += 1) {
      game.spot[h] = [];
      tr = $('<div>').addClass('row').appendTo(map);
      for (w = 0; w < opt.width; w += 1) {
        game.spot[h][w] = $('<div>').attr({id: game.map.toId(w, h)}).addClass('free spot').appendTo(tr).on('contextmenu', game.events.cancel);
      }
    }
    game.map.builded = true;
    return map;
  },
  toId: function (w, h) {
    if (w >= 0 && h >= 0 && w < game.width && h < game.height) {
      return game.map.letters[w] + (h + 1);
    }
  },
  getX: function (id) {
    if (typeof id.attr == 'function') { id = id.attr('id'); }
    if (id) {
      var w = game.map.letters.indexOf(id[0]);
      if (w >= 0 && w < game.width) { return w; }
    }
  },
  getY: function (id) {
    if (typeof id.attr == 'function') { id = id.attr('id'); }
    if (id) {
      var h = parseInt(id[1], 10) - 1;
      if (h >= 0 && h < game.height) { return h; }
    }
  },
  getSpot: function (w, h) {
    if (game.spot[h] && game.spot[h][w]) { return game.spot[h][w]; }
  },
  getPosition: function (el) {
    if (el.hasClass('spot')) { return el.attr('id'); }
    return el.closest('.spot').attr('id');
  },
  mirrorPosition: function (pos) {
    var w = game.map.getX(pos), h = game.map.getY(pos),
      x = game.width - w - 1, y = game.height - h - 1;
    return game.map.toId(x, y);
  },
  rangeArray: [ 0.5, 1, 1.25, 1.5, 2, 2.5, 3, 3.5, 4 ],
  atRange: function (spot, range, cb, filter) {
    if (range >= 0 && range <= game.map.rangeArray.length) {
      var radius, x, y, r, r2, l,
        fil = function (x, y) {
          var spot = game.map.getSpot(x, y);
          if (spot) {
            if (filter) {
              if (!spot.hasClasses(filter)) { cb(spot); }
            } else { cb(spot); }
          }
        },
        w = game.map.getX(spot),
        h = game.map.getY(spot);
      if (range === 0) {
        fil(w, h);
      } else {
        radius = game.map.rangeArray[range];
        r = Math.round(radius);
        r2 = radius * radius;
        l = Math.ceil(radius) * Math.cos(Math.PI / 4);
        fil(w, h + r);
        fil(w, h - r);
        fil(w - r, h);
        fil(w + r, h);
        if (range === 2 || range === 3) {
          for (x = 1; x <= l; x += 1) {
            y = Math.round(Math.sqrt(r2 - x * x));
            fil(w + x, h + y);
            fil(w + x, h - y);
            fil(w - x, h + y);
            fil(w - x, h - y);
          }
        } else if (range > 3) {
          for (x = 1; x <= l; x += 1) {
            y = Math.round(Math.sqrt(r2 - x * x));
            fil(w + x, h + y);
            fil(w + y, h + x);
            fil(w + x, h - y);
            fil(w + y, h - x);
            fil(w - x, h + y);
            fil(w - y, h + x);
            fil(w - x, h - y);
            fil(w - y, h - x);
          }
        }
      }
    }
  },
  atCross: function (spot, range, width, cb, filter) {
    if (range >= 0) {
      var x, y, r,
        fil = function (x, y) {
          var spot = game.map.getSpot(x, y);
          if (spot) {
            if (filter) {
              if (!spot.hasClasses(filter)) { cb(spot); }
            } else { cb(spot); }
          }
        },
        w = game.map.getX(spot),
        h = game.map.getY(spot);
      if (range === 0) {
        fil(w, h);
      } else {
        for (r = 1; r <= range; r += 1) {
          fil(w, h + r);
          fil(w, h - r);
          fil(w - r, h);
          fil(w + r, h);
        }
      }
    }
  },
  atMovementRange: function (card, range, cb, filter) {
    if (range >= 0 && range <= game.map.rangeArray.length) {
      var radius, x, y, r, r2, l, a, i, o, m, s, t, u,
        fil = function (x, y) {
          var spot = game.map.getSpot(x, y);
          if (spot) {
            if (filter) {
              if (!spot.hasClasses(filter)) { cb(spot); }
            } else { cb(spot); }
          }
        },
        pos = game.map.getPosition(card),
        w = game.map.getX(pos),
        h = game.map.getY(pos);
      radius = game.map.rangeArray[range];
      r = Math.round(radius);
      r2 = radius * radius;
      l = Math.ceil(radius) * Math.cos(Math.PI / 4);
      fil(w, h + 1);
      fil(w, h - 1);
      fil(w - 1, h);
      fil(w + 1, h);
      if (range === 2 || range === 3) {
        for (x = 1; x <= l; x += 1) {
          y = Math.round(Math.sqrt(r2 - x * x));
          m = game.map.getSpot(w, h - y);
          s = game.map.getSpot(w - x, h);
          t = game.map.getSpot(w + x, h);
          u = game.map.getSpot(w, h + y);
          if (m) m = m.hasClass('free'); 
          if (s) s = s.hasClass('free'); 
          if (t) t = t.hasClass('free'); 
          if (u) u = u.hasClass('free'); 
          if (t || u) fil(w + x, h + y);
          if (t || m) fil(w + x, h - y);
          if (s || u) fil(w - x, h + y);
          if (s || m) fil(w - x, h - y);
        }
      }
      if (range === 3 && !card.hasClass('phased')) {
        a = [{ a: w, b: h + 2, c: w, d: h + 1, e: w + 1, f: h + 1, g: w - 1, h: h + 1 },
             { a: w, b: h - 2, c: w, d: h - 1, e: w + 1, f: h - 1, g: w - 1, h: h - 1 },
             { a: w - 2, b: h, c: w - 1, d: h, e: w - 1, f: h + 1, g: w - 1, h: h - 1 },
             { a: w + 2, b: h, c: w + 1, d: h, e: w + 1, f: h + 1, g: w + 1, h: h - 1 }
          ];
        for (i = 0; i < a.length; i += 1) {
          o = a[i];
          m = game.map.getSpot(o.a, o.b);
          s = game.map.getSpot(o.c, o.d);
          if (s && s.hasClass('free')) {
            if (m) { m.data('detour', false); }
            fil(o.a, o.b);
          } else {
            s = game.map.getSpot(o.e, o.f);
            if (s && s.hasClass('free')) {
              if (m) { m.data('detour', s); }
              fil(o.a, o.b);
            } else {
              s = game.map.getSpot(o.g, o.h);
              if (s && s.hasClass('free')) {
                if (m) { m.data('detour', s); }
                fil(o.a, o.b);
              }
            }
          }
        }
      }
    }
  },
  inRange: function (spot, r, cb) {
    game.map.atRange(spot, 0, cb);
    game.map.around(spot, r, cb);
  },
  around: function (spot, r, cb) {
    game.map.atRange(spot, r, cb);
    if (r === 3) { game.map.atRange(spot, 1, cb); }
    if (r === 4) { game.map.atRange(spot, 2, cb); }
    if (r === 5) {
      game.map.atRange(spot, 1, cb);
      game.map.atRange(spot, 3, cb);
    }
  },
  radialStroke: function (spot, range, cl) {
    var radius, x, y, r, r2, l,
      fil = function (x, y, border) {
        var spot = game.map.getSpot(x, y);
        if (spot) { spot.addClass(cl + ' stroke ' + border); }
      },
      w = game.map.getX(spot),
      h = game.map.getY(spot);
    if (range === 0) { return fil(w, h, 'left right top bottom'); }
    radius = game.map.rangeArray[range];
    r = Math.round(radius);
    r2 = radius * radius;
    l = Math.ceil(radius) * Math.cos(Math.PI / 4);
    if (range % 2 === 0) {
      fil(w, h + r, 'bottom');
      fil(w, h - r, 'top');
      fil(w - r, h, 'left');
      fil(w + r, h, 'right');
    } else if (range % 2 === 1) {
      fil(w, h + r, 'bottom left right');
      fil(w, h - r, 'top  left right');
      fil(w - r, h, 'left top bottom');
      fil(w + r, h, 'right top bottom');
    }
    if (range === 2 || range === 3) {
      for (x = 1; x <= l; x += 1) {
        y = 1;
        fil(w + x, h + y, 'right bottom');
        fil(w + x, h - y, 'right top');
        fil(w - x, h + y, 'left bottom');
        fil(w - x, h - y, 'left top');
      }
    } else if (range === 4 || range === 6 || range === 8) {
      for (x = 1; x <= l; x += 1) {
        y = Math.round(Math.sqrt(r2 - x * x));
        fil(w + x, h + y, 'right bottom');
        fil(w + y, h + x, 'right bottom');
        fil(w + x, h - y, 'right top');
        fil(w + y, h - x, 'right top');
        fil(w - x, h + y, 'left bottom');
        fil(w - y, h + x, 'left bottom');
        fil(w - x, h - y, 'left top');
        fil(w - y, h - x, 'left top');
      }
    } else if (range >= 5) {
      for (x = 1; x <= l; x += 1) {
        y = Math.round(Math.sqrt(r2 - x * x));
        fil(w + x, h + y, 'bottom');
        fil(w - x, h + y, 'bottom');
        fil(w + x, h - y, 'top');
        fil(w - x, h - y, 'top');
        fil(w - y, h + x, 'left');
        fil(w - y, h - x, 'left');
        fil(w + y, h - x, 'right');
        fil(w + y, h + x, 'right');
      }
    }
    if (range === 7) {
      fil(w + 3, h + 2, 'bottom');
      fil(w - 3, h + 2, 'bottom');
      fil(w + 3, h - 2, 'top');
      fil(w - 3, h - 2, 'top');
      fil(w - 2, h + 3, 'left');
      fil(w - 2, h - 3, 'left');
      fil(w + 2, h + 3, 'right');
      fil(w + 2, h - 3, 'right');
    }
  },
  crossStroke: function (spot, range, width, cl) {
    var radius, x, y, r,
      fil = function (x, y, border) {
        var spot = game.map.getSpot(x, y);
        if (spot) { spot.addClass(cl + ' stroke ' + border); }
      },
      w = game.map.getX(spot),
      h = game.map.getY(spot);
    if (range === 0) { return fil(w, h, 'left right top bottom'); }

    fil(w, h + range, 'bottom');
    fil(w, h - range, 'top');
    fil(w - range, h, 'left');
    fil(w + range, h, 'right');

    for (r = 1; r <= range; r += 1) {
      fil(w - width, h + r, 'left');
      fil(w + width, h + r, 'right');
    }
    for (r = 1; r <= range; r += 1) {
      fil(w - width, h - r, 'left');
      fil(w + width, h - r, 'right');
    }
    for (r = 1; r <= range; r += 1) {
      fil(w + r, h - width, 'top');
      fil(w + r, h + width, 'bottom');
    }
    for (r = 1; r <= range; r += 1) {
      fil(w - r, h - width, 'top');
      fil(w - r, h - width, 'bottom');
    }

  },
  linearStroke: function (spot, range, width, cl) {
    var radius, x, y, r,
      fil = function (x, y, border) {
        var spot = game.map.getSpot(x, y);
        if (spot) { spot.addClass(cl + ' stroke ' + border); }
      },
      cw = game.map.getX(spot),
      ch = game.map.getY(spot),
      w = game.map.getX(game.castpos),
      h = game.map.getY(game.castpos);
    if (ch - h > 0) {
      fil(w, h + range, 'bottom');
      for (r = 1; r <= range; r += 1) {
        fil(w - width, h + r, 'left');
        fil(w + width, h + r, 'right');
      }
    }
    if (ch - h < 0) {
      fil(w, h - range, 'top');
      for (r = 1; r <= range; r += 1) {
        fil(w - width, h - r, 'left');
        fil(w + width, h - r, 'right');
      }
    }
    if (cw - w > 0) {
      fil(w + range, h, 'right');
      for (r = 1; r <= range; r += 1) {
        fil(w + r, h - width, 'top');
        fil(w + r, h + width, 'bottom');
      }
    }
    if (cw - w < 0) {
      fil(w - range, h, 'left');
      for (r = 1; r <= range; r += 1) {
        fil(w - r, h - width, 'top');
        fil(w - r, h - width, 'bottom');
      }
    }
  },
  getRange: function (att) {
    var range = att;
    if (att === game.data.ui.ortho)  { range = 1; }
    if (att === game.data.ui.melee)  { range = 2; }
    if (att === game.data.ui.short)  { range = 3; }
    if (att === game.data.ui.ranged) { range = 4; }
    if (att === game.data.ui.long)   { range = 5; }
    return range;
  },
  clear: function () {
    game.highlight.clearMap();
    $('.map .spot').removeClass('block').addClass('free');
  }
};
