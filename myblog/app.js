/*
 *Create by yue on 2020/2/13
 *应用程序的启动文件
 */
//加载express模块
var express = require("express");
//加载模板 处理模块
var swig = require("swig");
//加载数据库模块
var mongoose = require("mongoose");
//加载body-parser，用来处理post请求
var bodyParser = require("body-parser");
//加载cookies模块
var Cookies = require("cookies");

var fs = require("fs");


//加载app应用
var app = express();

var http = require("http").createServer(app);


var User = require("./models/User");

var Chat = require("./models/Chat");

//设置静态文件托管
//当用户访问的url以/public开始，直接访问__dirname + "/public"下的文件
app.use("/public", express.static(__dirname + "/public"));
//配置模板
//定义当前应用所使用的模板引擎
app.engine("html", swig.renderFile);
//设置模板文件存放的目录，（第一个参数必须是views）
app.set("views", "./views");
//注册所使用的模板引擎(第一个参数必须是view engine,)
app.set("view engine", "html");
//在开发过程中需要取消模板缓存
swig.setDefaults({
  cache: false,
});
//bodyparser设置
app.use(bodyParser.urlencoded({
  extended: true
}))
//设置cookies
app.use(function (req, res, next) {
  req.cookies = new Cookies(req, res);
  //解析登录的用户cookie信息
  req.userInfo = {};
  if (req.cookies.get('userInfo')) {
    try {
      req.userInfo = JSON.parse(req.cookies.get('userInfo'));
      //获取当前登录用户的类型，是否是管理员
      User.findById(req.userInfo._id).then(function (userInfo) {
        req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
        next();
      })
    } catch (error) {
      next();
    }
  } else {
    next();
  }
})
/*
 *根据不同的功能划分模块
 */
app.use("/admin", require("./routers/admin"));
app.use("/api", require("./routers/api"));
app.use("/", require("./routers/main"));
//监听http请求
mongoose.connect("mongodb://localhost:27017/blog", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, function (err) {
  if (err) {
    console.log("数据库连接失败");
  } else {
    console.log("数据库连接成功");
    app.listen(8081);

  }
});
/**
 * 在线聊天室
 */
var io = require("socket.io")(http);
http.listen(8080);
app.get("/chat", function (req, res, next) {
  res.render('main/chat', {
    router: "/chat",
    userInfo: req.userInfo
  });
})



//ws IO服务器监听用户的连接事件
io.on("connection", function (socket) {
  console.log("用户请求进入聊天室");
  //监听socket当中的消息发送事件
  socket.on("message", function (mes) {
    Chat.findOne().then(function (chat) {
      chat.chat.push(mes);
      return chat.save();
    }).then(function (newChat) {
      if (newChat) {
        //如果没有注明发给谁，就是广播
        io.emit("message", newChat);
      }
    })

  });
});