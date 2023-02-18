const express = require("express");
const router = express.Router();
const CommunityModels = require("../models/communityModels");

const passport = require("passport");

/* sessionID=s%3AMzIQqK0mPaBJd6nT3Mqiod8awILWU-3t.XoA6OZepfSwEj2%2FX8WIwb4tymQF9NiWWleHI%2FKLlZzM; Path=/; HttpOnly;
router.post("/login", (request, response, next) => {
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
/*
router.post('/login', passport.authenticate('local', {failureRedirect: '/404', failureMessage: true}),
    (request, response) => {        
            response.redirect('/mycommunity');
    }
);
/*
router.get("/signup", (request, response) => {
	response.render("signup", function (err, html) {
		if (err) {
			console.log("500 Error");
			console.log(err);
			response.redirect("/500");
		} else {
			response.render("signup", request.user);
		}
	});
});
*/
router.post("/signup", (request, response) => {
	const citizen = new CommunityModels.Citizen({
		firstName: request.body.firstName,
		lastName: request.body.lastName,
		secondLastName: request.body.secondLastName,
		email: request.body.email,
		password: request.body.password,
		cellphone: request.body.cellphone,
	});
	citizen
		.save()
		.then((result) => response.json(citizen))
		.catch((error) => response.send(error));
});
/*
router.get("/login", (request, response) => {
	response.render("login", (err, html) => {
		if (err) {
			response.redirect(404, "/404", { message: [err, html] });
		} else {
			response.render("login", request.user);
		}
	});
});
/*
router.post('/login', passport.authenticate('local', {failureRedirect: '/404', failureMessage: true}),
    (request, response) => {        
            response.redirect('/mycommunity');
    }
);


router.get("/profile", (request, response) => {
	if (!request.user) {
		response.redirect("/login");
		return;
	}
	Community.Community.findById(
		request.user.community,
		function (err, community) {
			Community.Home.findById(request.user.home, function (err, home) {
				response.locals.community = community;
				response.locals.home = home;
				response.locals.fullName = request.user.fullName;
				response.locals.firstName = request.user.firstName;
				response.locals.lastName = request.user.lastName;
				response.locals.secondLastName = request.user.secondLastName;
				response.render("profile");
			});
		}
	);
});

router.post("/logout", function (request, response, next) {
	request.logout(function (error) {
		if (error) {
			return next(error);
		}
		response.redirect("/");
	});
});
*/
module.exports = router;
