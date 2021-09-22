var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.all("*", function(req, res, next) {
    if (!req.get("Origin")) return next();
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "*");
    res.set("Access-Control-Allow-Headers", "*");
    next();
})
// var allowCors = function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", '*'); // 设置允许来自哪里的跨域请求访问（req.headers.origin为当前访问来源的域名与端口）
//   res.header("Access-Control-Allow-Methods", "*"); // 设置允许接收的请求类型
//   res.header("Access-Control-Allow-Headers", "Content-Type,request-origin"); // 设置请求头中允许携带的参数
//   // res.header("Access-Control-Allow-Credentials", "true"); // 允许客户端携带证书式访问。保持跨域请求中的Cookie。注意：此处设true时，Access-Control-Allow-Origin的值不能为 '*'
//   res.header("Access-control-max-age", 1000); // 设置请求通过预检后多少时间内不再检验，减少预请求发送次数
//   next();
// };
// app.use(allowCors); // 使用跨域中间件
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const expressJwt = require('express-jwt')
app.use(expressJwt({
  secret: 'secret12345', // 签名的密钥 或 PublicKey
  algorithms: ['HS256']
//   getToken: function fromHeaderOrQuerystring (req) {
//     console.log(req)
//     if (req.headers.authorization) {
//         return req.headers.authorization;
//     } else if (req.query && req.query.token) {
//         return req.query.token;
//     }

//     return null;
// }
}).unless({
  path: ['/login', '/register', '/admin', '/getimg', '/show', '/selet', '/logins', '/1619425682819_衣服']  // 指定路径不经过 Token 解析
}))

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  if (err.name === 'UnauthorizedError') {
    　　　　// 这个需要根据⾃自⼰己的业务逻辑来处理理
  　　　　  res.status(401).send({code:-1,msg:'token验证失败'});
  　　}
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
