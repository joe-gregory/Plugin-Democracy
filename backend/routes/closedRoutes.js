const express = require("express");
const router = express.Router();
const authentication = require("../controllers/authenticationController");

router.all("/*", (request, response, next) => {
	if (!request.isAuthenticated()) {
		let output = {
			success: false,
			messages: [{ severity: "error", message: "protected route" }],
		};
		return response.json(output);
	}
	next();
});

router.post("/sendconfirmationemail", authentication.sendConfirmEmail);

router.get("/aaa", (request, response) => {
	let output = {
		success: true,
		messages: [{ severity: "info", message: "made it passed security" }],
	};
	response.json(output);
});

module.exports = router;
