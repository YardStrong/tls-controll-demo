const repl = require('repl');
const clientManager = require('../manager/clientManager');
const PROMPT = 'Cloud-Socket:repl> ';


var replAPI = function(socket, identity) {
    return {
        findAll: function() {
            return clientManager.getAllClients();
        },
        find: function(identity) {
            return {
                exec: function(cmd, callback) {
                    clientManager.sendMsgToClient(identity, cmd, function(error, result) {
                        if(error) return callback(error);
                        callback(result);
                    });
                },
                destroy: function() {
                    clientManager.destroyClient(identity);
                    return 'Done.';
                }
            }
        }
    }
}

let app = function(socket) {
    socket.sendMessage = function(message) {
        socket.write(message);
        socket.write(PROMPT);
    }
    socket.write('--------------------------------------------------------------------\n');
    socket.write('Welcome to repl console.\n');
    socket.write('Usage:\n');
    socket.write('  replAPI().findAll()\n');
    socket.write('  replAPI().find("id000001").exec("cmd",function(r){console.log(r)})\n');
    socket.write('  replAPI().find("identity").destroy()\n');
    socket.write('--------------------------------------------------------------------\n');

    let replServer = repl.start({
        prompt: PROMPT,
        input: socket,
        output: socket,
        terminal: true,
        useGlobal: false,
        ignoreUndefined: true
    });

    replServer.on('exit', function () {
        socket.end();
    });

    replServer.context.replAPI = replAPI.bind(this, socket);
}


module.exports = app;
