$(function () {
    var count = 0;
    var socket = io.connect("localhost:8080"); //连接socket服务
    $(".w_btn").on("click", function () {
        var mes = $("textarea").val();
        if (!mes) return;
        $("textarea").val("");
        var obj = {
            mes: mes,
            userInfo: document.cookie
        }
        socket.send(obj); //发送消息到服务端
    });
    socket.on("message", function (mes) {
        renderComment(mes);
    });

    function renderComment(data) {
        var html = '';
        if (data.chat.length > 30) {
            var show = data.chat.reverse().slice(0, 30).reverse();
        } else {
            var show = data.chat;
        }
        for (var i = 0; i < show.length; i++) {
            if (show[i].userInfo == document.cookie) {
                html += `<ul>
                <li class="w_right">${show[i].mes}</li>
            </ul>`
            } else {
                html += `<ul>
                <li>${show[i].userInfo}</li>
                <li>${show[i].mes}</li>
            </ul>`
            }
        }
        $(".w_content", ".wrapper").html(html);
        for (var i = 0; i < $("ul", ".w_content").length; i++) {
            count += $("ul", ".w_content").eq(i).height();
        }
        var h = count - $(".w_content").height();
        $(".w_content").scrollTop(h);


    }
    // 获取所有信息并展示
    $.ajax({
        url: "/api/chat",
        data: {},
        dataType: 'json',
        success: function (data) {
            renderComment(data);
        }
    })
})