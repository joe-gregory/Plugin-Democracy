 const mongoose = require('mongoose');
 const Schema = mongoose.Schema; 

 const communitySchema = new Schema({
   
    name : {
        type: String,
        required: true,
        unique: true,
    },
    
    communityAddress : {
        type: String,
        required: true,
        unique: true,
    },
    
    innerHomes : [{ 
         type: Schema.Types.ObjectId, ref: 'Home'
    }],

    president : { type: Schema.Types.ObjectId, ref: 'Citizen'},

    treasurer : { type: Schema.Types.ObjectId, ref: 'Citizen' },
});

const homeSchema = new Schema({
    
    innerNumber : {
        type: Number,
        required: true,
    },

    community: { type: Schema.Types.ObjectId, ref: 'Community'},
    
    citizen: {
        type: Schema.Types.ObjectId, ref: 'Citizen'
    }
})

const citizenSchema = new Schema({
    
    firstName: {
        type: String,
        required: true
    },
    
    lastName: {
        type: String,
        required: true
    },
    
    secondLastName: String,
    
    email: {
        type: String,
        required: true,
        unique: true,
    },
    
    password: {
        type: String,
        required: true
    },

    cellPhone: String, 

    home: { type: Schema.Types.ObjectId, ref : 'Home' }

}, 
    {timestamps: true}
);

const Community = mongoose.model('Community', communitySchema);
const Home = mongoose.model('Home', homeSchema);
const Citizen = mongoose.model('Citizen', citizenSchema);

module.exports = {
    Community,
    Home,
    Citizen
};