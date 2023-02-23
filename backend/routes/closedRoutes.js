const express = require("express");
const router = express.Router();
const authentication = require("../controllers/authenticationController");

router.post("/sendconfirmationemail", authentication.sendConfirmEmail);

router.get("/verifyemail/:jwt", authentication.confirmEmail);

module.exports = router;
