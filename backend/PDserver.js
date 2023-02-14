const express = require("express");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");

const https = require("https");
const fs = require("fs");

const localStrategy = require("passport-local").Strategy;
const CommunityModels = require("./models/communityModels");

const key = require("./keys");

//express app
const server = express();

//MongoDB connection URL
const dbURI =
	"mongodb+srv://" +
	key +
	"@ddcluster.z8oz5ye.mongodb.net/?retryWrites=true&w=majority";

//https options
const httpsOptions = {
	key: fs.readFileSync("./SSLSecurity/cert.key"),
	cert: fs.readFileSync("./SSLSecurity/cert.pem"),
};

//connect to mongoDB
mongoose
	.connect(dbURI)
	.then((result) => {
		console.log(`Connected to Data Base`);
		//PDserver.listen(8080, "192.168.1.68" || "localhost"); //listen for requests
		https.createServer(httpsOptions, server).listen(8080, () => {
			console.log("server is running at port 8080!");
		});
		//console.log("listening on port 8080...");
	})
	.catch((error) => {
		console.log(`Error connecting to DB: ${error}`);
		console.log(`Error Object [key, value] pairs:`);
		console.log(Object.entries(error));
	});

//middleware
server.use(express.json()); //parse request body as JSON
server.use(express.urlencoded({ extended: true }));
server.use(
	cors({
		origin: true,
		preflightContinue: true,
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		credentials: true,
	})
);
//server.use(express.static("public")); //static files
//flash message middleware
/*
PDserver.use((request, response, next) => {
	response.locals.message = request.session.message;
	delete request.session.message;
	next();
});
*/

//Passport & sessions
server.use(passport.initialize());
server.use(
	session({
		secret: "plugindemocracy",
		name: "sessionID",
		cookie: {
			sameSite: "none",
			secure: true,
		},
		resave: false,
		saveUninitialized: false,
	})
);
server.use(passport.session());

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
				(error, citizen) => {
					let info = {};
					info.success = false;
					info.messages = [];

					//if there's an error in db lookup, return err callback
					if (error) {
						info.messages.push({
							type: "error",
							message: error.message,
						});
						return done(error, false, info);
					}
					//if user not found, return null and false in callback
					else if (!citizen) {
						info.messages.push({
							type: "error",
							message:
								"No hay ciudadano registrado con este correo",
						});
						return done(null, false, info); //error = null, user = false. There is no error but there is no used
					}
					//if user found, but password not valid, return err and false in callback
					else if (password != citizen.password) {
						info.messages.push({
							type: "error",
							message: "Contraseña equivocada",
						});
						return done(null, false, info);
					}
					//if user found and password valid, return user object in callback
					else if (password == citizen.password) {
						info.success = true;
						info.messages.push({
							type: "success",
							message: "Ciudadano autenticado",
						});
						return done(null, citizen, info);
					} else {
						info.messages.push({
							type: "error",
							message: "Check passport.use localStrategy",
						});
						return done(null, false, info);
					}
				}
			);
		}
	)
);
//serializeUser function. This function stores a cookie inside of the browser
passport.serializeUser((citizen, cb) => {
	console.log("serializing");
	console.log(citizen);
	return cb(null, { id: citizen._id });
});

//deserializeUser function. This function takes a cookie and unravels and returns a user from it.
passport.deserializeUser((citizen, done) => {
	CommunityModels.Citizen.findById(citizen.id, function (err, citizen) {
		if (err) return done(err);
		console.log("deserializedUser: ");
		console.log(citizen.firstName);
		done(null, citizen); //no error, citizen
	});
});

//console log incoming requests
server.use((request, response, next) => {
	console.log("//------------//-----------//");
	console.log(
		`Request Method: "${request.method}" => Request URL: "${request.url}".`
	);
	console.log("request.session.id", request.session.id);
	console.log("request.user : ", request.user);
	console.log("//------------//-----------//");
	next();
});
server.use(passport.authenticate("session"));

//routes
server.post("/login", (request, response, next) => {
	passport.authenticate("local", (error, citizen, info) => {
		let output = {};
		output.where = "post: /login";
		output.authenticated = request.isAuthenticated();
		output.success = info.success;
		output.messages = [...info.messages];

		if (error) {
			output.success = false;
			output.messages.push({ type: "error", message: error.message });
			console.log(output);
			response.status(401).json(output);
		}
		if (citizen) {
			request.login(citizen, (error) => {
				if (error) {
					output.messages.push({
						type: "error",
						message: error.message,
					});
				}
				output.authenticated = request.isAuthenticated();
				output.citizen = citizen;
				console.log("output from /login: ", output);
				console.log("Citizen output in /login: ");
				console.log(citizen);
				response.json(output);
			});
		} else {
			output.success = false;
			response.json(output);
		} /* else if (!citizen) {
			console.log(output);
			response.json(output);
		} else {
			request.login(citizen, (error) => {
				if (error) {
					output.success = false;
					//output.message = error;
				} else {
					output.success = true;
					//output.message = "User authenticated";
				}
				output.authenticated = request.isAuthenticated();
				output.citizen = citizen;
				console.log("output from /login: ", output);
				console.log("Citizen output in /login: ");
				console.log(citizen);
				response.json(output);
			});
		} //*/
	})(request, response, next);
});

const unprotectedRoutes = require("./routes/unprotectedRoutes");
server.use(unprotectedRoutes);
const authRoutes = require("./routes/authRoutes");
server.use(authRoutes);

/*
PDserver.use(myCommunityRoutes);
PDserver.use(errorsRoutes);
const errorsRoutes = require('./routes/errorsRoutes');
const myCommunityRoutes = require('./routes/myCommunityRoutes');
*/
