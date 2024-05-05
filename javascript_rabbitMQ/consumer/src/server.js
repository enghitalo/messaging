const express = require("express");
const amqp = require("amqplib");
const path = require("path");

const app = express();
const port = 3001;

// RabbitMQ connection URL
const rabbitUrl = "amqp://localhost:5672";

// Start the server
app.listen(port, async () => {
  const connection = await amqp.connect(rabbitUrl);
  const channel = await connection.createChannel();
  const queue = "my-queue";

  await channel.assertQueue(queue);
  channel.consume(
    queue,
    (message) => {
      if (message.content) {
        const receivedMessage = message.content.toString();
        console.log(`Received message: ${receivedMessage}`);
      }
    },
    { noAck: true }
  );

  console.log(`Server running at http://localhost:${port}`);
});
