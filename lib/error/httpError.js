module.exports = {
    httpServer: {
        methodInvalid: {code: 404, message: 'Post only'},
        contentTypeInvalid: {code: 406, message: 'Json only'},
        paramInvalid: {code: 400, message: 'Param invalid'},
        notFound: {code: 404, message: 'Not found'},
        wrong: {code: 500, message: 'Go wrong'},
    }
}