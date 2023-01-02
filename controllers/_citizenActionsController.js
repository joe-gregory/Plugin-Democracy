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

async function voteOnProposal(citizenId, proposalId, inFavor){
    //return true if vote went through, throw a corresponding error otherwise
    //if citizen doesn't have voting rights, the vote is counted as a non-official vote
    
    //get needed mongo objects
    let mongoProposal = await CitizenActionsModels.findById(proposalId);
    ////let mongoCitizen = await CommunityModels.findById(citizenId);
    ////let mongoCommunity = await CommunityModels.findById(mongoProposal.community);

    //Adjust value of inFavor accordingly
    if(inFavor === 'accept') inFavor = true;
    else if(inFavor === 'reject') inFavor = false;
    else if(inFavor === true || inFavor === false);
    else{throw new Error('Invalid inFavor vote value')} 

    //Does user have voting rights for this proposal?: is he a voter in the proposal's community?
    let votingRight = true;
    let mongoHomes = await CommunityModels.Home.find({voter: citizenId, community: mongoProposal.community});
    if(mongoHomes.length == 0){
        votingRight = false; //throw new Error('Citizen has no voting rights on this proposal');  
        console.log("Citizen doesn't have voting rights on this proposal");
    }

    //throw error if user already voted on proposal. Check for official and non-official votes.
    //official votes
    let officialVotes = await CitizenActionsModels.Vote.find({community: mongoProposal.community, citizen: citizenId, proposal: proposalId});
    if(officialVotes.length == 1){
        //make sure the vote is saved in the proposals votes array
        if(!mongoProposal.votes.find(vote => vote == officialVotes[0].id)) throw new Error("There is a vote object saved with citizen, proposal and community id but it is not in the proposal's vote array");
        throw new Error("There is already vote with this citizen id, this proposal id and this community id & it is saved in the votes array of proposal");
    } else if(officialVotes.length > 1){
        throw new Error("There is more than one vote saved with that information");
    }
    //unofficial votes
    

    //create new vote object
    const mongoVote = new CitizenActionsModels.Vote({
        citizen: mongoCitizen,
        inFavor: inFavor,
        proposal: mongoProposal,
        community: mongoCommunity
    })

    //add vote to votes list in proposal object 
    mongoProposal.push(mongoVote);
    
    // update vote count on proposal
    (inFavor === true) ? mongoProposal.votesInFavor++ : mongoProposal.votesAgainst++;

    //check to see if this vote gave the proposal majority in favor or against
    //first determine which community this proposal belongs to
    //For a vote to pass it is based on the majority of homes (not registered users)
    //Determine how many homes are in the community

    

    
    //OLD:
    //Check if user has voted on this proposal, if so, redirect to /profile as safety
    let proposal = await Law.Proposal.findById(request.params.proposalId);
    let votes = await Law.Vote.find({'_id' : { $in: proposal.votes}});
    if(votes.find(vote => vote.citizen == request.user.id)) response.redirect('/profile');

    //If user hasn't voted on this proposal previously, did he vote in favor or against
    /////const inFavor = request.body.voteButton === 'accept' ? true : false;

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
    
}

async function doesUserHaveVotingRightsForProposal(citizenId, proposalId){
    //return true if user is a voter for the proposal's community, if not return false
    let citizenId = await CommunityModels.Citizen.findById(citizenId);
    let mongoCommunity = await
    //I need to search a house that has a community like communityId and that has this guy as a voter
    
}

function createLaw(user, proposal){
    if (!isUserAllowed(user)) throw new Error('User is not allowed to create laws');

}

module.exports = {
    createProposal,
    hasUserVotedForProposal,
    voteOnProposal,
}