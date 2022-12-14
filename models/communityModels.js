const mongoose = require('mongoose');
const Schema = mongoose.Schema; 
const CitizenActions = require('./citizenActionsModels');

const communitySchema = new Schema({
   
    name : {
        type: String,
        required: true,
        unique: true,
    },
    
    address : {
        type: String,
        required: true,
        unique: true,
    },
    
    homes : [{ 
         type: Schema.Types.ObjectId, ref: 'Home'
    }],

    citizens: [{ 
        type: Schema.Types.ObjectId, ref: 'Citizen'
    }],

    proposals: [{
        type: Schema.Types.ObjectId, ref: 'CitizenActions.Proposal'
    }],

    laws: [{
        type: Schema.Types.ObjectId, ref: 'CitizenActions.Law'
    }],

    roles: [{type: Schema.Types.ObjectId, ref: 'CitizenActions.Role'}],

    projects: [{type: Schema.Types.ObjectId, ref: 'CitizenActions.Project'}],

    permits: [{type: Schema.Types.ObjectId, ref: 'CitizenActions.Permit'}],

    badges: [{type: Schema.Types.ObjectId, ref: 'CitizenActions.Badge'}],
}, 

{timestamps:true}

);

const homeSchema = new Schema({
    
    innerNumber : {
        type: Number,
        required: true,
    },

    community: { type: Schema.Types.ObjectId, ref: 'Community'},
    
    citizens: [{ type: Schema.Types.ObjectId, ref: 'Citizen' }], 

    voter: {type: Schema.Types.ObjectId, ref: 'Citizen'},
}, 
{timestamps:true}

);

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
    
    residencies: [

        { 
            community: {type: Schema.Types.ObjectId, ref : 'Community'},
            home: { type: Schema.Types.ObjectId, ref : 'Home' },
        }

        ],

    badges: [{type: Schema.Types.ObjectId, ref: 'CitizenActions.badge'}],

}, 
    {timestamps: true}
);

citizenSchema.virtual('fullName').
    get(function(){ return `${this.firstName} ${this.lastName} ${this.secondLastName}`})

const Community = mongoose.model('Community', communitySchema);
const Home = mongoose.model('Home', homeSchema);
const Citizen = mongoose.model('Citizen', citizenSchema);

module.exports = {
    Community,
    Home,
    Citizen,
};