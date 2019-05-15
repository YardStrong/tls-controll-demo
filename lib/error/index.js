module.exports = {
    clientModel: {
        socketLost: {code: 503, message: 'socket lost'},
        socketBusy: {code: 408, message: 'socket busy'},
        waitTimeout: {code: 408, message: 'task wait timeout'},
        execTimeout: {code: 408, message: 'task exec timeout'},
    },
    clientManager: {
        clientLost: {code: 404, message: 'client not find'},
    },
    httpServer: {
        methodInvalid: {code: 404, message: 'Post only'},
        contentTypeInvalid: {code: 406, message: 'Json only'},
        paramInvalid: {code: 400, message: 'Param invalid'},
        notFound: {code: 404, message: 'Not found'},
        wrong: {code: 500, message: 'Go wrong'},
    }
}
