const env = "development";
//const env = "production";

const createChannel = async callback => {
  const channel = async () => {
    const conn = await require("amqplib").connect(
      //"amqp://root:p0p0p0p0@134.209.28.165:5672"
      //"amqp://greais:greais@104.248.165.176:5672"
      "amqp://asantos:asantos@134.209.182.83:5672"
    );

    return conn.createChannel().then(channel => {
      return Promise.resolve(channel);
    });
  };

  global.globalRabbitMQChannel = await channel();
  callback();
};

const start = () => {
  publishMessage(
    globalRabbitMQChannel,
    "restaurant." + env,
    "order.initialized",
    JSON.stringify({
      event: "order_initialized",
      object: { _id: "5cd9a9952f62ca0004577801", state: 1 }
    })
  );
};

const publishMessage = async (channel, exchange, routingKey, message) => {
  channel.assertExchange(exchange, "direct", {
    durable: false
  });
  channel.publish(exchange, routingKey, Buffer.from(message));
  console.log(" [x] Sent %s: '%s'", routingKey, message);
};

createChannel(start);
