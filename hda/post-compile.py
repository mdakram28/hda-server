import sys
import os
import json
from pprint import pprint

args = sys.argv[1:]
targetFile = args[args.index('-o')+1]
fileName = targetFile;

if targetFile.index('/') >= 0:
	fileName = targetFile[targetFile.index('/')+1:]

subprocess.call(['scp', targetFile, "pi@192.168.43.249:/home/pi/target/"+fileName]