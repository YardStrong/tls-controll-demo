module.exports = {
    clientModel: {
        socketLost: {code: 503, message: 'socket lost'},
        socketBusy: {code: 408, message: 'socket busy'},
        waitTimeout: {code: 408, message: 'task wait timeout'},
        execTimeout: {code: 408, message: 'task exec timeout'},
    },
    clientManager: {
        clientLost: {code: 404, message: 'client not find'},
    }
}