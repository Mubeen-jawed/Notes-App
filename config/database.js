const mongoose = require("mongoose")
// const user = require("../model/user")

module.exports = function () {
  mongoose.connect('mongodb://127.0.0.1:27017/myUserDB',
    {
      useNewUrlParser: true
    }
  );

  const db = mongoose.connection
  db.on("error", console.error.bind(console, "connection error: "));
  db.once("open", function () {
    console.log("Connected successfully");
  });

  const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String
  })

  const User = mongoose.model("User", userSchema)


}
