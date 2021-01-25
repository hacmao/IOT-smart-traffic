#include <stdio.h> 
#include <netdb.h> 
#include <netinet/in.h> 
#include <stdlib.h> 
#include <string.h> 
#include <sys/socket.h> 
#include <sys/types.h> 
#include <unistd.h>
#include <arpa/inet.h>
#define MAX 400
#define SA struct sockaddr 

int create_socket(int port) { 
    int sockfd, connfd, len; 
    struct sockaddr_in servaddr, cli; 
  
    // socket create and verification 
    sockfd = socket(AF_INET, SOCK_STREAM, 0); 
    if (sockfd == -1) { 
        printf("socket creation failed...\n"); 
        exit(0); 
    } 
    else
        printf("Socket successfully created..\n"); 
    bzero(&servaddr, sizeof(servaddr)); 
  
    // assign IP, PORT 
    servaddr.sin_family = AF_INET; 
    servaddr.sin_addr.s_addr = htonl(INADDR_ANY); 
    servaddr.sin_port = htons(port); 
  
    // Binding newly created socket to given IP and verification 
    if ((bind(sockfd, (SA*)&servaddr, sizeof(servaddr))) != 0) { 
        printf("socket bind failed...\n"); 
        exit(0); 
    } 
    else
        printf("Socket successfully binded..\n"); 
  
    // Now server is ready to listen and verification 
    if ((listen(sockfd, 5)) != 0) { 
        printf("Listen failed...\n"); 
        exit(0); 
    } 
    else
        printf("Server listening..\n"); 
    len = sizeof(cli); 
  
    // Accept the data packet from client and verification 
    connfd = accept(sockfd, (SA*)&cli, &len); 
    if (connfd < 0) { 
        printf("server acccept failed...\n"); 
        exit(0); 
    } 
    else 
        printf("server acccept the client...\n"); 
    return connfd; 
}

int create_connect(int port) {
    int sock = 0, valread;
    struct sockaddr_in serv_addr;
    char *hello = "Hello from client";
    char buffer[1024] = {0};
    if ((sock = socket(AF_INET, SOCK_STREAM, 0)) < 0)
    {
        printf("\n Socket creation error \n");
        return -1;
    }

    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(port);

    // Convert IPv4 and IPv6 addresses from text to binary form
    if(inet_pton(AF_INET, "127.0.0.1", &serv_addr.sin_addr)<=0)
    {
        printf("\nInvalid address/ Address not supported \n");
        return -1;
    }

    if (connect(sock, (struct sockaddr *)&serv_addr, sizeof(serv_addr)) < 0)
    {
        printf("\nConnection Failed \n");
        return -1;
    }
    return sock; 
}

void pwnme(){
	puts("pwned");
	system("/bin/sh");
}

void func(int sockfd)
{
    char buff[0x40];
    char authen[1]; 
    char token[] = "ef19530563f3c7ded2047b3dbd23547b"; 
    int n;


    // infinite loop for chat
    for (;;) {
	bzero(buff, 0x40);
        // read the message from client and copy it in buffer
        recv(sockfd, buff, 0x80, 0);
	puts(buff);
        if (!strncmp(buff, token, strlen(buff))) {
		authen[0] = 0x1; 
	} else {
		authen[0] = 0x0; 
	}

        n = 0;
        // copy server message in the buffer

        // and send that buffer to client
        send(create_connect(9999), authen, sizeof(authen), 0);
	send(sockfd, authen, sizeof(authen), 0);

        // if msg contains "Exit" then server exit and chat ended.
	
        if (authen[0] == 0x1) {
            printf("Server Exit...\n");
            break;
        }
    }
}

int main() {
	int sockfd = create_socket(8888);
	printf("FD : %d \n", sockfd);
    	func(sockfd);
	return 0; 	

}
