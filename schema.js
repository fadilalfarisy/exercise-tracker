const mongoose = require("mongoose");

const exerciseSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  count: {
    type: Number,
    require: true,
    default: 0,
  },
  log: [
    {
      description: {
        type: String,
        require: true,
      },
      duration: {
        type: Number,
        require: true,
      },
      date: {
        type: String,
        require: true,
      },
    },
  ],
});

module.exports = mongoose.model("Exercise", exerciseSchema);
