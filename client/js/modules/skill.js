game.skill = {
  bindJquery: function () {
    $.fn.cast = game.skill.cast;
    $.fn.passive = game.skill.passive;
    $.fn.toggle = game.skill.toggle;
    $.fn.discard = game.skill.discard;
  },
  cast: function (skill, target) { //console.trace('cast')
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
          source.data('channeling', channelDuration).data('channel', channelDuration).addClass('channeling');
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
          game.timeout(300, function () { //console.trace('castend')
            if (game.mode !== 'library') this.skill.discard();
            //else this.source.select();
          }.bind({source: source, skill: skill, target: target}));
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
      if (game.audio.sounds.indexOf(hero + '/' + skillid) >= 0) {
        game.audio.play(hero + '/' + skillid);
      } else game.audio.play('activate');
      if (skill.hasClass('enemy')) game.enemy.hand -= 1;
      game.timeout(300, function () {
        this.skill.detach();
        game.highlight.clearMap();
        if (this.target.data('side') === 'player') this.target.select();
        else if (this.target.hasClass('selected')) this.target.select();
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
      if (game.audio.sounds.indexOf(hero + '/' + skillid) >= 0) {
        game.audio.play(hero + '/' + skillid);
      }
      if (skill.hasClass('enemy')) {
        game.enemy.hand -= 1;
      }
      game.timeout(300, function () {
        if (this.target.data('side') === 'player') this.target.select();
        else if (this.target.hasClass('selected')) this.target.select();
      }.bind({target: target, skill: skill}));
    }
    return this;
  },
  discard: function () {
    if (this.hasClass('skills')) {
      game.card.unselect();
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
