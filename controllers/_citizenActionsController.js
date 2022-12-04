const { Community } = require("../models/communityModels");


function isUserAllowed(user, action, proposal){
    switch(action) {
        case createProposal:
            //if user belongs to the community, the user can create a proposal even if not a homeowner
            if (user.community === proposal.community) return true;
        default:
            throw new Error ('User is not authorized for action');

    }
}

async function createProposal(user, proposalRequest){
    isUserAllowed(user, createProposal, proposal);
    
    let community = await Community.Community.findById(proposal.community);

    const proposal = new CitizenActions.Proposal({
        title: proposalRequest.title,
        body: proposalRequest.body,
        type: proposalRequest.type,
        author: user.id,
        votesInFavor: 0,
        votesAgainst: 0,
        community: proposalRequest.community,
        approvedDate: null,
        passed: null,
        passedDate: null,
    });
    //check if the proposal has the right info given the type of proposal it is
}
const postCreateProposal = (request, response) => {
    //create proposal and populate it

    Community.Community.findById(request.user.community, function(err,community) {
        let originalLawNumber;
        if(request.body.law){
            originalLawNumber = community.laws.indexOf(request.body.law);
            originalLawNumber++;
        };
        const proposal = new Law.Proposal({
                proposal: request.body.proposalText,
                type: request.body.typeProposal,
                author: request.user.id,
                votesInFavor: 0,
                votesAgainst: 0,
                law: request.body.law,  //for when deleting law
                originalLawNumber: originalLawNumber,
                community: request.user.community,
                
            });

        community.proposals.push(proposal);
        
        proposal.save();
        community.save();
        
        response.redirect('/mycommunity');    
    });
};

function createLaw(user, proposal){
    if (!isUserAllowed(user)) throw new Error('User is not allowed to create laws');

}