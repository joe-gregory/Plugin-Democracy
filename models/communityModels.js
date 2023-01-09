const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const communitySchema = new Schema(
{   
    name : {type: String, required: true,},

    address : { type: String, required: true, unique: true, },
    
    votingUnit: {type: String, enum:['homes.citizens', 'homes.owner'], required: true},

    proposalLimit: {type: Number, default: 30},

    homes : [{
        number : {type: Number, required: true,},

        residents: [{ type: Schema.Types.ObjectId, ref: 'Citizen' }], 

        owner: {type: Schema.Types.ObjectId, ref: 'Citizen'},
        }],

    records: {
        type: [{
            identifier: {type: String, required: true},
        
            title: {type: String, required: true},
            
            body: {type: String, required: true},

            description: String,

            salary: Number,

            cost: Number,

            effectiveDate : {
                date: Date,
                days: Number,
            },

            expirationDate : {
                date: Date,
                days: Number,
            },

            number: {type: Number, required: true, min: 1} ,

            type: {type: String, enum:['law', 'role','project', 'permit','badge'], required: true},

            category: {type: String,},

            categoryNumber:{type: Number, min: 1},

            status: {type: String, enum: ['proposal', 'passed','inactive'], required: true, default :'proposal'},

            votes: [{
                citizen: {type: Schema.Types.ObjectId, ref: 'Citizen'},
                vote: {type: String, enum: ['plug', 'unplug']},
                date: Date
            }],
        }],
        
        timestamps: true,
    },

    history: {
        type: [{
        event: {type: String, enum: ['community-created', 'home-added','home-removed',
        'resident-added','resident-removed','owner-added', 'owner-removed','record-created',
        'vote', 'record-status','record-edit']},
        date: Date,
        citizen: {type: Schema.Types.ObjectId, ref: 'Citizen'},
        vote: String,
        record: Schema.Types.ObjectId,
        status: String, 
        home: Schema.Types.ObjectId,
    }], 
},

    //Community options
    timestamps:true, 
    
    methods: { //all methods take in an object where all the inputs reside with the same structure as the schema
        //Begin utility methods. Only utility methods throw errors. All others record warning message.
        generateIdentifier: function(){
            //generates a random 5 digit identifier consisting of all lowercase letters and digits 0-9
            const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
            let identifier = '';

            for (let i = 0; i < 5; i++){
                //generate a random index between 0 and 35
                const index = Math.floor(Math.random()*characters.length);
                //add the random character to the combination
                identifier += characters[index];
            }
            return identifier;
        },

        isCitizenMember: function(input){
            //returns true if citizen is member of community, false otherwise,
            let result = false; 
            this.homes.forEach(home => {
                if(home.residents.includes(input.citizen._id)) result = true;
                if(home.owner === input.citizen._id) result = true;
            })
            return result
        },

        isCitizenOwner: function(citizen_id){
            //return true if citizen owns a home otherwise false
            let result = false;
            this.homes.forEach((home) => {
                if(home.owner === citizen_id) result = true;
            })
            return result;
        },

        getHomeIndex: function(input) {
            //gets a home's index in the homes array. It accepts home's number or home.id.
            let index = -1;
            if(input.home._id){
                index = this.homes.findIndex(home => home._id === input.home._id);
            } else if(input.home.id && index === -1){
                index = this.homes.findIndex(home => home.id === input.home.id);
            } else if(input.homes.number && index === -1){
                index = this.homes.findIndex(home => home.number === input.home.number);
            } else{throw new Error('No home found with provided information')}
            return index;
        },

        getHome: function(input){
            let home;
            if(input.home._id){
                home = this.homes.find(home => home._id === input.home._id);
            } else if(input.home.id){
                home = this.homes.find(home => home.id === input.home.id);
            } else if(input.homes.number){
                home = this.homes.find(home => home.number === input.home.number);
            } 
            if(home === undefined) throw new Error('No home found with provided information');
            return home;
        },
        
        getRecord: function(input){
            //search for records with _id, id or identifiere
            let record; 
            //search for records with input.record._id
            if(input.record._id){
                record = this.records.find(record => record._id === input.record._id);
                
            } else if (input.record.id){
                record = this.records.find(record => record.id === input.record.id);
                
            } else if(input.record.identifier){
                record = this.records.find(record => record.identifier === input.record.identifier);
            }
            if(record !== undefined) return record;
            else throw new Error('Record not found');
        },

        majorityVotes: function(record){
            //checks whether a given record has enough votes to pass returns true if yes, false otherwise
            let result;
            //check the type of voting system for community to count votes
            //for homes.owners, collect all the votes that belong to home owners
            if(this.votingUnit === 'homes.citizens'){
                let amountCitizenVotes = record.votes.reduce((total,vote) => {
                    if(vote.vote === 'plug') return total + 1;
                    return total;
                }, 0);
                result = (amountCitizenVotes > this.citizens/2) ? true : false;
                return result;
            }
            else if(this.votingUnit === 'homes.owners'){
                let amountHomes = this.homes.length;
                let ownersVotes = [];
                record.votes.forEach((vote) =>{
                if(isCitizenOwner(vote.citizen)) ownersVotes.push(vote);
                })
                amountOwnersVotes = record.votes.reduce((total, vote) => {
                    if(vote.vote === 'plug') return total + 1;
                    return total;
                }, 0);
                result = (amountOwnersVotes > amountHomes/2) ? true : false;
                return result;
            }
            throw new Error('no condition was found running majorityVotes')
        },

        updateRecord: function(record){
            //input: record, output: result.success
            //if in proposal mode and reached proposalLimit time, it goes inactive
            let within_proposal_time_limit = (Date.now() - record.createdAt.getTime() >= this.proposalLimit) ? true : false;
            let majorityVotes = this.majorityVotes(record); //true if it has majority
            const currentDate = new Date();

        },
        //End utility functions

        addResident: async function (input){
            let result;
            let home = this.getHome(input);
            home.residents.push(input.citizen);
            await this.save().then(result.success = true).catch(result.success = false);
            return result;
        },

        removeResident: async function(input){
            //if a home is provided, remove from that home only. 
            //Otherwise remove from all resident locations (stays as owner)
            //if house provided, get homeIndex
            let result;
            if(input.home) {
                let home = this.getHome(input);
                //if the given home does not contain the resident, provide warning message
                //and return result.success = false
                if(!home.residents.contains(input.citizen)){
                    result.success = false;
                    result.message = 'Citizen not registered as resident of given residency';
                    return result
                }

                //remove citizen as resident from home
                let residentIndex = home.residents.findIndex(resident => resident === input.citizen._id);
                //identify index
                home.residents = home.residents.splice(residentIndex, 1);
                await this.save().then(result.success = true).catch((error) => {
                    result.success = false;
                    result.message = error});
                return result;
                
            } else{
                //check for all the places the resident resides and eliminate from all of them
                this.homes.forEach(home => {
                    home.residents = home.residents.filter(citizen => citizen !== input.citizen.id);
                    home.residents = home.residents.filter(citizen => citizen !== input.citizen._id);
                });
                await this.save().then(result.success = true).catch((error) =>{
                    result.success = false;
                    result.message = error;
                });
                return result;
            }
        },

        addOwner: async function(input){
            //Don't allow if home already has an owner
            let result;
            let home = this.getHome(input);

            //if home already has an owner, return warning
            if(home.owner){
                result.success = false;
                result.message = 'Home already has an owner';
                return result;
            }
            //if no owner, add citizen as owner
            home.owner = input.citizen;
            await this.save().then(result.success = true).catch(result.success = false);
            return result;
        }, 

        removeOwner: async function(input){
            //Need to pass house number
            //if no owner return return.success = false
            let result;
            let home = this.getHome(input);
            if(home.owner) {
                home.owner = null;
                await this.save().then(result.success = true).catch((error) => {
                    result.success = false;
                    result.message = error});
                return result;
            }else{
                result.message = 'No owner in this house';
                result.success = false;
                return result;
            }
        }, 

        createProposal: async function(input){
            let result;
            //is citizen a member of community?
            if(!this.isCitizenMember(input)){
                result.success = false;
                result.message = 'This citizen is not a member of this community';
                return result;
            }
            //create new record
            input.proposal.status = null;
            input.proposal.votes = [];
            //generate identifier until there is an original one
            let success = false;
            let identifier;
            while(!success){
                identifier = this.generateIdentifier();
                if(!this.records.find(record => record.identifier === identifier)) success = true;
            }
            input.proposal.identifier = identifier;
            this.records.push(input.proposal);
            await this.save().then(result.success = true).catch(result.success = false);
            return result
        },

        vote: async function(input){
            let result; 
            //input: record, citizen, & citizen.vote ('plug' or 'unplug')
            //make sure the vote is saved correctly
            if(input.citizen.vote !== 'plug' || input.citizen.vote !== 'unplug'){
                result.message = 'citizen.vote is not in a valid form';
                result.success = false;
                return result
            }

            let record = this.getRecord(input);
            //what is the status of this record?
            if(record.status === 'inactive'){
                result.success = 'false';
                result.message = 'cannot vote on an inactive record';
                return result;
            }
            //has this citizen voted on this record?
            let citizenIndex = record.votes.findIndex(vote => vote.citizen === input.citizen._id);
            if(citizenIndex === -1){ //this citizen hasn't voted on this record
                record.votes.push({citizen: input.citizen._id, vote: input.citizen.vote})
            }
            //Run status updater to see if proposal had any changes
            //ALSO RUN AT THE BEGINNING
        }

    },

    virtuals: {
        citizens: {
            get() {
                //get all the homes.residents and homes.owners
                let citizens = [];
                for (const home of this.homes){
                    if(home.owner) citizens.push(home.owner);
                    for(const resident of home.residents){
                        citizens.push(resident);
                    }
                }
                //eliminate repeated citizens using the Set object and the spread operator
                citizens = [...new Set(citizens)];

                return citizens;
            }
        },

        laws: {
            get(){
                let laws = this.
            }
        }
    },
    
    pre: {
        save: function(next) {
            const community = this;

            //detect changes to homes array
            if(community.isModified('homes')){
                //check if the homes array has increase in size, 
            }
            next();
        }
    },

});

const citizenSchema = new Schema({
    
    identifier: String, 

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
    {timestamps: true}, 

    {virtuals: {
        fullName: {
            get() {
                return `${this.firstName} ${this.lastName} ${this.secondLastName}`
            }
        }
    }
    },
);

const Community = mongoose.model('Community', communitySchema);
const Citizen = mongoose.model('Citizen', citizenSchema);

module.exports = {
    Community,
    Citizen,
};