var amqp = require("amqplib/callback_api");
const orderController = require("./api/controllers/orderEventController");
const { orderState } = require("./api/models/orderEvent");

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
        "orders.write." + process.env.NODE_ENV + "." + localUser + "queue",
        {
          exclusive: false
        },
        function(error2, q) {
          console.log(" [*] Waiting for logs. To exit press CTRL+C");

          channel.bindQueue(q.queue, exchange, "order.paid");
          channel.bindQueue(q.queue, exchange, "order.initialized");
          channel.bindQueue(q.queue, exchange, "order.rejected");
          channel.bindQueue(q.queue, exchange, "order.refunded");
          channel.bindQueue(q.queue, exchange, "order.ready");

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
  orderController.newOrderEvent(message.object.order, message.event);
};

module.exports = startConsumer;
