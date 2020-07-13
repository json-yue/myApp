$(function () {
    var comBox = $(".comment");
    var limit = 3;
    var page = 1;
    var pages = 0;
    var len;
    var comment = [];
    var com;
    var em = $(".page em");
    //提交评论
    comBox.find(".sub").on("click", function () {
        //通过ajax提交请求
        $.ajax({
            type: 'post',
            url: "/api/comment/post",
            data: {
                contentid: comBox.find("[name = 'hidden']").val(),
                content: comBox.find("[name = 'comment']").val()
            },
            dataType: 'json',
            success: function (data) {
                comBox.find("[name = 'comment']").val('');
                comment = data;
                com = comment.postData.comment.reverse();
                renderComment();
            }
        })
    })
    em.eq(0).on("click", function () {
        page--;
        renderComment();
    })
    em.eq(2).on("click", function () {
        page++;
        renderComment();
    })

    function renderComment() {
        len = com.length;
        comBox.find('span').html(len);
        $('.num').html(len);
        pages = Math.max(Math.ceil(len / limit), 1);
        em.eq(1).html(`${page} / ${pages}`);
        if (page <= 1) {
            page = 1;
            em.eq(0).html("没有上一页了");
        } else {
            em.eq(0).html("<a>上一页</a>");
        }
        if (page >= pages) {
            page = pages;
            em.eq(2).html("没有下一页了");
        } else {
            em.eq(2).html("<a>下一页</a>");
        }
        if (pages == 0) {
            page = 1;
        }
        var start = (page - 1) * limit;
        var end = page * limit;
        if (end > len) {
            end = len;
        }
        var html = '';
        for (var i = start; i < end; i++) {
            var str = com[i].postTime;
            var date1 = str.split("T")[0].split("-");
            var date2 = str.split("T")[1].split(":");
            var str1 = `${date1[0]}年${date1[1]}月${date1[2]}日 ${parseInt(date2[0]) + 8} : ${date2[1]}`
            html += `<li>
            <h3>${com[i].username}</h3>
            <p>${str1}</p>
            <span>${com[i].content}</span>
           </li>`
        }
        if (!html) {
            html = "还没有留言，快来留言吧！"
        }
        pages = Math.max(Math.ceil(len / limit), 1);
        em.eq(1).html(`${page} / ${pages}`);
        comBox.find("ul").html(html);


    }
    // 获取所有评论并展示
    if (comBox.find("[name = 'hidden']").val()) {
        $.ajax({
            url: "/api/comment",
            data: {
                contentid: comBox.find("[name = 'hidden']").val()
            },
            dataType: 'json',
            success: function (data) {
                comment = data;
                com = comment.postData.comment.reverse();
                renderComment();
            }
        })
    }

})