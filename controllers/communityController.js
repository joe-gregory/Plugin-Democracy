const CommunityModels = require('../models/communityModels');
const CitizenActionsModels = require('../models/citizenActionsModels');

const citizenActions = require('./_citizenActionsController');
const dbController = require('./_dbController');

//IF USER NOT LOGGED IN, REROUTE TO /LOGIN
const RouteIfUserNoAuthenticated = (request, response, next) => {
    if(!request.isAuthenticated()){
        response.redirect('/login');
    }else{next();} 
}

//COMMUNITY ABOUT
const getCommunityAbout = async (request, response) => {
    //Get community's name, address, amount of homes, currently participating members per home, 
    //Voting member of home, roles, laws
    response.locals.communities = [];
    for (let i = 0; i < request.user.residencies.length; i++){
        community = await dbController.fullCommunityObject(request.user.residencies[i].community);
        response.locals.communities.push(community);
    }
    
    response.render('aboutCommunity');
};
/*
const getCommunityAboutDetailsAjax = async (request, response) => {
    if(request.xhr || request.accepts('json, html') == 'json') {
        //let community = await dbController.communityDetails(request.query.id);
        let community = await dbController.fullCommunityObject(request.query.id)
        //console.log(com.homes[0].citizens[0].residencies[0].home.citizens[0].fullName);
        response.send({community: community});
    }
}*/
//JOIN COMMUNITY
const getCommunityJoin = async (request, response) => {
    response.locals.communities = [];
    communities = await CommunityModels.Community.find({});
    communities.forEach(community => response.locals.communities.push(community));
    response.render('joinCommunity');
};

const getCommunityJoinHomesAjax = (request,response) => {
    //check wether request is ajax and if accepts json
    if(request.xhr || request.accepts('json,html') ==='json') {
        CommunityModels.Community.findById(request.query.id, function(err, community) {
            //Search for homes that have a community id == community
            CommunityModels.Home.find(
                {'_id' : { $in: community.homes}}, 
                function(err, homes) {
                    if(err) console.log(err);
                    response.send(community);
                });
        })
    };
}

const postCommunityJoin = async (request, response) => {
    //Obtain data from POST
    let citizen = await CommunityModels.Citizen.findById(request.user.id);
    let community = await CommunityModels.Community.findById(request.body.community);
    let home = await CommunityModels.Home.findById(request.body.home);

    dbController.joinCitizenToCommunity(citizen, home, community);
    
    response.redirect('/mycommunity');
};

//CREATE COMMUNITY
const getCommunityCreate = (request, response) => {
    response.render('createCommunity');
}

const postCommunityCreate = (request, response) => {
    let result_of_community_create = dbController.createCommunity(request.body);
    if (result_of_community_create instanceof Error){
        
        request.session.message = {
            type: 'danger',
            title: 'Error creando comunidad',
            message: `Por favor comunicate con servicio tecnico.`
        }

        response.redirect('/mycommunity/create');
        return;
    } else{
        request.session.message = {
            type: 'success',
            title: 'Comunidad creada exitosamente', 
            message: 'Ahora puedes unirte a esta comunidad', 
        }
        response.redirect('/mycommunity/join');
    }
};

//COMMUNITY PROPOSALS
const getCommunityProposal = (request, response) => {
    response.locals.firstName = request.user.firstName;
    response.render('createProposal')
};

const getCreateProposalAjax = async (request, response) => {
    //check whether request is ajax and if accepts json
    if(request.xhr || request.accepts('json, html') == 'json') {
        let community = await CommunityModels.Community.findById(request.user.community);
        let laws = await CitizenActionsModels.Law.find({'_id' : {$in: community.laws}});
        response.send({laws:laws});
    }
}

const postCreateProposal = (request, response) => {
    citizenActions.createProposal(request.user, request.body);
    response.redirect('/mycommunity');    
};

module.exports = {
    RouteIfUserNoAuthenticated,
    getCommunityAbout,
    getCommunityAboutDetailsAjax,
    getCommunityJoin,
    getCommunityJoinHomesAjax,
    postCommunityJoin,
    getCommunityCreate,
    postCommunityCreate,
    getCommunityProposal,
    getCreateProposalAjax,
    postCreateProposal,
}