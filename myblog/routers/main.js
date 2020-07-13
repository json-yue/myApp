var express = require("express");
var router = express.Router();

var Category = require("../models/Category");
var Content = require("../models/Content");
var data;
/**
 * 处理通用数据
 */
router.use(function (req, res, next) {
    data = {
        userInfo: req.userInfo,
        categories: {},
        count: 0,
        contents: {},
        limit: 3,
        pages: 0
    }
    Category.find().then(function (categories) {
        data.categories = categories;
        next();
    })

})


/*
 *首页
 */
router.get("/", function (req, res, next) {
    data.category = req.query.category || '';
    data.page = Number(req.query.page || 1)
    var where = {};
    if (data.category) {
        where.category = data.category;
    }
    Content.where(where).countDocuments().then(function (count) {
        data.count = count;
        //计算总页数
        data.pages = Math.ceil(data.count / data.limit);
        //取值不能超过pages
        data.page = Math.min(data.page, data.pages);
        //取值不能小于1
        data.page = Math.max(data.page, 1);
        var skip = (data.page - 1) * data.limit;
        return Content.where(where).sort({
            addTime: -1
        }).limit(data.limit).skip(skip).populate(['category', 'user']);
    }).then(function (contents) {
        data.contents = contents;
        data.router = "/";
        res.render('main/index', data);
    })
})
/**
 * 详情页
 */
router.get("/view", function (req, res, next) {
    var contentId = req.query.contentid || '';
    Content.findOne({
        _id: contentId
    }).populate(['category', 'user']).then(function (content) {
        data.contents = content;
        content.views++;
        content.save();
        res.render("main/view", data);
    })
})
/**
 * 日志
 */
router.get("/log", function (req, res, next) {
    data.category = req.query.category || '';
    data.page = Number(req.query.page || 1)
    Content.where({
        category: "5ea00e7649bdac109884d7ab"
    }).countDocuments().then(function (count) {
        data.count = count;
        //计算总页数
        data.pages = Math.ceil(data.count / data.limit);
        //取值不能超过pages
        data.page = Math.min(data.page, data.pages);
        //取值不能小于1
        data.page = Math.max(data.page, 1);
        var skip = (data.page - 1) * data.limit;
        return Content.where({
            category: "5ea00e7649bdac109884d7ab"
        }).sort({
            addTime: -1
        }).limit(data.limit).skip(skip).populate(['category', 'user']);
    }).then(function (contents) {
        data.contents = contents;
        data.router = "/log";
        res.render('main/log', data);
    })
})
module.exports = router;