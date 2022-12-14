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

async function fullCommunityObject(communityId){
    //mongoDB instance object: immutable
    let mongoCom = await CommunityModels.Community.findById(communityId);
    
    //declare the object that will be filled
    let community = {};
    //Basic info
    community.id = mongoCom.id;
    community.name = mongoCom.name;
    community.address = mongoCom.address;

    //Citizens
    community.citizens = [];
    for (let i = 0; i < mongoCom.citizens.length; i++){
        mongoCitizen = await CommunityModels.Citizen.findById(mongoCom.citizens[i]);
        citizen = {
            id: mongoCitizen.id,
            firstName: mongoCitizen.firstName,
            lastName: mongoCitizen.lastName,
            secondLastName: mongoCitizen.secondLastName,
            fullName: `${mongoCitizen.firstName} ${mongoCitizen.lastName} ${mongoCitizen.secondLastName}`,
            email: mongoCitizen.email,
            cellPhone: mongoCitizen.cellPhone,
            voter: false,
        }
        community.citizens.push(citizen);
    }

    //Homes
    let mongoHomes = [];
    for (let i = 0; i < mongoCom.homes.length; i++){
        let mongoHome = await CommunityModels.Home.findById(mongoCom.homes[i]);
        mongoHomes.push(mongoHome);
    }

    community.homes = [];
    for (let i = 0; i < mongoHomes.length; i++){
        let home = {
            id: mongoHomes[i].id,
            innerNumber: mongoHomes[i].innerNumber,
            community: community,

        }
        //Adding reference of community.citizens to homes[i].citizens and vice versa
        home.citizens = [];
        for(let j = 0; j < mongoHomes[i].citizens.length; j++){
            //what community.citizen index are the citizens in this home
            let index = community.citizens.findIndex(citizen => citizen.id == mongoHomes[i].citizens[j]);
            if(index === -1) console.log('-1');
            if(mongoHomes[i].citizens[j].voter === true) community.citizens[index].voter = true;
            community.citizens[index].residencies = [];
            community.citizens[index].residencies.push({community: community, home: home});
            home.citizens.push(community.citizens[index]);
        }
        community.homes.push(home);
    }
    
    //return object
    return community;
}



function returnCitizenFullName(citizen){
    if(citizen.firstName == undefined || citizen.lastName == undefined) return;
    return `${citizen.firstName} ${citizen.lastName} ${citizen.secondLastName}`;
}

module.exports = {
    isHomePartOfCommunity,
    isCitizenHomeCommunityConsistent,
    joinCitizenToCommunity,
    obtainCitizenHomeNumberInCommunity,
    createCommunity,
    fullCommunityObject,
    returnCitizenFullName,
}