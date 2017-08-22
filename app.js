'use strict'
const express = require('express')
const app = express()
const path = require('path');

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname, 'public')));

const session = require('express-session')
const bodyParser = require('body-parser')
app.use(bodyParser());
app.use(session({
	cookieName 	: 'session',
	secret	   	: 'asdfghjklpoiuytrewq',
}))

var server = require('http').createServer(app)


const io = require('socket.io').listen(server)
server.listen(3000);
app.get('/',function(req,res){
	res.render("index");
})

app.post('/login',function(req,res){
	if(req.body.pass == "redhat"){
		req.session.user = req.body.user;
		res.redirect('/home');
	}
})

app.get('/logout',function(req,res){
	req.session.destroy();
	res.redirect('/');
})

/*io.on('connection',function(socket){
	socket.emit('alert',"how r u")
	socket.on("yo got",function(data){
		console.log(data);
	})
})*/
var currentUsers = [];
var currentSockets = []
function updateUserList(){
	console.log(currentUsers);
	io.sockets.emit('usernames',currentUsers);
}

io.sockets.on('connection',function(socket){
	socket.on("new user",function(data,callback){
			callback(true);
			socket.user = data;
			currentUsers.push(socket.user);
			currentSockets.push(socket);
			updateUserList();
	})

	socket.on('send-msg',function(data){
		//io.sockets.emit('new msg',{msg:data,user:socket.user});
		socket.broadcast.emit('new msg',{msg:data,user:socket.user})
	})

	socket.on('private-data',function(data){
		//if(data.user in currentUsers){
			console.log("---------------------")
			currentSockets[currentUsers.indexOf(data.user)].emit('private-msg',data.msg);

		//}
	})

	socket.on('disconnect',function(data){
		console.log("disconnecting.........")
		if(!socket.user)
			return
		currentUsers.splice(currentUsers.indexOf(socket.user),1)
		currentSockets.splice(currentUsers.indexOf(socket.user),1)
		updateUserList();

	})
})

app.get('/home',function(req,res){
	let pageInfo = {};
	pageInfo.user = req.session.user;
	res.render("dashboard",pageInfo)
})


