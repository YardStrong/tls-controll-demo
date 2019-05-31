const Client = require('../model/clientModel');
const ERROR = require('../error').client.clientManager;

var allClients = {};

/**
 * 添加一个新的客户端
 * @Param {string} identity 唯一标识
 * @Param {object} socket socket连接
 **/
module.exports.addClient = function(identity, socket) {
    // TODO此处不排除identity抢坑的问题
    // 如果执行destroyClient(旧对象)，旧对象的socket关闭时会再次触发destroyClient方法，把新对象干掉
    // 如此不如直接替换，这样旧client没有被引用将会被回收机制回收（不会被回收！！）
    allClients[identity] = new Client(identity, socket);
}


/**
 * 发送命令消息
 * @Param {string} identity 唯一标识
 * @Param {string} message 消息或命令
 * @Param {function} callback 回调
 **/
module.exports.sendMsgToClient = function(identity, message, callback) {
    let client = allClients[identity];
    if(!client) return callback(ERROR.clientLost);
    let taskID = '';
    // 生产任务ID:长度为TASK_ID_STRING_LENGTH的[0-9a-z]的字符串
    for (var i = 0; i < 8; i++) taskID += Math.floor(Math.random() * 36).toString(36);
    client.exec(taskID, message, callback);
}

/**
 * 获取所有客户端标识
 * @Return {array} 返回标识数组
 **/
module.exports.getAllClients = function() {
    return Object.getOwnPropertyNames(allClients);
}


/**
 * 删除
 * @Param {string} identity 唯一标识
 **/
module.exports.destroyClient = function(identity) {
    let clientReadyToDestroy = allClients[identity];
    if(clientReadyToDestroy) {
        console.log('[TLS-MANAGER] Delete socket', identity);
        clientReadyToDestroy.destroy();
    }
    delete allClients[identity];
}


/**
 * 错误事件触发
 * @Param {string} identity 唯一标识
 * @Param {error} error
 **/
module.exports.onClientError = function(identity, error) {
    console.log('[TLS-MANAGER] Socket(', identity, ') error:');
    console.error(error);
}
