var mongoose = require("mongoose");

//用户的表结构
var schema = new mongoose.Schema({
    //用户名
    username: String,
    //密码
    passwd: String,
    //是否是管理员
    isAdmin: {
        type: Boolean,
        default: false
    }
})
module.exports = schema;