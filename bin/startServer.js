const http = require('http');
const tls = require('tls');
const net = require('net');
const path = require('path');
const fs = require('fs');
const tlsServerApp = require('../lib/app/tlsServerApp');
const httpServerApp = require('../lib/app/httpServerApp');
const replServerApp = require('../lib/app/replServerApp');
const TLS_SERVER_PORT = 8091;
const HTTP_SERVER_PORT = 8090;
const REPL_SERVER_PORT = 8092;


/********************************  tls-server  ********************************/
var tlsServer = tls.createServer({
    key: fs.readFileSync(path.join(__dirname, '../keys/server-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../keys/server-cert.pem')),
    ca: [ fs.readFileSync(path.join(__dirname, '../keys/server-cert.pem')) ],
    requestCert: true,
    rejectUnauthorized: false
}, tlsServerApp);
tlsServer.listen(TLS_SERVER_PORT, function() {
    console.log('[TLS-SOCKET-LOG] TLS Server started at port:', TLS_SERVER_PORT);
});
tlsServer.on('error', function(error) {
    console.log('[TLS-SERVER-ERR] :');
    console.dir(error);
});


/********************************  http-server  ********************************/
let httpServer = http.createServer(httpServerApp).listen(HTTP_SERVER_PORT);
httpServer.on('listening', function() {
    console.log('[HTTP-SERVER-LOG] Http Server started at port:', HTTP_SERVER_PORT);
});
httpServer.on('error', function(error) {
    console.log('[HTTP-SERVER-ERR] :');
    console.dir(error);
});


/********************************  repl-server  ********************************/
let replServer = net.createServer(replServerApp).listen(REPL_SERVER_PORT);
replServer.on('listening', function() {
    console.log('[REPL-SERVER-LOG] REPL Server started at port:', REPL_SERVER_PORT);
});
replServer.on('error', function(error) {
    console.log('[REPL-SERVER-ERR] :');
    console.dir(error);
});
