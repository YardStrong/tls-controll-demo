/*****************************************************
加载配置文件
*****************************************************/

/****************** requires & define ******************/
const defConfig = {
    app: {
        name: 'node-cloud-socket-demo',
        version: '0.0.1',
        port: process.env.PORT || 3000,
    },
    ACTIVE_MODE: process.env.ACTIVE_MODE || 'dev'
};
var config = null;

/********************* functions *********************/
// 加载配置
function loadConfig() {
    // 对象深拷贝 -- 完整式拷贝
    config = JSON.parse(JSON.stringify(defConfig));

    console.log('[SERVER-LOG]', 'Active mode:', config.ACTIVE_MODE, ' |  Active profile: conf-' + config.ACTIVE_MODE);
    let config_mode = null;

    try {
        config_mode = require('./conf-' + config.ACTIVE_MODE);
    } catch(error) {
        console.log('[SERVER-ERR]', 'Can not read profile: conf-' + config.ACTIVE_MODE);
        return config;
    }

    // 对象覆盖式拷贝
    objectCoverCopy(config_mode, config);
    function objectCoverCopy(fromObj, toObj) {
        for(let attribute in fromObj) {
            if(typeof(fromObj[attribute]) != 'object') {
                toObj[attribute] = fromObj[attribute];
            } else {
                if(typeof(toObj[attribute]) != 'object') toObj[attribute] = {};
                objectCoverCopy(fromObj[attribute], toObj[attribute]);
            }
        }
    }

    return config;
}

// 获取缓存配置
function getConfig() {
    if(config == null) return loadConfig();
    return config;
}



/********************* exports *********************/
module.exports.getConfig = getConfig;
