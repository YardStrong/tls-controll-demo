const ERROR = require('../error').httpServer;
const clientManager = require('../manager/clientManager');
const COMMAND_TYPE = {'send': 1, 'destroy': 1}; // 业务类型


// 业务处理
var next = function(req, res) {
    let command = req.body.command;
    let identity = req.body.identity;
    if(!command || !COMMAND_TYPE[command]) return res.paramInvalid('command');
    if(!identity) return res.paramInvalid('identity');
    switch (command) {
        case 'send': {
            let message = req.body.message;
            if(!message) return res.paramInvalid('message');
            clientManager.sendMsgToClient(identity, message, function(error, result) {
                if(error) return res.setStatusAndData(error.code || 200, error);
                res.json({code: 200, message: 'Success', data: result});
            });
            break;
        }
        case 'destroy': {
            clientManager.destroyClient(identity);
            res.json({code: 200, message: 'Success'});
        }
    }
}


// 参数处理和请求头过滤
let app = function(req, res) {
    // 添加三个成员方法，Restful风格统一返回
    res.setStatusAndData = function(status, object) {
        res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8'});
        res.end(JSON.stringify(object));
    }
    res.json = res.setStatusAndData.bind(res, 200);
    res.paramInvalid = function(paramName) {
        ERROR.paramInvalid.paramName = paramName;
        res.setStatusAndData(400, ERROR.paramInvalid);
    }
    // 请求头判定、请求方法，服务器接收参数类型限定
    if(req.method != 'POST') return res.setStatusAndData(404, ERROR.methodInvalid);
    if(!req.headers['content-type'] || !req.headers['content-type'].match(/json/)) {
        return res.setStatusAndData(406, ERROR.contentTypeInvalid);
    }
    // 获取post请求体
    var postData = '';
    req.on('data', function(receiveData) {
        postData += receiveData;
    });
    req.on('end', function() {
        try { req.body = JSON.parse(postData); }
        catch(e) { return res.json(ERROR.contentTypeInvalid); }
        next(req, res);
    });
}


module.exports = app;
