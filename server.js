//***** Server Setting *****//

var path = require('path');
var express = require('express');
var app = express();
app.use("/public", express.static(path.join(__dirname, 'public')));
var server =  require('http').createServer(app);
var io = require('socket.io').listen(server);
io.set("log level", 1);  

server.listen(8080);


app.get('/',function (req,res) {
	res.sendfile(__dirname+'/index.html');
});


io.on('connection', function (client_socket) {
	
	client_socket.on("offer",function (offer) {

		client_socket.broadcast.emit("answer",offer);
	});

	client_socket.on("answer_replay",function (answer) {
		client_socket.broadcast.emit("replay",answer);
	});

	client_socket.on("sendIceCandidate",function (candidate) {
		client_socket.broadcast.emit("recIceCandidate",candidate);
	})

});


