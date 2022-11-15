const express = require('express');
const router = express.Router();

const Community = require('../models/community');

router.get('/createCommunity', (request, response) =>{
    if(!request.isAuthenticated()) response.redirect('/login');
    response.render('createCommunity', request.user);
})

router.post('/createCommunity', (request, response) => {
    
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

module.exports = router;