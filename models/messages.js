var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var messageSchema = new Schema({
	message 	: {type:String},
	senderId   	: {type:mongoose.Schema.Types.ObjectId,ref:'User'},
	recvId  	: {type:mongoose.Schema.Types.ObjectId,ref:'User'}
})
mongoose.model('Message',messageSchema,'message')
