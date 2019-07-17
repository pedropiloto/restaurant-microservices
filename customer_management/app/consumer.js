var amqp = require("amqplib/callback_api");
const customerController = require("../app/api/controllers/customerController");

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
        "customers.management." +
          process.env.NODE_ENV +
          "." +
          localUser +
          "queue",
        {
          exclusive: false
        },
        function(error2, q) {
          console.log(" [*] Waiting for logs. To exit press CTRL+C");

          channel.bindQueue(q.queue, exchange, "order.created");
          channel.bindQueue(q.queue, exchange, "order.rejected");

          channel.consume(
            q.queue,
            function(msg) {
              console.log(
                " [x] %s: '%s'",
                msg.fields.routingKey,
                msg.content.toString()
              );
              proccessMessage(JSON.parse(msg.content.toString()));
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
        customerController.newOrder(message.object.order);
      } else {
        console.warn("No _id is being passed on order created event");
      }
      break;
    case "order_rejected":
      if (!!message.object.order._id) {
        customerController.refundOrder(message.object.order);
      } else {
        console.warn("No _id is being passed on order rejected event");
      }
      break;
    default:
      console.warn("Can't treat ", message.event);
      break;
  }
};

module.exports = startConsumer;
