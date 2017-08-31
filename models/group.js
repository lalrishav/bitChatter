var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var groupSchema = new Schema({
	groupName		: {type:String,require:true,unique:true},
	admins			: [{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
	users			: [{type:mongoose.Schema.Types.ObjectId,ref:'User'}]
})
mongoose.model('Group',groupSchema,'groups')