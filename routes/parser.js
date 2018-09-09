function parse_coverage(doc) {
	var lines = doc.split("\n");
	var ret = {lines: []};
	lines.forEach(line => {
		tokens = line.split(":");
		tokens[0] = tokens[0] && tokens[0].trim();
		tokens[1] = tokens[1] && tokens[1].trim();
		tokens[2] = tokens[2] && tokens[2].replace(/\t/g, " ");
		var lineNumber = parseInt(tokens[1]);
		if(lineNumber == 0) {
			ret[tokens[2].toLowerCase()] = tokens[3];
		}else{
			ret.lines[lineNumber-1] = {
				count: tokens[0],
				code: tokens[2]
			}
		}
	});

	return ret;
}

module.exports.parse_coverage = parse_coverage;