var express = require("express");
var router = express.Router();
var User = require("../models/User");
var Content = require("../models/Content");
var Chat = require("../models/Chat");
//返回格式
var resData;
router.use(function (req, res, next) {
    resData = {
        code: 0,
        message: ""
    }
    next();
})

/**
 * 用户注册
 * 注册逻辑
 * 
 * 1.用户名不能为空
 * 2.密码不能为空
 * 3.两次密码必须一致
 * 4.用户名是否已被注册（数据库查询）
 */
router.post('/user/register', function (req, res, next) {
    var username = req.body.username;
    var passwd = req.body.passwd;
    var repasswd = req.body.repasswd;
    //用户名是否为空
    if (username == "") {
        resData.code = 1;
        resData.message = "用户名不能为空";
        res.json(resData);
        return;
    }
    //密码是否为空
    if (passwd == "") {
        resData.code = 2;
        resData.message = "密码不能为空";
        res.json(resData);
        return;
    }
    //密码是否一致
    if (passwd != repasswd) {
        resData.code = 3;
        resData.message = "两次密码不一致";
        res.json(resData);
        return;
    }
    //用户名是否被注册
    User.findOne({
        username: username
    }).then(function (userInfo) {
        if (userInfo) {
            resData.code = 4;
            resData.message = "用户名已被注册";
            res.json(resData);
            return;
        }
        //保存用户注册信息
        var user = new User({
            username: username,
            passwd: passwd
        });
        return user.save();
    }).then(function (newUserInfo) {
        if (newUserInfo) {
            resData.message = "注册成功";
            req.cookies.set('userInfo', JSON.stringify({
                _id: newUserInfo._id,
                username: newUserInfo.username
            }));
            res.json(resData);
            return;
        }
    });
});
/**
 * 登录
 */
router.post('/user/login', function (req, res, next) {
    var username = req.body.username;
    var passwd = req.body.passwd;
    if (username == '' || passwd == '') {
        resData.code = 1;
        resData.message = "用户名或密码不能为空";
        res.json(resData);
        return;
    }
    //查询数据库中相同用户名和密码是否存在
    User.findOne({
        username: username,
        passwd: passwd
    }).then(function (userInfo) {
        if (!userInfo) {
            resData.code = 2;
            resData.message = "用户名或密码错误";
            res.json(resData);
            return;
        }
        //用户名和密码正确
        resData.message = "登录成功";
        resData.userInfo = {
            _id: userInfo._id,
            username: userInfo.username
        }
        req.cookies.set('userInfo', JSON.stringify({
            _id: userInfo._id,
            username: userInfo.username
        }));
        res.json(resData);
        return;
    })
})
/**
 * 退出
 */
router.get('/user/logout', function (req, res) {
    req.cookies.set('userInfo', null);
    res.json(resData);
})

/*
 *获取当前文章所有评论
 */
router.get('/comment', function (req, res) {
    var contentId = req.query.contentid || '';
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        if (content) {
            resData.postData = content;
            res.json(resData);
        }
    })
})

/*
 *评论
 */
router.post('/comment/post', function (req, res) {
    //内容的id
    var contentId = req.body.contentid || '';
    var postData = {
        username: req.userInfo.username,
        postTime: new Date(),
        id: new Date().getTime().toString(16),
        content: req.body.content
    };
    //查询当前内容的信息
    Content.findOne({
        _id: contentId
    }).then(function (content) {
        content.comment.push(postData);
        return content.save();
    }).then(function (newContent) {
        if (newContent) {
            resData.message = '评论成功';
            res.json({
                resData: resData,
                postData: newContent
            });
        }
    });

})


/*
 *获取所有聊天信息
 */
router.get('/chat', function (req, res) {
    Chat.findOne().then(function (chat) {
        if (chat) {
            res.json(chat);
        }
    })
})
module.exports = router;