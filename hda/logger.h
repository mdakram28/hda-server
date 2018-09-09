#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <sys/types.h>
#include <unistd.h>
#include <time.h>
#include <pthread.h>
#include <netdb.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <errno.h>
#include <sys/uio.h>
#include <string.h>
#include <stdarg.h>
#include <dirent.h>

#define delay_in_seconds 1

void __gcov_flush(void);

clock_t start, stop;
int fd;
struct addrinfo *res = 0;
char buffer[10000];
FILE *fptr;

void run_coverage()
{
	// Create gcno file
	__gcov_flush();
	// system("gcov fib.c -m -b >> coverage.log &>> coverage.err.log");
}

void setup_udp()
{
	const char *hostname = "127.0.0.1"; /* localhost */
	const char *portname = "5000";
	struct addrinfo hints;
	memset(&hints, 0, sizeof(hints));
	hints.ai_family = AF_UNSPEC;
	hints.ai_socktype = SOCK_DGRAM;
	hints.ai_protocol = 0;
	hints.ai_flags = AI_ADDRCONFIG;
	int err = getaddrinfo(hostname, portname, &hints, &res);
	if (err != 0)
	{
		fprintf(stderr, "failed to resolve remote socket address (err=%d)", err);
	}

	fd = socket(res->ai_family, res->ai_socktype, res->ai_protocol);
	if (fd == -1)
	{
		fprintf(stderr, "%s", strerror(errno));
	}
}

void delete_file(char *fileName)
{
	int status;
	status = remove(fileName);

	if (status != 0)
	{
		printf("Unable to delete the file\n");
		perror("Error");
	}
}

void delete_gcda_files() {
	struct dirent *de;
	DIR *dir = opendir(".");
	while ((de = readdir(dir)) != NULL)
	{
		char *dot = strrchr(de->d_name, '.');
		if (dot && !strcmp(dot, ".gcda"))
		{
			delete_file(de->d_name);
		}
	}
	// printf("sadsadsa------------d");;
	closedir(dir);
}

char *get_gcda_filename()
{
	struct dirent *de;
	DIR *dir = opendir(".");
	while ((de = readdir(dir)) != NULL)
	{
		char *dot = strrchr(de->d_name, '.');
		if (dot && !strcmp(dot, ".gcda"))
		{
			return de->d_name;
		}
	}
	closedir(dir);
	return 0;
}

void *probe_thread2(void *vargp)
{
	char *gcda_filename;
	run_coverage();
	sleep(1);
	gcda_filename = get_gcda_filename();
	setup_udp();
	while (1)
	{
		run_coverage();
		system(strcat(strcat("cat ", gcda_filename), " | nc -u 127.0.0.1 5000"));
		sleep(1);		
	}
}

void *probe_thread(void *vargp)
{
	char *gcda_filename;
	int size;
	delete_gcda_files();
	run_coverage();
	// sleep(1);
	gcda_filename = get_gcda_filename();
	printf("%s", gcda_filename);
	strcpy(buffer, gcda_filename);
	if(gcda_filename != 0){
		buffer[strlen(gcda_filename)] = '\n';
	}
	setup_udp();

	while (1)
	{
		start = clock();
		run_coverage();
		fptr = fopen(gcda_filename, "r");
		if (fptr == NULL)
		{
			printf("Cannot open file \n");
			exit(0);
		}
		size = fread(buffer + 20, sizeof(buffer) -  20, 1, fptr);
		fseek(fptr, 0L, SEEK_END);
		size = ftell(fptr);
		// printf("%s\n", buffer);
		if (sendto(fd, buffer, size + 20, 0, res->ai_addr, res->ai_addrlen) == -1)
		{
			fprintf(stderr, "%s", strerror(errno));
		}
		fclose(fptr);
		stop = clock();
		// printf("signal time : %6.3f\n", (double)(stop - start) * 1000000 / CLOCKS_PER_SEC);
		usleep(1000000);
	}
}

void __attribute__((constructor)) setup()
{
	pthread_t thread_id;

	setbuf(stdout, NULL);
	pthread_create(&thread_id, NULL, probe_thread, NULL);

	// printf("Probe setup complete for %s\n", __FILE__);
}
