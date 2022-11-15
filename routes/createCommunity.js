const express = require('express');
const router = express.Router();

const Community = require('../models/community');

router.get('/createCommunity', (request, response) =>{
    response.render('createCommunity', request.user);
})

router.post('createCommunity', (request, response) => {
    const community = new Community.Community({
        name:  request.body.communityName,
        communityAddress: request.body.communityAddress, 
    });
    community.save()
        .then((result) => response.redirect('mycommunity'))
        .catch((err) => response.send(err));
});

module.exports = router;