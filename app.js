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

app.get('/chatWith',function(req,res){
	var chatWith = req.query.user;
	var pageInfo = {};
	pageInfo.friend = chatWith;
	pageInfo.user = req.session.user
	res.render("privateChat",pageInfo);
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
	//console.log(currentUsers);
	io.sockets.emit('usernames',currentUsers);
}

io.sockets.on('connection',function(socket){
	socket.on("new user home",function(data,callback){
			
			callback(true);
			socket.user = data;
			socket.type = "home"
			currentUsers.push(socket.user);
			currentSockets.push(socket);
			console.log(currentUsers)
			updateUserList();
		})

	socket.on("new user chatWith",function(data,callback){
			console.log("data user is " + data.user)
			callback(true)
			socket.user = data.user;
			socket.type = "chatWith";
			socket.chatWith = data.chatWith;
			currentUsers.push(socket.user);
			currentSockets.push(socket);
			console.log(currentUsers)
			updateUserList();
		})

	socket.on('send-msg',function(data){
		//io.sockets.emit('new msg',{msg:data,user:socket.user});
		socket.broadcast.emit('new msg',{msg:data,user:socket.user})
	})

	socket.on('private-data',function(data){
		//if(data.user in currentUsers){
			for(var i=0;i<currentUsers.length;i++){
				if(currentUsers[i] == data.user){
					if(currentSockets[i].type == "chatWith"){
						if(currentSockets[i].chatWith == data.me){
							currentSockets[i].emit("private-msg",data.msg)
						}
						else{
							currentSockets[i].emit("alert msg",data.me)
						}
					}
					else{
						currentSockets[i].emit("alert msg",data.me)
					}
					/*currentSockets[i].emit('private-msg',data.msg);
					console.log("hiiii");*/
				}
			}
			

		//}
	})

	socket.on('disconnect',function(data){
		console.log("disconnecting.........")
		if(!socket.user)
			return
		//console.log(socket)
		var index = currentSockets.indexOf(socket);
		//console.log(index)
		currentUsers.splice(index,1)
		currentSockets.splice(index,1)
		//currentUsers.splice(currentUsers.indexOf(socket.user),1)
		//currentSockets.splice(currentUsers.indexOf(socket.user),1)
		updateUserList();

	})
})

app.get('/home',function(req,res){
	let pageInfo = {};
	pageInfo.user = req.session.user;
	res.render("dashboard",pageInfo)
})


