game.skill = {
  bindJquery: function () {
    $.fn.cast = game.skill.cast;
    $.fn.passive = game.skill.passive;
    $.fn.toggle = game.skill.toggle;
    $.fn.discard = game.card.discard;
  },
  cast: function (skill, target) {
    var source = this, targets, duration, channeler, channelDuration,
      hero = skill.data('hero'),
      skillid = skill.data('skill');
    if (skillid && hero && source.data('hero') === hero) {
      if (typeof target === 'string') {
        targets = game.data.skills[hero][skillid].targets;
        if (targets.indexOf(game.data.ui.spot) >= 0) {
          target = $('#' + target);
        } else {target = $('#' + target + ' .card'); }
      }
      if (target.length) {
        source.stopChanneling();
        var evt = {
          type: 'cast',
          skill: skill,
          source: source,
          target: target
        };
        source.trigger('cast', evt).trigger('action', evt);
        game.skills[hero][skillid].cast(skill, source, target);
        if (game.audio.sounds.indexOf(hero + '/' + skillid) >= 0) {
          game.audio.play(hero + '/' + skillid);
        }
        channelDuration = skill.data('channel');
        if (channelDuration) {
          source.data('channeling', channelDuration).addClass('channeling');
          source.on('channel', function (event, eventdata) {
            channeler = eventdata.source;
            duration = channeler.data('channeling');
            if (duration) {
              duration -= 1;
              channeler.data('channeling', duration);
            } else {
              channeler.stopChanneling();
            }
          });
        }
        if (source.hasClass('enemy')) {
          game.enemy.hand -= 1;
        } else {
          if (game.mode !== 'library' && source.hasClass('player')) {
            source.addClass('done').unselect();
          }
          game.timeout(400, function () {
            game.skill.aoe = '';
            //$('.map .spot, .map .card').off('mouseover.highlight mouseleave.highlight');
            if (game.mode !== 'library') this.skill.discard();
          }.bind({source: source, skill: skill}));
        }
      }
    }
    return this;
  },
  passive: function (target) {
    var skill = this,
      hero = skill.data('hero'),
      skillid = skill.data('skill');
    if (typeof target === 'string') target = $('#' + target + ' .card');
    if (skillid && hero && target.data('hero') === hero) {
      target.trigger('passive', {
        skill: skill,
        target: target
      });
      game.skills[hero][skillid].passive(skill, target);
      target.unselect();
      if (skill.hasClass('enemy')) game.enemy.hand -= 1;
      game.timeout(400, function () {
        this.skill.detach();
        this.target.select();
      }.bind({target: target, skill: skill}));
    }
    return this;
  },
  toggle: function (target) {
    var skill = this,
      hero = skill.data('hero'),
      skillid = skill.data('skill');
    if (typeof target === 'string') { target = $('#' + target + ' .card'); }
    if (skillid && hero && target.data('hero') === hero) {
      var evt = {
        type: 'toggle',
        skill: skill,
        target: target
      };
      target.trigger('toggle', evt);
      game.skills[hero][skillid].toggle(skill, target);
      if (skill.hasClass('enemy')) {
        game.enemy.hand -= 1;
      } else {
        game.timeout(450, target.select.bind(target));
      }
    }
    return this;
  },
  addBuff: function (target, data) {
    var buff = $('<div>').addClass('buff ' + data.buff).attr({ title: data.name + ': ' + data.description });
    $('<div>').appendTo(buff).addClass('img');
    $('<div>').appendTo(buff).addClass('overlay');
    buff.data('source', this);
    target.find('.buffs').append(buff);
    return buff;
  },
  hasBuff: function (buff) {
    var target = this;
    return target.find('.buffs .' + buff).length;
  },
  removeBuff: function (buffs) {
    var target = this;
    $.each(buffs.split(' '), function () {
      var buff = this;
      target.find('.buffs .' + buff).remove();
      if (target.hasClass('selected')) { target.select(); }
    });
    return this;
  },
  discard: function () {
    if (this.hasClass('skill')) {
      this.trigger('discard', {target: this});
      if (this.hasClass('player')) {
        this.appendTo(game.player.skills.cemitery);
      } else {
        this.appendTo(game.enemy.skills.deck);
        game.enemy.hand -= 1;
      }
    }
  },
};
