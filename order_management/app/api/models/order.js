const mongoose = require("mongoose");
const uuidv4 = require("uuid/v4");

const OrderState = {
  CREATED: 0,
  PAID: 1,
  INITIALIZED: 2,
  CANCELLED: 3,
  READY: 4,
  COMPLETED: 5,
  REFUNDED: 6
};

const OrderType = {
  RESTAURANT: 0,
  DELIVERY: 1
};

//Define a schema
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  _id: {
    type: String,
    trim: true,
    required: true
  },
  customer_id: {
    type: String,
    trim: true,
    required: true
  },
  dish_id: {
    type: String,
    trim: true,
    required: true
  },
  released_on: {
    type: Date,
    trim: true,
    required: true
  },
  state: {
    type: Number,
    default: OrderState.CREATED,
    required: false
  },
  type: {
    type: Number,
    default: OrderType.DELIVERY,
    required: false
  }
});

module.exports = {
  orderModel: mongoose.model("Order", OrderSchema),
  orderState: OrderState
};
