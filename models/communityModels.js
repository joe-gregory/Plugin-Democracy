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

    lawCategories : [{type: String}],

    records: {
        type: [{
            identifier: {type: String, required: true},

            author: {type: Schema.Types.ObjectId, ref: 'Citizen'},
        
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

            lawCategory: {type: String,},

            lawCategoryNumber:{type: Number, min: 1},

            status: {type: String, enum: ['proposal', 'active', 'passed','inactive'], required: true, default :'proposal'},
            //proposal when it is created and within community.proposalLimit and expiration date with less votes needed for passing
            //active when passed into law, passed when got votes but active date has not reached yet and inactive when proposalLimit (without enough votes) or expiration run out

            votes: [{
                citizen: {type: Schema.Types.ObjectId, ref: 'Citizen', required: true},
                vote: {type: String, enum: ['plug', 'unplug'], required: true},
                date: {type: Date, required: true}
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

        isCitizenOwner: function(input){
            //return true if citizen owns a home otherwise false
            let result = false;
            this.homes.forEach((home) => {
                if(home.owner === input.citizen) result = true;
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
                //in this.vote() is where I ensure the citizen hasn't voted twice. 
                record.votes.forEach((vote) =>{
                if(isCitizenOwner(vote)) ownersVotes.push(vote);
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

        updateRecord: async function(record){
            //input: record, output: result.success
            //output: result.success
            //conditions that get check: 
            let result;
            result.success = true;
            let previous_status = record.status;
            let within_proposal_time_limit = (Date.now() - record.createdAt.getTime() <= this.proposalLimit) ? true : false; //if proposal if still within the time limit that you can vote on a proposal (community.proposalLimit)
            let majorityVotes = this.majorityVotes(record); //true if it has majority votes
            
            let within_record_expiration;
            if(record.expirationDate) within_record_expiration = (record.expirationDate.getTime() > Date.now()) ? true : false; //when law expires
            else within_record_expiration = true;
            let after_record_effective_date;
            if(record.effectiveDate) (record.effectiveDate.getTime() <= Date.now()) ? true : false; //when law becomes active
            else after_record_effective_date = true;
            
            //Determination
            if(record.within_record_expiration === false) record.status = 'inactive';
            switch(record.status){
                case 'inactive':
                    break;
                case 'proposal':
                    if(!within_proposal_time_limit && !majorityVotes) record.status = 'inactive';
                    else if(within_proposal_time_limit && majorityVotes && within_record_expiration && after_record_effective_date) record.status = 'active';
                    else if(majorityVotes && within_record_expiration && !after_record_effective_date) record.status = 'passed';
                    break;
                case 'passed':
                    if(!within_proposal_time_limit && !majorityVotes) record.status = 'inactive';
                    else if(within_proposal_time_limit && !majorityVotes && within_record_expiration) record.status = 'proposal';
                    else if(majorityVotes && within_record_expiration && after_record_effective_date) record.status = 'active'
                    break;
                case 'active':
                    if(!majorityVotes) record.status = 'inactive';
                    else if(within_proposal_time_limit && !majorityVotes && within_record_expiration) record.status = 'proposal';
                    break;
                default:
                    result.success = false;
            }
            try{
                await this.save();
            } catch(error){
                result.success = false;
                result.message = error;
            }
            return result;
        },

        updateAllRecords: async function(){
            await this.records.forEach((record) => this.updateRecord(record));
        },
        //End utility functions

        addResident: async function (input){
            let result;
            let home = this.getHome(input);
            home.residents.push(input.citizen);
            try{
                await this.save();
                await this.updateAllRecords();
                result.success = true;
            }catch(error){
                result.success = false;
                result.message = error;
            }
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
                try{
                    await this.save();
                    await this.updateAllRecords();
                    result.success = true;
                } catch(error){
                    result.success = false;
                    result.message = error;
                }
                return result;
                
            } else{
                //check for all the places the resident resides and eliminate from all of them
                this.homes.forEach(home => {
                    home.residents = home.residents.filter(citizen => citizen !== input.citizen.id);
                    home.residents = home.residents.filter(citizen => citizen !== input.citizen._id);
                });
                try{
                    await this.save();
                    await this.updateAllRecords();
                    result.success = true;
                }catch(error){
                    result.success = false;
                    result.message = error;
                }

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
            try{
                await this.save();
                await this.updateAllRecords();
            }catch(error){
                result.success = false;
                result.message = error;
            }
            return result;
        }, 

        removeOwner: async function(input){
            //Need to pass house number
            //if no owner return return.success = false
            let result;
            let home = this.getHome(input);
            if(home.owner) {
                home.owner = null;
                try{
                    await this.save();
                    await this.updateAllRecords();
                    result.success = true;
                }catch(error){
                    result.success = false;
                    result.message = error;
                }
            }else{
                result.message = 'No owner in this house';
                result.success = false;
            }
            return result
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
            input.proposal.author = input.citizen._id;
            //generate identifier until there is an original one
            let success = false;
            let identifier;
            while(!success){
                identifier = this.generateIdentifier();
                if(!this.records.find(record => record.identifier === identifier)) success = true;
            }
            input.proposal.identifier = identifier;
            this.records.push(input.proposal);
            try{
                await this.save();
                result.success = true;
            } catch(error){
                result.success = false;
                result.message = error;
            }
            return result
        },

        vote: async function(input){
            let result; 
            //input: input.record, input.citizen, input.vote
            //**In controller: ensure that it is the signed-in user being passed in input.vote.citizen */
            //make sure the vote is saved correctly
            if(input.vote.vote !== 'plug' || input.vote.vote !== 'unplug'){
                result.message = 'input.citizen.vote is not in a valid form';
                result.success = false;
                return result
            }
            //update all record statuses
            await this.updateRecord(input.record);

            let record = this.getRecord(input);
            //if the status of the record is inactive, you cannot vote on it
            if(record.status === 'inactive'){
                result.success = false;
                result.message = 'cannot vote on an inactive record';
                return result;
            }
            //has this citizen voted on this record?
            let voteIndex = record.votes.findIndex(vote => vote.citizen === input.citizen._id);
            input.vote.date = new Date();
            if(voteIndex === -1){ //this citizen hasn't voted on this record
                record.votes.push(input.vote);
                result.message = 'New vote added to record'
            } else {
                record.votes[voteIndex].vote = input.vote.vote;
                record.votes[voteIndex].date = input.vote.date;
                result.message = 'Existing vote updated'
            }
            result.success = true;
            //save changes
            try {
                await this.save();
                //update record
                await this.updateRecord(record);
              } catch (error) {
                result.message = error;
                result.success = false;
              }
            return result;
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