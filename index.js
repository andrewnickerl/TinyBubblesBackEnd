const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/user");
const server = express();
const dbConnStr =
  "mongodb+srv://dbUser:Password123@cluster0.uxrjs.mongodb.net/<dbname>?retryWrites=true&w=majority";
let PORT = process.env.PORT || 3000;

mongoose.connect(dbConnStr, { useNewUrlParser: true });

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
  res.send(User.find());
});

// GET USER WITH SPECIFIED USERNAME
server.get("/:user", (req, res) => {
  let username = req.params.user;
  res.send(User.find(username));
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
  let user = User.findOneAndUpdate(
    { userName: req.params.user },
    {
      fName: req.body.fName,
      lName: req.body.lName,
      userName: req.body.username,
      password: req.body.password,
    }
  );

  res.send(`User edit successful`);
});

// ADD TO FAVORITES
server.put("/addFavorite", (req, res) => {
  let user = User.findOneAndUpdate(
    { userName: req.params.user },
    { favoritesList: favoritesList.push(req.body.brewery) }
  );

  res.send(`${req.body.brewery} successfully added to favorites list`);
});

// REMOVE FROM FAVORITES
server.put("/removeFavorite", (req, res) => {
  let user = User.findOneAndUpdate(
    { userName: req.params.user },
    {
      favoritesList: favoritesList.filter(
        (favs) => favs.name !== req.body.brewery
      ),
    }
  );

  res.send(`${req.body.brewery} has been removed from favorites`);
});

// DELETE USER
server.delete("/deleteUser", (req, res) => {
  let user = User.findOneAndDelete({ userName: req.params.user });
  res.send(`User deleted: ${req.params.user}`);
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
