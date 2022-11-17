const express = require('express');
const router = express.Router();

const Community = require('../models/community');

router.get('/mycommunity*', (request, response, next) => {
    if(!request.isAuthenticated()){
        response.redirect('/login');
    }else{next();} 
});

router.get('/mycommunity', (request, response) => {
    response.render('mycommunity', request.user);
});

router.get('/mycommunity/create', (request, response) =>{
    response.render('createCommunity', request.user);
});

router.post('/mycommunity/create', (request, response) => {
    
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
});

router.get('/mycommunity/join', (request, response) => {
    Community.Community.find({}, function(err, communities) {
        response.locals.communities = [];

        communities.forEach(function(community) {
            response.locals.communities.push(community);
        });

        response.render('joinCommunity', request.user);
    });
});

router.post('/mycommunity/join', (request, response) => {
    console.log('community id: ' + request.body.community);
    console.log('inner home id: ' + request.body.home);
    console.log('user id: ' + request.user.id);
    Community.Citizen.findById(request.user.id, function(err, citizen) {
        Community.Community.findById(request.body.community, function(err, community) {
            Community.Home.findById(request.body.home, async function(err, home) {
                console.log(citizen);
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
});

//AJAX request
router.get('/mycommunity/join/homes', (request,response) => {
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
});


module.exports = router;