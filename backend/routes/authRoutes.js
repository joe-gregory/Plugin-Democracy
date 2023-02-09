const express = require("express");
const router = express.Router();

const passport = require("passport");
const Community = require("../models/communityModels");

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

router.post("/signup", (request, response) => {
	const citizen = new Community.Citizen({
		firstName: request.body.firstName,
		lastName: request.body.lastName,
		secondLastName: request.body.secondLastName,
		email: request.body.email,
		password: request.body.password,
		cellphone: request.body.cellphone,
	});
	citizen
		.save()
		.then((result) => response.redirect("/profile"))
		.catch((error) => response.send(error));
});

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
);*/
router.post("/login", (request, response) => {
	passport.authenticate("local", (error, citizen, info) => {
		if (error) throw error;
		if (!citizen) response.send("no user exists");
		else {
			request.logIn(citizen, (error) => {
				if (error) throw error;
				response.send("Successfully authenticated");
			});
		}
	})(request, response, next);
});

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

module.exports = router;
