let app = require('express')();
let http = require('http').Server(app);

//* GET RID OF THIS

app.get('/', (req, res) => {
	res.send('<h1>Hello world</h1>');
});

//*/

//* SERVER

const _PORT_ = 3001;

http.listen(_PORT_, () => {
	console.log('listening on *:' + _PORT_);
});

//*/