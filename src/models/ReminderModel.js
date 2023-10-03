const mongoose = require("mongoose");

const ReminderSchema = mongoose.Schema(
  {
   
    lecturetitle: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Reminderforms = mongoose.model("Reminderforms", ReminderSchema);
module.exports = Reminderforms;
