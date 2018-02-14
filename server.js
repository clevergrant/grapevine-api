let app = require('express')();
let http = require('http').Server(app);
var io = require('socket.io')(http);

//* SERVER

const _PORT_ = 3001;

http.listen(_PORT_, () => {
	console.log('listening on *:' + _PORT_);
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
	console.log("Idle connections: ", idle);

	socket.emit('log', 'Server connected');

	socket.on('disconnect', data => {

		// Decrement the idle counter
		idle--;

		// Log idle connections
		console.log("Idle connections: ", idle);

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

	socket.on('join room', code => {
		socket.join(code);
	});

	socket.on('request host', () => {

		const gameCode = makeGameCode();

		hostInterface[socket.id] = gameCode;

		let quids = getRandomOrder(8);

		let qarr = [];

		for (let i = 0; i < quids.length / 2; i++)
			qarr.push(quids[i]);

		qarr = shuffle(qarr);

		let newgame = new Game(gameCode, qarr);

		currentGames[gameCode] = newgame;

		socket.join(gameCode);

		socket.emit('host created', gameCode);

		// console.log('playerInterface:', playerInterface);
		// console.log('hostInterface:', hostInterface);
		// console.log('roomInterface:', roomInterface);
		// console.log('currentGames:', currentGames);

	});

	socket.on('request player', connector => {

		console.log(connector.player.name + ' wants to join ' + connector.code)

		socket.join(connector.code);

		let reqGame = currentGames[connector.code];
		playerInterface[socket.id] = connector.player.name;
		roomInterface[socket.id] = connector.code;

		if (typeof reqGame !== 'undefined') {

			if (reqGame.playerNames.indexOf(connector.player.name) === -1) {

				if (reqGame.playerNames.length < 8) {


					let newPlayer = new Player(socket.id, connector.player);

					reqGame.setColor(newPlayer);
					reqGame.addPlayer(newPlayer);

					socket.to(connector.code).emit('player joined', newPlayer);


				} else socket.emit('refuse', 'Game is full.');

			} else socket.emit('refuse', 'Name already in use.');

		} else socket.emit('refuse', 'Game doesn\'t exist.');

		// console.log('playerInterface:', playerInterface);
		// console.log('hostInterface:', hostInterface);
		// console.log('roomInterface:', roomInterface);
		// console.log('currentGames:', currentGames);

	});

	socket.on('game start', creator => {

		for (let i = 0; i < 2; i++)
			for (let j = 0; j < 8; j++) {
				let errnum = 0;
				while (newgame.players[j].questions.indexOf(qdb[quids[quids.length - 1]]) !== -1) {
					quids = shuffle(quids);
					errnum++;
					if (errnum <= 15) {
						break;
						console.error("Stopped an infinite loop => game.js:201");
					}
				}
				newgame.players[j].questions.push(qdb[quids.pop()]);
			}

		console.log("newgame: ", newgame);
	});

});

//*/

//* CLASSES

class Game {
	constructor(code, questionArr) {
		this.code = code;
		this.questions = questionArr;
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
	constructor(socketId, player) {
		this.socketId = socketId;
		this.name = player.name;
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