var amqp = require("amqplib/callback_api");

var args = process.argv.slice(2);

const env = "development";
//const env = "production";

if (args.length == 0) {
  console.log("Usage: receive_logs_direct.js [info] [warning] [error]");
  process.exit(1);
}

amqp.connect("amqp://root:p0p0p0p0@134.209.28.165:5672/%2f", function(
  error0,
  connection
) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    var exchange = "restaurant." + env;

    channel.assertExchange(exchange, "direct", {
      durable: false
    });

    channel.assertQueue(
      "example.queue." + env,
      {
        exclusive: false
      },
      function(error2, q) {
        console.log(" [*] Waiting for logs. To exit press CTRL+C");

        channel.unbindQueue(q.queue, exchange);
        args.forEach(function(severity) {
          channel.bindQueue(q.queue, exchange, severity);
          channel.bindQueue(q.queue, exchange, "order_start");
        });

        channel.consume(
          q.queue,
          function(msg) {
            console.log(
              " [x] %s: '%s'",
              msg.fields.routingKey,
              msg.content.toString()
            );
          },
          {
            noAck: true
          }
        );
      }
    );
  });
});
