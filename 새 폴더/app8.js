//Express 기본 모듈 불러오기
var express = require('express')
,http = require('http')
,path = require('path');

//Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
,static = require('serve-static');

//익스프레스 객체 생성
var app = express();

//기본 속성 성질
app.set('port',process.env.PORT||8000);

//body-parser를 이용해 application/x-www-form-urlencoded파싱
app.use(bodyParser.urlencoded({extends:false}))

//body-parser를 이용해 applicaton/json파싱
app.use(bodyParser.json())

//app.use('./public',static(path.join(__dirname,'public')));
app.use('/',static(path.join(__dirname,'/')));

//라우터 객체 참조
var router = express.Router();

//라우팅 함수 등록
router.route('/process/login').post(function(req,res){
    console.log('/process/login 처리함');
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
    res.write('<h1>Express 서버에서 응답한 결과입니다.</h1>');
    res.write('<div><p>Param id:'+paramId+'</p></div>');
    res.write('<div><p>Param password:'+paramPassword+'</p></div>');
    res.write("<br><br><a href = /public/login2.html>로그인 페이지로 돌아가기</a>");
    res.end();
});

//라우터 객체를 app 객체에 등록
app.use('/',router);



// Express 서버 시작
http.createServer(app).listen(app.get('port'), function() {
    console.log('익스프레스 서버를 시작했습니다. : ' + app.get('port'));
  });
