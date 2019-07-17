const mongoose = require("mongoose");
const uuidv4 = require("uuid/v4");

//Define a schema
const Schema = mongoose.Schema;

const DishSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  ingredients: [
    {
      code: { type: String, trim: true, required: true },
      quantity: {
        type: Number,
        required: true
      }
    }
  ]
});

module.exports = {
  dishModel: mongoose.model("Dish", DishSchema)
};
