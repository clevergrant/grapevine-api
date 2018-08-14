let app = require('express')();
let http = require('http').Server(app);
var io = require('socket.io')(http);

//* SERVER

// const _PORT_ = 3001;
const PORT = 3001;

http.listen(PORT, () => {
	console.log('listening on *:' + PORT);
});

//*/

//* GAME VARIABLES

let currentGames = {};

let playerInterface = {};
let roomInterface = {};
let hostInterface = {};

//*/

//* SOCKET.IO

let idle = 0;
let currentRooms = {};

io.on('connection', socket => {
	idle++;

	socket.emit('log', 'Server connected');

	socket.on('disconnect', data => {

		// Decrement the idle counter
		idle--;

		// Log idle connections
		// console.log("Idle connections: ", idle);

		// When a Host disconnects
		if (socket.id in hostInterface) {
			const disconHost = hostInterface[socket.id];

			// console.log('NOW DELETING HOST ' + disconHost);

			// Disconnect all the players
			for (let person in currentGames[disconHost].players) {
				delete playerInterface[currentGames[disconHost].players[person].socketId];
				delete roomInterface[currentGames[disconHost].players[person].socketId];
			}

			// Delete all traces of host
			delete hostInterface[socket.id];
			delete currentGames[disconHost];
		}

		// When a player disconnects
		if (socket.id in playerInterface) {
			const disconName = playerInterface[socket.id];

			// get the room the player was in
			const disconRoom = roomInterface[socket.id];

			// get the color of the player
			const disconColor = currentGames[disconRoom].players[disconName].color;

			// Use class method removePlayer to remove the player from the game
			currentGames[disconRoom].removePlayer(disconName);

			// create an object with the info to send to the host
			let playerInfo = {
				name: disconName,
				color: disconColor
			};

			// tell the host that the player left
			socket.to(disconRoom).emit('player removed', playerInfo);

			// delete remeaining traces of player
			delete roomInterface[socket.id];
			delete playerInterface[socket.id];
		}

		// console.log('playerInterface:', playerInterface);
		// console.log('hostInterface:', hostInterface);
		// console.log('roomInterface:', roomInterface);
		// console.log('currentGames:', currentGames);

	});

	//Socket Requests

	socket.on('join room', code => {
		socket.join(code);
	});

	socket.on('request host', () => {

		// Set the game room code
		// const gameCode = makeGameCode();
		const gameCode = 'AAAA';

		// Store the game code along with the host's socket ID in the host interface object
		hostInterface[socket.id] = gameCode;

		// Get a list of questions
		let quids = getRandomOrder(8);

		let quidarr = [];

		for (let i = 0; i < quids.length / 2; i++)
			quidarr.push(quids[i]);

		quidarr = shuffle(quidarr);

		let quarr = [];

		for (let quid of quidarr)
			quarr.push(qdb[quid]);

		// Create a new game object using the game code and the new array of question IDs
		let newgame = new Game(gameCode, quarr);

		// Store the game in the currentGames array, indexed by game code
		currentGames[gameCode] = newgame;

		// secure the connection in a new room named after the game code
		socket.join(gameCode);

		// Tell the host that the game has been created
		socket.emit('host created', gameCode);

		// console.log('playerInterface:', playerInterface);
		// console.log('hostInterface:', hostInterface);
		// console.log('roomInterface:', roomInterface);
		// console.log('currentGames:', currentGames);

	});

	socket.on('request player', rp => {

		console.log(rp.name + ' wants to join ' + rp.code)

		// Create a local variable for the requested game
		let reqGame = currentGames[rp.code];

		// Update player interface and room interface
		playerInterface[socket.id] = rp.name;
		roomInterface[socket.id] = rp.code;

		// if the game exists,
		if (typeof reqGame !== 'undefined') {

			// and if the player is not already in the game,
			if (reqGame.playerNames.indexOf(rp.name) === -1) {

				// and if there's not already 8 players,
				if (reqGame.playerNames.length < 8) {

					// create a new player object
					let newPlayer = new Player(socket.id, rp.name);

					// give the new player a color and add them to the game
					reqGame.setColor(newPlayer);
					reqGame.addPlayer(newPlayer);

					// tell the client that it joined the room
					socket.emit('link', {
						code: rp.code,
						color: newPlayer.color
					});

					// join the room of the game that the player requested
					socket.join(rp.code);

					// tell the room that a new player joined
					socket.to(rp.code).emit('player joined', {
						name: newPlayer.name,
						color: newPlayer.color
					});

				} else socket.emit('refuse', 'Game is full.');

			} else socket.emit('refuse', 'Name already in use.');

		} else socket.emit('refuse', 'Game doesn\'t exist.');

		// console.log('playerInterface:', playerInterface);
		// console.log('hostInterface:', hostInterface);
		// console.log('roomInterface:', roomInterface);
		// console.log('currentGames:', currentGames);

	});

	socket.on('game start', code => {

		// get the game
		let game = currentGames[code];

		// assign 2 questions to each player
		let quids = getRandomOrder(8);

		let pid = 0;
		for (let i = 0; i < 16; i++) {
			game.players[game.playerNames[pid]].questions.push(game.questions[quids[i]]);
			pid++;
			if (i === 7) pid = 0;
		}

		//send questions to players
		for (let playerKey in game.players) {
			socket.to(game.players[playerKey].socketId)
				.emit('assign questions', game.players[playerKey].questions);
		}

	});

	socket.on('questions answered', qa => {
		currentGames[qa.code].players[qa.name].answers = qa.answers;
		socket.to(qa.code).emit('player answered', {
			color: currentGames[qa.code].players[qa.name].color
		});
	});

	socket.on('all ready', code => {
		// get the current game
		let game = currentGames[code];

		// Populate the voting round object with arrays that have questions as the key
		for (let question of game.questions)
			game.voteRound[question] = [];

		// Add all the answers to the appropriate questions
		for (let playerKey in game.players) {
			game.voteRound[game.players[playerKey].questions[0]].push({
				name: game.players[playerKey].name,
				color: game.players[playerKey].color,
				answer: game.players[playerKey].answers[0]
			});
			game.voteRound[game.players[playerKey].questions[1]].push({
				name: game.players[playerKey].name,
				color: game.players[playerKey].color,
				answer: game.players[playerKey].answers[1]
			});
		}

		// Send for the votes for each questions' answers
		askQuestion(
			socket,
			{
				code: code,
				question: game.questions[0],
				answers: game.voteRound[game.questions[0]],
				round: 0
			}
		);
	});

	socket.on('player vote', pv => {
		currentGames[pv.code].players[pv.name].points++;

		// TODO:
		// give 20 points to winning answer per player who voted for their answer
		// give 10 points to losing answer per player who voted for their answer
		// give 5 points to each player who guessed the winning answer

		currentGames[pv.code].votes++;

		if (currentGames[pv.code].votes >= 8) {
			let nextRound = pv.round + 1;

			if (nextRound >= 8) {

				socket.to(pv.code).emit('game over', )
			}
			else askQuestion(
				socket,
				{
					code: code,
					question: game.questions[nextRound],
					answers: game.voteRound[game.questions[nextRound]],
					round: nextRound
				}
			);
		}
	});

});

