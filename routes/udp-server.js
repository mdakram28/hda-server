var udp = require('dgram');
var parser = require("./parser");
var fs = require('fs');
var exec = require('child_process').exec;
var path = require('path');

const GCDA_START_OFFSET = 100;
const PACKET_INFO_START = 40;

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
	if(!percent)return ret;
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
	var process_info_buffer = new Buffer(PACKET_INFO_START);
	var packet_info_buffer = new Buffer(GCDA_START_OFFSET - PACKET_INFO_START);
	server.on('message', function (msg, info) {
		var timeReceived = new Date().getTime();
		
		// get process stats
		msg.copy(process_info_buffer, 0, 0);
		var process_stats_tokens = process_info_buffer.toString().split(";");
		var fileName = process_stats_tokens[0];
		var startTime = process_stats_tokens[1];
		var processId = process_stats_tokens[2];
		var sourceDir = getSourceFolder(store.sources, fileName);
		var runId = sourceDir.file+"-"+startTime+"-"+processId;
		if(!sourceDir) {
			console.log("Received packet from unknown source : "+ fileName);
			return;
		}

		// get resource stats
		msg.copy(packet_info_buffer, 0, PACKET_INFO_START);
		var packet_info_tokens = packet_info_buffer.toString().split(";");
		var memoryUsage = parseInt(packet_info_tokens[0]);

		// get file
		var file = new Buffer(msg.length - GCDA_START_OFFSET);
		msg.copy(file, 0, GCDA_START_OFFSET);
		var wstream = fs.createWriteStream(path.join(sourceDir.dir , fileName).toString());
		var covFile = path.join(sourceDir.dir , sourceDir.file + ".gcov").toString();
		wstream.write(file);

		console.log(' Received %d bytes from %s:%d %s\n', msg.length, info.address, info.port, runId);
		wstream.end();
		exec("cd " + sourceDir.dir + "; rm *.gcov; gcov "+sourceDir.file+" -m;", function (error, stdout, stderr) {
			// console.log(error);
			// console.log(stdout);
			// console.log(stderr);
			fs.readFile(covFile, function (err, data) {
				if (err) console.log(err);
				else {
					var content = parser.parse_coverage(data.toString());
					content.time = timeReceived;
					content.memory = memoryUsage;
					content.progress = getProgress(stdout);
					content.runId = runId;
					content.startTime = startTime;
					content.source = sourceDir.dir;
					onReceiveFile(sourceDir.file, runId, content);
					store.timeline[sourceDir.file] = store.timeline[sourceDir.file] || {};
					store.timeline[sourceDir.file][runId] = store.timeline[sourceDir.file][runId] || {};
					store.timeline[sourceDir.file][runId][timeReceived] = content;
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