var express = require('express');
const { session } = require('passport');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads')
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });
var router = express.Router();
const { User } = require('../models/User')
const { Timer } = require('../models/Timer');
const Todo = require("../models/todo");
const Subject = require('../models/Subjects');



router.get('/', function (req, res) {
  if (req.isAuthenticated()) {
    console.log("세션이 유효합니다.");
    User.findOne({ id: req.user.id }, function (err, user) {
      if (err) {
        console.log(err);
        res.redirect('/');
      } else {
        res.render('index', { user: user });
      }
    });
  } else {
    console.log("세션이 유효하지 않습니다.");
    User.find({}, function(err, users) {
      if(err) {
        console.log(err);
        res.redirect('/');
      } else {
        var sum = 0;
        for(var i = 0; i < users.length; i++) {
          for(var j = 0; j < users[i].subjects.length; j++) {
            sum += users[i].subjects[j].time;
          }
        }
        res.render('index', { user: null, whole: sum});
      }
    });
  }
});

router.get('/study/:id', function (req, res) {
  if (req.isAuthenticated()) {
    User.findOne({ id: req.user.id, }, function (err, user) {
      if (err) {
        console.log(err);
        res.redirect('/');
      } else {
        //res.render('selectSubjectPage', { user: user });

        let list =  User.find();
        res.render('studyPage', { user: user, data : list, subject_id: req.query.id});
        console.log(req.query.id);



      }
    });
  } else {
    res.render('main', { user: req.user });
  }
});


router.post('/study/timer', function (req, res) {
  let data = {
    timer: {
      hour: req.body.user.timer[0].hour,
      min: req.body.user.timer[0].min,
      sec: req.body.user.timer[0].sec
    }
  }

  User.findOneAndUpdate({ id: req.user.id }, data, function (err, user) {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  })
})

router.get('/home', function (req, res) {
  if (req.isAuthenticated()) {
    User.findOne({ id: req.user.id }, function (err, user) {
      if (err) {
        console.log(err);
        res.redirect('/');
      } else {
        res.render('homePage', { user: user });
      }
    });
  } else {
    res.render('main', { user: req.user });
  }
});

router.get('/my', function (req, res) {
  if (req.isAuthenticated()) {
    // console.log(req.params.id);
    User.findOne({ id: req.user.id }, function (err, user) {
      if (err) {
        console.log(err);
        res.redirect('/');
      } else {
        //console.log(user);
        res.render('mypage', { user: user });
      }
    });
  } else {
    res.render('main', { user: req.user });
  }
});

router.post('/my', upload.single('image'), function (req, res) {
  let data;
  if (req.file) {
    data = {
      nickname: req.body.nickname.trim() != '' ? req.body.nickname : req.user.displayName,
      intro: req.body.intro,
      profile_src: "../uploads/" + req.file.filename
    };
  } else {
    data = {
      nickname: req.body.nickname.trim() != '' ? req.body.nickname : req.user.displayName,
      intro: req.body.intro
    };
  }

  User.findOneAndUpdate({ id: req.user.id }, data, function (err) {
    res.redirect('/my');
  });
});

router.post('/deleteSubject/:id/:box', function (req, res) {
  User.updateOne({ id: req.params.id }, { "$pull": { "subjects": { "_id": req.params.box.substring(4) } } }, { safe: true, multi: true }, function (err, obj) { });
});


router.get('/checklist/:id', function (req, res) {
  if (req.isAuthenticated()) {
    User.findOne({ id: req.user.id }, function (err, user) {
      if (err) {
        console.log(err);
        res.redirect('/');
      } else {
        res.render('checklistPage', { user: user });
      }
    });
  } else {
    res.render('main', { user: req.user });
  }
});

router.post("/checklist/:id", function (req, res) {
  const todo = new Todo();
  todo.content = req.body.n;
  todo.date = req.body.d;

  console.log(todo);

  User.findOneAndUpdate({ id: req.user.id }, { $push: { todos: todo } }, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/");
    }
    console.log("성공");
    res.redirect('/checklist/' + req.params.id);
  });
});


router.get('/selectSubject/:id', function (req, res) {
  if (req.isAuthenticated()) {
    User.findOne({ id: req.user.id }, function (err, user) {
      if (err) {
        console.log(err);
        res.redirect('/');
      } else {
        res.render('selectSubjectPage', { user: user });
      }
    });
  } else {
    res.render('main', { user: req.user });
  }
});

router.post("/selectSubject/:id", function (req, res) {
  const todo = new Todo();
  todo.content = req.body.n;
  todo.date = req.body.d;

  console.log(todo);

  User.findOneAndUpdate({ id: req.user.id }, { $push: { todos: todo } }, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/");
    }
    console.log("성공");
    console.log(user);
    res.redirect('/selectSubjectPage/' + req.params.id);
  });
});

router.get('/addSubject/:id', function (req, res) {
  if (req.isAuthenticated()) {
    User.findOne({ id: req.user.id }, function (err, user) {
      if (err) {
        console.log(err);
        res.redirect('/');
      } else {
        console.log(user);
        res.render('addSubjectPage', { user: user });
      }
    });
  } else {
    res.render('main', { user: req.user });
  }
});

router.post("/addSubject/:id", function (req, res) {

  const subject = new Subject();
  subject.name = req.body.n;
  subject.time = 0;

  User.findOneAndUpdate({ id: req.user.id }, { $push: { subjects: subject } }, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/");
    }
    console.log("성공");
    if (req.body.mypage) {
      res.redirect('/my');
    } else {
      res.redirect('/addSubject/' + req.params.id);
    }
  });

});


router.get('/googlelogin', function (req, res) {
  res.render('main', { user: req.user });
});


// router.get('/logout', function(req, res) {
//   req.logout();
//   req.session.save(function(){
//     console.log('계정이 로그아웃 되었습니다');
//     res.redirect('/');
//   })
// });

router.get('/login', function (req, res) {
  res.render('login')
});

module.exports = router;