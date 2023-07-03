const mongoose = require("mongoose")

mongoose.export = function () {

  const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String
  })

  const User = mongoose.model("User", userSchema)

  let user1 = new User({
    firstName: "mubeen",
    lastName: "jawed",
    email: "mubeenjawed3@gmail.com",
    password: "123"
  })

  let user2 = new User({
    firstName: "mubeen2",
    lastName: "jawed2",
    email: "mubeenjawed3@gmail.com",
    password: "123"
  })
  user2.save()
  user1.save()
}