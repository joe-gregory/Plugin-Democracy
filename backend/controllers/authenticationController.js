const passport = require("passport");
const CommunityModels = require("../models/communityModels");
const bcrypt = require("bcrypt"); //hash passwords and compare hashed passwords
const keys = require("../keys");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const logIn = (request, response, next) => {
  if (request.isAuthenticated()) {
    let output = {
      success: false,
      messages: [{ severity: "info", message: "User is already signed in" }],
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
      request.login(citizen, async (error) => {
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
        output.citizen = citizen;
        communities = await CommunityModels.Community.communitiesWhereCitizen(
          request.user._id
        );

        output.communities = communities;

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
      output.messages = [{ severity: "success", message: "Session closed " }];
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
      message: "Passwords don't match",
    });
    output.success = false;
  }

  if (request.body.password.length < 7) {
    output.messages.push({
      severity: "error",
      message: "Passwords needs to be at least 7 characters long",
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
      message: "Date cannot be greater than today",
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
    message: "Citizen created successfully",
  });

  //login user
  try {
    request.login(createCitizenResult, (error) => {
      if (error) {
        output.messages.push({
          severity: "error",
          message: "Unable to login user after signup. " + error.message,
        });
      }
      output.messages.push({
        severity: "info",
        message: "Session initialized",
      });
      output.authenticated = request.isAuthenticated();

      let confirmOutput = sendConfirmEmail(request.user);
      for (let message of confirmOutput.messages) output.messages.push(message);

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
  //THIS FUNCTION DOES NOT SEND ITS OWN RESPONSE

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
    from: "contact@plugindemocracy.com",
    to: citizen.email,
    subject: "Plugin Democracy. Verify email address",
    html: `<h2>Hi!</h2>
        <p>Thank you for joining plugin democracy.</p>
        <p>To begin using the platform, please verify your email address:</p>
        <a href = "https://192.168.1.68:5173/verifyemail?jwt=${token}">Click here</a><i>  Expires in 1 day</i><br/>
        <p>If you encounter any issues, email us at:  <a href="mailto:contact@plugindemocracy.com">contact@plugindemocracy.com</a></p>
`,
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
      "An email has been sent to your inbox. Please follow the link to validate your account. Link expires in 1 day.",
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

    citizen.emailConfirm = true;

    try {
      citizen.save();
      output.messages.push({
        severity: "success",
        message: "Email confirmed.",
      });
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
