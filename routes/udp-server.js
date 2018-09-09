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

function getProgress(stdout) {
	files = stdout.toString().match(/'(\w+\.)+(c|h)'/g).map(function(f) {return f.replace(/'/g, "")});
	percent = stdout.toString().match(/\d+\.\d+% of \d+/g);
	var ret = {}
	for(var i=0;i<files.length;i++) {
		ret[files[i]] = {
			percent: parseFloat(percent[i].substring(0,percent[i].indexOf("%"))),
			total: parseFloat(percent[i].substring(percent[i].indexOf("of ")+3)),
		}
	}
	// console.log(ret);
	return ret;
}

module.exports = function (onReceiveFile, store) {

	var server = udp.createSocket('udp4');

	// emits when any error occurs
	server.on('error', function (error) {
		console.log('Error: ' + error);
		server.close();
	});
	var i = 0;
	// var memBuf = new Buffer();
	// emits on new datagram msg
	server.on('message', function (msg, info) {
		var tokens = msg.toString().split("\n");
		// console.log(tokens);
		var fileName = tokens[0];
		var file = new Buffer(msg.length - 40);
		msg.copy(file, 0, 40);
		var sourceDir = getSourceFolder(store.sources, fileName);
		console.log(sourceDir);
		var timeReceived = new Date().getTime();
		// console.log(msg.toString().substring(20, 50));
		var memoryUsage = parseInt(msg.toString().substring(20).split("\n")[0]);
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
					sourceFiles[fileName].time = timeReceived;
					sourceFiles[fileName].memory = memoryUsage;
					sourceFiles[fileName].progress = getProgress(stdout);
					onReceiveFile(sourceDir.file, sourceFiles[fileName]);
					store.timeline[sourceDir.file] = store.timeline[sourceDir.file] || {};
					store.timeline[sourceDir.file][timeReceived] = sourceFiles[fileName];
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