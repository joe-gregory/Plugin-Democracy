const express = require('express');
const router = express.Router();

const communityController = require('../controllers/communityController');
const communityFeedController = require('../controllers/communityFeedController');

router.get('/mycommunity*', communityController.RouteIfUserNoAuthenticated);

router.post('/mycommunity*', communityController.RouteIfUserNoAuthenticated);

router.get('/mycommunity', communityFeedController.getCommunityFeed);

router.get('/mycommunity/:communityId', communityFeedController.getCommunityFeed);

router.get('/mycommunity/nocommunity', (request, response) => {
    response.render('noCommunity');
})
router.get('/mycommunity/about',communityController.getCommunityAbout);

router.get('/mycommunity/about/details', communityController.getCommunityAboutDetailsAjax);

router.get('/mycommunity/create', communityController.getCommunityCreate);

router.post('/mycommunity/create', communityController.postCommunityCreate);

router.get('/mycommunity/join', communityController.getCommunityJoin);

router.post('/mycommunity/join', communityController.postCommunityJoin);

//AJAX request
router.get('/mycommunity/join/homes', communityController.getCommunityJoinHomesAjax);

router.get('/mycommunity/createproposal', communityController.getCommunityProposal);

router.post('/mycommunity/createproposal', communityController.postCreateProposal);

router.get('/mycommunity/createproposal/getcitizenactiondocuments', communityController.getCitizenActionDocumentsAjax);

router.post('/mycommunity/vote/:proposalId', communityFeedController.postFeedVote);

module.exports = router;