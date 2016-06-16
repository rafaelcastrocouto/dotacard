game.highlight = {
  bindJquery: function () {
    $.fn.highlightSource = game.highlight.source;
    $.fn.highlightAlly = game.highlight.ally;
    $.fn.highlightTargets = game.highlight.targets;
    $.fn.highlightAttack = game.highlight.attack;
    $.fn.highlightMove = game.highlight.move;
    $.fn.strokeSkill = game.highlight.strokeSkill;
    $.fn.strokeAttack = game.highlight.strokeAttack;
  },
  map: function () {
    if (game.selectedCard) {
      if (game.selectedCard.hasClasses('hero unit')) {
        game.selectedCard.strokeAttack();
        if (!game.states.table.el.hasClass('unturn')) {
          if (game.tutorial.lesson != 'Enemy' && 
              game.tutorial.lesson != 'Unselect') {
            game.selectedCard.highlightMove();
          }
          game.selectedCard.highlightAttack();
        }
      } else if (game.selectedCard.hasClass('skill')) {
        game.selectedCard.highlightSource();
        game.selectedCard.strokeSkill();
        if (!game.states.table.el.hasClass('unturn')) {
          game.selectedCard.highlightTargets();
        }
      } else if (game.selectedCard.hasClass('tower')) {
        game.selectedCard.strokeAttack();
      }
    }
  },
  source: function () {
    var skill = this, hero = skill.data('hero');
    if (hero) $('.map .card.player.hero.' + hero).addClass('source');
    return skill;
  },
  targets: function () {
    var skill = this, hero = skill.data('hero');
    if (hero) {
      var source = $('.map .source');
      if (source.hasClasses('hero unit')) {
        if (skill.data('type') === game.data.ui.passive) {
          game.highlight.passive(source);
        } else if (skill.data('type') === game.data.ui.toggle) {
          game.highlight.toggle(source);
        } else if (skill.data('type') === game.data.ui.active || 
                   skill.data('type') === game.data.ui.channel) {
          game.highlight.active(source, skill);
        }
      }
    }
    return skill;
  },
  passive: function (source) {
    if (!source.hasClass('dead')) {
      source.addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.passive);
    }
  },
  toggle: function (source) {
    if (!source.hasClasses('dead done stunned silenced hexed disabled sleeping cycloned taunted')) {
      source.addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.toggle);
    }
  },
  self: function (source) {
    source.addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.cast);
  },
  ally: function (source, skill) {
    var range = game.map.getRange(skill.data('range'));
    if (range === game.data.ui.global) {
      $('.map .player').addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.cast);
    } else {
      var pos = game.map.getPosition(source);
      game.map.inRange(pos, range, function (neighbor) {
        var card = $('.card', neighbor);
        if (card.hasClass('player')) {
          card.addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.cast);
        }
      });
    }
  },
  enemy: function (source, skill) {
    var range = game.map.getRange(skill.data('range'));
    if (range === game.data.ui.global) {
      $('.map .enemy').addClass('casttarget').on('mouseup.highlight touchend.highlight', game.player.cast);
    } else {
      var pos = game.map.getPosition(source);
      game.map.inRange(pos, range, function (neighbor) {
        var card = $('.card', neighbor);
        if (card.hasClass('enemy')) {
          card.addClass('casttarget').on('mouseup.highlight touchend.highlightd', game.player.cast);
        }
      });
    }
  },
  summoner: function (source, skill) {
    var pos = game.map.getPosition(source.data(game.data.ui.sumonner)),
        range = game.map.getRange(skill.data('range'));
    game.map.around(pos, range, function (neighbor) {
      if (neighbor.hasClass('free')) {
        neighbor.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
      }
    });
  },
  freeSpots: function (source, skill) {
    var pos = game.map.getPosition(source),
        range = game.map.getRange(skill.data('range'));
    game.map.around(pos, range, function (neighbor) {
      if (neighbor.hasClass('free')) {
        neighbor.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
      }
    });
  },
  radial: function (source, skill) {
    var pos = game.map.getPosition(source),
        range = game.map.getRange(skill.data('range'));
    game.map.around(pos, range, function (neighbor) {
      neighbor.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
      if (neighbor.hasClass('block')) {
        var card = $('.card', neighbor);
        card.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
      }
    });
  },
  linear: function (source, skill) {
    var pos = game.map.getPosition(source),
        range = skill.data('aoe range'),
        width = skill.data('aoe width');
    game.map.atCross(pos, range, width, function (neighbor) {
      neighbor.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
      if (neighbor.hasClass('block')) {
        var card = $('.card', neighbor);
        card.addClass('targetarea').on('mouseup.highlight touchend.highlight', game.player.cast);
      }
    });
  },
  active: function (source, skill) { 
    var targets = skill.data('targets');
    if (!source.hasClasses('dead done stunned frozen silenced hexed disabled sleeping cycloned taunted')) {
      if (targets.indexOf(game.data.ui.self) >= 0) game.highlight.self(source);
      if (targets.indexOf(game.data.ui.ally) >= 0) game.highlight.ally(source, skill);
      if (targets.indexOf(game.data.ui.enemy) >= 0) game.highlight.enemy(source, skill);
      if (targets.indexOf(game.data.ui.sumonner) >= 0) game.highlight.summoner(source, skill);
      if (targets.indexOf(game.data.ui.spot) >= 0) {
        if (targets.indexOf(game.data.ui.free) >= 0) game.highlight.freeSpots(source, skill);
        else {
          var aoe = skill.data('aoe');
          if (aoe === 'Radial') game.highlight.radial(source, skill);
          if (aoe === 'Linear') game.highlight.linear(source, skill);
        }
      }
    }
  },
  move: function () {
    var card = this, speed;
    if (card.hasClass('player') && card.hasClasses('unit hero') && !card.hasClasses('enemy done static dead stunned frozen entangled disabled sleeping cycloned taunted')) {
      speed = card.data('current speed');
      if (speed < 1) { return card; }
      if (speed > 3) { speed = 3; }
      game.map.atMovementRange(card, Math.round(speed), function (neighbor) {
        if (!neighbor.hasClass('block')) { 
          neighbor.addClass('movearea').on('mouseup.highlight touchend.highlight', game.player.move); 
        }
      });
    }
    return card;
  },
  attack: function () {
    var card = this, pos, range;
    if (card.hasClass('player') && card.hasClasses('unit hero') && !card.hasClasses('enemy done dead stunned frozen')) {
      pos = game.map.getPosition(card);
      range = game.map.getRange(card.data('range'));
      game.map.inRange(pos, range, function (neighbor) {
        var card = $('.card', neighbor);
        if (card.hasClass('enemy')) { card.addClass('attacktarget').on('mouseup.highlight touchend.highlight', game.player.attack); }
      });
    }
    return card;
  },
  strokeSkill: function () {  
    var skill = this,
      hero = skill.data('hero'),
      source = $('.map .source'),
      range,
      pos = game.map.getPosition(source);
    if (hero && pos && !source.hasClasses('dead done stunned')) {
      if (skill.data('aoe')) {
        game.castpos = pos;
        game.skill.aoe = skill.data('aoe');
        if (game.skill.aoe === 'Linear') {
          game.skill.aoewidth = skill.data('aoe width');
          game.skill.aoerange = skill.data('aoe range');
          game.map.crossStroke(pos, game.skill.aoerange, game.skill.aoewidth, 'skillarea');
        } else if (game.skill.aoe === 'Radial') {
          game.skill.aoerange = game.map.getRange(skill.data('range'));
          game.skill.aoecastrange = game.map.getRange(skill.data('aoe range'));
        }
        game.states.table.map.addClass('aoe');
        $('.map .spot, .map .card').on('mouseover.highlight mouseleave.highlight', game.highlight.hover);
      }
      if (skill.data('range')) {
        game.map.radialStroke(pos, game.map.getRange(skill.data('range')), 'skillarea');
      }
    }
    return skill;
  },
  strokeAttack: function () {
    var card = this, pos, range;
    if (!card.hasClasses('done dead stunned disabled disarmed hexed')) {
      pos = game.map.getPosition(card);
      range = game.map.getRange(card.data('range'));
      game.map.radialStroke(pos, range, card.data('side') + 'attack');
    }
    return card;
  },
  hover: function (event) {
    if (game.states.table.map.hasClass('aoe')) {
      var spot = $(this);
      $('.map .spot').removeClass('skillarea skillcast top right left bottom');
      if (!spot.hasClass('targetarea') || event.type === 'mouseleave') {
        if (game.skill.aoe === 'Linear') {
          game.map.crossStroke(game.castpos, game.skill.aoerange, game.skill.aoewidth, 'skillarea');
        } else if (game.skill.aoe === 'Radial') {
          game.map.radialStroke(game.castpos, game.skill.aoerange, 'skillarea');
        }
      } else {
        if (game.skill.aoe === 'Linear') {
          game.map.linearStroke(game.map.getPosition(spot), game.skill.aoerange, game.skill.aoewidth, 'skillcast');
        } else if (game.skill.aoe === 'Radial') {
          game.map.radialStroke(game.map.getPosition(spot), game.skill.aoecastrange, 'skillcast');
        }
      }
    }
  },
  clearMap: function () {
    game.states.table.map.removeClass('aoe');
    $('.map .card').clearEvents('highlight').removeClass('source attacktarget casttarget targetarea');
    $('.map .spot').clearEvents('highlight').removeClass('movearea targetarea stroke playerattack enemyattack skillcast skillarea top bottom left right');
  }
};
