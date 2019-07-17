const { dishModel } = require("../models/dish");
const { publishMessage } = require("../../publisher");

module.exports = {
  getById: function(req, res, next) {
    console.log("getting dish with id", req.params.id);
    dishModel.findById(req.params.id, function(err, dishInfo) {
      if (err) {
        next(err);
      } else {
        if (!!dishInfo) {
          res.json({
            status: "success",
            message: "Dish found!!!",
            data: { dish: dishInfo }
          });
        } else {
          console.log("Dish with id", req.params.id, "not found");
          res.status(404).json({ message: "Not found" });
        }
      }
    });
  },

  getAll: function(req, res, next) {
    console.log("getting all dishes");
    let dishesList = [];

    dishModel.find({}, function(err, dishes) {
      if (err) {
        next(err);
      } else {
        for (let dish of dishes) {
          dishesList.push({
            id: dish._id,
            name: dish.name,
            ingredients: dish.ingredients
          });
        }
        res.json({
          status: "success",
          message: "Dish list found!!!",
          data: { dishes: dishesList }
        });
      }
    });
  },

  getAllWSO2: function(req, res, next) {
    console.log("getting all dishes wso2");
    let dishesList = [];

    dishModel.find({}, function(err, dishes) {
      if (err) {
        next(err);
      } else {
        for (let dish of dishes) {
          dishesList.push({
            id: dish._id,
            name: dish.name
          });
        }
        res.json({
          dishes: dishesList }
        );
      }
    });
  },

  updateById: function(req, res, next) {
    console.log("update dish with id", req.body.id);
    dishModel.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        ingredients: req.body.ingredients
      },
      function(err, dishInfo) {
        if (err) next(err);
        else {
          if (!!dishInfo) {
            res.json({
              status: "success",
              message: "Dish updated successfully!!!",
              data: null
            });
          } else {
            console.log("Dish with id", req.params.id, "not found");
            res.status(404).json({ message: "Not found" });
          }
        }
      }
    );
  },

  deleteById: function(req, res, next) {
    console.log("deleting dish with id", req.params.id);
    dishModel.findByIdAndRemove(req.params.id, function(err, dishInfo) {
      if (err) next(err);
      else {
        res.json({
          status: "success",
          message: "Dish deleted successfully!!!",
          data: dishInfo
        });
      }
    });
  },

  create: function(req, res, next) {
    console.log(
      "creating dish with the params: ",
      req.body.name,
      req.body.ingredients
    );
    dishModel.create(
      {
        name: req.body.name,
        ingredients: req.body.ingredients
      },
      function(err, result) {
        if (err) next(err);
        else
          res.json({
            status: "success",
            message: "Dish added successfully!!!",
            data: result
          });
      }
    );
  },
  initializeOrder: function(order) {
    dishModel.findById(order.dish_id, function(err, dishInfo) {
      if(err){
        console.log("cannot initialize order with id:",order._id)
      }else{
        if(!!dishInfo){        
        console.log(
          "Cuisine initializing order with id:",
          order._id,
          "and with dish_id:",
          order.dish_id
          );
          dish = await =
          setTimeout(function() {
            publishMessage(
              "order.initialized",
              JSON.stringify({ event: "order_initialized", object: { order, dish: dishInfo } })
              );
            }, 2000);
        }else{
          console.log("dish with id", order.dish_id, "in order",order._id, "not found")
          publishMessage(
            "order.rejected",
            JSON.stringify({ event: "order_rejected", object: { order, dish: dishInfo } })
          )
        }
      }
      });
    },
    cookOrder: function(order, dish) {
      console.log("cooking order:",order._id,"dish:",dish._id)
            setTimeout(function() {
              publishMessage(
                "order.ready",
                JSON.stringify({ event: "order_ready", object: { order, dish } })
                );
              }, 2000);
      }
  };
  