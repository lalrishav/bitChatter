var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var settingSchema = new Schema({
	"sendOneEnter"	: {type:Boolean,defalut:false}
});