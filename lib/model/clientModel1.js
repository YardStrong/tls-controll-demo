/********************************************************
客户端连接封装成类
********************************************************/

const ERROR = require('../error').client.clientModel;

const STATUS = {RUNNING: 1, FREE: 0}; //用于标记状态
const WAIT_QUEUE_MAX_SIZE = 5; // 等待队列数量限制
const WAIT_TIME_OUT = 1024; // 执行队列中的最大等待时间约一秒1024ms
// 消息等待时间约1024ms[每次读取时间(32ms)x循环次数(32)]
const READ_INTERVAL_TIME = 32, READ_INTERVAL_TIMES = 32;
const DATA_CACHE_MAX_SIZE = 2048;

/**
 * 构造函数
 * 
 * @param {string} identity 
 * @param {object} socket 
 */
function Client(identity, socket) {
    this.identity = identity;
    this._status = STATUS.FREE;
    this._socket = socket;
    this._socket.setMaxListeners(10);
    this._socket.on('data', this._onData.bind(this));
    this._execQueue = new Array();
    this._dataCache = '';
}

/**
 * socket事件'data'
 * @Param {string} data 数据
 */
Client.prototype._onData = function(data) {
    if(this._dataCache.length > DATA_CACHE_MAX_SIZE || 
        data.length > DATA_CACHE_MAX_SIZE) {
        return;
    }
    this._dataCache += data;
}


/**
 * 任务调度：
 * 1. 任务线序执行；
 * 2. socket空闲则直接执行；
 * 3. socket工作中则任务入队列，等待当前任务执行结束后顺序执行；
 * 4. 任务限时等待，避免等待时间太长。
 *
 * @Param {string} taskID 任务ID
 * @Param {string} message 消息
 * @Param {function} callback 返回
 **/
Client.prototype.exec = function(taskID, message, callback) {
    if(this._socket == null) return callback(ERROR.socketLost);
    // 当前状态空闲，直接执行
    if(this._execQueue.length == 0 && this._status == STATUS.FREE) {
        console.log('>> Task[', taskID, '] exec directly');
        this._sendCMD(taskID, message, callback);
        return;
    }
    // 当前等待队列任务多
    if(this._execQueue.length >= WAIT_QUEUE_MAX_SIZE) {
        return callback(ERROR.socketBusy);
    }
    var _waitTimeout = function() {
        this._execQueue.shift();
        callback(ERROR.waitTimeout);
    }
    console.log('>> Task[', taskID, '] enter queue');
    // 入等待队列
    this._execQueue.push({
        waitTimer: setTimeout(_waitTimeout.bind(this), WAIT_TIME_OUT),
        taskID: taskID,
        message: message,
        callback: callback
    });

}


/**
 * 执行下一条任务，并清除限时等待定时器
 */
Client.prototype._execNext = function() {
    let task = this._execQueue.shift();
    if(!task) {
        console.log('>> Task empty; return; ');
        return;
    }
    console.log('>> Task[', task, '] is the next');
    if(task.waitTimer == null || task.taskID == null || 
        task.message == null || task.callback == null) {
        return console.log("[Socket-Task-Err] Task Info:", task);
    }
    clearTimeout(task.waitTimer);
    this._sendCMD(task.taskID, task.message, task.callback);
}


/**
 * 立即发送，并限时等待消息返回
 * 执行过程发生错误需要修改任务状态并尝试执行下一条命令
 * 
 * @Param {string} taskID 任务ID
 * @Param {string} message 消息
 * @Param {function} callback 返回
 */
Client.prototype._sendCMD = function(taskID, message, callback) {
    if(this._socket == null) {
        this._status = STATUS.FREE;
        callback(ERROR.socketLost);
        return this._execNext();
    }
    this._status = STATUS.RUNNING;


    var msgPrefix = taskID + '-start';
    var msgSuffix = taskID + '-end';

    console.log('>> Send --', msgPrefix + ' ' + message + ' ' + msgSuffix);
    this._socket.write(msgPrefix + ' ' + message + ' ' + msgSuffix);
    this._waitResult(taskID, callback);
}

/**
 * 等待消息返回
 * 
 * @Param {string} taskID 任务ID
 * @Param {function} callback 返回
 */
Client.prototype._waitResult = function(taskID, callback) {
    this._dataCache = "";
    var deadlineTimes = READ_INTERVAL_TIMES;
    var resultPattern = new RegExp (taskID + '-start([\\s\\S]+?)' + taskID + '-end','im');
    function _tryToRead(deadline) {
        console.log('>> Deadline times:', deadline);
        if(deadline == 0) {
            callback(ERROR.execTimeout);
            this._status = STATUS.FREE;
            return this._execNext();
        }
        console.log('>> dataCache:', this._dataCache);
        let realData = this._dataCache.match(resultPattern);
        if(!realData) return setTimeout(_tryToRead.bind(this, deadlineTimes--), READ_INTERVAL_TIME);
        callback(null, realData[1]);
        this._status = STATUS.FREE;
        this._execNext();
    }
    setTimeout(_tryToRead.bind(this, deadlineTimes), READ_INTERVAL_TIME);
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