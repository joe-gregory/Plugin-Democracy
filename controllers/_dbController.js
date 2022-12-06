const CommunityModels = require('../models/communityModels');
const CitizenActions = require('../models/citizenActionsModels');

async function isHomePartOfCommunity(home, community){
    //returns true if a Home ID is also registered in community.innerHomes
    //Search for homes that have a community id == community
    let homes = await CommunityModels.Home.find({'_id' : {$in: community.innerHomes}});
    if(homes.includes(home)) return true
    else return false
}

async function isCitizenHomeCommunityConsistent(citizen, home, community){
    //returns true if the citizen has the community & home registered &&
    //if the home has the citizen & community registered &&
    //if the community has the citizen & home registered
    //otherwise false
    //if all these conditions don't hold true, something went wrong somewhere

    let citizen_community_id = citizen.residencies.find(residency => residency.community === community.id);
    let citizen_home_id = citizen.residencies.find(residency => residency.home === home.id);

    let home_citizen_id = home.citizens.find(cit => cit === citizen.id);
    let home_community_id = home.community.find(com => com === community.id);

    let community_citizen_id = community.citizens.find(cit => cit === citizen.id);
    let community_home_id = community.homes.find(hm => hm === home.id);

    if(citizen_community_id && citizen_home_id && home_citizen_id && home_community_id && community_citizen_id && community_home_id) return true
    else return false
}

async function joinCitizenToCommunity(citizen, home, community) {
     //can't join community if you are already part of community
     if(!dbController.isCitizenHomeCommunityConsistent(citizen, home,community)) {
        let citizen_home_number = dbController.obtainCitizenHomeNumberInCommunity(citizen, community);
        request.session.message = {
            type: 'danger',
            title: 'Usuario ya registrado en comunidad',
            message: `Usuario esta registrado con esta comunidad en casa ${citizen_home_number}.
            Tambien puede ser que la comunidad tenga al usuario registrado pero no viceversa. 
            Por favor comunicate con servicio tecnico.`
        }
        response.redirect('back');
        return;
    }
    
    let citizen_residency = {
        community: community,
        home : home,
    };

    citizen.residencies.push(citizen_residency);
    community.citizens.push(citizen);
    home.citizens.push(citizen);

    await citizen.save();
    await community.save();
    await home.save();
}

async function obtainCitizenHomeNumberInCommunity(citizen, community){
    //returns the house number of the citizen in a given community
    let citizen_residency = citizen.residencies.find(residency => residency.community === community.id);
    let home = await CommunityModels.Home.findById(citizen_community.home);
    return home.innerNumber;
}

async function createCommunity(community_details){
    
    const community = new CommunityModels.Community({
        name:  community_details.communityName,
        communityAddress: community_details.communityAddress, 
    });
    
    for(let i = community_details.communityStartingNumber; i <= community_details.communityEndingNumber; i++){
        let home = new CommunityModels.Home({
            innerNumber: i, 
            community:community,
        });

        home.save().catch((error) => {return(error)});;
        community.homes.push(home);
    }

    community.save()
        .then((result) => {return(result)})
        .catch((error) => {return(error)});
}

module.exports = {
    isHomePartOfCommunity,
    isCitizenHomeCommunityConsistent,
    joinCitizenToCommunity,
    obtainCitizenHomeNumberInCommunity,
    createCommunity,
}