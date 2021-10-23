
const repo = new Map();
const obj = {
    nsp: null,
    onConnection: [],
    onDisconnection: []
}

module.exports = {
    injectNsp: (outIo) => {
        obj.nsp = outIo.of("/");
    },
    set: (socket, dest) => {
        if (repo.has(socket.id)) {
            return;
        }
        repo.set(socket.id, {
            socket,
            dest
        });
        obj.onConnection.forEach((task, index) => {
            if (task) {
                task(socket.id, dest);
            }
        });
    },
    remove: (id) => {

        var holder = repo.get(id);
        if (holder) {
            repo.delete(id);
            obj.onDisconnection.forEach((task, index) => {
                if (task) {
                    task(id, holder.dest);
                }
            });
        }


    },
    emit: (id, event, message) => {
        var holder = repo.get(id);
        if (holder) {
            holder.socket.emit(event, message);
        }
    },
    broadcast: (room, message) => {
        obj.nsp.to(room, message);
    },

    onConnection: (task) => {
        obj.onConnection.push(task);
    },

    onDisconnection: (task) => {
        obj.onDisconnection.push(task);
    }
}