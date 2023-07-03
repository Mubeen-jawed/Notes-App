const express = require("express")
// const database = require('./config/database')()
const mongoose = require("mongoose")
const cookieParser = require('cookie-parser')
const fs = require("fs")
const dotenv = require("dotenv")
const jwt = require("jsonwebtoken")
const auth = require("./middleware/auth")

const bcrypt = require("bcrypt")
const { title } = require("process")
const saltRounds = 10;


const app = express()

dotenv.config()

app.use(cookieParser())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(__dirname + '/public'))

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

const notesSchema = new mongoose.Schema({
  title: String,
  text: String,
})

const Note = mongoose.model("Note", notesSchema)

const notesListSchema = new mongoose.Schema({
  name: String,
  notes: [notesSchema]
})

const NotesList = mongoose.model("NotesList", notesListSchema)


app.set('view engine', 'ejs');




app.get('/signup', function (req, res) {
  res.render("signup")
})

app.post("/signup", function (req, res) {
  let userFirstName = req.body.firstName
  let userLastName = req.body.lastName
  let userEmail = req.body.email
  let userPassword = req.body.password

  if (userFirstName.length && userLastName.length && userEmail.length && userPassword != 0) {

    let token = jwt.sign({
      exp: Math.floor(Date.now() / 1000) + (60 * 60),
      data: userEmail
    }, 'secret');

    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 300000),
      httpOnly: true
    })

    User.findOne({ email: userEmail, password: userPassword })
      .then((foundList) => {
        if (foundList) {

          res.cookie("userId", foundList._id, {
            expires: new Date(Date.now() + 100000 * 100000),
            httpOnly: true
          })

          jwt.verify(token, 'secret', function (err, decoded) {
            if (decoded) {
              res.redirect(`/${foundList._id}`)
            } else {
              console.log(err);
            }
          });
        }

        else {
          bcrypt.hash(userPassword, saltRounds, function (err, hash) {
            const users = new User({
              firstName: userFirstName,
              lastName: userLastName,
              email: userEmail,
              password: hash
            })
            users.save()
            console.log(users._id, "id");
            res.redirect(`/${users._id}`)

            res.cookie("userId", users._id, {
              expires: new Date(Date.now() + 100000 * 100000),
              httpOnly: true
            })

          });
          // jwt.verify(token, 'secret', function (err, decoded) {
          //   if (decoded) {
          // } else {
          //   console.log(err);
          // }
          // });

        }
      })
  }
})



app.get("/login", function (req, res) {
  res.render("login")
})

app.post("/login", function (req, res) {
  let userEmail = req.body.email;
  let userPassword = req.body.password;

  if (userEmail.length && userPassword.length != 0) {
    User.findOne({ email: userEmail })
      .then((foundList) => {
        if (foundList) {

          let token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + (60 * 60),
            data: userEmail
          }, 'secret');

          res.cookie("jwt", token, {
            expires: new Date(Date.now() + 100000 * 100000),
            httpOnly: true
          })

          res.cookie("userId", foundList._id, {
            expires: new Date(Date.now() + 100000 * 100000),
            httpOnly: true
          })

          bcrypt.compare(userPassword, foundList.password, function (err, result) {
            result = true
            jwt.verify(token, 'secret', function (err, decoded) {
              if (decoded) {
                res.redirect(`/${foundList._id}`)
              } else {
                console.log(err);
              }
            });
          })
        }

        else {
          console.log("Account Not Found"); // account not exist
        }

      })
  }
})

app.get("/", function (req, res) {
  // res.redirect("/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODc3NzI0MTgsImRhdGEiOiJtdWJlZW5qYXdlZDNAZ21hbC5jb20iLCJpYXQiOjE2ODc3Njg4MTh9.xPKpBPJ0D3pF_vlKSfuOkRFT8XgdQW_ZSLwkmw6nHyM")
  res.render("main")
  // Note.find().exec()
  //   .then((result) => {

  //     res.render("main", { notes: result })

  //     res.redirect('/');

  //   })
  //   .catch((err) => {
  //     console.error(err);
  //   });
})

app.get("/:userId", auth, function (req, res) {
  let userId = req.params.userId
  let token = req.cookies.jwt
  let authorizedUserId = req.cookies.userId

  var cert = fs.readFileSync('public.key');

  // jwt.verify(token, 'secret', function (err, decoded) {
  //   if (decoded) {

  if (userId == authorizedUserId) {
    NotesList.findOne({ name: userId })
      .then((foundlist) => {
        if (foundlist) {
          res.render("main", { notes: foundlist.notes, paramValue: userId })
          // console.log(foundlist.notes);
        } else {
          const notesList = new NotesList({
            name: userId,
          })
          notesList.save()
          res.redirect(`/${userId}`)
        }

        //     })
        // } else {
        //   res.redirect("/login")
        //   console.log("Token expired");
        // }
      });
  } else {
    res.redirect("login")
  }
})

