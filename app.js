const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
//
const config = require("./js/config.js");
const bufferQueue = require("./js/buffer-queue.js");
const rabbitmqClient = require("./js/rabbitmq-client.js");

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.debug("a user connected");
  socket.on("disconnect", () => {
    console.debug("user disconnected");
  });

  socket.on("test-message", (msg) => {
    console.log("rcv test-message: " + msg);
    bufferQueue.enqueue({
      dest: "test-message",
      payload: msg
    });
  });

  socket.on("sub-channel", (msg) => {
    var json = JSON.parse(msg);
    bufferQueue.enqueue({
      dest: json.dest,
      payload: json.payload
    });
  });
});

serverStarted = () => {
  console.log("Start rabbitmqClient...");
  rabbitmqClient.start();
  console.log("Start rabbitmqClient... Done!");

}

server.listen(config.serverPort, () => {
  console.log(`listening on *:${config.serverPort}`);
  serverStarted();
});