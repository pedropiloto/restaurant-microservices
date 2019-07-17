const { orderEventModel } = require("../models/orderEvent");
const { publishMessage } = require("../../publisher");
const uuidv4 = require("uuid/v4");

module.exports = {
  getAll: function(req, res, next) {
    console.log("getting all orders");
    let ordersList = [];

    orderEventModel.find({}, function(err, orders) {
      if (err) {
        next(err);
      } else {
        for (let order of orders) {
          ordersList.push({
            order_id: order.order_id,
            event: order.event
          });
        }
        res.json({
          status: "success",
          message: "Order Events list found!!!",
          data: { orderEvents: ordersList }
        });
      }
    });
  },

  create: function(req, res, next) {
    console.log(
      "creating order with the params: ",
      req.body.customer_id,
      req.body.dish_id,
      req.body.released_on,
      req.body.type
    );
    let order_id = uuidv4();

    orderEventModel.create(
      {
        order_id: order_id,
        event: "order.created"
      },
      function(err, result) {
        if (err) next(err);
        else
          publishMessage(
            "order.created",
            JSON.stringify({
              event: "order_created",
              object: {
                order: {
                  _id: order_id,
                  customer_id: req.body.customer_id,
                  dish_id: req.body.dish_id,
                  released_on: req.body.released_on,
                  type: req.body.type
                }
              }
            })
          );
        res.json({
          status: "success",
          message: "Order Event added successfully!!!",
          data: result
        });
      }
    );
  },
  createWSO2Order: function(req, res, next) {
    console.log("creating wso2 order with the dish_id: ", req.params.dish_id);
    let order_id = uuidv4();

    orderEventModel.create(
      {
        order_id: order_id,
        event: "order.created"
      },
      function(err, result) {
        if (err) next(err);
        else
          publishMessage(
            "order.created",
            JSON.stringify({
              event: "order_created",
              object: {
                order: {
                  _id: order_id,
                  customer_id: req.params.customer_id,
                  dish_id: req.params.dish_id,
                  released_on: "2019-05-12",
                  type: 1
                }
              }
            })
          );
        res.json({
          status: "success",
          message: "Order added successfully!!!",
          data: result
        });
      }
    );
  },
  newOrderEvent: function(order, event) {
    console.log("adding event to order", order);
    orderEventModel.create(
      {
        order_id: order._id,
        event: event
      },
      function(err, result) {
        if (err) {
          console.log("error adding new order event", err);
        } else
          console.log(
            "event",
            event,
            "for order",
            order._id,
            "added successfully to the event store"
          );
      }
    );
  }
};
