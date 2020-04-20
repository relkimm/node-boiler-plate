const express = require("express");
const app = express();
const port = 5000;

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const config = require("./config/key");

const { User } = require("./models/User");
const { auth } = require("./middleware/auth");

/*
  middleware => app 객체에 use()로 등록!
*/
//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
//application/json
app.use(bodyParser.json());
app.use(cookieParser());

app.listen(port, () => console.log("I'm waiting for 3000 port"));

/*
  mongoose => mongodb와 연결!

*/
mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("mongodb is connected..."))
  .catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Hello chillgu~ Welcome to the express World!");
});

app.get("/api/hello", (req, res) => {
  res.send("hello axios");
});

/*
    @회원가입 route
    post method => register ( end point )
*/
app.post("/api/users/register", (req, res) => {
  // body-parser를 통해 POST요청의 requestBody 데이터를 손쉽게 원하는 형식으로 가져올 수 있다.
  const user = new User(req.body);

  user.save((err, doc) => {
    if (err)
      return res.json({
        success: false,
        err,
      });

    return res.json({
      success: true,
    });
  });
});

/*
    @로그인 route
    post method => login ( end point )
*/
app.post("/api/users/login", (req, res) => {
  // 데이터베이스에서 요청으로 들어온 email의 User가 있는지 찾는다. findOne()
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err)
      return res.status(400).json({
        loginSuccess: false,
        err,
      });

    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "입력한 이메일에 해당하는 회원이 없습니다.",
      });
    }
  });

  user.comparePassword(req.body.password, (err, isMatch) => {
    if (err)
      return res.status(400).json({
        loginSuccess: false,
        err,
      });

    if (!isMatch)
      return res.status(400).json({
        loginSuccess: false,
        message: "비밀번호가 일치하지 않습니다.",
      });
  });

  // 일치한다면 token을 발행한다.
  user.generateToken((err, user) => {
    if (err)
      return res.status(400).json({
        loginSuccess: false,
        err,
      });

    return res.cookie("x_auth", user.token).status(200).json({
      loginSuccess: true,
      userId: user._id,
    });
  });

  app.get("/api/users/auth", auth, (req, res) => {
    let user = req.user;
    res.status(200).json({
      _id: user._id,
      email: user.eamil,
      isAdmin: (user.role = 0 ? false : true),
      name: user.name,
      lastname: user.lastname,
      role: user.role,
      image: user.image,
      isAuth: true,
    });
  });

  app.get("/api/users/logout", auth, (req, res) => {
    User.findOneAndUpdate(
      {
        _id: req.user._id,
      },
      {
        token: "",
      },
      (err, user) => {
        if (err)
          return res.json({
            logoutSuccess: false,
            err,
          });

        return res.status(200).send({
          logoutSuccess: true,
        });
      }
    );
  });
});
