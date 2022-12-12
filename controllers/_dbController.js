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
    let home_community_id = community.id;

    let community_citizen_id = community.citizens.find(cit => cit === citizen.id);
    let community_home_id = community.homes.find(hm => hm === home.id);

    if(citizen_community_id && citizen_home_id && home_citizen_id && home_community_id && community_citizen_id && community_home_id) return true
    else return false
}

async function joinCitizenToCommunity(citizen, home, community) {
    //This function joins a citizen to a community if the citizen is not registered in the community 
    //or vice versa if community has it registered
    //if it can't it returns an error, otherwise the result of community.save()
     if(!isCitizenHomeCommunityConsistent(citizen, home,community)) {
        let citizen_home_number = obtainCitizenHomeNumberInCommunity(citizen, community);
        request.session.message = {
            type: 'danger',
            title: 'Usuario ya registrado en comunidad',
            message: `Usuario esta registrado con esta comunidad en casa ${citizen_home_number}.
            Tambien puede ser que la comunidad tenga al usuario registrado pero no viceversa. 
            Por favor comunicate con servicio tecnico.`
        }
        response.redirect('back');
        return new Error ('Unable to join citizen to community');
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
    let home = await CommunityModels.Home.findById(citizen_residency.home);
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

async function communityDetails(communityId){
    //return object with community's name, address, 
    //a homes list of sub objects with the home & its currently participating members full name, 
    //noting who the voting member is
    //active laws, active roles, active projects, (proposals?), active permits, badges
    let community = await CommunityModels.Community.findById(communityId);
    
    //homes 
    let homes = []
    for(let i = 0; i < community.homes.length; i++){
       let home = await homeDetails(community.homes[i]);
       homes.push(home);
    }
    community.homes = homes;

    //citizens
    let citizens = await CommunityModels.Citizen.find({'_id': {$in: community.citizens}});
    community.citizens = citizens;
    
    //active laws
    let laws = await CitizenActions.Law.find({'_id' : {$in: community.laws}});
    let activeLaws = laws.filter( law => law.active === true);
    community.laws = activeLaws;

    //active roles
    let roles = await CitizenActions.Role.find({'_id': {$in: community.roles}});
    let activeRoles = roles.filter(role => role.active === true);
    for(let i = 0; i < activeRoles.length; i++) {
        let rolee = await CommunityModels.Citizen.findById(activeRoles[i].citizen);
        activeRoles.citizen = rolee;
    }
    community.roles = activeRoles; 

    //active projects
    let projects = await CitizenActions.Project.find({'_id': {$in: community.projects}});
    let activeProjects = projects.filter(project => project.active === true);
    community.projects = activeProjects;
    
    //permits
    let permits = await CitizenActions.Permit.find({'_id' : {$in: community.permits}});
    let activePermits = permits.filter(permit => permit.active === true);
    community.permits = activePermits;

    //badges
    let badges = await CitizenActions.Badge.find({'_id': {$in: community.badges}});
    let activeBadges = badges.filter(badge => badge.active === true);
    community.badges = activeBadges;

    return community;
}

async function homeDetails(homeId){
    //return object with home number, and a list of its members with a voter true/false for voter
    //[id, full name, voter]
    let home = await CommunityModels.Home.findById(homeId);
    let community = await CommunityModels.Community.findById(home.community);
    home.community = community;

    let citizens = [];

    //cycling through the citizens of the home
    for(let i = 0; i < home.citizens.length; i++){
        
        let citizen = await CommunityModels.Citizen.findById(home.citizens[i]);
        
        (citizen.id == home.voter) ? citizen.voter = true : citizen.voter = false;
        
        citizens.push(citizen);
    }

    home.citizens = citizens; 

    return home;
}

module.exports = {
    isHomePartOfCommunity,
    isCitizenHomeCommunityConsistent,
    joinCitizenToCommunity,
    obtainCitizenHomeNumberInCommunity,
    createCommunity,
    communityDetails,
    homeDetails,
}