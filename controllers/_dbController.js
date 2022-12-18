const CommunityModels = require('../models/communityModels');
const CitizenActionsModels = require('../models/citizenActionsModels');

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

    return true;
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
        address: community_details.communityAddress, 
    });
    let homes = [];
    for(let i = community_details.communityStartingNumber; i <= community_details.communityEndingNumber; i++){
        let home = new CommunityModels.Home({
            innerNumber: i, 
            community:community,
        });

        community.homes.push(home);
        homes.push(home);
        console.log(homes);
        console.log(community.homes);
    }
    //if there is an error, delete everything that was saved
   let result = false;
  
    await community.save().
    then(() => {result = true; console.log('saved community')}).
    catch(() => result = false);
    for (let i = 0; i < homes.length; i++){
        await homes[i].save().
        then(() => result = true).
        catch(() =>result = false);
    }

    if(result === false){
        await community.remove();
        for(let j = 0; j < homes.length; j++){
            await homes[j].remove();
        }
    }

    return result;
}

async function fullCommunityObject(communityId){
    //mongoDB instance object: immutable
    let mongoCommunity = await CommunityModels.Community.findById(communityId);
    
    //declare the object that will be filled
    let community = {};
    //Basic info
    community.id = mongoCommunity.id;
    community.name = mongoCommunity.name;
    community.address = mongoCommunity.address;

    //Citizens
    community.citizens = [];
    for (let i = 0; i < mongoCommunity.citizens.length; i++){
        mongoCitizen = await CommunityModels.Citizen.findById(mongoCommunity.citizens[i]);
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
    for (let i = 0; i < mongoCommunity.homes.length; i++){
        let mongoHome = await CommunityModels.Home.findById(mongoCommunity.homes[i]);
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
   
    //proposals
    community.proposals = [];
    for(let i = 0; i < mongoCommunity.proposals.length; i++){
        let mongoProposal = await CitizenActionsModels.Proposal.findById(mongoCommunity.proposals[i]);
        let authorIndex = community.citizens.findIndex(citizen => citizen.id == mongoProposal.author);
        let proposal = {
            title: mongoProposal.title,
            body: mongoProposal.body,
            type: mongoProposal.type,
            author: community.citizens[authorIndex],
            votesInFavor: mongoProposal.votesInFavor,
            votesAgainst: mongoProposal.votesAgainst,
            community: community,
            approvedDate: mongoProposal.approvedDate,
            passed: mongoProposal.passed,
            passedDate: mongoProposal.passedDate,
            citizenActionTitle: mongoProposal.citizenActionTitle,
            citizenActionBody: mongoProposal.citizenActionBody,
            citizenActionStartDate: mongoProposal.citizenActionStartDate,
            citizenActionExpirationDate: mongoProposal.citizenActionExpirationDate,
            citizenActionActive: mongoProposal.citizenActionActive,
            citizenActionPay: mongoProposal.citizenActionPay,
            citizenActionVolunteersAmount: mongoProposal.citizenActionVolunteersAmount,
            citizenActionBadgeImage: mongoProposal.citizenActionBadgeImage,            
        }
        //proposals: citizenActionVolunteers (citizens)
        proposal.citizenActionVolunteers = []
        for (let j = 0; j < mongoProposal.citizenActionVolunteers.length; j++){
            let volunteerIndex = community.citizens.findIndex(citizen.id == mongoProposal.citizenActionvolunteers[j]);
            proposal.citizenActionVolunteers.push(community.citizens[volunteerIndex]);
        }
        //votes
        //proposal: votes
        proposal.votes = []
        for(let k = 0; k < mongoProposal.votes.length; k++){
            mongoVote = await CitizenActionsModels.Vote.findById(mongoVote);
            citizenIndex = community.citizens.findIndex(citizen => citizen.id == mongoVote.citizen)
            vote = {
                citizen: community.citizens[citizenIndex],
                inFavor: mongoVote.inFavor,
                proposal: proposal,
            }
        }
        community.proposals.push(proposal);
    }

    //laws
    community.laws = [];
    for(let i = 0; i < mongoCommunity.laws.length; i++){
        let mongoLaw = CitizenActionsModels.Law.findById(mongoCommunity.laws[i]);
        let authorIndex = community.citizens.findIndex(citizen => citizen.id == mongoLaw.author)
        let proposalIndex = community.proposals.findIndex(proposal => proposal.id == mongoLaw.proposal);
        let law = {
            title: mongoLaw.title,
            law: mongoLaw.law,
            author: community.citizens[authorIndex],
            proposal: community.proposals[proposalIndex],
            community: community,
            beginningDate: mongoLaw.beginningDate,
            expirationDate: mongoLaw.expirationDate,
            active: mongoLaw.active,

        }
        community.laws.push(law);
    }

    //roles
    community.roles = [];
    for(let i = 0; i < mongoCommunity.roles.length; i++){
        let mongoRole = await CitizenActionsModels.Role.findById(mongoCommunity.roles[i]);
        citizenIndex = community.citizens.findIndex(citizen => citizen.id == mongoRole.citizen);
        proposalIndex = community.proposals.findIndex(proposal => proposal.id == mongoRole.proposal);
        role = {
            title: mongoRole.title,
            body: mongoRole.body,
            community: community,
            citizen: community.citizens[citizenIndex],
            proposal: community.proposals[proposalIndex],
            beginningDate: mongoRole.beginningDate,
            expirationDate: mongoRole.expirationDate,
            active: mongoRole.active,
            pay: mongoRole.pay
        }
        community.roles.push(role);
    }

    //projects
    community.projects = [];
    for(let k = 0; k < mongoCommunity.projects.length; k++){
        let mongoProject = await CitizenActionsModels.Project.findById(mongoCommunity.projects[k]);
        proposalIndex = community.proposals.findIndex(proposal => proposal.id == mongoProject.proposal);
        let project = {
            title: mongoProject.title,
            body: mongoProject.body,
            community: community,
            proposal: community.proposals[proposalIndex],
            beginningDate: mongoProject.beginningDate,
            expiratioNDate: mongoProject.expirationDate,
            active: mongoProject.active,
        }
        project.volunteers = [];
        for (let j = 0; j < mongoProject.volunteers.length; j++){
            volunteerIndex = community.citizens.findIndex(citizen => citizen.id == mongoProject.volunteers[j]);
            project.volunteers.push(community.citizens[volunteerIndex]);
        }
        community.projects.push(project);
    }

    //badges
    community.badges = [];
    for(let i = 0; i < mongoCommunity.badges.length; i++){
        mongoBadge = await CitizenActionsModels.Badge.findById(mongoCommunity.badges[i]);
        proposalIndex = community.proposals.findIndex(proposal => proposal.id == mongoBadge.proposal);
        let badge = {
            title: mongoBadge.title,
            body: mongoBadge.body,
            community: community,
            proposal: community.proposals[proposalIndex],
            beginningDate: mongoBadge.beginningDate,
            expirationDate: mongoBadge.expirationDate,
            active: mongoBadge.active,
            image: mongoBadge.image,
        }
    }
    

    //proposals: citizenActionRewardBadges & citizenActionDocument
    for(let k = 0; k < community.proposals.length; k++){
        community.proposals[k].citizenActionRewardBadges = [];
        let mongoProposal = await CitizenActionsModels.Proposal.findById(community.proposals[k].id);
        //Badges
        for(let i = 0; i < mongoProposal.citizenActionRewardBadges.length; i++){
            badgeIndex = community.badges.findIndex(badge => badge.id == mongoProposal.citizenActionRewardBadges[i]);
            community.proposals[k].citizenActionRewardBadges.push(community.badges[badgeIndex]);
        }
        //citizenActionDocument
        //I would have to look in: laws, roles, projects, badges & permits
        let indexLaw = community.laws.findIndex(law => law.id == mongoProposal.citizenActionDocument);
        if(indexLaws > -1) community.proposals[k].citizenActionDocument = community.laws[indexLaw];
        let indexRole = community.roles.findIndex(role => role.id == mongoProposal.citizenActionDocument);
        if(indexRole > -1) community.proposals[k].citizenActionDocument = community.roles[indexRole];
        let indexProject = community.projects.findIndex(project => project.id == mongoProposal.citizenActionDocument);
        if(indexProject > -1) community.proposals[k].citizenActionDocument = community.projects[indexProject];
        let indexBadge = community.badges.findIndex(badge => badge.id == mongoProposal.citizenActionDocument);
        if(indexBadge > -1) community.proposals[k].citizenActionDocument = community.badges[indexBadge];
        let indexPermit = community.permits.findIndex(permit => permit.id == mongoProposal.citizenActionDocument);
        if(indexPermit > -1) community.permits[k].citizenActionDocument = community.permits[indexPermit];
    }
    
    //project: rewardBadges: 
    for(let k = 0; k < community.projects.length; k++){
        let mongoProject = await CitizenActionsModels.Project.findById(community.projects[k].id);
        let badgeIndexes = [];
        community.projects[k].rewardBadges = [];
        for(j = 0; j < mongoProject.rewardBadges.length; j++){
            let mongoBadge = await CitizenActionsModels.Badge.findById(mongoProject.rewardBadges[j]);
            let badgeIndex = community.badges.findIndex(badge => badge.id == mongoBadge.id);
            community.projects[k].rewardBadges.push(community.badges[badgeIndex]);
        }
    }

    //permits
    community.permits = [];
    for(let k = 0; k < mongoCommunity.permits.length; k++){
        let mongoPermit = await CitizenActionsModels.Permit.findById(mongoCommunity.permits[k]);
        let proposalIndex = community.proposals.findIndex(proposal => proposal.id == mongoPermit.proposal);
        let permit = {
            title: mongoPermit.title,
            body: mongoPermit.body,
            community: community,
            proposal: community.proposals[proposalIndex],
            beginningDate: mongoPermit.beginningDate,
            expirationDate: mongoPermit.expirationDate,
            active: mongoPermit.active,
        }
        permit.citizens = [];
        for (j = 0; j < mongoPermit.citizens.length; j++){
            let citizenIndex = community.citizens.findIndex(citizen => citizen.id == mongoPermit.citizens[j]);
            permit.citizens.push(community.citizens[citizenIndex]);
        }
        community.permits.push(permit);
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