var mongoose = require("mongoose");
var chatsSchema = require('../schemas/chats');
module.exports = mongoose.model('Chat', chatsSchema);