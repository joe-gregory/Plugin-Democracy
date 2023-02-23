const passport = require("passport");
const CommunityModels = require("../models/communityModels");
const bcrypt = require("bcrypt"); //hash passwords and compare hashed passwords
const keys = require("../keys");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const base64url = require("base64url");

const logIn = (request, response, next) => {
	if (request.isAuthenticated()) {
		let output = {
			success: false,
			messages: [
				{ severity: "info", message: "User is already signed in" },
			],
			where: "post: login",
		};
		return response.json(output);
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
			return response.status(401).json(output);
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
				output.emailConfirm = citizen.emailConfirm;
				citizen.password = null;
				output.emailConfirm = citizen.emailConfirm;
				return response.json(output);
			});
		} else {
			output.success = false;
			return response.json(output);
		}
	})(request, response, next);
};

const logOut = (request, response) => {
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
			output.emailConfirm = false;
		}
		response.json(output);
	});
};

const signUp = async (request, response, next) => {
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
	//prechecks failed
	if (!output.success === true) return response.json(output);

	//Create citizen
	const hashedPassword = await bcrypt.hash(request.body.password, 10);

	let createCitizenResult = await CommunityModels.createCitizen({
		firstName: request.body.firstName,
		lastName: request.body.lastName,
		secondLastName: request.body.secondLastName,
		dob: dobObject,
		email: request.body.email,
		password: hashedPassword,
		cellPhone: request.body.cellPhone,
	});

	if (createCitizenResult instanceof Error) {
		output.success = false;
		output.messages.push({
			severity: "error",
			message: createCitizenResult.message,
		});
		return response.json(output);
	}

	output.success = true;
	output.messages.push({
		severity: "success",
		message: "ciudadano creado exitosamente",
	});

	//login user
	try {
		request.login(createCitizenResult, (error) => {
			if (error) {
				output.messages.push({
					severity: "error",
					message:
						"Unable to login user after signup. " + error.message,
				});
			}
			output.messages.push({
				severity: "info",
				message: "Sesión iniciada",
			});
			output.authenticated = request.isAuthenticated();

			let confirmOutput = sendConfirmEmail(request.user);
			for (let message of confirmOutput.messages)
				output.messages.push(message);

			response.json(output);
		});
	} catch (error) {
		output.messages.push({
			severity: "error",
			message: error.message,
		});
	}
};

const sendConfirmEmail = (citizen) => {
	//create jwt based on user ID and on Date.

	let output = {
		success: false,
		messages: [],
	};

	const token = jwt.sign(
		{
			_id: citizen._id,
		},
		keys.jwtSecret,
		{ expiresIn: "1d" }
	);

	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: keys.gmailEmail,
			pass: keys.gmailPassword,
		},
	});

	mailOptions = {
		from: "contacto@plugindemocracy.com",
		to: citizen.email,
		subject: "Verifique su correo para Democracia Conectada",
		html: `<h2>¡Hola!</h2>
        <p>Gracias por unirte a Democracia Conectada. Somos una organizacion con el gol de convertir nuestra
        sociedad en una verdadera democracia. Nuestra plataforma permite a las 
        comunidades operar como democracias directas. Estamos entusiasmados de que te hayas 
        unido a nuestra comunidad de ciudadanos comprometidos con la construcción de una 
        sociedad 100% democrática.</p>
        <p>Para comenzar a utilizar la plataforma, por favor verifica tu correo electrónico haciendo click en el enlace a continuación:</p>
        <a href = "https://192.168.1.68:5173/verifyemail?jwt=${token}">Da click aqui</a><i>  Enlace expira en un dia</i><br/>
        <p>Si por alguna razón tienes problemas para verificar tu correo, por favor no 
        dudes en contactarnos a través de <a href="mailto:contact@plugindemocracy.com">contacto@plugindemocracy.com</a> 
        y te ayudaremos de inmediato.</p>
        <p>¡Gracias de nuevo por unirte a Democracia Conectada! 
        Estamos ansiosos de trabajar contigo en la construcción de una 
        sociedad transparente y participativa.</p>`,
	};

	try {
		transporter.sendMail(mailOptions);
	} catch (error) {
		output.success = false;
		output.messages.push({ severity: "error", message: error.message });
		return output;
	}
	output.success = true;
	output.messages.push({
		severity: "info",
		message:
			"Favor de seguir el enlace que se le envio al correo que uso para inscribirse para confirmar su cuenta. El link expira en un dia.",
	});

	return output;
};

const confirmEmail = (request, response) => {
	let output = { success: false, messages: [] };

	const token = request.query.jwt;

	const verifiedToken = jwt.verify(token, keys.jwtSecret);

	//check expiration date:
	if (verifiedToken.exp * 1000 < Date.now()) {
		output.success = false;
		output.messages.push({
			severity: "error",
			message: "Este enlace ha expirado",
		});
		return response.json(output);
	}

	CommunityModels.Citizen.findById(verifiedToken._id, (error, citizen) => {
		if (error) {
			output.success = false;
			output.messages.push({
				severity: "error",
				message: error.message,
			});
			return response.json(output);
		}
		//Message if citizen is already confirmed. During development reacts seems to run hook twice so this shows always
		/*if (citizen.emailConfirm === true) {
			output.success = false;
			output.messages.push({
				severity: "info",
				message: "Este correo ya esta validado",
			});
			return response.json(output);
		}*/
		citizen.emailConfirm = true;

		try {
			citizen.save();
		} catch (error) {
			output.success = false;
			output.messages.push({
				severity: "error",
				message: error.message,
			});

			return response.json(output);
		}

		output.emailConfirm = true;
		output.success = true;
		output.messages.push({
			severity: "success",
			message: "Correo electronico confirmado",
		});

		response.json(output);
	});
};

module.exports = {
	logIn,
	logOut,
	signUp,
	sendConfirmEmail,
	confirmEmail,
};
