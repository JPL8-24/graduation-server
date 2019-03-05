let mongoose = require('mongoose')
const paperSchema = mongoose.Schema({
    paperID:String,
    Img:String,
    questions:Array,
    paperID:String,
    paperRate:String
})

module.exports=mongoose.model('Paper',paperSchema)