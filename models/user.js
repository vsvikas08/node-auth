var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

// var UserSchema = new mongoose.Schema({
// 	firstName : String,
// 	lastName : String,
// 	email : String,
// 	phone : Number,
// 	password : String
// });

var UserSchema = new mongoose.Schema({
	firstName : {
		type : String,
		required : true
	},
	lastName : {
		type : String,
		required : true
	},
	email : {
		type : String,
		required : true
	},
	phone : {
		type : Number,
		required : true
	},
	password:{
		type : String,
		required: true
	},
	date:{
		type: Date,
		default : Date.now
	}
})

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserSchema);