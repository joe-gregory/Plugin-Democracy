const localStrategy = require("passport-local").Strategy;
const CommunityModels = require("./models/communityModels");
const bcrypt = require("bcrypt");

module.exports = function (passport) {
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
		console.log("serializing");
		console.log(citizen);
		cb(null, { id: citizen._id });
	});

	//deserializeUser function. This function takes a cookie and unravels and returns a user from it.
	passport.deserializeUser((id, done) => {
		CommunityModels.Citizen.findById(id, function (err, citizen) {
			if (err) return done(err);
			console.log("deserializedUser: ", citizen.firstName);
			done(null, citizen); //no error, citizen
		});
	});
};
