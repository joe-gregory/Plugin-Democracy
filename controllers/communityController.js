const CommunityModels = require('../models/communityModels');
const CitizenActionsModels = require('../models/citizenActionsModels');

const citizenActions = require('./_citizenActionsController');

const getCheckIsAuthenticated = (request, response, next) => {
    if(!request.isAuthenticated()){
        response.redirect('/login');
    }else{next();} 
}

const getCommunityAbout = async (request, response) => {
    //Get community's name, address, amount of homes, currently participating members, laws, president, treasurer
    let community = await CommunityModels.Community.findById(request.user.community);
    response.locals.community = community;

    let homes = await CommunityModels.Home.find({'_id' : { $in: community.innerHomes}});
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

const getCommunityJoin = (request, response) => {
    CommunityModels.Community.find({}, function(err, communities) {
        console.log('in getCommunityJoin');
        response.locals.communities = [];

        communities.forEach(function(community) {
            response.locals.communities.push(community);
        });
        console.log(response.locals.communities.length);
        response.render('joinCommunity', request.user);
    });
};

const postCommunityJoin = (request, response) => {
    CommunityModels.Citizen.findById(request.user.id, function(err, citizen) {
        CommunityModels.Community.findById(request.body.community, function(err, community) {
            CommunityModels.Home.findById(request.body.home, async function(err, home) {
                citizen.communities.push(community);
                citizen.home = home;

                community.citizens.push(citizen);

                home.citizen = citizen;

                await citizen.save();
                await community.save();
                await home.save();
                response.redirect('/mycommunity');

            });
        });
    });
};
//FUNCTION I WANT TO IMPLEMENT FOR CODE REUSABILITY
function createCommunity(data) {
    const community = new CommunityModels.Community({
        name: data.communityName,
        communityAddress: data.communityAddress,
    });
    for(let i = request.body.communityStartingNumber; i <= request.body.communityEndingNumber; i++){
        let home = new CommunityModels.Home({
            innerNumber: i, 
            community:community,
        });
        home.save();
        //community.innerHomes.push(new Community.Home({innerNumber: i}));
        community.innerHomes.push(home);
    }
    community.save()
        .then((result) => console.log('Community saved'))
        .catch((err) => console.log('Error community creation', err));
};
//THE FUNCTION WOULD GO IN HERE
const postCommunityCreate = (request, response) => {
    
    const community = new CommunityModels.Community({
        name:  request.body.communityName,
        communityAddress: request.body.communityAddress, 
    });
    for(let i = request.body.communityStartingNumber; i <= request.body.communityEndingNumber; i++){
        let home = new CommunityModels.Home({
            innerNumber: i, 
            community:community,
        });
        home.save();
        //community.innerHomes.push(new Community.Home({innerNumber: i}));
        community.innerHomes.push(home);
    }
    community.save()
        .then((result) => response.redirect('/mycommunity'))
        .catch((err) => response.send(err));
};

const getCommunityJoinHomesAjax = (request,response) => {
    //check wether request is ajax and if accepts json
    if(request.xhr || request.accepts('json,html') ==='json') {
        CommunityModels.Community.findById(request.query.id, function(err, community) {
            
            CommunityModels.Home.find(
                {'_id' : { $in: community.innerHomes}}, 
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
    getCheckIsAuthenticated,
    getCommunityAbout,
    getCommunityProposal,
    getCommunityJoin,
    postCommunityJoin,
    postCommunityCreate,
    getCommunityJoinHomesAjax,
    getCreateProposalAjax,
    postCreateProposal,
}