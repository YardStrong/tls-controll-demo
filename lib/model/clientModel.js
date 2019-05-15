/********************************************************
客户端连接封装成类
********************************************************/

const STATUS = {RUNNING: 1, FREE: 0}; //用于标记状态
const WAIT_QUEUE_MAX_SIZE = 5; // 等待队列数量限制
const WAIT_TIME_OUT = 1024; // 执行队列中的最大等待时间约一秒1024ms
// 消息等待时间约1024ms[每次读取时间(32ms)x循环次数(32)]
const READ_INTERVAL_TIME = 32, READ_INTERVAL_TIMES = 32;
// 缓存长度简单限定，如果长度超过该值，下次将不会读数据
const READ_CACHE_SIZE = 2048;
const ERROR = require('../error').clientModel;

function Client(identity, socket) {
    this.identity = identity;
    this._socket = socket;
    this._status = STATUS.FREE;
    this._queue = [];
    this._receiveCache = '';
    this._socket.on('data', function(data) {
        // 只在有任务执行时才能保存数据
        if(this._status != STATUS.RUNNING) return;
        // 缓存数据大小限定:READ_CACHE_SIZE
        if(this._receiveCache.length > READ_CACHE_SIZE) return;
        this._receiveCache += data.toString();
    }.bind(this));
}

/**
 * 执行任务：发送消息并限时接收返回内容
 * @Param {string} taskID 任务ID
 * @Param {string} message 消息
 * @Param {function} callback 返回
 **/
Client.prototype._realExec = function(taskID, message, callback) {
    this._status = STATUS.RUNNING;
    this._receiveCache = ''; // 清理缓存数据
    // 对消息信息进行标识
    message = taskID + '-START' + message + 'END-' + taskID;
    // message → socket
    if(!this._socket) return callback(ERROR.socketLost);
    this._socket.write(message);
    // socket → lister → callback
    var realData = null; // 有效返回
    var readIntervalTimes = READ_INTERVAL_TIMES;
    // 循环读取
    function _tryingToReadData() {
        console.log('time:', readIntervalTimes, ' | msg:', this._receiveCache);
        if(readIntervalTimes-- == 0) {
            this._receiveCache = ''; // 清理缓存数据
            callback(ERROR.execTimeout); // 当前任务超时了
            return this._nextTask();
        }
        realData = this._receiveCache.match(new RegExp(taskID+'-START'+'([\\s\\S]+)'+'END-'+taskID, 'm'));
        // 返回信息为，taskID特殊字符包裹的消息
        if(realData && realData[1]) {
            this._receiveCache = ''; // 清理缓存数据
            callback(null, realData[1]);
            return this._nextTask();
        }
        setTimeout(_tryingToReadData.bind(this), READ_INTERVAL_TIME);
    }
    setTimeout(_tryingToReadData.bind(this), READ_INTERVAL_TIME);
}

/**
 * 任务调度：
 * 1. 任务线序执行
 * 2. socket空闲则直接执行
 * 3. socket工作中则任务入队列，等待当前任务执行结束后顺序执行
 * 4. 任务限时等待，避免等待时间太长
 *
 * @Param {string} taskID 任务ID
 * @Param {string} message 消息
 * @Param {function} callback 返回
 **/
Client.prototype.exec = function(taskID, message, callback) {
    // 连接不可用
    if(!this._socket) return callback(ERROR.socketLost);
    // 服务繁忙
    if(this._socket.length > WAIT_QUEUE_MAX_SIZE) return callback(ERROR.socketBusy);
    // 当前空闲
    if(this._status == STATUS.FREE) return this._realExec(taskID, message, callback);
    // 设置一个限时返回定时器，避免在等待队列中停留过多时间
    let timer = setTimeout(function () {
        this._queue.shift(); // 移除等待队列
        callback(ERROR.waitTimeout);
    }, EXEC_TIME_OUT);
    // 当前工作未结束，任务入队列，然后等待执行
    this._queue.push({taskID: taskID, message: message, callback: callback, timer: timer});
}

/**
 * 执行等待队列中的下一任务
 **/
Client.prototype._nextTask = function() {
    if(!this._queue[0]) {
        this._status = STATUS.FREE;
        return; // 队列中没有任务，则退出
    }
    let task = this._queue.shift(); // 取下一个任务
    // 消除任务限时等待定时器
    if(task.timer) clearTimeout(task.timer);
    // 执行命令
    this._realExec(task.taskID, task.message, task.callback);
}

/**
 * 直接销毁连接
 **/
Client.prototype.destroy = function() {
    // 硬销毁
    if(this._socket) {
        this._socket.destroy();
        this._socket = null;
    }
}

module.exports = Client;
