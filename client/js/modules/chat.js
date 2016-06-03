game.chat = {
  build: function () {
    if (!game.chat.builded) {
      game.chat.builded = true;
      game.chat.el = $('<div>').addClass('chat').appendTo(game.states.menu.el).html('<h1>Chat</h1>').hover(function () {
        game.chat.input.focus();
      }).appendTo(game.states.menu.el);
      game.chat.messages = $('<div>').addClass('messages').appendTo(game.chat.el);
      game.chat.input = $('<input>').appendTo(game.chat.el).attr({type: 'text', maxlength: 42}).keydown(function (e) { if (e.which === 13)  game.chat.send();});
      game.chat.button = $('<div>').addClass('button').appendTo(game.chat.el).on('mouseup touchend', game.chat.send).text('Send');
      game.chat.icon = $('<span>').text('Chat').addClass('chat-icon').appendTo(game.chat.el);
      setInterval(function () {
        game.db({ 'get': 'chat' }, function (chat) {
          game.chat.update(chat, true);
        });
      }, 5000);
    }
  },
  start: function () {
    game.db({
      'set': 'chat',
      'data': game.player.name + ' ' + game.data.ui.joined
    }, function (chat) {
      game.chat.update(chat);
    });
  },
  update: function (chat, first) {
    if (chat.messages && chat.messages.length) {  
      var height = game.chat.messages[0].scrollHeight - game.chat.messages.height(),
          scroll = game.chat.messages.scrollTop(),
          down = (scroll > height * 0.9 || height < 80);
      game.chat.messages.empty();
      $.each(chat.messages, function () {
        var msg = $('<p>').text(this).prependTo(game.chat.messages);
      });
      if (down || first) { game.chat.messages.scrollTop(game.chat.messages[0].scrollHeight); }
    }
  },
  send: function () {
    var msg = game.chat.input.val();
    if (!msg) {
      game.chat.input.focus();
    } else {
      game.chat.button.attr('disabled', true);
      game.loader.addClass('loading');
      game.chat.input.val('');
      game.db({
        'set': 'chat',
        'data': game.player.name + ': ' + msg
      }, function (chat) {
        game.chat.update(chat);
        setTimeout(function () {
          game.loader.removeClass('loading');
          game.chat.button.attr('disabled', false);
        }, 2000);
      });
    }
  }
};
