const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/user");
const server = express();
const dbConnStr =
  "mongodb+srv://dbUser:Password123@cluster0.uxrjs.mongodb.net/tiny-bubbles?retryWrites=true&w=majority";
let PORT = process.env.PORT || 3000;

mongoose.connect(dbConnStr, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.once("open", () => {
  console.log("Database connected");
});
db.on("error", (err) => {
  console.error("Connection error: ", err);
});

function saveUser(user) {
  let u = new User(user);
  return u.save();
}

// GET ALL
server.get("/", (req, res) => {
  User.find().then((users) => {
    res.send(users);
  });
});

// GET USER WITH SPECIFIED USERNAME
server.get("/:user", (req, res) => {
  let username = req.params.user;
  User.find({ userName: username }).then((user) => {
    res.send(user);
  });
});

// CREATE NEW USER
server.post("/newUser", (req, res) => {
  let newUser = new User();
  newUser.fName = req.body.fName;
  newUser.lName = req.body.lName;
  newUser.userName = req.body.username;
  newUser.password = req.body.password;
  newUser.favoritesList = [];
  saveUser(newUser);

  res.send(`User creation successful: ${newUser}`);
});

// EDIT USER
server.put("/editProfile/:user", (req, res) => {
  User.findOneAndUpdate(
    { userName: req.params.user },
    {
      fName: req.body.fName,
      lName: req.body.lName,
      userName: req.body.username,
      password: req.body.password,
    }
  ).then((user) => {
    console.log(user);
    res.send("User edit succesful");
  });

  res.send();
});

// ADD TO FAVORITES
server.put("/addFavorite", (req, res) => {
  User.update(
    { userName: req.params.user },
    {
      $push: { favoritesList: req.body.name },
    }
  ).then((fav) => {
    res.send("Added successfully");
  });
});

// REMOVE FROM FAVORITES
server.put("/removeFavorite", (req, res) => {
  User.findOneAndUpdate(
    { userName: req.params.user },
    {
      $pull: { favoritesList: (rem) => rem.name === req.body.name },
    }
  ).then(() => {
    res.send("Removed from favorites");
  });

  res.send(`${req.body.brewery} has been removed from favorites`);
});

// DELETE USER
server.delete("/deleteUser/:user", (req, res) => {
  User.findOneAndDelete({ userName: req.params.user }).then(() => {
    res.send(`${user.userName} successfully deleted`);
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
