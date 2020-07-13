 $(function () {
     var mainBox = $(".userInfo");
     var lognBox = $(".login");
     var regBox = $(".regist");
     var comBox = $(".comment");
     //  mainBox.hide();
     regBox.hide();
     //切换到注册
     lognBox.find('a').on("click", function () {
         regBox.show();
         lognBox.hide();
     });
     //切换到登录
     regBox.find('a').on("click", function () {
         lognBox.show();
         regBox.hide();
     });
     mainBox.find('i').on("click", function () {

         $.ajax({
             url: 'api/user/logout',
             success: function (data) {
                 if (!data.code) {
                     window.location.reload();
                 }
             }
         })
     })
     regBox.find('.sub').on("click", function () {
         //通过ajax提交请求
         $.ajax({
             type: 'post',
             url: "/api/user/register",
             data: {
                 username: regBox.find("[name = 'username']").val(),
                 passwd: regBox.find("[name = 'passwd']").val(),
                 repasswd: regBox.find("[name = 'repasswd']").val()
             },
             dataType: 'json',
             success: function (data) {
                 regBox.find("b").html(data.message);
                 if (!data.code) {
                     //注册成功
                     window.location.reload();
                 }
             }
         })
     });
     lognBox.find('.sub').on("click", function () {
         //通过ajax提交请求
         $.ajax({
             type: 'post',
             url: "/api/user/login",
             data: {
                 username: lognBox.find("[name = 'username']").val(),
                 passwd: lognBox.find("[name = 'passwd']").val()
             },
             dataType: 'json',
             success: function (data) {
                 lognBox.find("b").html(data.message);
                 if (!data.code) {
                     //登录成功
                     document.cookie = lognBox.find("[name = 'username']").val();
                     window.location.reload();
                 }
             }
         })
     });
 })
 aa();
 function aa() {
     var now = new Date();
         var year = now.getFullYear();
         var month = now.getMonth() + 1;
         var day = now.getDate();
         var week = now.getDay;
         var lastDay = (new Date(year,month,0)).getDate();
         var firstWeek = (new Date(year,month - 1,1)).getDay();
         var content = document.getElementsByClassName("date_content")[0];
         var oUl = content.children[0];
         var head = document.getElementsByClassName("date_head")[0];
         var sp = head.children[0];
         sp.innerText = `${year}年${month}月`;
         for(var i = 1; i <= lastDay; i ++){
             var li = document.createElement("li");
             if(i == day){
                 li.style.background = "#f40";
             }
             li.innerText = i;
             oUl.appendChild(li);
         }
         if(firstWeek == 0){
             return;
         }else{
             for(var i = 0; i < firstWeek; i ++){
                 var li = document.createElement("li");
                 oUl.insertBefore(li,oUl.children[0]);
             }
         }
 }
 