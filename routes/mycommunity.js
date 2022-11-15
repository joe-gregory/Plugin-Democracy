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
        home = new Community.Home({innerNumber: i});
        home.save();
        community.innerHomes.push(new Community.Home({innerNumber: i}));
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

module.exports = router;