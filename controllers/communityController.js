const Community = require('../models/community');

const getCheckIsAuthenticated = (request, response, next) => {
    if(!request.isAuthenticated()){
        response.redirect('/login');
    }else{next();} 
}

const getCommunityAbout = (request, response) => {
    //Get community's name, address, amount of homes, currently participating members, laws, president, treasurer
        Community.Community.findById(request.user.community, function(err, community) {
            
            response.locals.community = community;
            
            Community.Home.find({'_id' : { $in: community.innerHomes}}, function(err, homes) {
                response.locals.homes = homes;

                Community.Citizen.find({'_id' : { $in: community.citizens}}, function(err, citizens) {
                    
                    //associate citizen and house number
                    for (let i = 0; i < citizens.length; i++) {
                        //search for the home that has the same citizen id as the citizen
                        relatedHome = homes.find(home => home.citizen._id == citizens[0].id);
                        citizens[i].innerNumber = relatedHome.innerNumber;
                    }
                    
                    response.locals.citizens = citizens;
                    response.locals.firstName = request.user.firstName; //this is to show nav bar. This is sloppy. Address in future. 
                    response.render('aboutCommunity');
                });
            });
        });
    };

const getCommunityProposal = (request, response) => {
    response.locals.firstName = request.user.firstName;
    response.render('createProposal')
};

const getCommunityJoin = (request, response) => {
    Community.Community.find({}, function(err, communities) {
        response.locals.communities = [];

        communities.forEach(function(community) {
            response.locals.communities.push(community);
        });

        response.render('joinCommunity', request.user);
    });
};

const postCommunityJoin = (request, response) => {
    Community.Citizen.findById(request.user.id, function(err, citizen) {
        Community.Community.findById(request.body.community, function(err, community) {
            Community.Home.findById(request.body.home, async function(err, home) {
                citizen.community = community;
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

const postCommunityCreate = (request, response) => {
    
    const community = new Community.Community({
        name:  request.body.communityName,
        communityAddress: request.body.communityAddress, 
    });
    for(let i = request.body.communityStartingNumber; i <= request.body.communityEndingNumber; i++){
        let home = new Community.Home({
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
    console.log('entered the ajax');
    
    if(request.xhr || request.accepts('json,html') ==='json') {
        Community.Community.findById(request.query.id, function(err, community) {
            
            Community.Home.find(
                {'_id' : { $in: community.innerHomes}}, 
                function(err, homes) {
                    if(err) console.log(err);
                    response.send({homes:homes});
                });
        })
    };
}

module.exports = {
    getCheckIsAuthenticated,
    getCommunityAbout,
    getCommunityProposal,
    getCommunityJoin,
    postCommunityJoin,
    postCommunityCreate,
    getCommunityJoinHomesAjax,
}