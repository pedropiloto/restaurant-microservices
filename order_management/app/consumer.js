var amqp = require("amqplib/callback_api");
const orderController = require("../app/api/controllers/orderController");
const { orderState } = require("./api/models/order");

const startConsumer = () => {
  const amqpURL = process.env.AMQP_URL;
  amqp.connect(amqpURL, function(error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }
      const exchange = "restaurant." + process.env.NODE_ENV;

      channel.assertExchange(exchange, "direct", {
        durable: false
      });

      let localUser = !!process.env.LOCAL_USER
        ? process.env.LOCAL_USER + "."
        : "";

      channel.assertQueue(
        "orders.management." + process.env.NODE_ENV + "." + localUser + "queue",
        {
          exclusive: false
        },
        function(error2, q) {
          console.log(" [*] Waiting for logs. To exit press CTRL+C");

          channel.bindQueue(q.queue, exchange, "order.created");
          channel.bindQueue(q.queue, exchange, "order.paid");
          channel.bindQueue(q.queue, exchange, "order.initialized");
          channel.bindQueue(q.queue, exchange, "order.refunded");
          channel.bindQueue(q.queue, exchange, "order.ready");
          channel.bindQueue(q.queue, exchange, "order.delivered");

          channel.consume(
            q.queue,
            function(msg) {
              console.log(
                " [x] %s: '%s'",
                msg.fields.routingKey,
                msg.content.toString()
              );
              try {
                proccessMessage(JSON.parse(msg.content.toString()));
              } catch (e) {
                console.log("could not proccess the message", e);
              }
            },
            {
              noAck: true
            }
          );
        }
      );
    });
  });
};

const proccessMessage = message => {
  console.log(message);
  switch (message.event) {
    case "order_created":
      if (!!message.object.order._id) {
        orderController.create(message.object.order);
      } else {
        console.warn(
          "Order_Management_Consumer - No order._id is being passed on order created event"
        );
      }
      break;
    case "order_paid":
      if (!!message.object.order._id) {
        orderController.setOrderPaid(
          message.object.order,
          message.object.customer
        );
      } else {
        console.warn(
          "Order_Management_Consumer - No order._id is being passed on order paid event"
        );
      }
      break;
    case "order_initialized":
      if (!!message.object.order._id) {
        orderController.changeOrderState(
          message.object.order._id,
          orderState.INITIALIZED
        );
      } else {
        console.warn(
          "Order_Management_Consumer - No order._id is being passed on order initialized event"
        );
      }
      break;
    case "order_ready":
      if (!!message.object.order._id) {
        orderController.setOrderReady(message);
      } else {
        console.warn(
          "Order_Management_Consumer - No order._id is being passed on order initialized event"
        );
      }
      break;
    case "order_delivered":
      if (!!message.object.order._id) {
        orderController.changeOrderState(
          message.object.order._id,
          orderState.COMPLETED
        );
      } else {
        console.warn(
          "Order_Management_Consumer - No order._id is being passed on order initialized event"
        );
      }
      break;
    case "order_refunded":
      if (!!message.object.order._id) {
        orderController.changeOrderState(
          message.object.order._id,
          orderState.REFUNDED
        );
      } else {
        console.warn(
          "Order_Management_Consumer - No order._id is being passed on order rejected event"
        );
      }
      break;
    default:
      console.warn("Can't treat ", message.event);
      break;
  }
};

module.exports = startConsumer;
