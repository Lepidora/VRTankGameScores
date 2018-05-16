var express = require('express')
  , path = require('path')
  , bodyParser = require('body-parser')
  , sass = require('node-sass-middleware');

var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);

app.use(sass({
	src: __dirname,
	dest: path.join(__dirname, 'public/'),
	debug: true,
	outputStyle: 'compressed'
}));

// all environments
app.set('port', process.env.PORT || 3004);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

var scores = {
		win: [{score: 1, name: "Alice"}, {score: 2, name: "Bob"}, {score: 3, name: "Carol"}, {score: 4, name: "Dave"}],
		lose: [{score: 4, name: "Alice"}, {score: 3, name: "Bob"}, {score: 2, name: "Carol"}, {score: 1, name: "Dave"}]
};

var latestwin = [];
var latestlose = [];

app.get('/', (req,res) => {
	if (res.sendFile) {
		res.sendFile(path.join(__dirname, "index.html"));		
	} else {
		res.sendfile(path.join(__dirname, "index.html"));	
	}
});

app.post('/submit', (req, res) => {
	
	//console.log(req);
	var body = req.body;
	console.log(body);
	
	var score = body.score;
	var win = body.win;
	
	if (win === 'true') {
		win = true;
	} else {
		win = false;
	}
	
	if (score && win !== undefined) {
		
		if (win) {
			//scores.win.push(score);
			latestwin.push(score);
		} else {
			//scores.lose.push(score);
			latestlose.push(score);
		}
		
		scores.win.sort(function(a, b){ return a.score - b.score; });
		scores.lose.sort(function(a, b){ return b.score - a.score; });
		
		console.log("push");
		
		pushToClient();
	}
	
	res.send('');
});

app.post('/name', (req, res) => {
	
	var body = req.body;
	
	var id = body.id;
	var name = body.name;
	var win = body.win;
	
	if (win === 'true') {
		win = true;
	} else {
		win = false;
	}	
	
	if (name !== undefined && id !== undefined && win !== undefined) {
		
		console.log("Win: " + win);

		var val;
		
		if (win === true) {
			console.log("bip");
			val = latestwin[id];
			latestwin[id] = null;
		} else {
			console.log("bap");
			val = latestlose[id];
			latestlose[id] = null;
		}
		
		var score = {name: name, score: val};
		
		console.log(score);
		
		if (win) {
			scores.win.push(score);
		} else {
			scores.lose.push(score);
		}
		
		scores.win.sort(function(a, b){ return a.score - b.score; });
		scores.lose.sort(function(a, b){ return b.score - a.score; });
		
		console.log(latestwin);
		console.log(latestlose);
		
		console.log("Added " + name + " to score " + val);

		pushToClient();
	}
	
	res.send('');
});

io.on('connection', (socket) => {
	
	console.log('Client connected');
	socket.emit('scores', {latestwin: latestwin, latestlose: latestlose, scores: scores});
	
	socket.on('getscores', (msg) => {
		console.log('Sending scores: ' + JSON.stringify(scores));
		pushToClient();
	});
});

function pushToClient() {
	cleanLatest();
	io.sockets.emit('scores', {latestwin: latestwin, latestlose: latestlose, scores: scores});
}

function cleanLatest() {
	
	var tempwin = [];
	
	for (var i = 0; i < latestwin.length; i++) {
		if (latestwin[i] != null) {
			tempwin.push(latestwin[i]);
		}
	}
	
	var templose = [];
	
	for (var i = 0; i < latestlose.length; i++) {
		if (latestlose[i] != null) {
			templose.push(latestlose[i]);
		}
	}
	
	latestwin = tempwin;
	latestlose = templose;
}

server.listen(app.get('port'), function(){
	  console.log('Server listening on port ' + app.get('port'));
});