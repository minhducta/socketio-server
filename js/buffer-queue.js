const AsyncBlockingQueue = require('async-blocking-queue');

var queue = new AsyncBlockingQueue();

exports.enqueue = (obj) => {
    queue.enqueue(obj);
}

exports.start = (task) => {
    _start(task);
}

function _start(task) {
    queue.dequeue().then((result) => {
        // console.debug("buffer-queue dequeue: " + result);
        task(result);
        _start(task);
    });
}
