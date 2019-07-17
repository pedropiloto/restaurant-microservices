const { customerModel } = require("../models/customer");
const { publishMessage } = require("../../publisher");

module.exports = {
  getById: function(req, res, next) {
    console.log("getting customer with id", req.params.id);
    customerModel.findById(req.params.id, function(err, customerInfo) {
      if (err) {
        next(err);
      } else {
        if (!!customerInfo) {
          res.json({
            status: "success",
            message: "Customer found!!!",
            data: { customer: customerInfo }
          });
        } else {
          console.log("Customer with id", req.params.id, "not found");
          res.status(404).json({ message: "Not found" });
        }
      }
    });
  },

  getAll: function(req, res, next) {
    console.log("getting all customers");
    let customersList = [];

    customerModel.find({}, function(err, customers) {
      if (err) {
        next(err);
      } else {
        for (let customer of customers) {
          customersList.push({
            id: customer._id,
            name: customer.name,
            card_number: customer.card_number,
            address: customer.address
          });
        }
        res.json({
          status: "success",
          message: "Customer list found!!!",
          data: { customers: customersList }
        });
      }
    });
  },

  deleteById: function(req, res, next) {
    console.log("deleting customer with id", req.params.id);
    customerModel.findByIdAndRemove(req.params.id, function(err, customerInfo) {
      if (err) next(err);
      else {
        res.json({
          status: "success",
          message: "Customer deleted successfully!!!",
          data: null
        });
      }
    });
  },

  create: function(req, res, next) {
    console.log(
      "creating customer with the params: ",
      req.body.name,
      req.body.card_number,
      req.body.address
    );
    customerModel.create(
      {
        name: req.body.name,
        card_number: req.body.card_number,
        address: req.body.address
      },
      function(err, result) {
        if (err) next(err);
        else
          res.json({
            status: "success",
            message: "Customer added successfully!!!",
            data: result
          });
      }
    );
  },

  newOrder: function(order) {
    console.log("Received order with order:", order);
    customerModel.findById(order.customer_id, function(err, customerInfo) {
      if (err) {
        publishOrderRefundedMessage(order);
        console.log("Customer with id", order.customer_id, "not found", err);
      } else {
        if (!!customerInfo) {
          publishOrderPaidMessage(order, customerInfo);
        } else {
          publishOrderRefundedMessage(order);
          console.log("CustomerInfo with id", order.customer_id, "not defined");
        }
      }
    });
  },

  refundOrder: function(order) {
    console.log("refunding order with id", order._id);
    publishOrderRefundedMessage(order);
  }
};

const publishOrderPaidMessage = (order, customerInfo) => {
  setTimeout(function() {
    publishMessage(
      "order.paid",
      JSON.stringify({
        event: "order_paid",
        object: { order: order, customer: customerInfo }
      })
    );
  }, 12000);
};

const publishOrderRefundedMessage = order => {
  setTimeout(function() {
    publishMessage(
      "order.refunded",
      JSON.stringify({
        event: "order_refunded",
        object: { order }
      })
    );
  }, 6000);
};
