const Community = require('../models/community');
const Law = require('../models/law');

const getCommunityFeed = (request, response) => {
    if (!request.user.community) response.redirect('/mycommunity/nocommunity');

    response.locals.firstName = request.user.firstName;
    //Primero buscar la comunidad asociada con el usuario
    Community.Community.findById(request.user.community, function(err, community) {

        //Guardar la informacion de la comunidad en locals para poder render en pagina
        response.locals.community = community;
        
        //Despues buscar la lista de propuestas en el modelo de comunidad
        Law.Proposal.find({'_id' : { $in: community.proposals}}, function(err, proposals) {
            
            //Guardar la lista de propuestas por orden de fecha en un array de locals para usar en render
            response.locals.proposals = proposals.sort(function(a,b) {return new b.createdAt - a.createdAt});
            if(response.locals.proposals.length == 0) response.render('mycommunity');
            for (let j = 0; j < response.locals.proposals.length; j++) {
                //Encontrar el autor de cada propuesta y su numero de casa y agregar a locals.proposals
                Community.Citizen.findById(response.locals.proposals[j].author, function(err, citizen) {

                    Community.Home.findById(citizen.home, function(err, home) {
                        (request.user.id == response.locals.proposals[j].author) ? response.locals.proposals.alreadyVoted = true : response.locals.proposals.alreadyVoted = false;
                        response.locals.proposals[j].authorName = `${citizen.firstName} ${citizen.lastName} ${citizen.secondLastName}`;
                        response.locals.proposals[j].houseNumber = home.innerNumber;
                        if(j == response.locals.proposals.length-1){
                            response.render('mycommunity');
                        }
                    })
                })
            }
        });
    });
};

const postCreateProposal = (request, response) => {
    //create proposal and populate it

    Community.Community.findById(request.user.community, function(err,community) {
        const proposal = new Law.Proposal({
                proposal: request.body.proposalText,
                type: request.body.typeProposal,
                author: request.user.id,
                law: request.body.law, //for when deleting law
                community: request.user.community
            });
            proposal.save();
            community.proposals.push(proposal);
            community.save();
            
    });
    response.redirect('/mycommunity');
};

//dealing with voting on feed proposals:
const postFeedVote = (request, response) =>{
    //Check if user has voted on this proposal: check list of votes in proposal and see if any of them has a citizen.id that matches the current user
    Law.Proposal.findById(request.params.proposalId, function(err, proposal) {
        //[^]Make sure there isn't double voting search for votes and if any matches request.user.id in proposal.votes[i].id
        Law.Vote.find({'_id' : { $in: proposal.votes}}, function(err, votes) {
                if(votes.find(vote => vote.citizen == request.user.id)){
                    console.log('already voted');
                    response.redirect('/profile');
                }else{
                    //[^]If no double voting create a new Vote object with proposal & user information and append it to the proposal
                    const inFavor = (request.body.voteButton === 'accept') ? true : false;
                    const vote = new Law.Vote({
                        citizen: request.user.id,
                        inFavor: inFavor,
                        proposal: request.params.proposalId 
                    });
                    //[^]save the vote
                    vote.save();
                    //[^] add vote to proposals.votes & save
                    //[^}test to make vote
                    //[^]test to try to make vote twice to see it doesn't get made and I get redirected
                    //[^]add vote to list of votes in proposal
                    proposal.votes.push(vote);
                    proposal.save();
                    response.redirect('/mycommunity');
                    //[]Check to see if this vote gave the proposal majority

                    //[]count votes in favor, count votes against, 
                    //[]if votes in favor/amountHouses > .5 => proposal passes, give it date it passed & create law
                    //[]Add law to the community's laws. 
                };
            });
    });
};

module.exports = {
    getCommunityFeed,
    postCreateProposal,
    postFeedVote,
}

