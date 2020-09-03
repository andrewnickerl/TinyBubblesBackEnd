const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/user");
const session = require("express-session");
const connectEnsureLogin = require("connect-ensure-login");
const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");

const server = express();
const dbConnStr =
  "mongodb+srv://dbUser:Password123@cluster0.uxrjs.mongodb.net/tiny-bubbles?retryWrites=true&w=majority";
let PORT = process.env.PORT || 3000;

// SERVER MIDDLE WARE USES
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(flash());
server.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);
server.use(passport.initialize());
server.use(passport.session());

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
// CONFIGURE PASSPORT LOGIN STRATEGY
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// AUTHENTICATION VIA PASSPORT
server.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      console.log(err);
      return next(err);
    }

    if (!user) {
      console.log(info);
      return res.redirect("/register");
    }

    req.logIn(user, function (err) {
      if (err) {
        console.log(err);
        return next(err);
      }
      console.log(user);
      return res.send({ id: req.user.id });
    });
  })(req, res, next);
});

// GET ALL
server.get("/", (req, res) => {
  User.find().then((users) => {
    res.send(users);
  });
});

// GET A SPECIFIC USER
server.get("/user", (req, res) => {
  res.send(User.findOne({ _id: req.body.id }));
});

// CREATE NEW USER
server.post("/newUser", (req, res) => {
  User.register(
    {
      username: req.body.username,
      password: req.body.password,
      fName: req.body.fName,
      lName: req.body.lName,
      favoritesList: [],
    },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
      }
      console.log(user);
      var authenticate = User.authenticate();
      authenticate(req.body.username, req.body.password, (err, result) => {
        if (err) {
          console.log(err);
        }
        console.log(result);
      });
    }
  );
  res.send("User created successfully");
});

// EDIT USER
server.put("/editProfile/", (req, res) => {
  User.findOneAndUpdate(
    { username: req.user.username },
    {
      fName: req.body.fName,
      lName: req.body.lName,
      username: req.body.username,
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
    { username: req.user.username },
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
    { username: req.user.username },
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
  User.findOneAndDelete({ username: req.params.user }).then(() => {
    res.send(`${user.username} successfully deleted`);
  });
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
