const mongoose = require('mongoose');
const Schema = mongoose.Schema; 
const Community = require('./communityModels');

const proposalSchema = new Schema ({
    title: {
        type: String,
    }, 

    body: String,

    type: {
        type: String, 
        enum: ['createLaw','deleteLaw', 'editLaw', 'createRole','deleteRole', 'editRole', 
        'assignRole', 'removeRole', 'swapRole', 'createProject', 'createBadge', 
        'assignBadge', 'permit'],
    }, 

    author:  {
        type: Schema.Types.ObjectId, ref: 'Community.Citizen',
        required: true,
    },

    votes: [{
        type: Schema.Types.ObjectId, ref: 'Vote'
    }],

    unofficialVotes: [{type: Schema.Types.ObjectId, ref: 'UnofficialVote'}],
    
    community: {
        type: Schema.Types.ObjectId, ref: 'Community.Community',
        required: true,
    },

    approvedDate: {
        type: Date,
    }, 

    passed: Boolean, 

    passedDate: Date,

    //Data related to the documen that will be created when the proposal passes

    citizenActionDocument: {
        type: Schema.Types.ObjectId
    },

    citizenActionTitle : String,

    citizenActionBody: String, 

    citizenActionStartDate: Date,

    citizenActionExpirationDate: Date, 

    citizenActionActive: Boolean,

    citizenActionPay: Number,

    citizenActionVolunteersAmount: Number,

    citizenActionVolunteers : [{type: Schema.Types.ObjectId, ref: 'Community.Citizen'}],

    citizenActionRewardBadges : [{type: Schema.Types.ObjectId, ref: 'Badge'}],

    citizenActionBadgeImage: String,

    },

    {timestamps: true}

);

proposalSchema.virtual('votesInFavor').get(function(){ 
    return this.votes.reduce((accumulator, vote) => accumulator + (vote.inFavor === true),0);
});

proposalSchema.virtual('votesAgainst').get(function(){
  return this.votes.reduce((accumulator, vote) => accumulator + (vote.inFavor === false), 0);
});

proposalSchema.virtual('unofficialVotesInFavor').get(function(){
    return this.unofficialVotes.reduce((accumulator, unofficialVote) => accumulator + (unofficialVote.inFavor === true), 0);
});

proposalSchema.virtual('unofficialVotesAgainst').get(function(){
    return this.unofficialVotes.reduce((accumulator, unofficialVote) => accumulator + (unofficialVote.inFavor === false),0);
})

const lawSchema = new Schema ({

    title: String, 

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
    },

    beginningDate : Date,

    expirationDate : Date, 

    active: Boolean,
    
    },

    {timestamps: true}
);

const voteSchema = new Schema({
    citizen: {type: Schema.Types.ObjectId, ref: 'Community.Citizen'},

    inFavor: {type: Boolean},

    proposal: {type: Schema.Types.ObjectId, ref: 'Law'},

    community: {type: Schema.Types.ObjectId, ref: 'Community'},
},

{ timestamps: true}

);

const unofficialVoteSchema = new Schema({
    citizen: {type: Schema.Types.ObjectId, ref: 'Community.Citizen'},

    inFavor: {type: Boolean},

    proposal: {type: Schema.Types.ObjectId, ref: 'Law'},

    community: {type: Schema.Types.ObjectId, ref: 'Community'},
},

{ timestamps: true}

);

const roleSchema = new Schema ({

    title: String, 

    body: {
        type: String,
        required: true,
    },

    community: {
            type: Schema.Types.ObjectId, ref: 'Community.Community',
            required: true,
        },
    
    citizen:  {
        type: Schema.Types.ObjectId, ref: 'Community.Citizen'
    },

    proposal: {
        type: Schema.Types.ObjectId, ref: 'Proposal',
        required: true,
    }, 

    beginningDate : Date,

    expirationDate : Date, 

    active: Boolean,

    pay: Number,
},

    {timestamps: true}
);

const projectSchema = new Schema ({

    title: String, 

    body: {
        type: String,
        required: true,
    },

    community: {
            type: Schema.Types.ObjectId, ref: 'Community.Community',
            required: true,
        },

    proposal: {
        type: Schema.Types.ObjectId, ref: 'Proposal',
        required: true,
    }, 

    beginningDate : Date,

    expirationDate : Date, 

    active: Boolean,

    volunteers: [{type: Schema.Types.ObjectId, ref: 'Community.Citizen'}],

    rewardBadges: [{type: Schema.Types.ObjectId, ref: 'Badge'}]

},

    {timestamps: true}
);

const badgeSchema = new Schema ({

    title: String, 

    body: {
        type: String,
        required: true,
    },

    community: {
            type: Schema.Types.ObjectId, ref: 'Community.Community',
            required: true,
        },

    proposal: {
        type: Schema.Types.ObjectId, ref: 'Proposal',
        required: true,
    }, 

    beginningDate : Date,

    expirationDate : Date, 

    active: Boolean,

    image: String,

},

    {timestamps: true}
);

const permitSchema = new Schema ({

    title: String, 

    body: {
        type: String,
        required: true,
    },

    community: {
            type: Schema.Types.ObjectId, ref: 'Community.Community',
            required: true,
        },

    proposal: {
        type: Schema.Types.ObjectId, ref: 'Proposal',
        required: true,
    }, 

    beginningDate : Date,

    expirationDate : Date, 

    active: Boolean,

    citizens: [{type: Schema.Types.ObjectId, ref: 'Community.Citizen'}],

},

    {timestamps: true}
);

const Proposal = mongoose.model('Proposal', proposalSchema);
const Law = mongoose.model('Law', lawSchema);
const Vote = mongoose.model('Vote', voteSchema);
const UnofficialVote = mongoose.model('UnofficialVote', unofficialVoteSchema);
const Role = mongoose.model('Role', roleSchema);
const Project = mongoose.model('Project', projectSchema);
const Badge = mongoose.model('Badge', badgeSchema);
const Permit = mongoose.model('Permit', permitSchema);

module.exports = {
    Proposal,
    Law,
    Vote,
    UnofficialVote,
    Role,
    Project,
    Badge,
    Permit,
};