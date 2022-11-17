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

//AJAX request
router.get('/mycommunity/join/homes', (request,response) => {
    //check wether request is ajax and if accepts json
    console.log('entered the ajax');
    if(request.xhr || request.accepts('json,html') ==='json') {
        Community.Community.findById(request.query.id, function(err, community) {
            console.log(community.innerHomes[1].innerNumber);
        })/*
            then((community) => {
                console.log(community.innerHomes[0].innerNumber);
                response.send({homes: community.innerHomes});
            })
        /*Community.Community.findById(request.query.id, function(err, community) {
            
            let homes = [];

            for(let i = 0; i < community.innerHomes.length; i++) {
                
                let homeid = community.innerHomes[i];
                console.log('new search: '+community.innerHomes[i].innerNumber);

                Community.Home.findById(homeid, function (err, home) {
                        if (err)
                            console.log(err);
                        //homes.push(home);
                        //console.log(home);
                    }).then((home) => {homes.push(home)});


            }
            
        }).then(console.log(homes);
            response.send({homes:homes}));//'innerhomes': innerhomes});)

    } //else { console.log('ajax did not work')};*/
    }
});

module.exports = router;