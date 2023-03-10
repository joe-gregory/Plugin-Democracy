const express = require("express");
const router = express.Router();
const authentication = require("../controllers/authenticationController");
const informational = require("../controllers/informationalController");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const filesController = require("../controllers/filesController");
const CommunityModels = require("../models/communityModels");

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

router.post(
	"/profilepicture",
	upload.single("profilePicture"),
	filesController.uploadProfilePicture
);

router.get("/profile-picture", filesController.getProfilePicture);

router.get("/account", informational.respondCitizenObject);

router.get("/community/about", informational.respondCommunitiesOfCitizen);

router.post("/community/register", async (request, response) => {
	let output;

	request.body.communityRegistrator = request.user._id;

	try {
		output = await CommunityModels.createCommunity(request.body);
	} catch (error) {
		output.success = false;
		output.messages = [{ severity: "error", message: error.message }];
		return response.json(output);
	}
	output.messages = [
		{
			severity: "info",
			message:
				"We've received your request to register a community. We will need to get in touch for next steps.",
		},
	];
	response.json(output);
});

router.get("/community/join", async (request, response) => {
	//get list of communities that have verified as false
	let communityOptions;

	let output = { success: true, messages: [] };

	try {
		communityOptions = await CommunityModels.Community.find({
			verified: true,
		});
		output.communityOptions = communityOptions;
	} catch (error) {
		output.success = false;
		output.messages.push({ severity: "error", message: error.message });
		return response.json(output);
	}

	response.json(output);
});

router.post("/community/join", async (request, response) => {
	let output = { success: true, messages: [] };

	let community = await CommunityModels.Community.findById(
		request.body.community._id
	);
	if (!community) {
		output.success = false;
		output.messages.push({
			severity: "warning",
			message: "No community found with given informaiton.",
		});
	}

	//check that there is not another join request for the same person with the same information

	let prevReqs = community.joinRequests.filter(
		(joinRequest) =>
			joinRequest.citizen === request.user._id &&
			joinRequest.homeNumber === request.body.homeNumber &&
			joinRequest.type === request.body.type
	);
	if (prevReqs > 0) {
		output.success = false;
		output.messages.push({
			severity: "error",
			message: "There is already a request for this user at this house",
		});
		return response.json(output);
	}

	joinRequest = {
		citizen: request.user._id,
		homeNumber: +request.body.homeNumber,
		type: request.body.type,
	};

	community.joinRequests.push(joinRequest);

	try {
		community.save();
	} catch (error) {
		output.success = false;
		output.messages.push({ severity: "error", message: error.message });
		return response.json(output);
	}
	output.messages.push({
		severity: "info",
		message:
			"Your request to join the community has been sent. Community members will follow up with you for next steps.",
	});
	response.json(output);
});

router.get("/admin", async (request, response) => {
	let output = {
		success: true,
		messages: [],
	};

	let allOriginalCommunities = await CommunityModels.Community.find({});
	let allCommunities = JSON.parse(JSON.stringify(allOriginalCommunities));

	let unverifiedCommunities = allCommunities.filter(
		(community) => community.verified === false
	);
	let verifiedCommunities = allCommunities.filter(
		(community) => community.verified === true
	);
	let verifiedCommunitiesWithRequests = verifiedCommunities.filter(
		(community) => {
			return community.joinRequests.some(
				(request) => request.status === "new"
			);
		}
	);

	for (let unverifiedCommunity of unverifiedCommunities) {
		let communityRegistrator = await CommunityModels.Citizen.findById(
			unverifiedCommunity.communityRegistrator
		);
		communityRegistrator.password = null;
		unverifiedCommunity.communityRegistrator = communityRegistrator;
	}

	for (let verifiedCommunityWithRequest of verifiedCommunitiesWithRequests) {
		for (let joinRequest of verifiedCommunityWithRequest.joinRequests) {
			if (joinRequest.status === "new") {
				let citizen = await CommunityModels.Citizen.findById(
					joinRequest.citizen
				);
				joinRequest.citizen = citizen;
			}
		}
	}
	output.unverifiedCommunities = unverifiedCommunities;
	output.verifiedCommunitiesWithRequests = verifiedCommunitiesWithRequests;
	response.json(output);
});

router.post("/admin", async (request, response) => {
	let output = {
		success: true,
		messages: [],
	};
	let community = await CommunityModels.Community.findById(
		request.body.community._id
	);
	if (request.body.type === "unverifiedCommunity") {
		let output = {
			success: true,
			messages: [],
		};

		community.verified = true;

		try {
			community.save();
		} catch (error) {
			output.success = false;
			output.messages.push({ severity: "error", message: error.message });
			return response.json(output);
		}

		output.messages.push({
			severity: "success",
			message: `Community ${community.name} has been verified`,
		});
	} else if (request.body.type === "joinRequest") {
		let requestCitizen = await CommunityModels.Citizen.findById(
			request.body.joinRequest.citizen._id
		);

		let input = { home: {}, citizen: undefined };
		input.home.number = request.body.joinRequest.homeNumber;
		input.citizen = requestCitizen;
		let result;
		if (request.body.joinRequest.type === "owner") {
			result = await community.addOwner(input);
		} else {
			result = await community.addResident(input);
		}
		output.success = result.success;
		output.messages.push({
			severity: result.success ? "success" : "error",
			message: result.message,
		});
		/*
		if (output.success === true) {
			community.joinRequests.find(
				(request) => request.citizen === requestCitizen._id
			).status = "approved";
			await community.save();
		} */
	}

	response.json(output);
});

router.get("/community/:_id", async (request, response) => {
	let output = {
		success: true,
		messages: [],
	};
	let community = await CommunityModels.Community.findById(
		request.params._id
	);

	communityRecords = community.records.filter(
		(record) => record.status !== "inactive"
	);
	output.feed = communityRecords;
	return response.json(output);
	communityPosts = community.posts;

	let unorderedFeed = communityRecords.concat(communityPosts);

	let feed = unorderedFeed.sort((a, b) => {
		const aDate = a.date || a.statusUpdateDate;
		const bDate = b.date || b.statusUpdateDate;
		return aDate - bDate;
	});

	output.feed = feed;
	response.json(output);
});

router.post("/community/vote", async (request, response) => {
	let output = {
		success: true,
		messages: [],
	};
	let community = await CommunityModels.Community.findById(
		request.body.community._id
	);

	let input = {
		citizen: request.user,
		record: request.body.record,
		vote: request.body.vote,
	};
	let result = await community.vote(input);

	output.success = result.success;
	let message = {};
	result.success
		? (message.severity = "success")
		: (message.severity = "error");
	message.message = result.message;
	output.messages.push(message);
	response.json(output);
});

router.post("/createproposal", async (request, response) => {
	let output = {
		success: true,
		messages: [],
	};

	let community = await CommunityModels.Community.findById(
		request.body.community._id
	);
	let input = {
		citizen: request.user,
		proposal: {
			title: request.body.title,
			body: request.body.body,
			description: request.body.description,
			effectiveDate: request.body.effectiveDate,
			expirationDate: request.body.expirationDate,
		},
	};

	let result = await community.createProposal(input);
	output.success = result.success;
	let message = {};
	result.success
		? (message.severity = "success")
		: (message.severity = "error");
	message.message = result.message;
	output.messages.push(message);
});

module.exports = router;
