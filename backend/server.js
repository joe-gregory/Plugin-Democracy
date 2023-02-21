const express = require("express");
const passport = require("passport");
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");

const https = require("https");
const fs = require("fs");

const localStrategy = require("passport-local").Strategy;
const CommunityModels = require("./models/communityModels");

const keys = require("./keys");

//express app
const server = express();

//MongoDB connection URL
const dbURI =
	"mongodb+srv://" +
	keys.mongo_missing_link +
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
			console.log("server is running at port 8080");
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
		secret: keys.session,
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
				async (error, citizen) => {
					let info = {};
					info.success = false;
					info.messages = [];

					//if there's an error in db lookup, return err callback
					if (error) {
						info.messages.push({
							severity: "error",
							message: error.message,
						});
						return done(error, false, info);
					}
					//if user not found, return null and false in callback
					else if (!citizen) {
						info.messages.push({
							severity: "error",
							message:
								"No hay ciudadano registrado con este correo",
						});
						return done(null, false, info); //error = null, user = false. There is no error but there is no used
					}
					//if user found, but password not valid, return err and false in callback
					else if (
						!(await bcrypt.compare(password, citizen.password))
					) {
						info.messages.push({
							severity: "error",
							message: "Contraseña equivocada",
						});
						return done(null, false, info);
					}
					//if user found and password valid, return user object in callback
					else if (await bcrypt.compare(password, citizen.password)) {
						info.success = true;
						info.messages.push({
							severity: "success",
							message: "Ciudadano autenticado",
						});
						return done(null, citizen, info);
					} else {
						info.messages.push({
							severity: "error",
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
		citizen.password = null;
		console.log(citizen);
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
/*
server.use(
	//adding authenticated to every request
	(request, response, next) => {
		/*let output = {
			authenticated: request.isAuthenticated(),
			citize: request.user,
		};
		response = { ...response, ...output };////
		response.authenticated = request.isAuthenticated();
		response.citizen = request.user;
		next();
	}
);*/

//routes
const openRoutes = require("./routes/openRoutes");
server.use(openRoutes);

/*
PDserver.use(myCommunityRoutes);
PDserver.use(errorsRoutes);
const errorsRoutes = require('./routes/errorsRoutes');
const myCommunityRoutes = require('./routes/myCommunityRoutes');
*/
