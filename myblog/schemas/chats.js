var mongoose = require("mongoose");

//用户的表结构
var schema = new mongoose.Schema({
    chat: {
        type: Array,
        default: []
    }
})
module.exports = schema;