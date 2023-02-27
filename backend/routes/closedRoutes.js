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

const CommunityModels = require("../models/communityModels");
router.get("/account", (request, response) => {
	let output = {
		where: "/account",
		success: true,
		messages: [],
	};

	let u = request.user;

	output.citizen = {
		firstName: u.firstName,
		lastName: u.lastName,
		secondLasName: u.secondLasName,
		fullName: u.fullName,
		dob: u.dob,
		email: u.email,
		cellPhone: u.cellPhone,
		superAdmin: u.superAdmin,
		cellPhoneConfirm: u.cellPhoneConfirm,
		emailConfirm: u.emailConfirm,
		createdAt: u.createdAt,
	};

	output.citizen.communities =
		CommunityModels.Community.communitiesWhereCitizen(request.user._id);

	response.json(output);
});

module.exports = router;
