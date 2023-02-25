const express = require("express");
const router = express.Router();
const authentication = require("../controllers/authenticationController");

const fs = require("fs");
const multer = require("multer");
const storage = multer.diskStorage({
	destination: function (request, file, cb) {
		cb(null, "./uploads");
	},
	filename: function (request, file, cb) {
		cb(null, Date.now().toString());
	},
});
const upload = multer({ storage: storage });

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

router.post(
	"/profilepicture",
	upload.single("profilePicture"),
	(request, response) => {
		const file = request.file;

		let output = {};
		output.success = false;
		output.messages = [];

		if (!file) {
			output.messages.push({
				severity: "error",
				message: "missing file",
			});
			return response.json(output);
		}

		const filePath = file.path; //get the path of the uploaded file
		const newFilePath = "./uploads/" + file.originalname; //construct path to new file
		fs.rename(filePath, newFilePath, function (error) {
			if (error) {
				output.messages.push({
					severity: "error",
					message: error.message,
				});
				return response.json(output);
			} else {
				output.success = true;
				output.messages.push({
					severity: "success",
					message: "File uploaded successfully",
				});
			}
		});
	}
);

module.exports = router;
