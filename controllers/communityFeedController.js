const CommunityModels = require('../models/communityModels');
const CitizenActionsModels = require('../models/citizenActionsModels');
const dbController = require('./dbController');
const citizenActionsController = require('./_citizenActionsController');

const getCommunityFeed = async (request, response) => {
    
    if (!request.user.residencies.length) return response.redirect('/mycommunity/nocommunity');
    
    response.locals.communities = [];
    
    for(let i = 0; i < request.user.residencies.length; i++){
        let community = await CommunityModels.Community.findById(request.user.residencies[i].community);
        response.locals.communities.push(community);
        }
    
    if(request.params.communityId === undefined) response.locals.index = 0;
    else{
        response.locals.index = response.locals.communities.findIndex(community => community.id == request.params.communityId); 
    }
    
    let community = await dbController.fullCommunityObject(request.user.residencies[response.locals.index].community);
    response.locals.communities[response.locals.index] = community;
    response.locals.user = request.user;

    response.render('mycommunity');
};

//Votes on feed units:
const postFeedVote = async (request, response) =>{
    //Check if user has voted on this proposal, if so, send back to page with message
    try{
        await citizenActionsController.voteOnProposal(request.user.id, request.params.proposalId, request.body.voteButton)
    } catch(error){
        request.session.message = {
            type: 'danger',
            title: 'Ya has votado por esta propuesta', 
            message: 'No puedes dar mas de un voto por la misma propuesta. Si hay un problema, favor de contactar servicio tecnico.', 
        }
        response.redirect('/mycommunity');
    }
 
};

module.exports = {
    getCommunityFeed,
    postFeedVote,
}

