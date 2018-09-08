var udp = require('dgram');
var parser = require("./parser");
var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');

var sourceFiles = {};

// --------------------creating a udp server --------------------

// creating a udp server

function getSourceFolder(sources, fileName) {
	for(var source in sources) {
		for(var file in sources[source]){
			file = sources[source][file];
			if(file.substring(0, file.lastIndexOf(".")) == fileName.substring(0, file.lastIndexOf("."))){
				return {
					dir: source,
					file: file
				}
			}
		}
	}
}

module.exports = function (onReceiveFile, store) {

	var server = udp.createSocket('udp4');

	// emits when any error occurs
	server.on('error', function (error) {
		console.log('Error: ' + error);
		server.close();
	});
	var i = 0;
	// emits on new datagram msg
	server.on('message', function (msg, info) {
		var fileName = msg.toString().split("\n")[0];
		var file = new Buffer(msg.length - 20);
		msg.copy(file, 0, 20);
		var sourceDir = getSourceFolder(store.sources, fileName);
		// console.log(sourceDir);
		// console.log("File size: "+file.length +"/"+msg.length);
		// console.log(JSON.stringify(fileName));
		// msg = msg.toString().replace(/\n*\u0000*$/, "");
		// fs.writeFile(, file,)
		var wstream = fs.createWriteStream(path.join(sourceDir.dir , fileName).toString());
		var covFile = path.join(sourceDir.dir , sourceDir.file + ".gcov").toString();
		wstream.write(file);
		// console.log('Data received from client : ' + JSON.stringify(parser.parse_coverage(msg), null, 4));
		console.log(Math.random() + ' Received %d bytes from %s:%d\n', msg.length, info.address, info.port);
		wstream.end();
		exec("cd " + sourceDir.dir + "; rm *.gcov; gcov "+sourceDir.file+" -m;", function (error, stdout, stderr) {
			// console.log(error);
			// console.log(stdout);
			// console.log(stderr);
			fs.readFile(covFile, function (err, data) {
				if (err) console.log(err);
				else {
					sourceFiles[fileName] = parser.parse_coverage(data.toString());
					onReceiveFile(sourceDir.file, sourceFiles[fileName]);
				}
			});
		});
	});

	//emits when socket is ready and listening for datagram msgs
	server.on('listening', function () {
		var address = server.address();
		var port = address.port;
		var family = address.family;
		var ipaddr = address.address;
		console.log('Server is listening at port ' + port);
		console.log('Server ip :' + ipaddr);
		console.log('Server is IP4/IP6 : ' + family);
	});

	//emits after the socket is closed using socket.close();
	server.on('close', function () {
		console.log('Socket is closed !');
	});

	server.bind(5000);

}