const clientManager = require('../manager/clientManager');

/**
 * 读取identity，并重新绑定事件
 * @Param {object} socket 连接
 **/
var readIdentityFromSocket = function(socket) {
    let identity = socket.read().toString();
    if(!identity) {
        console.log('[TLS-SERVER-ERR] Non-identity socket(%s)',
        socket.remoteAddress + ':' + socket.remotePort);
        return socket.close();
    }
    console.log('[TLS-SOCKET-LOG]', 'Client[' + identity + '] connected:');
    clientManager.addClient(identity, socket);
    socket.on('close', clientManager.destroyClient.bind(this, identity));
    socket.on('error', clientManager.onClientError.bind(this, identity));
}


let app = function(socket) {
    socket.setEncoding('utf8');
    let onError = function(error) {
        console.log('[TLS-SERVER-LOG] Error appeared.');
        console.error(error);
    }
    let onReadable = function() {
        socket.removeListener('readable', onReadable);
        socket.removeListener('error', onError);
        readIdentityFromSocket(socket);
    }
    socket.on('readable', onReadable);
    socket.on('error', onError);
}

module.exports = app;
