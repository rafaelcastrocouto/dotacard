game.skills.pud = {
  hook: {
    cast: function (skill, source, target) {
      var cw = game.map.getX(source.parent()),
        ch = game.map.getY(source.parent()),
        w = game.map.getX(target),
        h = game.map.getY(target),
        range = skill.data('aoe range'),
        x = 0, y = 0,
        hooked,
        r,
        dx,
        dy;
      if (ch - h > 0) { y = -1; }
      if (ch - h < 0) { y = 1; }
      if (cw - w > 0) { x = -1; }
      if (cw - w < 0) { x = 1; }
      target = game.map.getSpot(cw + x, ch + y);
      for (r = 1; r <= range; r += 1) {
        var spot = game.map.getSpot(cw + (r * x), ch + (r * y));
        if (spot) {
          var card = spot.find('.card');
          if (card.length) {
            hooked = card;
            break;
          }
        }
      }
      if(hooked && hooked.hasClasses('heroes units')) {
        source.damage(skill.data('damage'), hooked, skill.data('damage type'));
        w = game.map.getX(hooked.parent());
        h = game.map.getY(hooked.parent());
        dx = -212 * x * (Math.abs(cw - w) - 1);
        dy = -313 * y * (Math.abs(ch - h) - 1);
        //if (!source.data('hook fx')) { game.skills.pud.hook.fx(source, dx, dy); }
        setTimeout(function () {
          if (x) {
            hooked.css({left: 'calc(50% + ' + dx + 'px)'});
          } else if (y) {
            hooked.css({top: 'calc(50% + ' + dy + 'px)'});
          }
        }.bind({hooked: hooked, dx: dx, dy: dy, x: x, y: y}), 600);
        setTimeout(function () {
          this.hooked.place(this.target).css({
            transition: 'all 0.4s',
            top: '50%',
            left: '50%'
          });
        }.bind({source: source, hooked: hooked, target: target}), 1200);
      }
    }/*,
    fx: function (card, x, y) {
      var fx = game.fx.build(card, 'hook fx');
      game.fx.image(fx);
      fx.create('hook.png', 1200, 1000, x, y);
    }*/
  },
  rot: {
    toggle: function (skill, source) {
      if(skill.hasClass('on')) {
        //turn off
        skill.removeClass('on');
        source.off('turnend.rot');
        source.data('pud-rot', null);
        source.removeClass('pud-rot');
        source.removeBuff('pud-rot');
        //source.data('rot fx').stop();
      }
      else {
        //turn on
        skill.addClass('on');
        source.on('turnend.rot', game.skills.pud.rot.turnendcast);
        source.data('pud-rot', skill);
        source.addClass('pud-rot');
        source.addBuff(source, skill.data('buff'));
        //if (!source.data('rot fx')) { game.skills.pud.rot.fx(source); }
        //source.data('rot fx').animate();
      }
    },
    turnendcast: function (event, eventdata) {
      var source = eventdata.target;
      var spot = game.map.getPosition(source);
      var otherSide = game.otherSide(source);
      var skill = source.data('pud-rot');
      source.damage(skill.data('damage'), source, skill.data('damage type'));
      game.map.inRange(spot, game.map.getRange(skill.data('aoe range')), function (neighbor) {
        var card = neighbor.find('.card.'+otherSide);
        if(card.length) {
          source.damage(skill.data('damage'), card, skill.data('damage type'));
          if(card.data('pud-rot')) {
            card.data('pud-rot', skill.data('duration'));
          } else {
            card.data('pud-rot', skill.data('duration'));
            source.addBuff(card, skill.data('buff'));
            var speed = card.data('speed') - 1;
            card.data('currentspeed', speed);
            card.on('turnend.rot', game.skills.pud.rot.turnend);
          }
        }
      });
    },
    turnend: function (event, eventdata) {
      var target = eventdata.target;
      var duration = target.data('pud-rot');
      if(duration > 0) {
        duration -= 1;
        target.data('pud-rot', duration);
      } else {
        var speed = target.data('current speed') + 1;
        target.data('currentspeed', speed);
        target.off('turnend.rot');
        target.data('pud-rot', null);
        target.removeBuff('pud-rot');
      }
    }//,
//      fx: function (card) {
//        var fx = game.fx.build(card, 'rot fx');
//        game.fx.particles(fx);
//        fx.create(100, {
//          radius: function () { return 10 + Math.random() * 30; },
//          speed: function () { return 4 + Math.random() * 2; },
//          x: function () { return 1100; },
//          y: function () { return 1150; },
//          color: function () { return 'yellowgreen'; },
//          dir: function () { return Math.random() * Math.PI * 2; }
//        });
//      }
  },
  passive: {
    passive: function (skill, source) {
      var resistance = source.data('resistance') + skill.data('resistance');
      source.data('resistance', resistance);
      source.addBuff(source, skill.data('buff'));
      game.skills.pud.passive.kill.call({skill: skill, source: source});
      source.on('kill', game.skills.pud.passive.kill.bind({skill: skill, source: source}));
    },
    kill: function () {
      var skill = this.skill;
      var source = this.source;
      var damage = source.data('damage');
      var bonus = skill.data('damage bonus');
      source.setDamage(damage + bonus);
      var hp = source.data('hp');
      var bonusHp = skill.data('hp bonus');
      source.setCurrentHp(hp + bonusHp);
    }
  },
  ult: {
    cast: function (skill, source, target) {
      var channelDuration = skill.data('channel');
      source.addClass('channeling');
      source.data('channeling', channelDuration);
      source.data('dismember', {
        target: target,
        skill: skill
      });
      source.on('channel', game.skills.pud.ult.channel);
      source.on('channelEnd', game.skills.pud.ult.channelEnd);
      source.addBuff(source, skill.data('buff'));
      source.addBuff(target, skill.data('buff'));
      target.addClass('disabled');
      source.trigger('channel', {source: source});
    },
    channel: function (event, eventData) {
      var source = eventData.source;
      var data = source.data('dismember');
      var target = data.target;
      var skill = data.skill;
      var duration = source.data('channeling');
      var type = skill.data('damage type');
      var dot = skill.data('dot');
      source.damage(dot, target, type);
      if (game.mode == 'library' && game.states.table.el.hasClass('unturn')) {}
      else game.audio.play('pud/ult-channel');
    },
    channelEnd: function (source, target) {
      source.data('dismember', null);
      source.removeBuff('pud-ult');
      target.removeBuff('pud-ult').removeClass('disabled');
    }
  }
};
