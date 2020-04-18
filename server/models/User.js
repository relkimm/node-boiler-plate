const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 10;

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },

  email: {
    type: String,
    trim: true,
    unique: true,
    required: true,
    lowercase: true,
  },

  password: {
    type: String,
    minlength: 5,
  },

  lastname: {
    type: String,
    maxlegnth: 50,
  },

  role: {
    type: Number,
    default: 0,
  },

  token: {
    type: String,
  },

  tokenExp: {
    type: Number,
  },

  image: String,
});

/*
  pre() -> 반드시 next()로 해당 스코프에서 벗어나도록 하자.
*/
userSchema.pre("save", (next) => {
  let user = this;

  if (user.isModified("password")) {
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) return next(err);

      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) return next(err);

        user.password = hash;
        next();
      });
    });
  } else next();
});

// plainPassword 1234 , 암호화된 비밀번호 hash는 복호화할수없다. plainPassword를 암호화해서 비교하자.
userSchema.methods.comparePassword = function (plainPassword, cb) {
  bcrypt.comapare(plainPassword, this.password, (err, isMatch) => {
    // return을 해야만 아래의 콜백함수가 실행되지 않는다.
    if (err) return cb(err);

    cb(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  let user = this;

  let token = jwt.sign(user._id.toHexString(), "secretKey");
  user.token = token;

  user.save((err, user) => {
    if (err) return cb(err);

    cb(null, user);
  });
};

userSchema.statics.findByToken = function (token, cb) {
  let user = this;

  // 토큰을 decode한다.
  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err) return cb(err);

    user.findOne({ _id: decoded, token: token }, (err, user) => {
      if (err) return cb(err);
      cb(null, user);
    });
  });
};

const User = mongoose.model("User", userSchema);

module.exports = { User };
