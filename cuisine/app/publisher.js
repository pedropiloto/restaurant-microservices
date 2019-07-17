require("dotenv").config();
const createChannel = async callback => {
  const channel = async () => {
    const amqpURL = process.env.AMQP_URL;
    console.log("AMQP URL", amqpURL);
    const conn = await require("amqplib").connect(amqpURL);

    return conn.createChannel().then(channel => {
      return Promise.resolve(channel);
    });
  };

  global.globalRabbitMQChannel = await channel();
  callback();
};

const publishMessage = async (routingKey, message) => {
  const exchange = "restaurant." + process.env.NODE_ENV;

  globalRabbitMQChannel.assertExchange(exchange, "direct", {
    durable: false
  });
  globalRabbitMQChannel.publish(exchange, routingKey, Buffer.from(message));
  console.log(" [x] Sent %s: '%s'", routingKey, message);
};

module.exports = { createChannel, publishMessage };
