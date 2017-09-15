const mongoose = require('mongoose');
var messageModel = mongoose.model('Message');
const async = require('async')
var userModel = mongoose.model("User");
var notificationModel = mongoose.model("Notification")
var groupModel = mongoose.model("Group")
var joinRequest = mongoose.model("JoinRequest")
module.exports = function(server){
	/*array to keep track all the connected username*/
	var currentUsers = [];
	/*array to keep track of all the connected sockets*/
	var currentSockets = []
	var mainChatMessage = [];
	const io = require('socket.io').listen(server)

	function updateUserList(){
		io.sockets.emit('usernames',currentUsers);
	}
	
	io.sockets.on('connection',function(socket){
		socket.on("new user home",function(data,callback){
				
				callback(true);
				console.log("sent username")
				socket.user = data.user;
				socket.type = "home"
				currentUsers.push(socket.user);
				currentSockets.push(socket);
				updateUserList();
				userId = data.id;
				var items = [notificationModel]
				socket.emit("prev main msg",mainChatMessage)
				async.each(items,function(item,callback){
					console.log("userid is" + userId)
					item.find({"userId":userId},function(err,data){
						if(err)
							throw err
						else{
							console.log(data)
							callback(data);
						}
					})
				},function(found){
					for(var i=0;i<currentUsers.length;i++){
						if(currentUsers[i] == data.user){
							console.log("---------------------");
							console.log("@@@@@@@@@@@@@@@@@@@@@");
							//if(currentSockets[i].type == "home"){
								currentSockets[i].emit("notification",found);
							
						}
					}
					var items1 = [joinRequest]
					async.each(items1,function(item1,callback){
						item1.find({"userId":userId},function(err,datas){
							if(err)
								throw err
							else{}
						}).populate("gId").exec((err,story)=>{
							if(err)
								throw err
							else{
								console.log("---------")
								console.log(story)
								if(story.length > 0)
									callback(story[0].gid)
								else
									callback("not found")
							}
						})
					},function(founds){
						console.log("i found")
						//console.log(founds.datas1);
						for(var i=0;i<currentUsers.length;i++){
							if(currentUsers[i] == data.user){
								if(currentSockets[i].type == "home"){
									currentSockets[i].emit("join request",founds);
								}
							}
						}
					})

					
				})
			})



		socket.on("new user chatWith",function(data,callback){
				callback(true)
				var items = [userModel]
				socket.emit("prev main msg",mainChatMessage)
				async.each(items,function(item,callback){
					item.findOne({"email":data.chatWith},function(err,data){
						if(err)
							throw err
						else{
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
						var prevMsg = found.msg;
						//emit the socket for this user
						socket.user = data.user;
						socket.type = "chatWith";
						socket.chatWith = data.chatWith;
						currentUsers.push(socket.user);
						currentSockets.push(socket);
						updateUserList();
						for(var i=0;i<currentUsers.length;i++){
							if(currentUsers[i] == data.user){
								if(currentSockets[i].type == "chatWith"){
									if(currentSockets[i].chatWith == data.chatWith){
										currentSockets[i].emit("prev private-msg",found.msg)
									}
									else{
									}
								}
								else{
									currentSockets[i].emit("alert msg",data.me)
								}
								/*currentSockets[i].emit('private-msg',data.msg);
								console.log("hiiii");*/
							}
						}
				userId = data.userId;
				console.log("user id is " + data.id)
				var itemsss = [notificationModel]
				async.each(itemsss,function(item,callback){
					item.find({"userId":userId},function(err,data){
						if(err)
							throw err
						else{
							console.log(data)
							callback(data);
						}
					})
				},function(found){
					for(var i=0;i<currentUsers.length;i++){
						if(currentUsers[i] == data.user){
							console.log("-------++--------------");
							console.log("@@@@@@++@@@@@@@@@@@@@@@");
							//if(currentSockets[i].type == "home"){
								currentSockets[i].emit("notification",found);
							
						}
					}
					var items1 = [joinRequest]
					async.each(items1,function(item1,callback){
						item1.find({"userId":userId},function(err,datas){
							if(err)
								throw err
							else{}
						}).populate("gId").exec((err,story)=>{
							if(err)
								throw err
							else{
								console.log("---------")
								console.log(story)
								if(story.length > 0)
									callback(story[0].gid)
								else
									callback("not found")
							}
						})
					},function(founds){
						console.log("i found")
						//console.log(founds.datas1);
						for(var i=0;i<currentUsers.length;i++){
							if(currentUsers[i] == data.user){
								//if(currentSockets[i].type == "home"){
									currentSockets[i].emit("join request",founds);
								//}
							}
						}
					})

					
				})
					})
				})
				
			})

		socket.on('send-msg',function(data){
			//io.sockets.emit('new msg',{msg:data,user:socket.user});
			mainChatMessage.push({"user":socket.user,"msg":data});
			socket.broadcast.emit('new msg',{msg:data,user:socket.user})

		})

		socket.on('private-data',function(data){
			//if(data.user in currentUsers){
				/*insert into database*/
				
				var items = [userModel]
				async.each(items,function(item,callback){
					item.findOne({"email":data.user},function(err,data){
						if(err){
							throw err;
						}
						else{
							callback({"id":data._id,"username":data.email})
						}
						
					})
				},function(found){
					new messageModel({
						message : data.msg,
						senderId : data.meId,
						recvId : found.id
					}).save(function(err){
						if(err)
							throw err;
						else{

						}
					})
					if(currentUsers.indexOf(data.user) == -1){
						new notificationModel({
							notification 	: data.me,
							userId 			: found.id
						}).save(function(err){
							if(err)
								throw err;
						})
					}
					else{
						for(var i=0;i<currentUsers.length;i++){
							if(currentUsers[i] == data.user){
								if(currentSockets[i].type == "chatWith"){
									if(currentSockets[i].chatWith == data.me){
										currentSockets[i].emit("private-msg",data.msg)
									}
									else{
										currentSockets[i].emit("alert msg",{"user":data.me,"msg":data.msg})
									}
								}
								else{
									currentSockets[i].emit("alert msg",{"user":data.me,"msg":data.msg})
								}
							}
						}
					}

				})
		})
		socket.on("delete notification",function(data){
			var items = [notificationModel]

			async.each(items,function(item,callback){
				item.update({"userId":data},{"isActive":false},{multi:true},function(err){
					if(err)
						throw err;
					else{
						console.log("successfully updated")
					}
				})
				/*item.find({"userId":data}).remove().exec(function(err){
					if(err)
						throw err;
				})*/
			})
		})
		socket.on('disconnect',function(data){
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
		socket.on('createGroup',function(data){
			new groupModel({
				"groupName" 	: data.groupName,
				"admins"		: data.user,
			}).save((err)=>{
				if(err)
					throw err
				else{
					socket.emit("createGroup ack","Group Created Successfully");
					console.log("group created successfully")
				}
			})
		})
		socket.on("send join request",function(data){
			var items = [userModel]
			async.each(items,function(item,callback){
				item.findOne({"email":data.user},function(err,datas){
					if(err)
						throw err
					else{
						console.log(datas)
						callback({"userId":datas._id})
					}
				})
			},function(found){
				new joinRequest({
					userId 	: found.userId,
					gId		: data.gid
				}).save((err)=>{
					if(err)
						throw err;
				})
			})
		})
		/*socket.on("add user",function(data){
			console.log("===================")
			console.log(data)
			var items = [userModel]
			async.each(items,function(item,callback){
				item.findOne({"email":data.user},function(err,datas){
					if(err)
						throw err
					else{
						console.log(datas)
						callback({"userId":datas._id})
					}
				})
			},function(found){
				groupModel.findOneAndUpdate({"_id":data.gid},{$push:{users:found.userId}},function(err,data){
					if(err)
						throw err
					else{
						console.log("updated")
					}
				})
			})
		})*/
	})
}