const mongoose = require("mongoose");
const uuidv4 = require("uuid/v4");

//Define a schema
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  order_id: {
    type: String,
    trim: true,
    required: true
  },
  event: {
    type: String,
    trim: true,
    required: true
  }
});

module.exports = {
  orderEventModel: mongoose.model("OrderEvent", OrderSchema)
};
