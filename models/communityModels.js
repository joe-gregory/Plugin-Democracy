const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const communitySchema = new Schema(
{   
    name : {type: String, required: true,},

    address : { type: String, required: true, unique: true, },
    
    votingUnit: {type: String, enum:['community.citizens', 'homes.owner'], required: true},

    proposalLimit: {type: Number, default: 30},

    homes : [{
        number : {type: Number, required: true,},

        residents: [{ type: Schema.Types.ObjectId, ref: 'Citizen' }], 

        owner: {type: Schema.Types.ObjectId, ref: 'Citizen'},
        }],

    lawCategories : [{type: String}],

    records: 
        [{ type: new mongoose.Schema({
            identifier: {type: String, required: true}, //automatically assigned

            author: {type: Schema.Types.ObjectId, ref: 'Citizen'}, //citizen who created the proposal
        
            title: {type: String, required: true}, //title of law, role, badge, permit or record
            
            body: {type: String, required: true}, //Further description of law, role, badge, permit or record

            description: String, //why should people vote on this proposal

            salary: Number, //role

            cost: Number, //project

            effectiveDate : { //Date at which law, role, badge, permit or project takes effect
                date: Date,
                days: Number,
            },

            expirationDate : { //Date at which law, role, badge, permit or project expires and becomes inactive
                date: Date,
                days: Number,
            },

            number: {type: Number, required: true, min: 1} , //law absolute number

            type: {type: String, enum:['law', 'role','project', 'permit','badge'], required: true}, //type of proposal

            lawCategory: {type: String,}, //law category

            lawCategoryNumber:{type: Number, min: 1}, //law category number

            status: {type: String, enum: ['proposal', 'active', 'passed','inactive'], required: true, default :'proposal'}, //status of record
            //proposal when it is created and within community.proposalLimit and expiration date with less votes needed for passing
            //active when passed into law, passed when got votes but active date has not reached yet and inactive when proposalLimit (without enough votes) or expiration run out

            votes: [{
                citizen: {type: Schema.Types.ObjectId, ref: 'Citizen', required: true},
                vote: {type: String, enum: ['plug', 'unplug'], required: true},
                date: {type: Date, required: true}
            }],
            },
            {timestamps:true}
        )}],

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
},
    //Community options
    {timestamps:true, 
    
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
            return this.citizens.includes(input.citizen);
        },

        isCitizenOwner: function(input){
            //return true if citizen owns a home otherwise false
            let result = false;
            if(this.owners.includes(input.citizen.id)) result = true;
            return result;
        },

        getHome: function(input){
            let home = this.homes.find(home => home._id === input.home._id || 
                home.id === input.home.id || home.number === input.home.number);
            if(home === undefined) throw new Error('No home found with provided information');
            return home;
        },

        majorityVotes: function(record){
            //checks whether a given record has enough votes to pass returns true if yes, false otherwise
            let result = {};
            //check the type of voting system for community to count votes
            //for homes.owners, collect all the votes that belong to home owners
            if(this.votingUnit === 'community.citizens'){
                let amountCitizenVotes = record.votes.reduce((total,vote) => {
                    if(vote.vote === 'plug') return total + 1;
                    return total;
                }, 0);
                result = (amountCitizenVotes > this.citizens/2) ? true : false;
                return result;
            }
            else if(this.votingUnit === 'homes.owner'){
                let amountHomes = this.homes.length;
                let amountOwnersVotes = record.votes.reduce((total, vote) => {
                    if (vote.vote === 'plug' && this.isCitizenOwner({ citizen: vote.citizen })) return total + 1;
                    return total;
                }, 0);
                result = (amountOwnersVotes > amountHomes / 2) ? true : false;
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
            //add category to lawCategories if necessary and remove if necessary
            //conditions that get check: 
            let result = {success: true};
            let within_proposal_time_limit = (Date.now() - record.createdAt.getTime() <= this.proposalLimit) ? true : false; //if proposal if still within the time limit that you can vote on a proposal (community.proposalLimit)
            let majorityVotes = this.majorityVotes(record); //true if it has majority votes
            
            let within_record_expiration;
            if(record.expirationDate) within_record_expiration = (record.expirationDate.getTime() > Date.now()) ? true : false; //when law expires
            else within_record_expiration = true;
            let after_record_effective_date;
            if(record.effectiveDate) after_record_effective_date = (record.effectiveDate.getTime() <= Date.now()) ? true : false; //when law becomes active
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
                await this.reorderRecords();
            } catch(error){
                result.success = false;
                result.message = error;
            }
            return result;
        },

        updateAllRecords: async function(){
            let records = this.records.filter(record => record.identifier !== '000001' && record.identifier !== '000002')
            records.forEach((record) => this.updateRecord(record));
        },

        reorderRecords: async function(){
            //Helper function to updateRecord();
            //Search for the newest 'active' record and update by universal number and category number
            //or if no numbers are provided, a new number at the end is given.
            //in the above cases, look for the newest record, and use that information to determine what to do 
            //if one became inactive, all the records need to get organize to fill the missing number
            //in this case, look at all absolute and categories and adjust accordingly
            
            //search for the newest record.
            let newestRecord = this.records.sort((a,b) => b.updatedAt - a.updatedAt)[0];
            //if the newest record changed was not a law, no need to do anything. 
            if(newestRecord.type !== 'law') return;
            let activeLawRecordsInNumberOrder = this.records.filter(r => r.status === 'active' && r.type ==='law').sort((a,b) => a.number - b.number);
            //remove the current record
            activeLawRecordsInNumberOrder = activeLawRecordsInNumberOrder.filter(r => r.identifier != newestRecord.identifier);
            let activeLawRecordsInCategoryOrder = activeLawRecordsInNumberOrder.filter(r => r.category === newestRecord.category).sort((a,b) => a.categoryNumber - b.categoryNumber);
            if (newestRecord.status === 'active' && newestRecord.type === 'law'){
                let newestActiveRecord = activeRecord;
                //Universal Number
                
                let biggestLawRecordNumber = activeLawRecordsInNumberOrder[activeLawRecordsInNumberOrder.length - 1].number;
                //fix universal numbering system
                if(newestActiveRecord.number){
                if(newestActiveRecord.number <= 2) newestActiveRecord.number = 3;
                else if(newestActiveRecord.number > biggestLawRecordNumber + 1) newestActiveRecord.number = biggestLawRecordNumber + 1;
                //fix numbering
                let startingIndex = activeLawRecordsInNumberOrder.findIndex(r => r.number === newestActiveRecord.number);
                for(let i = startingIndex; i < activeLawRecordsInNumberOrder.length; i++) activeLawRecordsInNumberOrder.number++;
                }else{
                    newestActiveRecord.number = biggestLawRecordNumber + 1;
                }
                //Category Number
                //if category doesn't exist, add it to lawCategories
                if(!this.lawCategories(newestRecord.category)) this.lawCategories.push(newestRecord.category);
                let biggestCategoryNumber = activeLawRecordsInCategoryOrder[activeLawRecordsInCategoryOrder.length - 1].categoryNumber;
                if(activeLawRecordsInCategoryOrder.length === 0) newestRecord.categoryNumber = 1;
                else if(newestRecord.categoryNumber > biggestCategoryNumber + 1) newestRecord.categoryNumber = biggestCategoryNumber + 1;
                else{
                    if(newestRecord.categoryNumber < 1) newestRecord.categoryNumber = 1;
                    let index = activeLawRecordsInCategoryOrder.findIndex(r => r.categoryNumber === newestRecord.categoryNumber);
                    for(let i = index; i < activeLawRecordsInCategoryOrder.length; i++) activeLawRecordsInCategoryOrder[i].categoryNumber++;
                }
            } else if(newestRecord.status === 'inactive' && newestRecord.type === 'law'){
                //Universal Number
                let index = activeLawRecordsInNumberOrder.findIndex(r => r.number == newestRecord.number + 1);
                for(let i = index; i < activeLawRecordsInNumberOrder.length; i ++){
                    activeLawRecordsInNumberOrder[i].number--; 
                }
                //Category Number. At what index do I need to start decreasing number?
                index = activeLawRecordsInCategoryOrder.findIndex(r => r.categoryNumber === newestRecord.categoryNumber + 1);
                for(let i = index; i < activeLawRecordsInCategoryOrder.length; i++) activeLawRecordsInCategoryOrder[i].categoryNumber--;
                //remove category from lawCategories if no other active law has that category anymore
                for(let i = 0; i < this.lawCategories.length; i++){
                    lawsWithCategory = activeLawRecordsInNumberOrder.filter(r => r.category === this.lawCategories[i]);
                    if(lawsWithCategory.length === 0) this.lawCategories.splice(i,1);
                }
            }
            await this.save();
        },
        //End utility functions

        addResident: async function (input){
            //add resident to given home
            //if citizen is already a resident of given home, it does not get added
            let result = {};
            let home = this.getHome(input);
            //check if resident is already registered
            if(home.residents.some(resident => resident.equals(input.citizen._id))){
                result.success = false;
                result.message = 'Citizen already a resident of given home';
                return result;
            }
            home.residents.push(input.citizen._id);
            try{
                await this.save();
                await this.updateAllRecords();
                let automaticVotes = {record:{}};
                automaticVotes.record.identifier = '000001';
                automaticVotes.vote = {
                    citizen: input.citizen,
                    vote: 'plug',
                }
                result.success = true;
                let r1 = await this.vote(automaticVotes);
                if(r1.success == false) result = r1;
                automaticVotes.record.identifier = '000002';
                let r2 = await this.vote(automaticVotes);
                if(r2.success === false) result = r2;
                
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
            let result = {};
            if(input.home) {
                let home = this.getHome(input);
                //if the given home does not contain the resident, provide warning message
                //and return result.success = false
                if(!home.residents.includes(input.citizen._id.toString())){
                    result.success = false;
                    result.message = 'Citizen not registered as resident of given home';
                    return result
                }
                //remove citizen as resident from home
                home.residents = home.residents.filter(resident => !resident.equals(input.citizen._id));
                                
            } else{
                //check for all the places the resident resides and eliminate from all of them
                this.homes.forEach(home => {
                    home.residents = home.residents.filter(resident => !resident.equals(input.citizen._id));
                });
            }
            try{
                    await this.save();
                    await this.updateAllRecords();
                    result.success = true;
                } catch(error){
                    result.success = false;
                    result.message = error;
                }
                return result;
        },

        addOwner: async function(input){
            //Don't allow if home already has an owner
            let result = {};
            let home = this.getHome(input);

            //if home already has an owner, return warning
            if(home.owner){
                result.success = false;
                result.message = 'Home already has an owner';
                return result;
            }
            //if no owner, add citizen as owner
            home.owner = input.citizen._id;

            try{
                await this.save();
                await this.updateAllRecords();
                let automaticVotes;
                automaticVotes.record.identifier = '000001';
                automaticVotes.vote = {
                    citizen: input.citizen,
                    vote: 'plug',
                }
                await this.vote(automaticVotes);
                automaticVotes.record.identifier = '000002';
                await this.vote(automaticVotes);
            }catch(error){
                result.success = false;
                result.message = error;
            }
            return result;
        }, 

        removeOwner: async function(input){
            //Need to pass house only. Whiuchever owner is there gets removed
            //if no owner return return.success = false
            let result = {};
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
            let result = {};
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
            let result = {}; 
            //input: input.record, input.citizen, input.vote
            //**In controller: ensure that it is the signed-in user being passed in input.vote.citizen */
            //make sure the vote is saved correctly
            if(input.vote.vote !== 'plug' && input.vote.vote !== 'unplug'){
                result.message = 'input.citizen.vote is not in a valid form';
                result.success = false;
                return result
            }


            let record = this.getRecord(input);
            
            //update all record statuses
            await this.updateRecord(record);

            //if the status of the record is inactive, you cannot vote on it
            if(record.status === 'inactive'){
                result.success = false;
                result.message = 'cannot vote on an inactive record';
                return result;
            }
            //has this citizen voted on this record?
            let voteIndex = record.votes.findIndex(vote => vote.citizen.equals(input.citizen._id));
            input.vote.date = new Date();
            if(voteIndex === -1){ //this citizen hasn't voted on this record
                record.votes.push(input.vote);
                result.message = 'New vote added to records'
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

        owners: {
            //returns array of owners without repeating
            get(){
                const owners = this.homes.map(home => home.owners);
                return [...new Set(owners)];
            }
        },

        laws: {
            get(){
                //return all laws sorted by record.number
                let laws = this.records.filter(record => record.status === 'active' && record.type === 'law');
                laws.sort((a,b) => a.number - b.number);
                return laws;
            }
        },

        constitution: {
            //return an object that contains law categories with the laws in each category sorted by record.categoryNumber. 
            //The first element of the array is the laws that don't have a category ordered by record.Number
            get(){
                let constitution = {};
                constitution[''] = this.records.filter(record => record.status === 'active' && !record.category).sort((a,b) => a.number - b.number);
                for(let i = 0; i < this.lawCategories.length; i++){
                    constitution[this.lawCategories[i]] = this.records.filter(record => record.status === 'active' && record.category === this.lawCategories[i]);
                }
                return constitution;
            }
        },

        proposals: {
            get(){
                //return list of proposals in order of createdAt
                return this.records.filter(record => record.status === 'proposal').sort((a,b) => a.createdAt - b.createdAt);
            }
        },

        inactive: {
            get(){
                //return inactive records from oldest to newest
                return this.records.filter(record => record.status === 'inactive').sort((a,b) => a.createdAt - b.createdAt);
            }
        }, 

        roles: {
            get(){
                //returned ordered by createdAt date
                return this.records.filter(record => record.status === 'active' && record.type === 'role').sort((a,b) => a.createdAt - b.createdAt);
            }
        }, 

        badges:{
            get(){
                //return badges in order of createdAt
                return this.records.filter(record => record.status === 'active' && record.type === 'badge').sort((a,b) => a.createdAt - b.createdAt);
            }
        },

        permits:{
            get(){
                //return permits in order of createdAt
                return this.records.filter(record => record.status === 'active' && record.type === 'permit').sort((a,b) => a.createdAt - b.createdAt);
            }
        },

        projects:{
            get(){
                //return projects in order of createdAt
                return this.records.filter(record => record.status === 'active' && record.type === 'project').sort((a,b) => a.createdAt - b.createdAt);
            }
        }, 
    },

    statics: {
        async communitiesWhereResident(citizenId){
            //returns all the communities objects where the citizen is registered in a home without being an owner
            const distinctCommunitiesId = await this.distinct('_id', { homes: { $elemMatch: { residents: citizenId } } });
            return this.find({ _id: { $in: distinctCommunitiesId } });
        },

        async communitiesWhereOwner(citizenId){
            //returns all the communities objects where the citizen is registered as a home owner
            const distinctCommunitiesId = await this.distinct('_id', { homes: { $elemMatch: { owner: citizenId } } });
            return this.find({ _id: { $in: distinctCommunitiesId } });
        },

        async communitiesWhereCitizen(citizenId){
            //returns all the communities objects where the citizen is registered either as a resident or home owner
            const distinctCommunitiesId = await this.distinct('_id', { homes: { $elemMatch: { $or: [ { owner: citizenId }, { residents: citizenId } ] } } });
            return this.find({ _id: { $in: distinctCommunitiesId } });
        }
    }
});

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

    dob: {type: Date, required: true}, //date of birth
    
    email: {
        type: String,
        required: true,
        unique: true,
        set: function(email) {return email.toLowerCase()},
    },
    
    password: {
        type: String,
        required: true
    },

    cellPhone: String, 
},    
    {timestamps: true,

    virtuals: {
        fullName: {
            get() {
                return `${this.firstName} ${this.lastName} ${this.secondLastName}`
            }
        }
    }
});

const Community = mongoose.model('Community', communitySchema);
const Citizen = mongoose.model('Citizen', citizenSchema);

module.exports = {
    Community,
    Citizen,
};