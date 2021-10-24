const express = require("express");
const app = express();
var cors = require('cors')
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
//
const config = require("./js/config.js");
const bufferQueue = require("./js/buffer-queue.js");
const rabbitmqClient = require("./js/rabbitmq-client.js");
const socketManager = require("./js/socket-manager.js");
//
app.use(cors({
  origin: '*'
}));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.debug("a user connected");
  socket.on("disconnect", () => {
    console.debug("user disconnected");
    socketManager.remove(socket.id);
  });

  socket.on("test-message", (msg) => {
    console.log("rcv test-message: " + msg);
    socketManager.set(socket, "test-message");

    bufferQueue.enqueue({
      id: socket.id,
      dest: "test-message",
      payload: { message: msg }
    });
  });

  socket.on("to-server", (msg) => {
    var json = JSON.parse(msg);
    socketManager.set(socket, json.dest);

    bufferQueue.enqueue({
      id: socket.id,
      dest: json.dest,
      payload: json.payload
    });
    socket.join(json.dest);
  });
});

serverStarted = () => {
  console.log("InjectIo...");
  socketManager.injectNsp(io);
  console.log("InjectIo... Done!");

  console.log("Start rabbitmqClient...");
  rabbitmqClient.start();
  console.log("Start rabbitmqClient... Done!");
}

server.listen(config.serverPort, () => {
  console.log(`listening on *:${config.serverPort}`);
  serverStarted();
});