const mongoose = require('mongoose');
const CommunityModels = require('./models/communityModels');
const dbController = require('./controllers/dbController')
const key = require('./keys');


const dbURI = 'mongodb+srv://'+key+'@ddcluster.z8oz5ye.mongodb.net/?retryWrites=true&w=majority';
//let pepinId = 
//let community7Id = 
let communityExample = {
    name: 'colonia',
    address: 'El pipila',
    votingUnit: 'homes.owner',
    homesStartingNumber: 2,
    homesEndingNumber: 4
};
let userExample = {
    firstName: 'el pepe',
    lastName: 'el sangron de san quintin',
    email: 'PEPE@PEPE.COM',
    password: '123',
    dob: Date.now(),
}
//register view engine

//connect to mongoDB
mongoose.connect(dbURI)
    .then((result) => {
        console.log(`Connected to Data Base`);
    })
    .catch((error) => {
        console.log(`Error connecting to DB: ${error}`);
        console.log(`Error Object [key, value] pairs:`);
        console.log(Object.entries(error));
    });

module.exports = {
    dbController,
    CommunityModels,
    communityExample,

}