var express = require("express");
var router = express.Router();
var User = require("../models/User");
var Category = require("../models/Category");
var Content = require("../models/Content");

router.use(function (req, res, next) {
    if (!req.userInfo.isAdmin) {
        //非管理员
        res.send("你不是管理员");
    }
    next();
})
/*
 *首页
 */
router.get("/", function (req, res, next) {
    if (req.userInfo.isAdmin) {
        res.render('admin/index', {
            userInfo: req.userInfo
        });
    }
})
/**
 * 用户管理
 */
router.get("/user", function (req, res, next) {

    /**
     * 从数据库中读取所有用户信息
     * limit(Number):限制获取数据的条数
     * skip():忽略数据的条数
     * 形成数据分页展示
     * 
     * 每页显示2条
     * 1：1-2 skip:0 -> (当前页 - 1) * limit
     * 2: 3-4 skip:2
     */
    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages = 0;
    User.countDocuments().then(function (count) {
        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min(page, pages);
        //取值不能小于1
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        User.find().limit(limit).skip(skip).then(function (users) {

            if (req.userInfo.isAdmin) {
                res.render('admin/user_index', {
                    userInfo: req.userInfo,
                    users: users,
                    page: page,
                    pages: pages
                });
            }
        });
    })
});
/**
 * 分类管理
 */
router.get("/category", function (req, res, next) {
    var page = Number(req.query.page || 1);
    var limit = 6;
    var pages = 0;
    Category.countDocuments().then(function (count) {
        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min(page, pages);
        //取值不能小于1
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        /**
         * 1:升序
         * -1：降序
         */
        Category.find().sort({
            _id: -1
        }).limit(limit).skip(skip).then(function (categories) {
            if (req.userInfo.isAdmin) {
                res.render('admin/category_index', {
                    userInfo: req.userInfo,
                    categories: categories,
                    page: page,
                    pages: pages
                });
            }
        });
    })
});
/*
 *分类的添加
 */
router.get("/category/add", function (req, res, next) {
    res.render('admin/category_add', {
        userInfo: req.userInfo
    });
});
/**
 * 分类的保存
 */
router.post('/category/add', function (req, res, next) {
    var name = req.body.name || " ";
    if (name == " ") {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "名称不能为空"
        });
        return;
    }
    //数据库中是否已经存在
    Category.findOne({
        name: name
    }).then(function (rs) {
        if (rs) {
            res.render("admin/error", {
                userInfo: req.userInfo,
                message: "名称已存在"
            });
            return;
        } else {
            //存入数据库
            return new Category({
                name: name
            }).save();
        }
    }).then(function (newCategory) {
        if (newCategory) {
            res.render('admin/success', {
                userInfo: req.userInfo,
                message: "分类保存成功",
                url: '/admin/category'
            })
        }
    })
})
/**
 * 分类修改
 */
router.get('/category/edit', function (req, res, next) {
    //获取要修改的分类信息
    var id = req.query.id || " ";
    Category.findOne({
        _id: id
    }).then(function (category) {
        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: "分类信息不存在"
            });
            return;
        } else {
            res.render('admin/category_edit', {
                userInfo: req.userInfo,
                category: category
            });
        };
    })
})
/**
 * 分类的修改保存
 */
router.post('/category/edit', function (req, res, next) {
    //获取要修改的分类信息
    var id = req.query.id || " ";
    var name = req.body.name || " ";
    Category.findOne({
        _id: id
    }).then(function (category) {
        if (!category) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: "分类信息不存在"
            });
            return;
        } else {
            //分类是否被修改
            if (name == category.name) {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: "保存成功",
                    url: "/admin/category"
                });
                return;
            } else {
                //要保存的分类名称是否已经存在
                return Category.findOne({
                    _id: {
                        $ne: id
                    },
                    name: name
                })
            };
        };
    }).then(function (sameCategory) {
        if (sameCategory) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: "分类信息已存在"
            });
            return;
        } else {
            return Category.updateOne({
                _id: id
            }, {
                name: name
            })
        };
    }).then(function (sameCategory) {
        if (sameCategory) {
            if (sameCategory.nModified) {
                res.render('admin/success', {
                    userInfo: req.userInfo,
                    message: "保存成功",
                    url: "/admin/category"
                });
            }
        }
    })
})
/**
 * 分类删除
 */
router.get('/category/delete', function (req, res, next) {
    //获取要删除的分类信息
    var id = req.query.id || " ";
    Category.deleteOne({
        _id: id
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: "删除成功",
            url: '/admin/category'
        });
    })
})


/**
 * 内容首页
 */
