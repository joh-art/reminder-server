const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, 
  }
);

const Lectures = mongoose.model("Lectures", lectureSchema);

module.exports = Lectures;
