var express 				= require('express'),
	bodyParser 				= require('body-parser'),
	mongoose 				= require('mongoose'),
	passport 				= require('passport'),
	LocalStrategy 			= require('passport-local'),
	passportLocalMongoose 	= require('passport-local-mongoose'),
	bcrypt 					= require('bcryptjs'),
	User 					= require('./models/user'),
	flash 					= require('connect-flash');

mongoose.connect('mongodb://localhost:27017/lkart',{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.set('useCreateIndex', true);
var app = express();

app.set('view engine','ejs');
require('./config/passport')(passport);
app.use(bodyParser.urlencoded({extended:true}));
app.use(require('express-session')({
	secret : "Lkart",
	resave : false,
	saveUninitialized : false
}));
// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash
app.use(flash());
// Global vars
app.use(function(req,res,next){
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
});

app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	next();
});

// passport.use(new LocalStrategy(User.authenticate()));
// // reading data from session encoding and decoding
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res){
	console.log(req.user);
	res.render("index",{currentUser : req.user});
});

// Register 
app.get("/register",function(req,res){
	res.render("register");
});
app.post("/register",function(req,res){
	console.log(req.body);
	var {firstName,lastName,email,phone,password} = req.body;
	let errors = [];
	if(!firstName || !lastName || !email || !phone || !password){
		errors.push({msg:'Please fill in all fields'});
	}
	// if(password !== password2){
	// 	errors.push({msg:'Password do not match'});
	// }
	if(password.length < 6){
		errors.push({msg:'Password should be at least 6 characters'});
	}

	if(errors.length > 0){
		res.render('register',{
			errors,
			firstName,
			lastName,
			email,
		});
	}else{
		// validation passed
		User.findOne({email:email})
			.then(user => {
				if(user){
					// User Exists
					errors.push({msg:'Email is already register'});
					res.render('register',{
						errors,
						firstName,
						lastName,
						email,
						phone
					});
				}else{
					var newUser = new User({
						firstName,
						lastName,
						email,
						phone
					});
					// salting password
					bcrypt.genSalt(10,(err,salt)=>
						bcrypt.hash(newUser.password,salt,(err,hash)=>{
							if(err)
								throw err;
							// set password to hashed
							newUser.password = hash;
							newUser.save()
								.then(user => {
									req.flash('success_msg','You are now registerd');
									res.redirect('/');
								})
								.catch(err=> console.log(err));
					}));
				}
			});
	}

	// var newUser = new User({firstName:req.body.firstName,lastName:req.body.lastName,email:req.body.email,phone:req.body.phone});
	// User.register(newUser,req.body.password,function(err,user){
	// 	if(err){
	// 		console.log(err);
	// 		return res.render("register");
	// 	}
	// 	passport.authenticate("local")(req,res,function(){
	// 		res.redirect("/");
	// 	});
	// });
});

// login
app.get("/login",function(req,res){
	res.render("login");
});
app.post("/login",(req,res,next)=>{
	passport.authenticate('local',{
		successRedirect : "/",
		failureRedirect : "/login",
		failureFlash : true
	})(req,res,next);
});

// logout
app.get("/logout",function(req,res){
	req.logout();
	req.flash('success_msg' , 'You are logged out');
	res.redirect('/login');
});


app.listen(8080,function(req,res){
	console.log("Server started.....");
})
