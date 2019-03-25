const mongoose = require('mongoose')
const paperSchema = mongoose.Schema({
    "paperID":String,
    "Img":String,
    "questions":Array,
    "paperRate":Number,
    "teacherID":String,
    "ExamDate":Date,
    "TotalTime":String,
    "StudentList":Array,
    "title":String,
    "skill":String
})
//type:1单选 2多选 3主观
module.exports=mongoose.model('Papers',paperSchema)