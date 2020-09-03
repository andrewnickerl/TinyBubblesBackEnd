const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require("./models/user");
const session = require("express-session");
const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;
const server = express();
const dbConnStr =
  "mongodb+srv://dbUser:Password123@cluster0.uxrjs.mongodb.net/tiny-bubbles?retryWrites=true&w=majority";
let PORT = process.env.PORT || 3000;

// SERVER MIDDLE WARE USES
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
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
passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ userName: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Username does not exist" });
      }
      if (!user.validPassword(password)) {
        return done(null, false, {
          message: "Incorrect username/password combination",
        });
      }

      return done(null, user);
    });
  })
);

// AUTHENTICATION VIA PASSPORT
server.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/loggedIn",
    failureFlash: true,
  })
);

// SERIALIZE/DESERIALIZE PASSPORT SESSION
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// GET ALL
server.get("/", (req, res) => {
  User.find().then((users) => {
    res.send(users);
  });
});

// GET A SPECIFIC USER
server.get("/user", (req, res) => {
  res.send(findOne({ userName: req.user.userName }));
});

// CREATE NEW USER
server.post("/newUser", (req, res) => {
  let newUser = new User();
  newUser.fName = req.body.fName;
  newUser.lName = req.body.lName;
  newUser.userName = req.body.username;
  newUser.password = req.body.password;
  newUser.favoritesList = [];
  newUser.save((err, result) => {
    if (err) {
      console.log(err);
    } else {
      console.log(result);
    }
  });

  res.send(`User creation successful: ${newUser}`);
});

// EDIT USER
server.put("/editProfile/", (req, res) => {
  User.findOneAndUpdate(
    { userName: req.user.userName },
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
    { userName: req.user.userName },
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
    { userName: req.user.userName },
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
