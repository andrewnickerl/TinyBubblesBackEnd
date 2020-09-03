const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  fName: { type: String, required: true },
  lName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favoritesList: { type: Array, required: true },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
