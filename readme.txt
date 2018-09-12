[ Note: The following instructions have been tested on kubuntu 17.04 distro ]

## Installation
1. Install nodejs
2. Install npm
3. Run ./install.sh

## Usage


1. Run hda-server
	1.1 Run 'npm start' in 'hda-server' directory

2. Run hda
	2.1 Run 'npm start' in 'hda' directory
	2.2 The web app will run at 'http://localhost:3002/'

-------------------------------------------------------------------------------------------------------------------
3. For Remote Machine
	3.1. Compile source code
		3.1.1. Run 'compile sourcefile.c -o /target/location/targetfile -DHOST='"127.0.0.1"''
		       [ Note : Replace '127.0.0.1' by your external ip address when running compiling for remote machine ]
		       [ Note : Replace 'compile' by 'compile-arm' for compiling for raspberry pi ]
	3.2. Copy source code in remote machine if needed
		3.2.1. scp /target/location/targetfile pi@192.168.123.123:~/target/targetfile
		       [ Note : Replace '/target/location/targetfile' by your binary file ]
		       [ Note : Replace '192.168.123.123' by raspberry pi ip address ]
		       [ Note : Replace '~/target/targetfile' by remote binary file location you want save into ]
	3.3. Run
		3.3.1. Run 'ssh pi@<rpi ip address>'
		3.3.2. Run 'cd <target/file/location>'
		3.3.3. Run 'export GCOV_PREFIX_STRIP=10'
		3.3.4. Run './targetfile'
-------------------------------------------------------------------------------------------------------------------
4. For Local machine
	4.1. Compile source code
		4.1.1. Run 'compile sourcefile.c -o /target/location/targetfile'
		       [ Note : Replace 'compile' by 'compile-arm' for compiling for raspberry pi ]
	4.2. Run
		4.2.1. Run 'cd <target/file/location>'
		4.2.2. Run 'export GCOV_PREFIX_STRIP=10'
		4.2.3. Run './targetfile'
-------------------------------------------------------------------------------------------------------------------