const express = require("express");
const app = express();
const port = 3000;

const mongoose = require("mongoose");

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
  .then(() => console.log("mongoDB is connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) =>
  res.send("Hello chillgu~ Welcome to node express world!")
);
app.listen(port, () => console.log(`I'm waiting for port 3000~~`));
