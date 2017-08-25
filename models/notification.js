var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var notificationSchema = new Schema({
	notification   : {type:String},
	userId 		   : {type:mongoose.Schema.Types.ObjectId,ref:'User'},
	isActive       : {type:Boolean,default:true}
 })
mongoose.model('Notification',notificationSchema,'notification')