router.get('/content', function (req, res, next) {
    var page = Number(req.query.page || 1);
    var limit = 6;
    var pages = 0;
    Content.countDocuments().then(function (count) {
        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min(page, pages);
        //取值不能小于1
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        /**
         * 1:升序
         * -1：降序
         */
        Content.find().sort({
            addTime: -1
        }).limit(limit).skip(skip).populate(['category', 'user']).then(function (contents) {
            if (req.userInfo.isAdmin) {
                res.render('admin/content_index', {
                    userInfo: req.userInfo,
                    contents: contents,
                    page: page,
                    pages: pages
                });
            }
        });
    })
})


/**
 * 内容添加页面
 */
router.get('/content/add', function (req, res, next) {
    Category.find().sort({
        _id: -1
    }).then(function (categories) {
        res.render("admin/content_add", {
            userInfo: req.userInfo,
            categories: categories
        })
    })

})

/*
 *内容保存
 */
router.post('/content/add', function (req, res, next) {
    // console.log(req.body);
    if (req.body.category == '') {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "内容分类不能为空"
        })
        return;
    }
    if (req.body.title == '') {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "内容标题不能为空"
        })
        return;
    }
    if (req.body.description == '') {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "内容简介不能为空"
        })
        return;
    }
    if (req.body.content == '') {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "内容不能为空"
        })
        return;
    }
    //保存数据
    new Content({
        category: req.body.category,
        title: req.body.title,
        user: req.userInfo._id.toString(),
        description: req.body.description,
        content: req.body.content
    }).save().then(function (rs) {
        if (rs) {
            res.render('admin/success', {
                userInfo: req.userInfo,
                message: "内容保存成功",
                url: '/admin/content'
            })
        }
    })
})

/**
 * 内容修改
 */
router.get('/content/edit', function (req, res, next) {
    //获取要修改的内容信息
    var id = req.query.id || " ";
    var categories = [];
    Category.find().sort({
        _id: -1
    }).then(function (rs) {
        categories = rs;
        return Content.findOne({
            _id: id
        }).populate('category');
    }).then(function (content) {
        if (!content) {
            res.render('admin/error', {
                userInfo: req.userInfo,
                message: "内容信息不存在"
            });
            return;
        } else {
            res.render('admin/content_edit', {
                userInfo: req.userInfo,
                categories: categories,
                content: content
            });
        };
    });
});

/**
 * 内容的修改保存
 */
router.post('/content/edit', function (req, res, next) {
    //获取要修改的分类信息
    var id = req.query.id || " ";
    if (req.body.category == '') {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "内容分类不能为空"
        })
        return;
    }
    if (req.body.title == '') {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "内容标题不能为空"
        })
        return;
    }
    if (req.body.description == '') {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "内容简介不能为空"
        })
        return;
    }
    if (req.body.content == '') {
        res.render("admin/error", {
            userInfo: req.userInfo,
            message: "内容不能为空"
        })
        return;
    }
    Content.updateOne({
        _id: id
    }, {
        category: req.body.category,
        title: req.body.title,
        addTime: new Date,
        description: req.body.description,
        content: req.body.content
    }).then(function (rs) {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: "保存成功",
            url: "/admin/content"
        });
    })
})
/**
 * 内容删除
 */
router.get('/content/delete', function (req, res, next) {
    //获取要删除的内容信息
    var id = req.query.id || " ";
    Content.deleteOne({
        _id: id
    }).then(function () {
        res.render('admin/success', {
            userInfo: req.userInfo,
            message: "删除成功",
            url: '/admin/content'
        });
    })
})
/**
 * 留言首页
 */
router.get('/comment', function (req, res, next) {
    var page = Number(req.query.page || 1);
    var limit = 2;
    var pages = 0;
    Content.countDocuments().then(function (count) {
        //计算总页数
        pages = Math.ceil(count / limit);
        //取值不能超过pages
        page = Math.min(page, pages);
        //取值不能小于1
        page = Math.max(page, 1);
        var skip = (page - 1) * limit;
        /**
         * 1:升序
         * -1：降序
         */
        Content.find().sort({
            addTime: -1
        }).limit(limit).skip(skip).populate(['category', 'user']).then(function (contents) {
            if (req.userInfo.isAdmin) {
                res.render('admin/comment_index', {
                    userInfo: req.userInfo,
                    contents: contents,
                    page: page,
                    pages: pages
                });
            }
        });
    })
})
/**
 * 留言删除
 */
// router.get('/comment/delete', function (req, res, next) {
//     //获取要删除的内容信息
//     var id1 = req.query.id1 || " ";
//     var id2 = req.query.id2 || " ";
//     Content.where({
//         comment:
//     }).then(function (comment) {
//         console.log(comment);
//     });
//     // comment.remove({
//     //     id: id
//     // }).then(function () {
//     //     res.render('admin/success', {
//     //         userInfo: req.userInfo,
//     //         message: "删除成功",
//     //         url: '/admin/content'
//     //     });
//     // })
// })
module.exports = router;