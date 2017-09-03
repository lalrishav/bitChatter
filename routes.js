function isLoggedIn(req,res,next){
	if(req.isAuthenticated())
		return next()
	else{
		res.redirect("/");
	}
}

module.exports = function(app,passport){
	app.get('/',function(req,res){
		if(req.isAuthenticated())
			res.redirect('/home');
		else
			res.render("index");
	})

	/*app.post('/login',function(req,res){
		if(req.body.pass == "redhat"){
			req.session.user = req.body.user;
			res.redirect('/home');
		}
	})*/

	app.get('/register',function(req,res){
		if(req.isAuthenticated())
			res.redirect('/home');
		else 
			res.render("register");
	})

	app.post('/register',passport.authenticate('local-signup',{
		successRedirect :  '/dashfboghard',
		failureRedirect :  '/auth',
 	}))

	app.get('/logout',function(req,res){
		req.logout()
		res.redirect('/');
	})

	app.get('/chatWith',isLoggedIn,function(req,res){
		var chatWith = req.query.user;
		var pageInfo = {};
		pageInfo.friend = chatWith;
		pageInfo.user = req.user
		res.render("privateChat",pageInfo);
	})
	app.get('/home',isLoggedIn,function(req,res){
		let pageInfo = {};
		pageInfo.user = req.user;
		res.render("dashboard",pageInfo)
	})
	app.post('/login',passport.authenticate('local-login',{
		successRedirect :  '/home',
		failureRedirect : '/auth',
		failureFlash : true
	}))
	app.get('/auth',function(req,res){
		console.log(req.flash('errorMessages'))
	})

	app.get('/viewGroup',function(req,res){
		console.log(req.query.group)
		var json = JSON.parse(req.query.group);
		console.log(json)
		console.log(json.groupName)
	})
	app.get('/createGroup',isLoggedIn,function(req,res){
		let pageInfo = {};
		pageInfo.user = req.user;
		res.render("createGroup",pageInfo)
	})
	app.get('/addUser/:gid',isLoggedIn,function(req,res){
		var gid = req.params.gid;
		var pageInfo = {}
		pageInfo.gid = gid;
		pageInfo.user = req.user
		res.render("addUser",pageInfo)
	})
}