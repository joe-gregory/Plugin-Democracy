const CommunityModels = require("../models/communityModels");

async function aboutCitizen(request, response) {
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

module.exports = {
	aboutCitizen,
};
