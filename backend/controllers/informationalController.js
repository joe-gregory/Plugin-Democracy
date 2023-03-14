const CommunityModels = require("../models/communityModels");
const keys = require("../keys");

async function respondCitizenObject(request, response) {
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

	let communities = await CommunityModels.Community.communitiesWhereCitizen(
		request.user._id
	);
	output.citizen.communities = [];
	for (let community of communities) {
		output.citizen.communities.push({
			_id: community._id,
			name: community.name,
		});
	}
	response.json(output);
}

async function respondCommunitiesOfCitizen(request, response) {
	let output = {
		success: true,
		communities: [],
		messages: [],
	};
	let communities;

	try {
		communities = await CommunityModels.Community.communitiesWhereCitizen(
			request.user._id
		);
	} catch (error) {
		output.success = false;
		output.messages.push({ severity: "error", message: error.message });
		return response.json(output);
	}

	for (community of communities) {
		for (adminRecord of community.adminRecords) {
			let citizen = await CommunityModels.Citizen.findById(
				adminRecord.citizen
			);
			if (citizen) {
				citizen.password = null;
			}

			adminRecord.citizen = citizen;
		}

		for (nonAdminRoleRecord of community.nonAdminRoleRecords) {
			/*let citizen = await CommunityModels.Citizen.findById(
				nonAdminRoleRecord.citizen
			).toJSON();
			if (citizen) citizen.password = null;

			nonAdminRoleRecord.citizen = citizen;*/
		}

		output.communities.push(community.toJSON());
	}
	output.key = keys.googleMapsApiKey;

	response.json(output);
}

module.exports = {
	respondCitizenObject,
	respondCommunitiesOfCitizen,
};
