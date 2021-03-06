const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  task: [
    {
      type: Schema.Types.ObjectId,
      ref: "Task",
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