//*/

//* CLASSES

class Game {
	constructor(code, questionArr) {
		this.code = code;
		this.questions = questionArr;

		this.questionText = [];

		for (let key in questionArr) {
			this.questionText.push({ key: key, text: qdb[key] });
		}

		this.players = {};
		this.playerNames = [];
		this.colors = {
			red: true,
			orange: true,
			yellow: true,
			lime: true,
			green: true,
			blue: true,
			indigo: true,
			violet: true
		}

		this.voteRound = [];
		this.votes = 0;
	}

	addPlayer(newPlayer) {
		this.players[newPlayer.name] = newPlayer;
		this.playerNames.push(newPlayer.name);
	}

	removePlayer(playerName) {
		let index = this.playerNames.indexOf(playerName);
		if (index > -1) {
			this.colors[this.players[playerName].color] = !this.colors[this.players[playerName].color];
			delete this.players[playerName];
			this.playerNames.splice(index, 1);
		}
	}

	setColor(player) {
		for (let color in this.colors)
			if (this.colors[color]) {
				this.colors[color] = !this.colors[color];
				player.color = color;
				return true;
			}
		return false;
	}
}

class Player {
	constructor(socketId, name) {
		this.socketId = socketId;
		this.name = name;
		this.color = '';
		this.points = 0;
		this.questions = [];
		this.answers = [];
	}

	setColor(newColor) {
		this.color = newColor;
	}

	addPoints(points) {
		this.points += points;
	}

	addQuestion(question) {
		if (!this.questions.length >= 2)
			this.questions.push(question);
		else return 'Too many questions';
	}

	addAnswer(answer) {
		if (!this.answers.length >= 2)
			this.answers.push(answer);
		else return 'Too many answers';
	}

}

class Question {
	constructor(text) {
		this.text = text;
		this.answers = [];
	}

	addAnswer(answer) {
		if (!this.answers.length >= 2)
			this.answers.push(answer);
		else return 'Too many answers';
	}
}

class Answer {
	constructor(owner, text) {
		this.owner = owner;
		this.text = text;
		this.votes = 0;
	}

	vote() {
		this.votes++;
	}
}

//*/

//* UTILITIES

function nextColor(game) {
	for (let color in game.colors)
		if (game.colors[color]) {
			game.colors[color] = !game.colors[color];
			return color;
		}
	return false;
}

function makeGameCode() {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	// if it ends up being a swear word, give everyone who joins a free 10 tokens

	for (let i = 0; i < 4; i++)
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
}

function getRandomOrder(max) {
	let randArr = [];
	for (let i = 0; i < 8; i++) {
		let randQues;
		do randQues = getRandomInt(8);
		while (randArr.indexOf(randQues) !== -1);
		randArr.push(randQues);
	}

	let secondArr = [];
	for (let i = 0; i < 8; i++) {
		let randQues;
		do randQues = getRandomInt(8);
		while (secondArr.indexOf(randQues) !== -1);
		secondArr.push(randQues);
	}

	// this ensures that no player gets the same question twice
	let badPair = true;
	while (badPair) {
		badPair = false;
		for (let i = 0; i < 8; i++) if (randArr[i] === secondArr[i]) {
			badPair = true;
			const temp = secondArr[i];
			secondArr[i] = secondArr[0];
			secondArr[0] = temp;
		}
	}

	for (const item of secondArr) randArr.push(item);

	return randArr;
}

function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function shuffle(array) {
	let currentIndex = array.length, temporaryValue, randomIndex;
	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		temporaryValue = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = temporaryValue;
	}
	return array;
}

function askQuestion(socket, voteObj) {
	socket.to(voteObj.code).emit('ask vote', voteObj);
}

//*/

//* DATA

let qdb = [
	"What's your favorite color? 0",
	"What's your favorite food? 1",
	"What's your favorite book? 2",
	"What's your favorite sport? 3",
	"What's your favorite song? 4",
	"What's your favorite movie? 5",
	"What's your favorite game? 6",
	"What's your favorite show? 7"
];

//*/