const express = require("express");
const router = express.Router();
const authentication = require("../controllers/authenticationController");
const informational = require("../controllers/informationalController");

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

router.get("/sendconfirmationemail", (request, response) => {
	let output = authentication.sendConfirmEmail(request.user);
	response.json(output);
});

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const filesController = require("../controllers/filesController");

router.post(
	"/profilepicture",
	upload.single("profilePicture"),
	filesController.uploadProfilePicture
);

router.get("/profile-picture", filesController.getProfilePicture);

router.get("/account", informational.respondCitizenObject);

router.get("/community/about", informational.respondCommunitiesOfCitizen);

module.exports = router;
