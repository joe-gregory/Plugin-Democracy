const CommunityModels = require('../models/communityModels');
const CitizenActionsModels = require('../models/citizenActionsModels');

async function createCommunity(community_details){
    //function creates a community and saves it or returns an error
    
    //generate homes objects
    let homes = [];
    for(let i = community_details.homesStartingNumber; i <= community_details.homesEndingNumber; i++){
        homes.push({identifier: i})
    }

    //create community
    const community = new CommunityModels.Community({

        name: community_details.name,
        votingUnit: community_details.votingUnit,
        address: community_details.address,
        homes: homes,
    });
    //La primera y segunda ley se agregan a la comunidad automaticamente
    let law1 = {title: 'Gobierno de la Comunidad', identifier: '000001', number: 1};
    if(community.votingUnit === 'homes.owner'){
        law1.body = "La comunidad operará como una democracia directa, " +
            "en la cual todos los propietarios tienen la oportunidad igual de participar " +
            "en el proceso de toma de decisiones. Cualquier residente de la comunidad, incluyendo " +
            "aquellos que no son propietarios, pueden crear propuestas para la comunidad, pero solo " +
            "los propietarios tienen derecho a votar. Una mayoría de votos de los propietarios se " +
            "considera como una propuesta aprobada."
            "\n\n" +
            "En esta forma de democracia directa, los propietarios pueden en cualquier momento 'desconectar'" +
            " su voto de una propuesta. Los votos pueden ser desconectados incluso de leyes, roles, permisos, " +
            "distintivos o proyectos aprobados. Si una propuesta pierde votos pero todavía está dentro del límite " +
            "de tiempo de propuesta establecido por esta constitución, entonces sigue siendo una propuesta y mantiene" +
            " los votos 'conectados' a favor. Si una ley, rol, medalla, permiso o proyecto aprobado pierde la " +
            "mayoría de votos después de ser aprobado, se vuelve inactivo. Una vez inactivo, todos los votos son " +
            "desconectados y si los ciudadanos desean votar sobre una propuesta similar de nuevo, debe ser recreada." +
            "\n\n"+
            "La comunidad utilizará la plataforma Democracia Conectada para facilitar este proceso, incluyendo pero " +
            "no limitado a la creación, discusión y votación de propuestas. La plataforma será considerada el medio " +
            "oficial de llevar a cabo los negocios de la comunidad." +
            "\n\n" +
            "Al residir en la comunidad, se entenderá que todos los propietarios han leído, comprendido y aceptado " +
            "cumplir con los términos y condiciones establecidos en esta ley.";
    } else if(community.votingUnit === 'community.citizens'){
        law1.body = "La comunidad operará como una democracia directa, en la cual todos los ciudadanos de la comunidad " +
            "tienen la oportunidad igual de participar en el proceso de toma de decisiones. Cualquier residente de la comunidad" +
            " puede crear propuestas para la comunidad, y todos los ciudadanos tienen derecho a votar. Un ciudadano no puede " +
            "conectar o desconectar mas de un voto por una propuesta, ley, rol, medalla, permiso o proyecto. Una mayoría de votos " +
            "de los ciudadanos se considera como una propuesta aprobada." +
            "\n\n" +
            "En esta forma de democracia directa, los ciudadanos tienen la posibilidad de retirar su voto de una propuesta " +
            "en cualquier momento, incluso después de que una propuesta haya sido aprobada. Si una propuesta pierde votos " +
            "antes del vencimiento del plazo establecido en esta constitución, seguirá siendo una propuesta activa y los votos" +
            " permanecerán conectados. Si una propuesta aprobada pierde la mayoría de los votos después de ser aprobada, sera " +
            "declarada inactiva y todos los votos serán retirados. En caso de querer volver a presentar una propuesta similar, " +
            "se deberá crear una nueva propuesta." +
            "\n\n" +
            "La comunidad utilizará la plataforma de Democracia Conectada para facilitar este proceso, incluyendo " +
            "pero no limitado a la creación, discusión y votación de propuestas. La plataforma será considerada el " +
            "medio oficial de llevar a cabo los negocios de la comunidad." +
            "\n\n" +
            "Al residir en la comunidad, se entenderá que todos los ciudadanos han leído, comprendido y aceptado " +
            "cumplir con los términos y condiciones establecidos en esta ley.";
    }
    let law2 = {title: 'Expiración de las Propuestas', identifier: '000002', number: 2};
    law2.body = "Todas las propuestas presentadas por los ciudadanos tendrán una fecha de expiración de " +
    "`${community.proposalLimit}` días a partir de la fecha de su publicación. Los ciudadanos pueden " +
    "votar para modificar esta ley y cambiar el plazo para votar en las propuestas. Cualquier modificación " +
    "debe ser aprobada por la mayoría de la comunidad. Si la modificación es aprobada, la nueva fecha de " +
    "expiración entrará en vigor de inmediato.";

    //add these laws to the community
    community.records.push(law1);
    community.records.push(law2);
    
    //save community
    let result;
    await community.save().then((savedCommunity) => result = savedCommunity).catch((error) => result = error);
    return result;
}


async function obtainCitizenHomeNumberInCommunity(citizen, community){
    //returns the house number of the citizen in a given community
    let citizen_residency = citizen.residencies.find(residency => residency.community === community.id);
    let home = await CommunityModels.Home.findById(citizen_residency.home);
    return home.innerNumber;
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
            fullName: mongoCitizen.fullName,
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
            id: mongoProposal.id,
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
            createdAt: mongoProposal.createdAt,            
        }
        //proposals: citizenActionVolunteers (citizens)
        proposal.citizenActionVolunteers = [];
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
                id: mongoVote.id,
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
            id: mongoLaw.id,
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
            id: mongoRole.id,
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
            id: mongoProject.id,
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
            id: mongoBadge.id,
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
            id: mongoPermit.id,
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
        if(indexLaw > -1) community.proposals[k].citizenActionDocument = community.laws[indexLaw];
        let indexRole = community.roles.findIndex(role => role.id == mongoProposal.citizenActionDocument);
        if(indexRole > -1) community.proposals[k].citizenActionDocument = community.roles[indexRole];
        let indexProject = community.projects.findIndex(project => project.id == mongoProposal.citizenActionDocument);
        if(indexProject > -1) community.proposals[k].citizenActionDocument = community.projects[indexProject];
        let indexBadge = community.badges.findIndex(badge => badge.id == mongoProposal.citizenActionDocument);
        if(indexBadge > -1) community.proposals[k].citizenActionDocument = community.badges[indexBadge];
        let indexPermit = community.permits.findIndex(permit => permit.id == mongoProposal.citizenActionDocument);
        if(indexPermit > -1) community.permits[k].citizenActionDocument = community.permits[indexPermit];
    }
    
    //return object
    return community;
}


module.exports = {
    createCommunity,
    joinCitizenToCommunity,
    obtainCitizenHomeNumberInCommunity,
    fullCommunityObject,
}