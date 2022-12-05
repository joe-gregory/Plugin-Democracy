const CommunityModels  = require("../models/communityModels");

function isUserAllowed(user, action, proposal){
    switch(action) {
        case createProposal:
            //if user belongs to the community, the user can create a proposal even if not a homeowner
            if (user.community === proposal.community) return true;
        default:
            throw new Error ('User is not authorized for action');

    }
};

async function createProposal(user, proposalRequest){
    
    isUserAllowed(user, createProposal, proposalRequest);
    
    let community = await CommunityModels.Community.findById(proposal.community);
    let pR = proposalRequest;

    const proposal = new CitizenActions.Proposal({
        title: pR.title,
        body: pR.body,
        type: pR.type,
        author: user.id,
        votesInFavor: 0,
        votesAgainst: 0,
        community: pR.community,
        approvedDate: null,
        passed: null,
        passedDate: null,
    });
    
    //check if the proposal has the right info given the type of proposal it is
    switch(proposal.type){
        case 'createLaw':
            if(!(pR.citizenActionTitle && pR.citizenActionBody && pR.citizenActionStartDate)) throw new Error ('Missing attributes to create a law proposal');
            proposal.citizenActiontitle = pR.citizenActionTitle;
            proposal.citizenActionBody = pR.citizenActionBody;
            proposal.citizenActionStartDate = pR.citizenActionStartDate;
            proposal.citizenActionExpirationDate = pR.citizenActionExpirationDate;
            break;
        case 'deleteLaw':
            break;
        case 'editLaw':
            break;
        case 'createRole':
            break;
        case 'deleteRole':
            break;
        case 'assignRole':
            break;
        case 'removeRole':
            break;
        case 'swapRole':
            break;
        case 'createProject':
            break;
        case 'createBadge':
            break;
        case 'assignBadge':
            break;
        case 'permit':
            break;
        default:
            throw new Error('Missing or wrong attributes for proposal type');
    }

    //push proposal to community, save both the community changes and proposal
    community.proposals.push(proposal);    
    proposal.save();
    community.save();
};

function createLaw(user, proposal){
    if (!isUserAllowed(user)) throw new Error('User is not allowed to create laws');

}

module.exports = {
    createProposal,
}