const mongoose = require('mongoose');
var messageModel = mongoose.model('Message');
const async = require('async')
var userModel = mongoose.model("User");
module.exports = function(server){
	var currentUsers = [];
	var currentSockets = []
	const io = require('socket.io').listen(server)
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
				var items = [userModel]
				async.each(items,function(item,callback){
					item.findOne({"email":data.chatWith},function(err,data){
						if(err)
							throw err
						else{
							console.log(data)
							callback({"recvId":data._id})
						}
					})
				},function(found){

					var itemss = [messageModel]
					async.each(itemss,function(item,callback){
						item.find({
							$or: [
								{$and : [{"senderId":data.userId},{"recvId":found.recvId}]},
								{$and : [{"senderId":found.recvId},{"recvId":data.userId}]}

							]
						},function(err,data){
							if(err)
								throw err
							else{
								console.log(data)
								callback({"msg":data})
							}
						})
						/*var searchParam = {};
						searchParam.senderId = data.userId
						searchParam.recvId = found.recvId
						item.find(searchParam,function(err,data){
							if(err)
								throw err
							else{
								console.log(data)
								callback({"msg":data})
							}
						})*/
					},function(found){
						console.log("--------------------------------")
						console.log(found)
						console.log("successfull callback")
						var prevMsg = found.msg;
						//emit the socket for this user
						socket.user = data.user;
						socket.type = "chatWith";
						socket.chatWith = data.chatWith;
						currentUsers.push(socket.user);
						currentSockets.push(socket);
						console.log(currentUsers)
						updateUserList();
						for(var i=0;i<currentUsers.length;i++){
							if(currentUsers[i] == data.user){
								if(currentSockets[i].type == "chatWith"){
									if(currentSockets[i].chatWith == data.chatWith){
										console.log("prev msg diplayed")
										currentSockets[i].emit("prev private-msg",found.msg)
									}
									else{
										console.log("ss")
									}
								}
								else{
									currentSockets[i].emit("alert msg",data.me)
								}
								/*currentSockets[i].emit('private-msg',data.msg);
								console.log("hiiii");*/
							}
						}
					})
				})
				/*var items = [messageModel];
				async.each(items,function(item,callback){
					var searchParam = {};
					searchParam.sendId = data.user
					searchParam.recvId = data.chatWith
					item.findOne(searchParam,function(err,data){
						if(err)
							throw err;
						else{
							console.log(data)
							callback();
						}
					})
				},function(){
					console.log("successfull callback")
					socket.user = data.user;
					socket.type = "chatWith";
					socket.chatWith = data.chatWith;
					currentUsers.push(socket.user);
					currentSockets.push(socket);
					console.log(currentUsers)

					updateUserList();
				})*/
				
			})

		socket.on('send-msg',function(data){
			//io.sockets.emit('new msg',{msg:data,user:socket.user});
			socket.broadcast.emit('new msg',{msg:data,user:socket.user})
		})

		socket.on('private-data',function(data){
			//if(data.user in currentUsers){
				/*insert into database*/
				
				var items = [userModel]
				async.each(items,function(item,callback){
					console.log("----")
					console.log(data.user)
					item.findOne({"email":data.user},function(err,data){
						if(err){
							throw err;
						}
						else{
							callback({"id":data._id})
						}
						
					})
				},function(found){
					console.log(found);
					new messageModel({
						message : data.msg,
						senderId : data.meId,
						recvId : found.id
					}).save(function(err){
						if(err)
							throw err;
						else
							console.log("inserted successfully")
					})
					console.log("---")
					console.log(currentUsers)
					console.log(data);
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
				})
				/*new messageModel({
					message : data.msg,
					senderId : data.meId,
					recvId : data.chatWith
				}).save(function(err){
					if(err)
						throw err;
				})*/
				
				

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
}