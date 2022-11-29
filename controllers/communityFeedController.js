const Community = require('../models/community');
const Law = require('../models/law');

const getCommunityFeed = async (request, response) => {
    if (!request.user.community) return response.redirect('/mycommunity/nocommunity');
     
    response.locals.firstName = request.user.firstName;
    
    //Search for the community associated with the user
    let community = await Community.Community.findById(request.user.community); 
    response.locals.community = community; //Save the community's information on locals to render on page
    
    //if there are no proposals yet, redirect to /mycommunity directly
    if (community.proposals.length === 0) return response.render('mycommunity');
    
    //Search for the array of proposal IDs stored in the community model
    let proposals = await Law.Proposal.find({'_id' : { $in: community.proposals}});
    
    response.locals.proposals = proposals;
    //I need to find the array of votes.citizens in each proposal inside proposals
    //so I can check it against req.user.id to see if the current user
    //already voted on this proposal[j]
    
    for (let j = 0; j < response.locals.proposals.length; j++) {
        //obtain an array of votes that match the ID of the proposal.votes array 
        votes = await Law.Vote.find({'_id' : { $in: response.locals.proposals[j].votes}});

        //Search to see if any vote.citizen id match the current user's id
        let matchingVote = votes.find(vote => vote.citizen == request.user.id);

        if(matchingVote != undefined){
            response.locals.proposals[j].alreadyVoted = true;
            response.locals.proposals[j].votedValue = matchingVote.inFavor;
        } else{
            response.locals.proposals[j].alreadyVoted = false;
        }

        //get proposal's authors full name
        let citizen = await Community.Citizen.findById(response.locals.proposals[j].author);
        response.locals.proposals[j].authorName = `${citizen.firstName} ${citizen.lastName} ${citizen.secondLastName}`;
        //get proposal's author house number
        home = await Community.Home.findById(citizen.home);
        response.locals.proposals[j].houseNumber = home.innerNumber;
    }
    response.render('mycommunity');
};

const postCreateProposal = (request, response) => {
    //create proposal and populate it

    Community.Community.findById(request.user.community, function(err,community) {
        const proposal = new Law.Proposal({
                proposal: request.body.proposalText,
                type: request.body.typeProposal,
                author: request.user.id,
                votesInFavor: 0,
                votesAgainst: 0,
                law: request.body.law, //for when deleting law
                community: request.user.community
            });
            proposal.save();
            community.proposals.push(proposal);
            community.save();
        response.redirect('/mycommunity');    
    });
};

//dealing with voting on feed proposals:
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
        if(proposal.type === 'create' && proposal.passed !== true){
            const newLaw = new Law.Law({
            law: proposal.proposal,
            author: proposal.author,
            proposal: proposal.id,
            community: proposal.community,
            });
            proposal.passed = true;
            proposal.passedDate = Date.now();
            proposal.law = newLaw.id;
            newLaw.save();
            //add new law to community model
            let community = await Community.Community.findById(proposal.community);
            community.laws.push(newLaw);
            community.save();
        }
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
    postCreateProposal,
    postFeedVote,
}

