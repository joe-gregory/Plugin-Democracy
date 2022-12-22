const CommunityModels = require('../models/communityModels');
const CitizenActionModels = require('../models/citizenActionsModels');
const dbController = require('./_dbController');

const getCommunityFeed = async (request, response) => {
    
    if (!request.user.residencies.length) return response.redirect('/mycommunity/nocommunity');
    
    response.locals.communities = [];
    
    for(let i = 0; i < request.user.residencies.length; i++){
        let community = await CommunityModels.Community.findById(request.user.residencies[i].community);
        response.locals.communities.push(community);
        }
    
    if(request.params.communityId === undefined) response.locals.index = 0;
    else{
        response.locals.index = response.locals.communities.findIndex(community => community.id = request.params.communityId); 
    }

    let community = await dbController.fullCommunityObject(request.user.residencies[0].community);
    response.locals.communities[response.locals.index] = community;
    response.locals.user = request.user;

    response.render('mycommunity');
};

//Votes on feed units:
const postFeedVote = async (request, response) =>{
    //Check if user has voted on this proposal, if so, redirect to /profile as safety
    let proposal = await Law.Proposal.findById(request.params.proposalId);
    let votes = await Law.Vote.find({'_id' : { $in: proposal.votes}});
    if(votes.find(vote => vote.citizen == request.user.id)) response.redirect('/profile');

    //If user hasn't voted on this proposal previously, did he vote in favor or against
    const inFavor = request.body.voteButton === 'accept' ? true : false;

    //create new vote object for this users vote on this proposal
    const vote = new Law.Vote({
        citizen: request.user.id,
        inFavor: inFavor,
        proposal: request.params.proposalId
    });

    //update vote count on proposal
    prevVotesInFavor = proposal.votesInFavor;
    prevVotesAgainst = proposal.votesAgainst;

    if (vote.inFavor == true){
        proposal.votesInFavor = prevVotesInFavor + 1;
    } else if(vote.inFavor == false) {
        proposal.votesAgainst = prevVotesAgainst + 1;
    } else{
        throw 'Unexpected value for proposals.votesInFavor';
    }
    
    //Check to see if this vote gave the proposal majority.
    //How many homes in this community?
    //first determine which community this proposal belongs to
    let community = await Community.Community.findById(proposal.community);
    //For a vote to pass it is based on the majority of homes (not registered users)
    amountHomes = community.innerHomes.length;
    //Is the votes in favor the majority? 
    if (proposal.votesInFavor > amountHomes/2){
        //proposal passed
        
        proposal.passedDate = Date.now();
        //if proposal of type to create law
        if(proposal.type === 'create' && proposal.passed !== true && proposal.passed !== false){

            const newLaw = new Law.Law({
            law: proposal.proposal,
            author: proposal.author,
            proposal: proposal.id,
            community: proposal.community,
            });
            
            proposal.law = newLaw.id;
            newLaw.save();
            //add new law to community model
            let community = await Community.Community.findById(proposal.community);
            community.laws.push(newLaw);
            community.save();
        }else if(proposal.type === 'delete' && proposal.passed !== true && proposal.passed !== false) { //if proposal of type to delete law
            //delete law object & splice law from community laws array
            //find law object & delete
            let law = await Law.Law.findById(proposal.law);
            law.deleteOne;

            let index = community.laws.indexOf(proposal.law);
            community.laws.splice(index, 1);

            //law.save();
            community.save();
        }
        proposal.passed = true;
    } else if(proposal.votesAgainst > amountHomes/2){
        proposal.passed = false;
        proposal.passedDate = Date.now();
    }

    //save the vote
    vote.save();
    //push vote to proposals.votes array & save
    proposal.votes.push(vote);
    proposal.save();
    response.redirect('/mycommunity');
};

module.exports = {
    getCommunityFeed,
    postFeedVote,
}

