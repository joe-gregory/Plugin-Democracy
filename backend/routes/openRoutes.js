const express = require("express");
const router = express.Router();
const passport = require("passport");
const CommunityModels = require("../models/communityModels");
const bcrypt = require("bcrypt"); //hash passwords and compare hashed passwords

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

router.post("/login", (request, response, next) => {
	if (request.isAuthenticated()) {
		let output = {
			success: false,
			messages: [
				{ severity: "info", message: "User is already signed in" },
			],
			where: "post: login",
		};
		response.json({ ...output });
	}
	passport.authenticate("local", (error, citizen, info) => {
		let output = {};
		output.where = "post: /login";
		output.authenticated = request.isAuthenticated();
		output.success = info.success;
		output.messages = [...info.messages];

		if (error) {
			output.success = false;
			output.messages.push({ severity: "error", message: error.message });
			console.log(output);
			response.status(401).json(output);
		}
		if (citizen) {
			request.login(citizen, (error) => {
				if (error) {
					output.messages.push({
						severity: "error",
						message: error.message,
					});
				}
				output.authenticated = request.isAuthenticated();
				citizen.password = null;
				output.citizen = citizen;
				console.log("output from /login: ", output);
				console.log("Citizen output in /login: ");
				console.log(citizen);
				response.json({ ...output });
			});
		} else {
			output.success = false;
			response.json({ ...output });
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
			output.messages = [{ severity: "error", message: error.message }];
			output.authenticated = request.isAuthenticated();
		} else {
			output.success = true;
			output.messages = [
				{ severity: "success", message: "Sesión cerrada " },
			];
			output.authenticated = request.isAuthenticated();
		}
		console.log("logged out output : ", output);
		response.json(output);
	});
});

router.post("/signup", async (request, response, next) => {
	console.log(request.body);

	let output = {};
	output.messages = [];
	output.success = true;

	if (request.body.password !== request.body.confirmPassword) {
		output.messages.push({
			severity: "error",
			message: "las contraseñas no coinciden",
		});
		output.success = false;
	}

	if (request.body.password.length < 7) {
		output.messages.push({
			severity: "error",
			message: "Contraseña ocupa minimo 7 caracteres",
		});
		output.success = false;
	}

	//process dob. Incoming format: YYYY-MM-DD
	const [year, month, day] = request.body.dob.split("-").map(Number);
	const dobObject = new Date(year, month - 1, day); //months start at zero so need to substract 1
	if (dobObject > new Date()) {
		output.success = false;
		output.messages.push({
			severity: "error",
			message: "La fecha no puede ser mayor que hoy",
		});
	}
	//Create citizen
	if (output.success === true) {
		try {
			const hashedPassword = await bcrypt.hash(request.body.password, 10);

			output.citizen = CommunityModels.createCitizen({
				firstName: request.body.firstName,
				lastName: request.body.lastName,
				secondLastName: request.body.secondLastName,
				dob: dobObject,
				email: request.body.email,
				password: hashedPassword,
				cellPhone: request.body.cellPhone,
			});
			output.citizen.password = null;
			output.messages.push({
				severity: "success",
				message: "ciudadano creado exitosamente",
			});
		} catch (error) {
			output.success = false;
			output.messages.push({ severity: "error", message: error.message });
		}
	}

	response.json(output);
});

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
