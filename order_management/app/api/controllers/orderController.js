const { orderModel, orderState } = require("../models/order");
const { publishMessage } = require("../../publisher");

module.exports = {
  getById: function(req, res, next) {
    console.log("getting oorder with id", req.params.id);
    orderModel.findById(req.params.id, function(err, orderInfo) {
      if (err) {
        next(err);
      } else {
        if (!!orderInfo) {
          res.json({
            status: "success",
            message: "Order found!!!",
            data: { order: orderInfo }
          });
        } else {
          console.log("Order with id", req.params.id, "not found");
          res.status(404).json({ message: "Not found" });
        }
      }
    });
  },

  getByIdV2: function(req, res, next) {
    console.log("getting oorder with id", req.params.id);
    orderModel.findById(req.params.id, function(err, orderInfo) {
      if (err) {
        next(err);
      } else {
        if (!!orderInfo) {
          res.json({
            order: orderInfo
          });
        } else {
          console.log("Order with id", req.params.id, "not found");
          res.status(404).json({ message: "Not found" });
        }
      }
    });
  },

  getAll: function(req, res, next) {
    console.log("getting all orders");
    let ordersList = [];

    orderModel.find({}, function(err, orders) {
      if (err) {
        next(err);
      } else {
        for (let order of orders) {
          ordersList.push({
            id: order._id,
            customer_id: order.customer_id,
            released_on: order.released_on,
            state: order.state,
            type: order.type
          });
        }
        res.json({
          status: "success",
          message: "Order list found!!!",
          data: { orders: ordersList }
        });
      }
    });
  },
  getAllV2: function(req, res, next) {
    console.log("getting all orders v2");
    let ordersList = [];

    orderModel.find({}, function(err, orders) {
      if (err) {
        next(err);
      } else {
        for (let order of orders) {
          ordersList.push({
            id: order._id,
            customer_id: order.customer_id,
            released_on: order.released_on,
            state: order.state,
            type: order.type
          });
        }
        res.json(ordersList);
      }
    });
  },

  changeOrderState: function(id, state) {
    console.log("changing order with id ", id, "to state", state);
    orderModel.findByIdAndUpdate(
      id,
      {
        state
      },
      function(err, orderInfo) {
        if (err)
          console.warn(
            "Failed to change state of order with id",
            id,
            "to state"
          );
        else {
          if (!!orderInfo) {
            console.log(
              "order with id",
              id,
              "was changed to state",
              state,
              "with success"
            );
          } else {
            console.log("Order with id", id, "not found");
          }
        }
      }
    );
  },
  setOrderReady: function(message) {
    console.log("setting order", message.object.order._id, "ready");
    this.changeOrderState(message.object.order._id, orderState.READY);
  },

  create: function(order) {
    console.log(
      "creating order with the params: ",
      order._id,
      order.customer_id,
      order.dish_id,
      order.released_on,
      order.type
    );

    orderModel.create(
      {
        _id: order._id,
        customer_id: order.customer_id,
        dish_id: order.dish_id,
        released_on: order.released_on,
        type: order.type
      },
      function(err, result) {
        if (err) {
          console.log("could not add order");
        } else {
          console.log("order was added successfully");
        }
      }
    );
  },

  setOrderPaid: function(order, customer) {
    orderModel.findById(order._id, (err, orderInfo) => {
      if (err) {
        console.log("error:", err);
      } else {
        if (!!orderInfo) {
          if (orderInfo.state !== orderState.CANCELLED) {
            console.log("setting order with id", order._id, "paid");
            this.changeOrderState(order._id, orderState.PAID),
              publishMessage(
                "order.confirmed",
                JSON.stringify({
                  event: "order_confirmed",
                  object: { order, customer }
                })
              );
          } else {
            console.log("order with id", order._id, "was cancelled");
          }
        } else {
          console.log("Order with id", order._id, "not found");
        }
      }
    });
  },

  removeById: function(req, res, next) {
    console.log("removing oorder with id", req.params.id);
    orderModel.findById(req.params.id, (err, orderInfo) => {
      if (err) {
        next(err);
      } else {
        if (!!orderInfo) {
          const state = orderInfo.state;
          console.log("state", state);
          if (state !== orderState.CREATED) {
            console.log("cannot remove order with id", orderInfo._id);
            res.status(400).json({
              message: "Cannot cancel processing or proccessed orders"
            });
          } else {
            orderModel.findByIdAndUpdate(
              orderInfo._id,
              {
                state: orderState.CANCELLED
              },
              function(err, orderInfo) {
                if (err)
                  res.status(400).json({
                    message: "Failed to update the order to cancelled sate"
                  });
                else {
                  if (!!orderInfo) {
                    res.status(200).json({
                      mesage:
                        "order with id " +
                        orderInfo._id +
                        " cancelled with success"
                    });
                  } else {
                    res.status(404).json({ message: "Not found" });
                  }
                }
              }
            );
          }
        } else {
          console.log("Order with id", req.params.id, "not found");
          res.status(404).json({ message: "Not found" });
        }
      }
    });
  }
};
