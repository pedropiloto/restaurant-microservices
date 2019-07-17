var amqp = require("amqplib/callback_api");
const stockController = require("../app/api/controllers/stockController");

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
        "stocks.management." + process.env.NODE_ENV + "." + localUser + "queue",
        {
          exclusive: false
        },
        function(error2, q) {
          console.log(" [*] Waiting for logs. To exit press CTRL+C");

          channel.bindQueue(q.queue, exchange, "order.initialized");

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
    case "order_initialized":
      if (!!message.object.order._id) {
        console.log("Stock_Management_Consumer - order initialized");
        stockController.useIngredients(
          message.object.order,
          message.object.dish
        );
      } else {
        console.warn(
          "Order_Management_Consumer - No order._id is being passed on order initialized event"
        );
      }
      break;
    default:
      console.warn("Can't treat ", message.event);
      break;
  }
};

module.exports = startConsumer;
