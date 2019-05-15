const repl = require('repl');
const clientManager = require('../manager/clientManager');
const PROMPT = 'node:repl> ';


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

    socket.sendMessage('*****************************************');
    socket.sendMessage('Welcome to repl console.');
    socket.sendMessage('Usage:');
    socket.sendMessage('  replAPI().findAll()');
    socket.sendMessage('  replAPI().find("id000001").exec("time5", function(result){console.log(result)})');
    socket.sendMessage('  replAPI().find("identity").destroy()');
    socket.sendMessage('*****************************************');

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
