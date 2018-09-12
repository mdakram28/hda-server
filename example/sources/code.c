#include <stdio.h>
#include <stdlib.h>
#include "logger.h"

void add(int **a, int **b, int r, int c)
{
	int i, j;

	for (i = 0; i < r; i++)
	{
		for (j = 0; j < c; j++)
		{
			a[i][j] = a[i][j] + b[i][j];
		}
	}
}

int main()
{

	int n = 100, rows, cols, i, j, **a, **b;
	usleep(200000);
	while (n != 0)
	{
		usleep(200000);
		scanf("%d", &rows);
		scanf("%d", &cols);
		if(0)
		{
			printf("fkhdbf");
		}
		a = malloc(rows * sizeof(int *));
		b = malloc(rows * sizeof(int *));
		usleep(200000);
		// for each row allocate cols int
		for (i = 0; i < rows; i++)
		{
			a[i] = malloc(cols * sizeof(int));
		}
		usleep(200000);
		for (i = 0; i < rows; i++)
			b[i] = malloc(cols * sizeof(int));

		usleep(200000);
		for (i = 0; i < rows; i++)
		{
			for (j = 0; j < cols; j++)
			{
				int num = (rand() %
						   (9999 - 1 + 1)) +
						  1;
				usleep(20000);
				a[i][j] = num;
			}
		}

		for (i = 0; i < rows; i++)
		{
			for (j = 0; j < cols; j++)
			{
				int num = (rand() %
						   (9999 - 1 + 1)) +
						  1;
				usleep(20000);
				b[i][j] = num;
			}
		}

		usleep(200000);
		add(a, b, rows, cols);

		usleep(200000);
		for (i = 0; i < rows; i++)
		{
			for (j = 0; j < cols; j++)
			{
				printf("%d ", a[i][j]);
			}
			usleep(200000);
			printf("\n");
		}
		usleep(200000);
		free(a);
		usleep(200000);
		free(b);
		usleep(200000);
		n--;
	}

	return 0;
}