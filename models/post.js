const mongoose = require('mongoose')
const postSchema=mongoose.Schema({
    "title":String,
    "des":String,
    "date":String,
    "comments":Array,
    "user":Object,
    "postID":String
})

module.exports=mongoose.model('Posts',postSchema)