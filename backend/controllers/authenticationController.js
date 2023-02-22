const passport = require("passport");
const CommunityModels = require("../models/communityModels");
const bcrypt = require("bcrypt"); //hash passwords and compare hashed passwords
const keys = require("../keys");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const postLogin = (request, response, next) => {
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
};

const postLogout = (request, response) => {
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
};

const postSignup = async (request, response, next) => {
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
};

const sendConfirmEmail = (request, resposne, next) => {
	//create jwt based on user ID and on Date.
	let output = {};

	const signature = jwt.sign(
		{
			_id: "hola",
		},
		keys.jsonSecret,
		{ expiresIn: "1d" }
		/*(error, token) => {
			console.log(token);
		}*/
	);
	console.log("signature: ", signature);

	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: keys.gmailEmail,
			pass: keys.gmailPassword,
		},
	});

	mailOptions = {
		from: "contacto@plugindemocracy.com",
		to: "joe@gummilabs.com",
		subject: "Verifique su correo para Democracia Conectada",
		html: `<h2>¡Hola!</h2>
        <p>Gracias por unirte a Democracia Conectada. Somos una organizacion con el gol de convertir nuestra
        sociedad en una verdadera democracia. Nuestra plataforma permite a las 
        comunidades operar como democracias directas. Estamos entusiasmados de que te hayas 
        unido a nuestra comunidad de ciudadanos comprometidos con la construcción de una 
        sociedad 100% democrática.</p>
        <p>Para comenzar a utilizar la plataforma, por favor verifica tu correo electrónico haciendo click en el enlace a continuación:</p>
        <a href = "https://192.168.1.68:8080/verifyemail/${signature}">Da click aqui</a><br/>
        <p>Si por alguna razón tienes problemas para verificar tu correo, por favor no 
        dudes en contactarnos a través de <a href="mailto:contact@plugindemocracy.com">contacto@plugindemocracy.com</a> 
        y te ayudaremos de inmediato.</p>
        <p>¡Gracias de nuevo por unirte a Democracia Conectada! 
        Estamos ansiosos de trabajar contigo en la construcción de una 
        sociedad transparente y participativa.</p>`,
	};

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log(info);
		}
	});
};

module.exports = {
	postLogin,
	postLogout,
	postSignup,
	sendConfirmEmail,
};
