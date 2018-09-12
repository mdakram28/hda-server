import sys
import os
import json
from pprint import pprint

script_path = (os.path.dirname(os.path.realpath(__file__)))
source_path = os.getcwd()

args = sys.argv[1:]

if len(args) == 0:
	print("Empty arguments supplied")
	exit(1)

args = " ".join(args)
args = args[:args.index(' -')].split()

data = {}
try:
	with open(script_path+'/sources.json') as f:
		data = json.load(f)
		print(data)
		if source_path in data:
			args = [arg for arg in args if (arg not in data[source_path])]
			data[source_path].extend(args)
		else:
			data[source_path] = args
except err:
	print("Error reading sources.json")
	data[os.getcwd()] = args

with open(script_path+'/sources.json', 'w+') as outfile:
	json.dump(data, outfile)