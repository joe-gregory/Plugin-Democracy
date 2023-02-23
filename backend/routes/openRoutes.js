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

	request.isAuthenticated()
		? (output.authenticated = true)
		: (output.authenticated = false);

	if (request.user) output.emailConfirm = request.user.emailConfirm;
	else output.emailConfirm = false;

	response.json(output);
});

router.post("/login", authentication.logIn);

router.post("/logout", authentication.logOut);

router.post("/signup", authentication.signUp);

router.get("/verifyemail", authentication.confirmEmail);

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
