const mongoose = require('mongoose')
const userSchema=mongoose.Schema({
    "userID":String,
    "userName":String,
    "userPwd":String,
    "type":Number,
    "testList":Array,
    "postList":Array,
    "checkList":Array,
    "portrait":String
})

module.exports=mongoose.model('User',userSchema)