let app = require('express')();
let http = require('http').Server(app);

//* GET RID OF THIS

app.get('/', (req, res) => {
	res.send('<h1>Hello world</h1>');
});

//*/

//* SOCKET.IO

io.on('connection', socket => {
	console.log("uc");

	socket.on('disconnect', () => {
		console.log('ud');
	});
});

//*/

//* SERVER

const _PORT_ = 3001;

http.listen(_PORT_, () => {
	console.log('listening on *:' + _PORT_);
});

//*/