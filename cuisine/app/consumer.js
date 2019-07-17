var amqp = require("amqplib/callback_api");
const dishController = require("../app/api/controllers/dishController");

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
        "cuisine." + process.env.NODE_ENV + "." + localUser + "queue",
        {
          exclusive: false
        },
        function(error2, q) {
          console.log(" [*] Waiting for logs. To exit press CTRL+C");

          channel.bindQueue(q.queue, exchange, "order.confirmed");
          channel.bindQueue(q.queue, exchange, "order.fulfilled");

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
    case "order_confirmed":
      if (!!message.object.order._id) {
        dishController.initializeOrder(message.object.order);
      } else {
        console.warn(
          "Cuisine_Consumer - No order._id is being passed on order confirmed event"
        );
      }
      break;
    case "order_fulfilled":
      if (!!message.object.order._id) {
        dishController.cookOrder(message.object.order, message.object.dish);
      } else {
        console.warn(
          "Cuisine_Consumer - No order._id is being passed on order fulfilled event"
        );
      }
      break;
    default:
      console.warn("Cuisine_Consumer - Can't treat ", message.event);
      break;
  }
};

module.exports = startConsumer;
