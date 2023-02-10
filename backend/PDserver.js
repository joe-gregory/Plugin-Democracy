const express = require("express");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");

const localStrategy = require("passport-local").Strategy;
const CommunityModels = require("./models/communityModels");

const key = require("./keys");

//express app
const PDserver = express();
const dbURI =
	"mongodb+srv://" +
	key +
	"@ddcluster.z8oz5ye.mongodb.net/?retryWrites=true&w=majority";

//CORS

/*
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
});*/

/*
const errorsRoutes = require('./routes/errorsRoutes');
const myCommunityRoutes = require('./routes/myCommunityRoutes');*/

//register view engine
//PDserver.set("view engine", "ejs");

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
PDserver.use(
	cors({
		origin: "http://localhost:5173",
		credentials: true,
	})
);
PDserver.use(express.static("public")); //static files

//flash message middleware
/*
PDserver.use((request, response, next) => {
	response.locals.message = request.session.message;
	delete request.session.message;
	next();
});
*/
PDserver.use(passport.initialize());
PDserver.use(
	session({
		secret: "plugindemocracy",
		resave: true,
		saveUninitialized: true,
	})
);
//Passport

PDserver.use(passport.session());

//require("./passportConfig")(passport);

passport.use(
	new localStrategy(
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
//serializeUser function. This function stores a cookie inside of the browser
passport.serializeUser((citizen, cb) => {
	process.nextTick(function () {
		console.log("serializing");
		console.log(citizen);
		return cb(null, { id: citizen._id });
	});
});

//deserializeUser function. This function takes a cookie and unravels and returns a user from it.
passport.deserializeUser((id, cb) => {
	process.nextTick(function () {
		return cb(null, id);
	});
	/*CommunityModels.Citizen.findById(id, function (err, citizen) {
		if (err) return done(err);
		console.log("deserializedUser: ", citizen.firstName);
		done(null, citizen); //no error, citizen
	});*/
});

//console log incoming requests
PDserver.use((request, response, next) => {
	console.log(
		`Request Method: "${request.method}" => Request URL: "${
			request.url
		}". Session: ${request.isAuthenticated()}`
	);
	console.log("request.user all : ", request.user);
	//response.locals.user = request.user;
	next();
});
PDserver.use(passport.authenticate("session"));
//routes
PDserver.get("/", (request, response) => {
	let output = {};
	output.isAuthenticated = request.isAuthenticated();
	output.citizen = request.user;
	response.json(output);
});

PDserver.post("/login", (request, response, next) => {
	passport.authenticate("local", (error, citizen) => {
		let output = {};
		output.where = "api/post/login";

		if (error) {
			output.success = false;
			output.message = error;
			output.isAuthenticated = request.isAuthenticated();
			console.log(output);
			response.json(output);
		} else if (!citizen) {
			output.success = false;
			output.message = "No user exists with given credentials";
			output.isAuthenticated = request.isAuthenticated();
			console.log(output);
			response.json(output);
		} else {
			request.logIn(citizen, (error) => {
				if (error) {
					output.success = false;
					output.message = error;
				} else {
					output.success = true;
					output.message = "User authenticated";
				}
				output.isAuthenticated = request.isAuthenticated();
				console.log("output from /login: ", output);
				console.log("Citizen output in /login: ");
				console.log(citizen);
				response.json(output);
			});
		}
	})(request, response, next);
});

const authRoutes = require("./routes/authRoutes");
PDserver.use(authRoutes);
/*
PDserver.post("/login", (request, response) => {
	//response.render('index', request.user);
	console.log(request.body);
	response.json({ data: "hello from the server nigrou" });
});
/*

PDserver.use(myCommunityRoutes);
PDserver.use(errorsRoutes);*/
