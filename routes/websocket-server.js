var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function (request, response) {});
server.listen(3001, function () {});

wsServer = new WebSocketServer({
	httpServer: server
});

var fileListeners = {};

function onRegister(connection, data) {
	fileListeners[data.filename] = fileListeners[data.filename] || [];
	if(fileListeners[data.filename].indexOf(connection) == -1) {
		fileListeners[data.filename] = [connection];
		console.log("Registered");
	}
}

function removeAll(connection) {
	for(var filename in fileListeners) {
		// console.log(fileListeners[filename]);
		fileListeners[filename] = fileListeners[filename].filter(function(connection2) {
			return connection !== connection2;
		});
	}
}

wsServer.on('request', function (request) {
	var connection = request.accept(null, request.origin);

	connection.on('message', function (message) {
		if (message.type === 'utf8') {
			var json = JSON.parse(message.utf8Data);
			// console.log(json);
			switch (json.type) {
				case "register": onRegister(connection, json);
					break;
			}
		}
	});

	connection.on('close', function (connection) {
		removeAll(connection);
	});
});

module.exports.onReceiveFile = function (filename, content) {
	if(fileListeners[filename]){
		// console.log(fileListeners[filename]);
		fileListeners[filename].forEach(function(connection) {
			console.log("Sent")
			connection.send(JSON.stringify(content));
		});
	}
}

module.exports.init = function(store) {

}