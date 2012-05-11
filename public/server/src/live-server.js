#!/usr/bin/env node

var spawn = require('child_process').spawn;
var WebSocketServer = require('node_modules/websocket/lib/WebSocketServer');
var http = require('http');
var url = require('url');
var fs = require('fs');
var WSConnection = null;
var clientID = 1;

var args = {
    /* defaults */
    port: '8001'
};

/* Parse command line options */
var pattern = /^--(.*?)(?:=(.*))?$/;
process.argv.forEach(function (value) {
    var match = pattern.exec(value);
    if (match) {
        args[match[1]] = match[2] ? match[2] : true;
    }
});

var port = parseInt(args.port, 10);

debugLiveServer("WebSocket-Node: live-server");
debugLiveServer("Usage: ./live-server.js [--port=8001]");

var server = http.createServer(function (request, response) {
    debugLiveServer((new Date()) + " Received request for " + request.url);
    response.writeHead(404);
    response.end();
});

server.listen(port, function () {
    debugLiveServer((new Date()) + " Server is listening on port " + port);
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: true,
    maxReceivedFrameSize: 64 * 1024 * 1024, // 64MiB
    maxReceivedMessageSize: 64 * 1024 * 1024, // 64MiB
    fragmentOutgoingMessages: false,
    keepalive: true,
    disableNagleAlgorithm: false
});

wsServer.on('connect', function (connection) {
    debugLiveServer((new Date()) + " Connection accepted - Protocol Version " + connection.webSocketVersion);

    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            debugLiveServer("Received utf-8 message of " + message.utf8Data.length + " characters.");
            debugLiveServer("Client sent [" + message.utf8Data + "]");

            var raw_json = JSON.parse(message.utf8Data);
            handleClientRequest(connection, raw_json);

            clientID++;
        } else if (message.type === 'binary') {
            debugLiveServer("Received Binary Message of " + message.binaryData.length + " bytes");
            connection.sendBytes(message.binaryData);
        }
    });

    connection.on('close', function (reasonCode, description) {
        debugLiveServer((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
    });
});

function handleClientRequest(connection, client_json) {
    debugLiveServer("Client[" + clientID + "] request type[" + client_json.t + "]");

    var client_request = spawn("/usr/bin/tail", ["-f", client_json.d]);

    client_request.stdout.on('data', function (data) {
        connection.sendUTF(data);
        debugLiveServer('Client[' + clientID + '] stdout::' + data);
    });

    client_request.stderr.on('data', function (data) {
        connection.sendUTF(data);
        debugLiveServer('Client[' + clientID + '] stderr: ' + data);
    });
}

function debugLiveServer(msg) {
    console.log("Live-S:[" + new Date() + "]:" + msg);
}