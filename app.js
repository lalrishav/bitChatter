'use strict'
const express = require('express')
const app = express()
const path = require('path');
const passport = require('passport');
const fs = require("fs")
const flash = require('connect-flash');
var mongoose = require("mongoose")
//mongoose.connect(process.env.MONGOLAB_URI|| "mongodb://localhost:27017/bitChatter" )
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
app.use(passport.initialize());
app.use(flash());
app.use(passport.session());
var server = require('http').createServer(app)
let models_path =  './models';
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
});

require('./config/passport')(passport);
require('./routes.js')(app,passport);
require('./sockets.js')(server);


server.listen(process.env.PORT || 3000);









