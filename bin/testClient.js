const tls = require('tls');
const path = require('path');
const fs = require('fs');
const tlsClientApp = require('../lib/app/tlsClientApp');
// 111.231.17.213
const TLS_SERVER_HOST = '127.0.0.1', TLS_SERVER_PORT = 8091;
const TLS_CLIENT_IDENTITY = 'id000001';

var socket = tls.connect({
    host: TLS_SERVER_HOST,
    port: TLS_SERVER_PORT,
    key: fs.readFileSync(path.join(__dirname, '../keys/server-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../keys/server-cert.pem')),
    ca: [ fs.readFileSync(path.join(__dirname, '../keys/server-cert.pem')) ],
    // key: fs.readFileSync(path.join(__dirname, '../keys/client-key.pem')),
    // cert: fs.readFileSync(path.join(__dirname, '../keys/client-cert.pem')),
    // ca: [ fs.readFileSync(path.join(__dirname, '../keys/server-cert.pem')) ],
    rejectUnauthorized: false
}, function() {
    socket.setEncoding('utf-8');
    socket.write(TLS_CLIENT_IDENTITY);
    console.log('[TLS-CLIENT-LOG] Connect to server(127.0.0.1:8091)');
});

socket.on('data', tlsClientApp.bind(this, socket));

socket.on('end', function() {
    console.log('[TLS-CLIENT-LOG] Disconnect from server(127.0.0.1:8091)');
});

socket.on('error', function(error) {
    console.log('[TLS-CLIENT-ERR] Error appeared:');
    console.error(error);
});
