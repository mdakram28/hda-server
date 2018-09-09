import sys
import os
import json
from pprint import pprint

args = sys.argv[1:]
args = args[:args.index('-o')]

print(args, os.getcwd())

data = {}
try:
	with open('/hda/sources.json') as f:
		data = json.load(f)
		data[os.getcwd()] = args
except:
	data[os.getcwd()] = args

with open('/hda/sources.json', 'w+') as outfile:
	json.dump(data, outfile)