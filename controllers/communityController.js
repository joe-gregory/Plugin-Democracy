const CommunityModels = require('../models/communityModels');
const CitizenActionsModels = require('../models/citizenActionsModels');

const citizenActions = require('./_citizenActionsController');
const dbController = require('./_dbController');

const RouteIfUserNoAuthenticated = (request, response, next) => {
    if(!request.isAuthenticated()){
        response.redirect('/login');
    }else{next();} 
}

const getCommunityAbout = async (request, response) => {
    //Get community's name, address, amount of homes, currently participating members, laws, president, treasurer
    let community = await CommunityModels.Community.findById(request.user.residencies[0].community);
    response.locals.community = community;

    let homes = await CommunityModels.Home.find({'_id' : { $in: community.homes}});
    response.locals.homes = homes; 

    let citizens = await CommunityModels.Citizen.find({'_id' : { $in: community.citizens}});
    
    for(let i = 0; i < citizens.length; i++){
        relatedHome = homes.find( home => home.citizen == citizens[i].id);
        citizens[i].innerNumber = relatedHome.innerNumber;
    }

    response.locals.citizens = citizens;
    response.locals.firstName = request.user.firstName; //this is to show nav bar. This is sloppy. Address in future. 
    let laws = await CitizenActionsModels.Law.find({'_id' : {$in: community.laws}});
    response.locals.laws = laws;

    response.render('aboutCommunity');
};

const getCommunityProposal = (request, response) => {
    response.locals.firstName = request.user.firstName;
    response.render('createProposal')
};

const getCommunityJoin = async (request, response) => {
    response.locals.communities = []
    communities = await CommunityModels.Community.find({});
    communities.forEach(community => response.locals.communities.push(community));
    response.render('joinCommunity');
};

const postCommunityJoin = async (request, response) => {
    //Obtain data from POST
    let citizen = await CommunityModels.Citizen.findById(request.user.id);
    let community = await CommunityModels.Community.findById(request.body.community);
    let home = await CommunityModels.Home.findById(request.body.home);

    dbController.joinCitizenToCommunity(citizen, home, community);
    
    response.redirect('/mycommunity');
};

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
            message: '', 
        }
        response.redirect('/mycommunity/join');
    }
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
                    response.send({homes:homes});
                });
        })
    };
}

const postCreateProposal = (request, response) => {
    citizenActions.createProposal(request.user, request.body);
    response.redirect('/mycommunity');    
};

const getCreateProposalAjax = async (request, response) => {
    //check whether request is ajax and if accepts json
    if(request.xhr || request.accepts('jason, html') == 'json') {
        let community = await CommunityModels.Community.findById(request.user.community);
        let laws = await CitizenActionsModels.Law.find({'_id' : {$in: community.laws}});
        response.send({laws:laws});
    }
}
module.exports = {
    RouteIfUserNoAuthenticated: RouteIfUserNoAuthenticated,
    getCommunityAbout,
    getCommunityProposal,
    getCommunityJoin,
    postCommunityJoin,
    postCommunityCreate,
    getCommunityJoinHomesAjax,
    getCreateProposalAjax,
    postCreateProposal,
}