const outputExchange = "exchange.output";
const inputExchange = "exchange.input";
const config = require("./config.js");
const bufferQueue = require('./buffer-queue.js');
const socketManager = require("./socket-manager.js");
const ulti = require('./ulti.js');

var url = `amqp://${config.rabbit.user}:${config.rabbit.pwd}@${config.rabbit.host}:${config.rabbit.port}/${config.rabbit.vhost}`;
var open = require('amqplib').connect(url);
var q = ulti.randomString(16);
var qq = ulti.randomString(16);

procInMsg = txtMsg => {
  var json = JSON.parse(txtMsg);
  socketManager.emit(json.id, json.event, json.message);
}

exports.start = () => {
  // Publisher
  open.then(function (conn) {
    return conn.createChannel();
  }).then((ch) => {
    return ch.assertExchange(outputExchange, "topic", {
      durable: false
    }).then(() => {
      bufferQueue.start(
        (obj) => {
          ch.publish(outputExchange, obj.dest, Buffer.from(JSON.stringify(obj)))
        }
      );
      socketManager.onConnection((id, dest) => {
        ch.publish(outputExchange, dest, Buffer.from(JSON.stringify({
          id,
          dest,
          payload: {
            isConnected: true
          }
        })));
      });

      socketManager.onDisconnection((id, dest) => {
        ch.publish(outputExchange, dest, Buffer.from(JSON.stringify({
          id,
          dest,
          payload: {
            isConnected: false
          }
        })));
      });

    }).then(() => {
      return ch.assertExchange(inputExchange, "fanout", {
        durable: false
      });
    }).then(() => {
      return ch.assertQueue(qq, {
        durable: false,
        exclusive: true,
        autoDelete: true
      }).then(() => {
        return ch.bindQueue(qq, inputExchange, "").then(ok => {
          return ch.consume(qq, function (msg) {
            if (msg !== null) {
              var textMsg = msg.content.toString();
              procInMsg(textMsg);
              ch.ack(msg);
            }
          });
        });
      });  
    }).then(() => { //for host testing
      return ch.assertQueue(q, {
        durable: false,
        exclusive: true,
        autoDelete: true
      }).then(function (ok) {
        return ch.bindQueue(q, outputExchange, "test-message").then(ok => {
          return ch.consume(q, function (msg) {
            if (msg !== null) {
              console.log("rabbitclient consume: " + msg.content.toString());
              var json = JSON.parse(msg.content.toString());

              procInMsg(JSON.stringify({
                id: json.id,
                event: "test-message-response",
                message: "Response " + json.payload.message
              }));

              ch.ack(msg);
            }
          });
        });
      });
    })
      ;
  }).catch(console.warn);
}