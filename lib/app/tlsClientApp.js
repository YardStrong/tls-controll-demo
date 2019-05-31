let app = function(socket, message) {
    // console.log('Message--> ', message);
    // socket.write(message);
    // return;
    // 解析收到的信息
    console.log('Message-- ', message);
    let taskIDSize  = message.indexOf('-start');
    var taskID = message.substring(0, taskIDSize);
    console.log('>> TaskID:', taskID);
    message = message.substring(taskIDSize + 6, message.length - 4 - taskIDSize);
    socket.returnMsg = function(returnMsg) {
        console.log('>> Socket.write:', taskID + '-start' + returnMsg + taskID + '-end');
        socket.write(taskID + '-start' + returnMsg + taskID + '-end');
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
            socket.returnMsg('undefine');
        }
    }
}

module.exports = app;
