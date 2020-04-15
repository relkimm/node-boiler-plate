const express = require("express");
const app = express();
const port = 3000;

const mongoose = require("mongoose");

const bodyParser = require("body-parser");
const { User } = require("./models/User");

//application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//application/json
app.use(bodyParser.json());

mongoose
  .connect(
    "mongodb+srv://chillgu:abcd1234@boiler-plate-12xps.mongodb.net/test?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    }
  )
  .then(() => console.log("mongoDB is connected..."))
  .catch((err) => console.log(err));

app.get("/", (req, res) =>
  res.send("Hello chillgu~ Welcome to node express world!")
);

app.post("/register", (req, res) => {
  const user = new User(req.body);

  // userModel에 저장됨.
  // doc -> user에 대한 정보가 담겨있다.
  user.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({ success: true });
  });
});

app.listen(port, () => console.log(`I'm waiting for port 3000~~`));
