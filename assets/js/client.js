/**
 * Created by andkon on 19.07.16.
 */


var chat = {
    container: null,
    list: null,
    mess: null,
    socket: null,
    chatId: null,
    open: function () {
        if (typeof clientChat != 'undefined') {
            this.chatId = clientChat.chatId;
            this.container = $('#container_' + this.chatId);
            this.list = $('.list', $(this.container));
            this.mess = $('.message', $(this.container));
            $(this.container).on('click', '.messSend', function () {
                chat.send();
            });
            $(this.container).show(1);
            this.socket = new WebSocket("ws://" + clientChat.url);

            this.socket.onopen = function () {
                console.log("connected");
                chat.setList('');
            };

            this.socket.onclose = function (event) {
                if (event.wasClean) {
                    console.log('Соединение закрыто чисто');
                } else {
                    console.log('Обрыв соединения'); // например, "убит" процесс сервера
                }

                if (event.code == 1006) {
                    chat.setList('Соединение с сервером...');
                    setTimeout('chat.open()', 3000);
                    return;
                }
                console.log('Код: ' + event.code + ' причина: ' + event.reason);
                chat.echo('Соединение закрыто');
            };

            this.socket.onmessage = function (event) {
                console.log("Получены данные " + event.data);
                var messages = JSON.parse(event.data);
                var tpl = clientChat.messageTemplate.current || '';
                var html = '';
                for (i in messages) {
                    html += tpl.replace('{message}', messages[i].text)
                        .replace('{date}', messages[i].date);
                }

                chat.echo(html);
            };

            this.socket.onerror = function (error) {
                console.log("Ошибка " + error.message);
                chat.setList("Ошибка " + error.message);
            };

        }
    },
    echo: function (mess) {
        $(this.list).append(mess);
    },
    setList: function (html) {
        $(this.list).html(html);
    },
    send: function () {
        var mess = $(this.mess).val();
        $(this.mess).val('');
        this.socket.send(JSON.stringify({chatId: this.chatId, message: mess}));
        return false;
    }
}