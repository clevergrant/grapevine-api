# grapevine-api
This will handle all the socket.io functionality and run the game so it can speak to multiple devices.

# Summary of network traffic:

|No.	|            Server           	|     Client    	|          Player          	|
| 1 	|:---------------------------:	|:-------------:	|:------------------------:	|
| 2 	|                             	|      Host     	|                          	|
| 3 	|         Set up Game         	|               	|                          	|
| 4 	|      *C* Send Game Code     	|               	|                          	|
| 5 	|                             	|   Show Code   	|                          	|
| 6 	|                             	|               	| *S* Send name, room code 	|
| 7 	|          Add Player         	|               	|                          	|
| 8 	| *C* Send player name, color 	|               	|                          	|
| 9 	|                             	|  Show Player  	|                          	|
| 10	|                             	|   Start Game  	|                          	|
| 11	|      *P* Send Questions     	|               	|                          	|
| 12	|                             	|               	|     *S* Send Answers     	|
| 13	|        Store answers        	|               	|                          	|
| 14	|    *P* *C* Send Q's, A's    	|               	|                          	|
| 15	|                             	|  Show Q, A's  	|        Show Q, A's       	|
| 16	|                             	|               	|       *S* Send Vote      	|
| 17	|        Adjust Scores        	|               	|                          	|
| 18	|       *C* Send Scores       	|               	|                          	|
| 19	|                             	|  Show Scores  	|                          	|
| 20	|                             	| *S* Send Next 	|                          	|
| 21	|     *P* *C* Send Winner     	|               	|                          	|
| 22	|                             	|  Show Winner  	|        Show Winner       	|