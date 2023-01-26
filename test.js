const mongoose = require('mongoose');
const key = require('./keys');
const CommunityModels = require('./models/communityModels');
const dbController = require('./controllers/dbController');

const dbURI = 'mongodb+srv://'+key+'@ddcluster.z8oz5ye.mongodb.net/?retryWrites=true&w=majority';

let citizenId = '63c0b62a37c2ac98aaa515cc';
let garyId = '63c0e0c19a434a642af0a86f';
let communityId = '63d0662ee8fd029a343da3b1';
let communityRequestId = '63d05c2bdfe949b409ffed07';
let community = {};
let communityRequest = {};
let pepin = {};
let gary = {};
let input = {};

let communityExample = {
    name: 'comunidad homes owners',
    address: 'direccion 2',
    votingUnit: 'homes.owner',
    homesStartingNumber: 2,
    homesEndingNumber: 4,
};
let citizenExample = {
    firstName: 'Joe',
    lastName: 'Gregory',
    secondLastName: 'Martinez',
    email: 'PEPIN@PEPIN',
    password: 'password',
};
let recordExample = {
    title: 'titulo 1',
    body: 'body 1',
}
let lore = {
    firstname: 'Lore',
    lastName: 'Prima',
    email: 'LORE@loRE',
    password: '123',
}

async function test(){
    try{
        await mongoose.connect(dbURI);
        console.log(`Connected to Data Base`);
    } catch(error){
        console.log(`Error connecting to DB: ${error}`);
        console.log(`Error Object [key, value] pairs:`);
        console.log(Object.entries(error));
    }
    input = {
        citizen: pepin,
        vote: {vote: 'plug'},
        //record: {identifier: 'nbhr87'},
        home: {number: 3},
        proposal:{
            title: 'titulo',
            body: 'dale tu cuerpo alegria macarena',
            number: 10,
            type:'law',
            lawCategory: 'A',
            lawCategoryNumber: 10,
        },
        post: {
            type: 'custom',
            body: 'cuperpo de custom post',
        }
    };
    community = await CommunityModels.Community.findById(communityId);
    //community = await dbController.createCommunity(communityExample);
    pepin = await CommunityModels.Citizen.findById(citizenId);
    gary = await CommunityModels.Citizen.findById(garyId);
    communityRequest = await CommunityModels.communityRequest.findById(communityRequestId);
    //console.log('finished assignments');
    //console.log('community: ');
    //console.log(community);
    //console.log('citizen: ');
    //console.log(pepin);
    //console.log('gary: ');
    //console.log(gary);

    input.citizen = pepin;
    let result = {
        gary: gary, 
        pepin: pepin, 
        community: community,
        communityRequest: communityRequest,
        input: input,
    };
    //test creating citizen with citizen constructor in dbController
    //test creating community with community constructor in dbController
    //test adding citizen as resident and having votes on law 1 and 2 added
    //test adding citizen as owner and having votes on law 1 and 2 added
    //test creating a proposal
    //test voting on new proposal
    //test passing proposal
    //test having proposal get correctly numbered when passed
    //test having a proposal with category and have it correctly numbered. Pass one, then insert the other after
        //first pass one with negative number

    return result;
    //console.log('add Owner citizen: ')
    //let result = await community.addOwner(input);
    //console.log(result);

}
//connect to mongoDB

module.exports = {
    CommunityModels,
    citizenId,
    garyId,
    communityId,
    dbController,
    communityExample,
    citizenExample,
    recordExample,
    test,
    input,
    pepin,
    gary,
    community,
    lore,
}
