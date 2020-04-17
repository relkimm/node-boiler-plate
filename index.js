const express = require("express");
const app = express();
const port = 3000;

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const config = require("./config/key");

const { User } = require("./models/User");
const { auth } = require("./middleware/auth");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//application/json
app.use(bodyParser.json());
app.use(cookieParser());

mongoose
  .connect(config.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("mongoDB is connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) =>
  res.send("Hello chillgu~ Welcome to node express world!")
);

app.post("/api/users/register", (req, res) => {
  const user = new User(req.body);

  // userModel에 저장됨.
  // doc -> user에 대한 정보가 담겨있다.
  user.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

app.post("/api/users/login", (req, res) => {
  // 데이터베이스에서 요청으로 들어온 email의 User가 있는지 찾는다. findOne()
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당되는 회원이 없습니다.",
      });
    }
  });

  // 찾은 User의 password가 요청으로 들어온 password와 일치하는지 확인한다.
  user.comparePassword(req.body.password, (err, isMatch) => {
    if (err) {
      return res.json({
        loginSuccess: false,
        error,
      });
    }

    if (!isMatch)
      return res.json({
        loginSuccess: false,
        message: "비밀번호가 틀렸습니다.",
      });
  });

  // 일치한다면 token을 발행한다.

  user.generateToken((err, user) => {
    if (err) return res.status(400).send(err);

    // 토큰을 저장한다. 어디에? 쿠키, 로컬 스토리지..
    res.cookie("x_auth", user.token).status(200).json({
      loginSuccess: true,
      userId: user._id,
    });
  });
});

app.get("/api/users/auth", auth, (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    email: req.user.email,
    isAdmin: req.user.role === 0 ? false : true,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

app.listen(port, () => console.log(`I'm waiting for port 3000~~`));
