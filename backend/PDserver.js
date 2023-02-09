const express = require("express");
const passport = require("passport");
const passportLocal = require("passport-local").Strategy;
const session = require("express-session");
const bcrypt = require("bcrypt");

const mongoose = require("mongoose");
const CommunityModels = require("./models/communityModels");

const key = require("./keys");

//routes
/*const authRoutes = require('./routes/authRoutes');
const errorsRoutes = require('./routes/errorsRoutes');
const myCommunityRoutes = require('./routes/myCommunityRoutes');*/

//express app
const PDserver = express();
const dbURI =
	"mongodb+srv://" +
	key +
	"@ddcluster.z8oz5ye.mongodb.net/?retryWrites=true&w=majority";

//register view engine
PDserver.set("view engine", "ejs");

//connect to mongoDB
mongoose
	.connect(dbURI)
	.then((result) => {
		console.log(`Connected to Data Base`);
		PDserver.listen(8080); //listen for requests
		console.log("listening on port 8080...");
	})
	.catch((error) => {
		console.log(`Error connecting to DB: ${error}`);
		console.log(`Error Object [key, value] pairs:`);
		console.log(Object.entries(error));
	});

//middleware
PDserver.use(express.json()); //parse request body as JSON
PDserver.use(express.urlencoded({ extended: true }));
PDserver.use(express.static("public")); //static files

PDserver.use((request, response, next) => {
	response.setHeader("Access-Control-Allow-Origin", "*");
	response.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, x-Requested-With, Content-Type, Accept, Authorization"
	);
	response.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PATCH, DELETE"
	);
	next();
});

PDserver.use(
	session({
		secret: "plugindemocracy",
		resave: true,
		saveUninitialized: true,
		cookie: { secure: true },
	})
);

//flash message middleware
PDserver.use((request, response, next) => {
	response.locals.message = request.session.message;
	delete request.session.message;
	next();
});

//Passport
PDserver.use(passport.initialize());
PDserver.use(passport.session());

//serializeUser function. This function stores a cookie inside of the browser
passport.serializeUser((citizen, done) => {
	done(null, citizen.id);
});

//deserializeUser function. This function takes a cookie and unravels and returns a user from it.
passport.deserializeUser((id, done) => {
	CommunityModels.Citizen.findById(id, function (err, citizen) {
		if (err) return done(err);
		console.log("deserializedUser: ", citizen.firstName);
		done(null, citizen); //no error, citizen
	});
});

//local Strategy
passport.use(
	new passportLocal(
		{
			usernameField: "email",
			passwordField: "password",
		},
		function verify(email, password, done) {
			//look up user in DB
			CommunityModels.Citizen.findOne(
				{ email: email },
				(err, citizen) => {
					//if there's an error in db lookup, return err callback
					if (err) {
						console.log(err);
						return done(err);
					}
					//if user not found, return null and false in callback
					if (!citizen) {
						console.log("!citizen");
						return done(null, false); //error = null, user = false. There is no error but there is no used
					}
					//if user found, but password not valid, return err and false in callback
					if (password != citizen.password) {
						console.log("wrong password");
						return done(null, false);
					}
					//if user found and password valid, return user object in callback
					if (password == citizen.password) {
						console.log("User authenticated");
						return done(null, citizen);
					}
				}
			);
		}
	)
);

//console log incoming requests
PDserver.use((request, response, next) => {
	console.log(
		`Request Method: "${request.method}" => Request URL: "${request.url}"`
	);
	response.locals.user = request.user;
	next();
});

PDserver.post("/login", (request, response) => {
	//response.render('index', request.user);
	console.log(request.body);
	response.json({ data: "hello from the server nigrou" });
});
/*
PDserver.use(authRoutes);
PDserver.use(myCommunityRoutes);
PDserver.use(errorsRoutes);*/
