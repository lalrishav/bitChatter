var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var messageSchema = new Schema({
	userId   	: {type:mongoose.Schema.Types.ObjectId,ref:'User',require:true},
	gId  		: {type:mongoose.Schema.Types.ObjectId,ref:'Group',require:true}
})
mongoose.model('JoinRequest',messageSchema,'joinrequest')
