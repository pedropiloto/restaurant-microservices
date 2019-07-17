const mongoose = require("mongoose");
const uuidv4 = require("uuid/v4");

//Define a schema
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  card_number: {
    type: String,
    trim: true,
    required: true,
    default: "0000"
  },
  address: {
    type: String,
    trim: true,
    required: false
  }
});

module.exports = {
  customerModel: mongoose.model("Customer", CustomerSchema)
};
