# grapevine-api
This will handle all the socket.io functionality and run the game so it can speak to multiple devices.

# Summary of network traffic:

|No.	|            Server           	|     Client    	|          Player          	|
|:-:	|:---------------------------:	|:-------------:	|:------------------------:	|
| 1 	|                             	|      Host     	|                          	|
| 2 	|         Set up Game         	|               	|                          	|
| 3 	|      *C* Send Game Code     	|               	|                          	|
| 4 	|                             	|   Show Code   	|                          	|
| 5 	|                             	|               	| *S* Send name, room code 	|
| 6 	|          Add Player         	|               	|                          	|
| 7 	| *C* Send player name, color 	|               	|                          	|
| 8 	|                             	|  Show Player  	|                          	|
| 9 	|                             	|   Start Game  	|                          	|
| 10	|      *P* Send Questions     	|               	|                          	|
| 11	|                             	|               	|     *S* Send Answers     	|
| 12	|        Store answers        	|               	|                          	|
| 13	|    *P* *C* Send Q's, A's    	|               	|                          	|
| 14	|                             	|  Show Q, A's  	|        Show Q, A's       	|
| 15	|                             	|               	|       *S* Send Vote      	|
| 16	|        Adjust Scores        	|               	|                          	|
| 17	|       *C* Send Scores       	|               	|                          	|
| 18	|                             	|  Show Scores  	|                          	|
| 19	|                             	| *S* Send Next 	|                          	|
| 20	|     *P* *C* Send Winner     	|               	|                          	|
| 21	|                             	|  Show Winner  	|        Show Winner       	|