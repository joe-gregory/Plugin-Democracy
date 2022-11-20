const mongoose = require('mongoose');
const Schema = mongoose.Schema; 
const Community = require('./community');

const proposalSchema = new Schema ({
    proposal: {
        type: String,
    }, 

    type: {
        type: String, 
        enum: ['create','delete'],
    }, 

    author:  {
        type: Schema.Types.ObjectId, ref: 'Community.Citizen',
        required: true,
    },

    votes: [{
        type: Schema.Types.ObjectId, ref: 'Vote'
    }],

    law: {
        type: Schema.Types.ObjectId, ref: 'Law',
    },

    community: {
        type: Schema.Types.ObjectId, ref: 'Community.Community',
        required: true,
    },

    approvedDate: {
        type: Date,
    }
    
    },

    {timestamp: true}

);

const lawSchema = new Schema ({

    law: {
        type: String,
        required: true,
    },

    author:  {
        type: Schema.Types.ObjectId, ref: 'Community.Citizen'
    },

    proposal: {
        type: Schema.Types.ObjectId, ref: 'Proposal',
        required: true,
    }, 

    community: {
        type: Schema.Types.ObjectId, ref: 'Community.Community',
        required: true,
    }
    
    },

    {timestamp: true}
);

voteSchema = new Schema({
    citizen: {
        type: Schema.Types.ObjectId, ref: 'Community.Citizen'
    },

    inFavor: {
        type: Boolean
    },

    law: {
        type: Schema.Types.ObjectId, ref: 'Law'
    }
},

{ timestamp: true}

);

const Proposal = mongoose.model('Proposal', proposalSchema);
const Law = mongoose.model('Law', lawSchema);
const Vote = mongoose.model('Vote', voteSchema);

module.exports = {
    Proposal,
    Law,
    Vote,
};