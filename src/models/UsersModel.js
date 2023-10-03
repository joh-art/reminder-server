const mongoose = require("mongoose");


const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true, 
    },

    email: {
      type: String,
      unique: true,
      required: true, 
    },

    password: {
      type: String,
      required: true, 
    },
  },
  {
    collation: { locale: 'en_US', strength: 1 }
  }
);



const Users = mongoose.model("Users", userSchema);
module.exports = Users;
