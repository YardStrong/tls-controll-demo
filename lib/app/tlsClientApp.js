let app = function(socket, message) {
    // 解析收到的信息
    let taskIDSize  = message.indexOf('-START');
    var taskID = message.substring(0, taskIDSize);
    message = message.substring(taskIDSize + 6, message.length - 4 - taskIDSize);
    socket.returnMsg = function(returnMsg) {
        socket.write(taskID + '-START' + returnMsg + 'END-' + taskID);
    }

    switch (message) {
        case 'time1': {
            setTimeout(function () {
                socket.returnMsg('time1');
            }, 256);
            break;
        }
        case 'time2': {
            setTimeout(function () {
                socket.returnMsg('time2');
            }, 512);
            break;
        }
        case 'time3': {
            setTimeout(function () {
                socket.returnMsg('time3');
            }, 768);
            break;
        }
        case 'time4': {
            setTimeout(function () {
                socket.returnMsg('time4');
            }, 1024);
            break;
        }
        case 'time5': {
            setTimeout(function () {
                socket.returnMsg('time5');
            }, 1280);
            break;
        }
        default: {
            socket.returnMsg('default');
        }
    }
}

module.exports = app;
