const CommunityModels = require('../models/communityModels');
const CitizenActions = require('../models/citizenActionsModels');

//function to check if a user is part of a community
//it checks whether the user ID shows up on the communities.
function isUserCitizen(user, community){

}

async function getAllCommunities(){
    let communities =  await CommunityModels.Community.find({});
    return communities;

}