//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODc4NTY2ODQsImRhdGEiOiJtdWJlZW5qYXdlZDNAZ21hbC5jb20iLCJpYXQiOjE2ODc4NTMwODR9.r5dBJJ6z4YbjbVfwRlED5uf2h3MkgVnrNJCYpob_VJ4
//eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2ODc4NTY3MTAsImRhdGEiOiJtdWJlZW5qYXdlZDNAZ21hbC5jb20iLCJpYXQiOjE2ODc4NTMxMTB9.mr7qXKWwHMip2_JvwNZ3SQAhOQix00stDYwXakSfs6E

app.post("/", function (req, res) {
  let noteTitle = req.body.title;
  let noteText = req.body.text;
  let userId = req.body.noteValue

  // var cert = fs.readFileSync('public.pem');
  // console.log(cert);

  const note = new Note({
    title: noteTitle,
    text: noteText,
  })

  note.save()

  NotesList.findOne({ name: userId })
    .then((foundList) => {
      if (noteTitle || noteText != 0) {
        foundList.notes.push(note)
        foundList.save().then(() => console.log("notes added"))

        res.redirect(`/${userId}`)
      }
      else {
        res.redirect(`/${userId}`)
      }
    })
})

app.post("/delete", function (req, res) {
  let deleteNoteId = req.body.deleteBtn
  let userId = req.cookies.userId
  // console.log(deleteNoteId);

  // console.log(req.cookies.userId);

  NotesList.findOne({ name: userId })
    .then((foundList) => {
      if (foundList) {
        foundList.notes.pull({ _id: deleteNoteId })
        return foundList.save();
      }
    })

    .then(function () {
      console.log('Item has deleted from custom list');
      res.redirect(`/${userId}`)
    })

    .catch(function (err) {
      console.log(err);
    })
})

app.post("/update", function (req, res) {
  let updateTitle = req.body.updateTitle;
  let updateContent = req.body.updateContent;
  let titleValue = req.body.titleValue;

  let userId = req.cookies.userId

  // NotesList.findOneAndUpdate({ name: userId }, { title: updateTitle, text: updateContent }, { new: true })
  //   .then((result) => {
  //     res.redirect(`/${userId}`)
  //     console.log(result);
  //   })
  //   .catch(e => console.log("Error :", e))

  Note.findOneAndUpdate({ title: titleValue }, { title: updateTitle, text: updateContent }, { new: true })
    .then((result) => {
      updateNotes = result
      res.redirect(`/${userId}`)
      console.log(result);

      res.cookie("updateNote", result, {
        expires: new Date(Date.now() + 100000 * 100000),
        httpOnly: true
      })
    })
    .catch(e => console.log("Error :", e))

  // console.log(req.cookies.updateNote, "cookie");

  // NotesList.findOneAndUpdate({ name: userId }, { notes: req.cookies.updateNote })
  //   .then(() => res.redirect(`/${userId}`))




  // const note = new Note({
  //   title: updateTitle,
  //   text: updateContent,
  // })

  // NotesList.findOne({ name: userId })
  //   .then((foundList) => {
  //     // const notesList = new NotesList({
  //     //   notes: [note]
  //     // })
  //     // notesList.save()
  //     console.log(foundList.notes[0]);
  //     foundList.notes[0].title = "note"
  //     note.save()

  //     res.redirect(`/${userId}`)
  //   })



  // .then((foundlist) => {
  //   foundlist.notes[0].title = updateTitle
  //   foundlist.notes[0].text = updateContent
  // })

  // var query = { title: titleValue };

  // NotesList.findOneAndUpdate({ name: userId }, { title: updateTitle, text: updateContent }, { upsert: true })
  //   .then((err, doc) => {
  //     if (err) return res.status(500).send({ error: err });
  //     return res.redirect(`/${userId}`);
  //   })

  // Note.findOneAndUpdate({ title: titleValue }, { title: updateTitle, text: updateContent }, { new: true })
  //   .then(() => {
  //     res.redirect(`/${userId}`)
  //   })

  // .then((foundList) => {
  //   foundList.title = updateTitle
  //   foundList.text = updateContent

  //   foundList.save()
  // })
})



app.listen('3000', function () {
  console.log("The server has started on port 3000");
})