var express = require('express');
var router = express.Router();
var fs = require("fs");

var store = {
	sources: {},
	timeline: {}
};

store.sources = require("../hda/sources.json");
fs.watchFile('../hda/sources.json', (curr, prev) => {
	store.sources = require("../hda/sources.json");
});

var websocketServer = require("./websocket-server");
var udpServer = require("./udp-server")(websocketServer.onReceiveFile, store);

websocketServer.init(store);

/* GET home page. */
router.get('/', function (req, res, next) {
	res.json({
		status: "Working"
	});
});

router.get("/sources", function(req,res) {
	res.json(Object.keys(store.sources));
});

router.get("/files", function(req,res) {
	var source = req.query.source;
	console.log(source, store.sources[source]);
	res.json(store.sources[source]);
});

router.get("/timeline", function(req,res) {
	var file = req.query.file;
	var runId = req.query.runId;
	return res.json(store.timeline[file][runId]);
});

module.exports = router;