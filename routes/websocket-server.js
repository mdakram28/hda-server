var WebSocketServer = require("websocket").server;
var http = require("http");

var server = http.createServer(function(request, response) {});
server.listen(3001, function() {});

wsServer = new WebSocketServer({
    httpServer: server
});

var fileListeners = {};

var files = {};
var processListeners = [];

function removeAll(connection) {
    for (var filename in fileListeners) {
        // console.log(fileListeners[filename]);
        fileListeners[filename] = fileListeners[filename].filter(function(
            connection2
        ) {
            return connection !== connection2;
        });
    }
}

function sendProcessList() {
    processListeners.forEach(function(connection) {
        connection.send(JSON.stringify(files));
    });
}

wsServer.on("request", function(request) {
    var url = request.httpRequest.url;
    console.log("Websocket request from : %s", url);

    if (url.startsWith("/live")) {
        var connection = request.accept(null, request.origin);
        var file = url.split("/")[2];
        var runId = url.split("/")[3];

        fileListeners[runId] = fileListeners[runId] || [];
        fileListeners[runId].push(connection);

        connection.on("close", function(connection) {
            removeAll(connection);
        });
    } else if (url == "/files") {
        var connection = request.accept(null, request.origin);

        if (processListeners.indexOf(connection) == -1)
            processListeners.push(connection);

        connection.on("close", function(connection) {
            processListeners = processListeners.filter(function(connection2) {
                return connection2 !== connection;
            });
        });

        connection.send(JSON.stringify(files));
    }
});

module.exports.onReceiveFile = function(filename, runId, content) {
    files[filename] = files[filename] || {};
    if (!files[filename][runId]) {
        // New run found
        files[filename][runId] = {
			file: filename,
			runId: runId,
            source: content.source,
            running: true,
            lastPacketTime: Date.now()
        };

        var runPoller = setInterval(function() {
            // console.log((Date.now() - files[filename][runId].lastPacketTime));
            if (Date.now() - files[filename][runId].lastPacketTime > 1000) {
                files[filename][runId].running = false;
                clearInterval(runPoller);
                sendProcessList();
            }
        }, 1000);

        sendProcessList();
    } else {
        files[filename][runId].lastPacketTime = Date.now();
        if (!files[filename][runId].running) {
            files[filename][runId].running = true;
            var runPoller = setInterval(function() {
                // console.log((Date.now() - files[filename][runId].lastPacketTime));
                if (Date.now() - files[filename][runId].lastPacketTime > 1000) {
                    files[filename][runId].running = false;
                    clearInterval(runPoller);
                    sendProcessList();
                }
            }, 1000);
        }
    }

    if (fileListeners[runId]) {
        fileListeners[runId].forEach(function(connection) {
            connection.send(JSON.stringify(content));
        });
    }
};

module.exports.init = function(store) {};
