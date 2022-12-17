const { request } = require("express");
const CommunityModels  = require("../models/communityModels");
const CitizenActionsModels = require("../models/citizenActionsModels");

async function createProposal(user, proposal){

    let community = await CommunityModels.Community.findById(proposal.community);
    
    //Is user allowed to create proposal? Aka, is user citizen of said community. 
    if(community.citizens.find(citizen => citizen == user.id) === undefined) return false;
    
    for(let key in proposal){
        if(proposal[key]== '') proposal[key] = null;
    }

    const mongoProposal = new CitizenActionsModels.Proposal({
        title: proposal.title,
        body: proposal.body,
        type: proposal.proposalType,
        author: user.id,
        votesInFavor: 0,
        votesAgainst: 0,
        community: proposal.community,
        passed:null,
        citizenActionDocument: proposal.citizenActionDocument,
        citizenActionTitle: proposal.citizenActionTitle,
        citizenActionBody: proposal.citizenActionBody,
        citizenActionStartDate: proposal.citizenActionStartDate,
        citizenActionExpirationDate: proposal.citizenActionExpirationDate,
        citizenActionActive: proposal.citizenActionActive,
        citizenActionPay: proposal.citizenActionPay,
        citizenActionPay: proposal.citizenActionVolunteersAmount,
        citizenActionRewardBadges: proposal.citizenActionRewardBadges,
        citizenActionBadgeImage: proposal.citizenActionBadgeImage,
    })
    

    //push proposal to community, save both the community changes and proposal
    community.proposals.push(mongoProposal);    
    mongoProposal.save();
    community.save();

    return mongoProposal;
};

function createLaw(user, proposal){
    if (!isUserAllowed(user)) throw new Error('User is not allowed to create laws');

}

module.exports = {
    createProposal,
}