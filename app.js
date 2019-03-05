var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose=require('mongoose')
let jwt=require('jsonwebtoken')
let jwtTokenSecret='grajwt'

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
mongoose.connect('mongodb://127.0.0.1:27017/JPL',{ useNewUrlParser: true })
mongoose.connection.on('connected',()=>{
  console.log('connect success 连接成功')
})
mongoose.connection.on('error',()=>{
  console.log('connect error')
})
mongoose.connection.on('disconnected',()=>{
  console.log('disconnect')
})

app.all('*',(req,res,next)=>{
  res.header("Access-Control-Allow-Origin", "http://localhost:8080");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Credentials','true');
  next();
})
// app.use((req,res,next)=>{
//   console.log(req.headers)
//   let token=req.headers.Authorization
//   if(req.originalUrl=='/users/login' || req.originalUrl=='/users/authorization'){
//     next()
//   } else {
//     if(token){
//       jwt.verify(token,jwtTokenSecret,(err,decode)=>{
//         if(err){
//           res.json({
//             status:'2',
//             msg:'token信息错误',
//             data:''
//           })
//         } else {
//           console.log(decode)
//           next()
//         }
//       })
//     } else {
//       res.status(403).send({
//         status:'3',
//         msg:'未携带token',
//         data:''
//       })
//     }
//   }
// })
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
