const express = require("express");
const amqp = require("amqplib");
const path = require("path");

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, "src")));
app.use(express.json());

const rabbitUrl = "amqp://localhost:5672";

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/send-message", async (req, res) => {
  const { message } = req.body;

  try {
    const connection = await amqp.connect(rabbitUrl);
    const channel = await connection.createChannel();
    const queue = "my-queue";

    await channel.assertQueue(queue);
    await channel.sendToQueue(queue, Buffer.from(message));

    console.log(`Message sent: ${message}`);
    await channel.close();
    await connection.close();

    res.json({ message: "Message sent successfully!" }); // Send success response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending message" }); // Send error response
  }
});

// Start the server
app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);
});
