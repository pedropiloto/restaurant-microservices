const mongoose = require("mongoose");
const uuidv4 = require("uuid/v4");

//Define a schema
const Schema = mongoose.Schema;

const stockSchema = new Schema({
  ingredient_code: {
    type: String,
    trim: true,
    required: true
  },
  quantity: {
    type: String,
    trim: true,
    required: true
  }
});

module.exports = {
  stockModel: mongoose.model("Stock", stockSchema)
};
