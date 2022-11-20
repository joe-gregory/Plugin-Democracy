const Community = require('../models/community');
const Law = require('../models/law');

const getCommunityFeed = (request, response) => {
    if (!request.user.community) response.redirect('/mycommunity/nocommunity');

    response.locals.firstName = request.user.firstName;
    //Primero buscar la comunidad asociada con el usuario
    Community.Community.findById(request.user.community, function(err, community) {

        //Guardar la informacion de la comunidad en locals para poder render en pagina
        response.locals.community = community;
        
        //Despues buscar la lista de propuestas en el modelo de comunidad
        Law.Proposal.find({'_id' : { $in: community.proposals}}, async function(err, proposals) {
            
            //Guardar la lista de propuestas por orden de fecha en un array de locals para usar en render
            response.locals.proposals = proposals.sort(function(a,b) {return new b.createdAt - a.createdAt});

            for (let j = 0; j < response.locals.proposals.length; j++) {
                //Encontrar el autor de cada propuesta y su numero de casa y agregar a locals.proposals
                Community.Citizen.findById(response.locals.proposals[j].author, function(err, citizen) {

                    Community.Home.findById(citizen.home, function(err, home) {

                        response.locals.proposals[j].authorName = `${citizen.firstName} ${citizen.lastName} ${citizen.secondLastName}`;
                        response.locals.proposals[j].houseNumber = home.innerNumber;
                        if(j == response.locals.proposals.length-1){
                            response.render('mycommunity');
                        }
                    })
                })
            }
            
        });
    
    });

    
};

const postCreateProposal = (request, response) => {
    //create proposal and populate it

    Community.Community.findById(request.user.community, function(err,community) {
        const proposal = new Law.Proposal({
                proposal: request.body.proposalText,
                type: request.body.typeProposal,
                author: request.user.id,
                law: request.body.law, //for when deleting law
                community: request.user.community
            });
            proposal.save();
            community.proposals.push(proposal);
            community.save();
            
    });
    response.redirect('/mycommunity');
};

module.exports ={
    getCommunityFeed,
    postCreateProposal,
}

