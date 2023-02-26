const express = require("express");
const router = express.Router();
const authentication = require("../controllers/authenticationController");
/*
router.all("/*", (request, response, next) => {
	if (!request.isAuthenticated()) {
		let output = {
			success: false,
			messages: [{ severity: "error", message: "protected route" }],
		};
		return response.json(output);
	}
	next();
});*/

router.post("/sendconfirmationemail", authentication.sendConfirmEmail);

const fs = require("fs");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
//import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const s3Client = require("@aws-sdk/client-s3");
const keys = require("../keys");
const s3 = new s3Client.S3Client({
	credentials: {
		accessKeyId: keys.aws_access_key,
		secretAccessKey: keys.aws_secret_access_key,
	},
	region: keys.aws_bucket_region,
});

router.post(
	"/profilepicture",
	upload.single("profilePicture"),
	async (request, response) => {
		let output = {};
		output.success = false;
		output.messages = [];

		const params = {
			Bucket: keys.aws_bucket_name,
			Key: "profile-pictures/" + request.file.originalname,
			Body: request.file.buffer,
			ContentType: request.file.mimetype,
		};
		const command = new s3Client.PutObjectCommand(params);

		try {
			await s3.send(command);
		} catch (error) {
			console.log("ERROR UPLOADING: ", error);
		}
	}
);

router.get("/profile-picture", async (request, response) => {
	const getObjectParams = {
		Bucket: keys.aws_bucket_name,
		Key: "profilePictures/profilePic.jpeg",
	};
	const command = new s3Client.GetObjectCommand(getObjectParams);
	try {
		const data = await s3.send(command);
		response.setHeader("Content-Type", data.ContentType);
		response.end(data.Body, "binary");
	} catch (error) {
		console.log("First error, ", error);
	}
});

module.exports = router;
