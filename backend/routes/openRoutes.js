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

const nodemailer = require("nodemailer");
const keys = require("../keys");

router.post("/contact", (request, response) => {
	let output = { success: false, messages: [] };
	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: keys.gmailEmail,
			pass: keys.gmailPassword,
		},
	});

	mailOptions = {
		from: "contact@plugindemocracy.com",
		to: "contact@plugindemocracy.com",
		subject: "New Page Contact",
		html: `<h2>${request.body.title}</h2>
		FROM: ${request.body.email}
        ${request.body.message}`,
	};

	try {
		transporter.sendMail(mailOptions);
	} catch (error) {
		output.success = false;
		output.messages.push({ severity: "error", message: error.message });
		return response.json(output);
	}
	output.success = true;
	output.messages.push({
		severity: "info",
		message: "Your message has been sent. We will get in touch shortly :)",
	});

	response.json(output);
});

module.exports = router;
