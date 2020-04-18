const { User } = require("../models/User");

let auth = (req, res, next) => {
  let token = req.cookies.x_auth;

  User.findByToken(token, (err, user) => {
    if (err)
      return res.json({
        isAuth: false,
        err,
      });

    if (!user)
      return res.json({
        isAtuh: false,
        error: true,
      });

    req.token = token;
    req.user = user;

    next();
  });
};

module.exports = { auth };
