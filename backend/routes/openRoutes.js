const express = require("express");
const router = express.Router();
const authentication = require("../controllers/authenticationController");

router.get("/", (request, response) => {
	let output = {
		authenticated: request.isAuthenticated(),
	};

	response.json(output);
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

router.post("/login", authentication.postLogin);

router.post("/logout", authentication.postLogout);

router.post("/signup", authentication.postSignup);

router.get("/test-messages", (request, response) => {
	let severities = ["success", "error", "warning", "info"];
	let messages = [];
	for (let i = 0; i < severities.length; i++) {
		messages.push({
			severity: severities[i],
			message: `This is a ${severities[i]} message`,
		});
	}
	let output = {};
	output.messages = messages;
	response.json(output);
});

module.exports = router;
