const express = require("express");
const router = express.Router();

router.get("/", (request, response) => {
	let output = {};
	output.authenticated = request.isAuthenticated();
	output.citizen = request.user;
	response.json(output);
});

module.exports = router;
