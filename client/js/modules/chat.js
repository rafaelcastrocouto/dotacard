game.chat = {
  build: function () {
    if (!game.chat.builded) {
      game.chat.builded = true;
      game.chat.el = $('<div>').addClass('chat').appendTo(game.states.menu.el).html('<h1>Chat</h1>').hover(game.chat.hover).appendTo(game.states.menu.el);
      game.chat.messages = $('<div>').addClass('messages').appendTo(game.chat.el);
      game.chat.input = $('<input>').appendTo(game.chat.el).attr({type: 'text', maxlength: 42}).keydown(game.chat.keydown);
      game.chat.button = $('<div>').addClass('button').appendTo(game.chat.el).on('mouseup touchend', game.chat.send).text(game.data.ui.send);
      game.chat.icon = $('<span>').text('Chat 🗩').addClass('chat-icon').appendTo(game.chat.el);
      setInterval(game.chat.check, 2000);
    }
  },
  joined: function () {
    game.db({
      'set': 'chat',
      'data': game.player.name + ' ' + game.data.ui.joined
    }, function (chat) {
      game.chat.update(chat);
    });
  },
  hover: function () {
    game.db({ 'get': 'chat' }, function (chat) {
      game.chat.update(chat);
      game.chat.input.focus();
    });
  },
  check: function () {
    game.db({ 'get': 'chat' }, function (chat) {
      game.chat.update(chat);
    });
  },
  update: function (received) {
    if (received.messages && received.messages.length) {  
      game.chat.messages.empty();
      $.each(received.messages, function () {
        $('<p>').text(this).prependTo(game.chat.messages);
      });
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
        game.loader.removeClass('loading');
        setTimeout(function () {
          game.chat.button.attr('disabled', false);
        }, 2000);
      });
    }
  },
  keydown: function (event) {
    if (event.which === 13 && !game.chat.button.attr('disabled')) {
      game.chat.send();
    }
  }
};
