const Community = require('../models/community');

const communityAbout = (request, response) => {
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

module.exports = {
    communityAbout,
}