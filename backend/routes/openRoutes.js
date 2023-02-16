const express = require("express");
const router = express.Router();
const passport = require("passport");

router.get("/", (request, response) => {
	let output = {};
	output.authenticated = request.isAuthenticated();
	output.citizen = request.user;
	response.json(output);
});

router.post("/login", (request, response, next) => {
	if (request.isAuthenticated()) {
		let output = {
			success: false,
			messages: [{ type: "info", message: "User is already signed in" }],
			where: "post: login",
		};
		response.json(output);
	}
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
				citizen.password = null;
				output.citizen = citizen;
				console.log("output from /login: ", output);
				console.log("Citizen output in /login: ");
				console.log(citizen);
				response.json(output);
			});
		} else {
			output.success = false;
			response.json(output);
		}
	})(request, response, next);
});

router.post("/logout", (request, response) => {
	console.log("logging out ", request.user._id);
	let output = {
		where: "post: /logout",
	};
	request.logout((error) => {
		if (error) {
			output.success = false;
			output.messages = [{ type: "error", message: error.message }];
			output.authenticated = request.isAuthenticated();
		} else {
			output.success = true;
			output.messages = [{ type: "success", message: "Sesión cerrada " }];
			output.authenticated = request.isAuthenticated();
		}
		console.log("logged out output : ", output);
		response.json(output);
	});
});

router.get("/session-status", (request, response) => {
	let output = {};
	console.log("Is Authenticated? ", request.isAuthenticated());
	request.isAuthenticated()
		? (output.authenticated = true)
		: (output.authenticated = false);
	output.citizen = request.user;
	response.json(output);
});

module.exports = router;
