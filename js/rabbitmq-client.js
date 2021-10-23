const outputExchange = "exchange.output";
const bufferQueue = require('./buffer-queue.js');
const ulti = require('./ulti.js');

var open = require('amqplib').connect('amqp://socketio:socketio0945080066d@14.225.254.235:5672/socketio');

exports.start = () => {
  var q = ulti.randomString(16);

  // Publisher
  open.then(function (conn) {
    return conn.createChannel();
  }).then(function (ch) {
    return ch.assertExchange(outputExchange, "topic", {
      durable: false
    }).then((ok) => {
      bufferQueue.start(
        (obj) => {
          ch.publish(outputExchange, obj.dest, Buffer.from(obj.payload))
        }
      );
    }).then(() => {
      return ch;
    }).then(function (ch) {
      return ch.assertQueue(q, {
        durable: false,
        exclusive: true,
        autoDelete: true
      }).then(function (ok) {
        return ch.bindQueue(q, outputExchange, "test-message").then(ok => {
          return ch.consume(q, function (msg) {
            if (msg !== null) {
              console.log("rabbitclient consume: " + msg.content.toString());
              ch.ack(msg);
            }
          });
        });
      });
    })
      ;
  }).catch(console.warn);


  // // Consumer
  // open.then(function (conn) {
  //   return conn.createChannel();
  // }).then(function (ch) {
  //   return ch.assertQueue(q, {
  //     durable: false,
  //     exclusive: true,
  //     autoDelete: true
  //   }).then(function (ok) {
  //     return ch.bindQueue(q, outputExchange, "test-message").then(ok => {
  //       return ch.consume(q, function (msg) {
  //         if (msg !== null) {
  //           console.log("rabbitclient consume: " + msg.content.toString());
  //           ch.ack(msg);
  //         }
  //       });
  //     });
  //   });
  // }).catch(console.warn);
}