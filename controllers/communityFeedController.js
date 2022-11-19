const Community = require('../models/community');
const Laws = require('../models/laws');

const getCommunityFeed = (request, response) => {
    if (!request.user.community) response.redirect('/mycommunity/nocommunity');
    response.locals.firstName = request.user.firstName;
    response.render('mycommunity');
};

module.exports ={
    getCommunityFeed,
}

