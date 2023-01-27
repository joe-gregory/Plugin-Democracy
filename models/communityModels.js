const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const communitySchema = new Schema(
{   
    name : {type: String, required: true,},

    address : { type: String, required: true, unique: true, },

    language: {type: String, enum:['ES','EN'], default: 'ES'},
    
    votingUnit: {type: String, enum:['community.citizens', 'homes.owner'], required: true},

    proposalLimit: {type: Number, default: 30},

    homes : [{
        number : {type: Number, required: true,},

        residents: [{ type: Schema.Types.ObjectId, ref: 'Citizen' }], 

        owner: {type: Schema.Types.ObjectId, ref: 'Citizen'},
        }],
    
    reservedIdentifiers: [{type: String}],

    records: 
        [{ type: new mongoose.Schema({
            identifier: {type: String, required: true}, //automatically assigned

            author: {type: Schema.Types.ObjectId, ref: 'Citizen'}, //citizen who created the proposal
        
            title: {type: String, required: true}, //title of law, role, badge, permit or record
            
            body: {type: String, required: true}, //Further description of law, role, badge, permit or record

            description: String, //why should people vote on this proposal

            salary: Number, //role

            cost: Number, //project

            citizen: {type: Schema.Types.ObjectId, ref: 'Citizen'}, //for role
            
            admin: {type: Boolean, default: false}, //role

            effectiveDate : Date, //Date at which law, role, badge, permit or project takes effect

            expirationDate : Date, //Date at which law, role, badge, permit or project expires and becomes inactive

            number: {type: Number, min: 1} , //law absolute number

            type: {type: String, enum:['law', 'role','project', 'permit','badge', 'law2'], required: true, default: 'law'}, //type of proposal

            proposalLimit: Number, //for proposals of type law2 to change the length of proposal limits

            previousProposalLimit: {type: Number, default: 30},//place to store original this.proposalLimit in case records goes from active to passed during voting period

            lawCategory: {type: String,}, //law category

            lawCategoryNumber:{type: Number, min: 1}, //law category number

            status: {type: String, enum: ['proposal', 'active', 'passed','inactive'], required: true, default :'proposal'}, //status of record

            statusUpdateDate: {type: Date, required: true},
            //proposal when it is created and within community.proposalLimit and expiration date with less votes needed for passing
            //active when passed into law, passed when got votes but active date has not reached yet and inactive when proposalLimit (without enough votes) or expiration run out

            votes: [{type: new mongoose.Schema({
                citizen: {type: Schema.Types.ObjectId, ref: 'Citizen', required: true},
                vote: {type: String, enum: ['plug', 'unplug'], required: true},
            }, {timestamps: true})}],
            },
            {timestamps:true}
        )}],

    joinRequests: [{
        citizen: {type: Schema.Types.ObjectId, ref: 'Citizen', required: true},

        homeNumber: {type: Number, required: true},

        type: {type: String, enum: ['resident','owner'], required: true, default: 'resident'},

        status: {type: String, enum:['new','approved','denied'], default: 'new'}
    }],

    posts: [{
        body: String,

        date: Date,

        author: {type: Schema.Types.ObjectId, ref: 'Citizen'}
    }],

},
    //Community options
    {timestamps:true, 
    
    methods: { //all methods take in an object where all the inputs reside with the same structure as the schema
        //Begin utility methods. Only utility methods throw errors. All others record warning message.
        generateIdentifier: function(){
            //generates a random 5 digit identifier consisting of all lowercase letters and digits 0-9
            const characters = '0123456789abcdefghijklmnopqrstuvwxyz';
            let identifier = '';

            for (let i = 0; i < 6; i++){
                //generate a random index between 0 and 35
                const index = Math.floor(Math.random()*characters.length);
                //add the random character to the combination
                identifier += characters[index];
            }
            return identifier;
        },

        generateUniqueIdentifier: function(){
            //provides an identifier that is not on the reservedIdentifiers list or used by another record
            //generate identifier until there is an original one
            let success = false;
            let identifier;
            while(!success){
                identifier = this.generateIdentifier();
                if(!this.records.find(record => record.identifier === identifier) && 
                !this.reservedIdentifiers.includes(identifier)) success = true;
            }
            return identifier;

        },

        isCitizenMember: function(citizen_id){
            //returns true if citizen is member of community in home or owner, false otherwise,
            return this.citizens.some((citizen) => citizen.equals(citizen_id));
        },

        isCitizenResident: function(citizen_id){
            return this.residents.some((resident) => resident.equals(citizen_id));
        },

        isCitizenOwner: function(citizen_id){
            //return true if citizen owns a home otherwise false
            return this.owners.some((owner) => owner.equals(citizen_id));
        },

        getHome: function(input){
            let home = this.homes.find(home => home._id === input.home._id || 
                home.id === input.home.id || home.number === input.home.number);
            if(home === undefined) throw new Error('No home found with provided information');
            return home;
        },

        getCitizen: async function(input){
            //returns the full citizen object. Required _id
            //needs to be called with await because async function returns a promise
            let citizen =  await Citizen.findById(input.citizen._id);
            if(!citizen) throw new Error('No citizen found with given _id');
            return citizen;
        },

        homesOwned: function(citizenId){
            //return array of homes owned by given citizen Id
            let homes = [];
            for(const home of this.homes){
                if(home.owner && home.owner.equals(citizenId)) homes.push(home);
            }
            return homes;
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
                let amountOfHomes = this.homes.length;
                let votesInFavor = 0;
                let votesAgainst = 0;
                //go through each vote, see what type it is, see who the owner is and how many homes he owns
                for(const vote of record.votes){
                    //if it's not owner, don't do anything
                    if(this.isCitizenOwner(vote.citizen)){
                        let amount_homes_owned = this.homesOwned(vote.citizen).length;
                        if(vote.vote === 'plug') votesInFavor += amount_homes_owned;
                        else if(vote.vote ==='unplug') votesAgainst += amount_homes_owned;
                    }
                }
                result = (votesInFavor > amountOfHomes/2) ? true : false;
                return result;
            }
            throw new Error('no condition was found running majorityVotes')
        },

        getRecord: function(input){
            //search for records with _id, id or identifier
            let record; 
            //search for records with input.record._id
            if(input.record._id){
                record = this.records.find(record => record._id === input.record._id);
                
            } else if (input.record.id){
                record = this.records.find(record => record.id === input.record.id);
                
            } else if(input.record.identifier){
                record = this.records.find(record => record.identifier === input.record.identifier);
            }
            if(record) return record;
            else throw new Error('Record not found');
        },

        law2Proposal: async function(record){
            if(record.proposalLimit < 1 || record.previousProposalLimit < 1){
                throw new Error('Proposed proposal limit below 1 or wrong type');
            } 
            if (record.status === 'active'){
                this.proposalLimit = record.proposalLimit;
            } 
            else if(record.status === 'proposal'){
                this.proposalLimit = record.previousProposalLimit;
            }else if(record.status === 'inactive'){
                this.proposalLimit = 30;
            }
            let law2 = this.getRecord({record:{identifier:'000002'}});
            law2.body = "Todas las propuestas presentadas por los ciudadanos tendrán una fecha de expiración de " +
            this.proposalLimit + " días a partir de la fecha de su publicación. Los ciudadanos pueden " +
            "votar para modificar esta ley y cambiar el plazo para votar en las propuestas. Cualquier modificación " +
            "debe ser aprobada por la mayoría de la comunidad. Si la modificación es aprobada, la nueva fecha de " +
            "expiración entrará en vigor de inmediato.";
            
            await this.save();
        },
        //End utility methods

        addPost: async function(input){
            //input. type, record, citizen
            let post = {};
            if(input.citizen) input.citizen = await this.getCitizen(input);
            if(input.home) input.home = this.getHome(input);
            if(input.record){
                input.record = this.getRecord(input);
                if(input.record.author){
                    input.record.author = await this.getCitizen({citizen:{_id:input.record.author}});
                }
            } 
            //translating of record type, status, plug and unplug
            let estatus; 
            let tipo;
            let coneccion;
            if(input.vote){
                (input.vote.vote === 'plug') ? coneccion = 'conectado' : coneccion = 'desconectado'; 
            }
            if(input.record){
                switch(input.record.status){
                case 'proposal':
                    estatus = 'propuesta';
                    break;
                case 'active':
                    estatus = 'activo'
                    break;
                case 'inactive':
                    estatus = 'inactivo';
                    break;
                case 'passed':
                    estatus = 'mayoria'
                    break;
                }
                switch(input.record.type){
                    case 'law':
                        tipo = 'ley';
                        break;
                    case 'role':
                        tipo = 'rol';
                        break;
                    case 'law2':
                        tipo = 'ley sobre cambio al limite de propuestas';
                        break;
                    case 'project':
                        tipo = 'proyecto';
                        break;
                    case 'permit':
                        tipo = 'permiso';
                        break;
                    case 'badge':
                        tipo = 'medalla';
                        break
                    default:
                        throw new Error('No input.record.type matched in "vote" case for addPost');
                }
            }
            
            //filling post.body
            switch(input.post.type){
                case 'addResident':
                    post.body = `${input.citizen.fullName} se ha agregado como residente de la vivienda #${input.home.number}`;
                    break;
                case 'removeResident':
                    if(input.home){
                        post.body = `${input.citizen.fullName} se ha quitado como residente de la casa #${input.home.number}`
                    }else{
                        post.body = `${input.citizen.fullName} se ha quitado como residente de esta comunidad.`
                    }
                    break;
                case 'addOwner':
                    post.body = `${input.citizen.fullName} se ha agregado como propietario de casa #${input.home.number}`
                    break;
                case 'removeOwner':
                    post.body = `${input.citizen.fullName} se ha quitado como propietario de casa #${input.home.number}`;
                    break;
                case 'vote':
                    post.body = `${input.citizen.fullName} ha ${coneccion} su voto a `;
                    if(estatus === 'propuesta') post.body += `la propuesta para `;
                    post.body += `${tipo} record #${input.record.identifier}`;  
                    break;
                case 'createProposal':
                    post.body  = `Propuesta ${input.record.identifier} para un(a) nuevo(a) ${tipo} presentada por ${input.record.author.fullName}. ` +
                    `Titulo de la propuesta: ${input.record.title}. ` +
                    `Propuesta: ` +
                    `${input.record.body}`;
                    break;
                case 'updateRecord':
                    post.body = `${tipo} con numero de record #${input.record.identifier} cambio a estatus ${estatus}`
                    break;
                case 'custom':
                    post.body = input.post.body;
                    break;
                default:
                    throw new Error('No post type determined in addPost method');
            }
            
            post.date = Date.now();
            this.posts.push(post);
            if(input.post.type === 'custom') this.save();
            return post; 
        },

        updateRecord: async function(record){
            //input: record, output: result.success
            //output: result.success
            //conditions that get check: 
            let result = {success: true};
            let originalStatus = record.status; //for posts

            if(this.reservedIdentifiers.includes(record.identifier)){
                result.success = false;
                result.message = 'updateRecord will not update records with reserved identifiers';
                return result;
            }
            
            let within_proposal_time_limit = (Date.now() - record.createdAt.getTime() <= this.proposalLimitMilliseconds) ? true : false; //if proposal if still within the time limit that you can vote on a proposal (community.proposalLimit)
            let majorityVotes = this.majorityVotes(record); //true if it has majority votes
            let within_record_expiration;
            if(record.expirationDate) within_record_expiration = (record.expirationDate.getTime() > Date.now()) ? true : false; //when law expires
            else within_record_expiration = true;
            let after_record_effective_date;
            if(record.effectiveDate) after_record_effective_date = (record.effectiveDate.getTime() <= Date.now()) ? true : false; //when law becomes active
            else after_record_effective_date = true;
            
            //Determination
            if(within_record_expiration === false) record.status = 'inactive';
            switch(record.status){
                case 'inactive':
                    break;
                case 'proposal':
                    if(!within_proposal_time_limit && !majorityVotes){
                        record.status = 'inactive';
                        record.statusupdateDate = Date.now();
                    } 
                    else if(within_proposal_time_limit && majorityVotes && within_record_expiration && after_record_effective_date){
                        record.status = 'active';
                        record.statusUpdateDate = Date.now();
                        if(record.type === 'law2') this.law2Proposal(record);
                    } 
                    else if(majorityVotes && within_record_expiration && !after_record_effective_date){
                        record.status = 'passed';
                        record.statusUpdateDate = Date.now();
                    } 
                    break;
                case 'passed':
                    if(!within_proposal_time_limit && !majorityVotes){
                        record.status = 'inactive';
                        record.statusUpdateDate = Date.now();
                    } 
                    else if(within_proposal_time_limit && !majorityVotes && within_record_expiration){
                        record.status = 'proposal';
                        record.statusUpdateDate = Date.now();
                    } 
                    else if(majorityVotes && within_record_expiration && after_record_effective_date){
                        record.status = 'active';
                        record.statusUpdateDate = Date.now();
                    } 
                    break;
                case 'active':
                    if(!majorityVotes && !within_proposal_time_limit){
                        record.status = 'inactive';
                        record.statusUpdateDate = Date.now();
                    } 
                    else if(within_proposal_time_limit && !majorityVotes && within_record_expiration){
                        record.status = 'proposal';
                        record.statusUpdateDate = Date.now();
                        if(record.type === 'law2') this.law2Proposal(record);
                    } 
                    break;
                default:
                    result.success = false;
            }
            try{
                //for posts
                if(record.status !== originalStatus){
                    let postInput ={
                        post: {
                            type: 'updateRecord'
                        },
                        record: record,
                    }
                    this.addPost(postInput);
                }

                //save doc
                await this.save();
                await this.reorderRecords();

            }catch(error){
                result.success = false;
                result.message = error;
            }
            return result;
        },

        updateAllRecords: async function(){
            this.records.forEach(async (record) => await this.updateRecord(record));
        },

        reorderRecords: async function(type = 'law'){
            //Helper function to updateRecord(); type is law, role, project, permit, badge
            //Search for the newest 'active' record and update by universal number or category number
            let newestRecord = this.records.sort((a,b) => b.statusUpdateDate - a.statusUpdateDate)[0];
            
            if(newestRecord.type !== type) return;

            if(newestRecord.lawCategory && type === 'law'){
                
                let categoryOrder = this.records.filter(r => r.lawCategory === newestRecord.lawCategory && r.status ==='active');
                categoryOrder = categoryOrder.filter(r => r.identifier !== newestRecord.identifier);
                categoryOrder.sort((a,b) => a.lawCategoryNumber - b.lawCategoryNumber);

                if(newestRecord.status === 'active'){
                    //Sanitize incoming number
                    let biggestCategoryNumber;
                    if(categoryOrder.length === 0){
                        biggestCategoryNumber = 0;
                    }else{
                        biggestCategoryNumber = categoryOrder[categoryOrder.length - 1].lawCategoryNumber;
                    }
                    if(!newestRecord.lawCategoryNumber){
                        newestRecord.lawCategoryNumber = biggestCategoryNumber + 1;
                    }
                    else if(newestRecord.lawCategoryNumber < 1){
                        newestRecord.lawCategoryNumber = 1;
                    }
                    //find where to insert newest record
                    for(let i = 0; i < categoryOrder.length; i++){
                        if(categoryOrder[i].lawCategoryNumber < newestRecord.lawCategoryNumber &&
                            (categoryOrder[i + 1] === undefined || newestRecord.lawCategoryNumber <= categoryOrder[i+1].lawCategoryNumber)){
                                    categoryOrder.splice(i + 1 , 0, newestRecord);
                                    break;
                                }
                    }
                    //Reorder Category Numbers
                    for(let i = 0; i < categoryOrder.length; i++){
                        categoryOrder[i].lawCategoryNumber = i + 1;
                    }

                }else if(newestRecord.status === 'inactive' || newestRecord.status === 'passed'){
                    for(let i = 0; i < categoryOrder.length; i++){
                        categoryOrder[i].lawCategoryNumber = i + 1;
                    }
                }
            }else{
                
                let numberOrder = this.records.filter(r => r.status === 'active' && r.type === type && !r.lawCategory)
                numberOrder = numberOrder.filter(r => r.identifier !== newestRecord.identifier);
                numberOrder.sort((a,b) => a.number - b.number);

                if(newestRecord.status === 'active'){
                    //Sanitize incoming number
                    let biggestNumber;
                    if(numberOrder.length === 0){
                        biggestNumber = 0;
                    }else{
                        biggestNumber = numberOrder[numberOrder.length - 1].number;
                    }
                    if(!newestRecord.number){
                        newestRecord.number = biggestNumber + 1;
                    }
                    else if(newestRecord.number <= 2){
                        newestRecord.number = 3;
                    } 
                    //Reorder Numbers
                    for(let i = 0; i< numberOrder.length; i++){
                        if(numberOrder[i].number < newestRecord.number &&
                            (numberOrder[i + 1] === undefined || newestRecord.number <= numberOrder[i+1].number)){
                                    numberOrder.splice(i + 1 , 0, newestRecord);
                                    break;
                                }
                    }
                    for(let i = 0; i < numberOrder.length; i++){
                        numberOrder[i].number = i + 1;
                    }
                }else if(newestRecord.status === 'inactive' || newestRecord.status === 'passed'){
                    for(let i = 0; i < numberOrder.length; i++){
                        numberOrder[i].number = i + 1;
                    }
                }
            }
            
            let result = {};
            try{
                await this.save();
                result.success = true;
            } catch(error){
                result.success = false;
                result.message = error;
            }
            return result
        },

        deleteRecord: async function(input){
            //need to call updateCommunity afterwards to see results
            let record = this.getRecord(input);
            let result = {};

            try{
                this.records = this.records.filter(r => r._id !== record._id);
                result.success = true;
                result.message = 'Record removed from community. Need to save community'
            }catch(error){
                result.success = false;
                result.message = error;
            }
            
            return result
        },

        updateCommunity: async function(){
            //updates the community object with information from the database
            const freshData = await Community.findById(this._id);
            Object.assign(this, freshData);
        },

        automaticVotes: async function(citizen){
            //adds votes to reserved Identifiers
            let result = {success: true, message: `automatic votes ran on ${citizen._id}`}
            try{
                for(const identifier of this.reservedIdentifiers ){
                    if(this.records.some(record => record.identifier === identifier)){
                        let voteInput = {
                        record: {
                            identifier: identifier
                        },
                        citizen: {
                            _id: citizen._id,
                        },
                        vote: {
                            vote: 'plug',
                        }
                        }
                        let result = await this.vote(voteInput);
                        if(result.success === false) return result;
                    }
                }
            }catch(error){
                result.success = false;
                result.message = `Error running automaticVotes for ${input.citizen._id}`
            }
            return result; 
        },

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
                //for post
                let postInput = {
                    post: {
                        type: 'addResident',
                    },
                    citizen: input.citizen,
                    home: home
                }
                await this.addPost(postInput);

                //save doc
                await this.save();
                await this.updateAllRecords();

                result.success = true;
                result.message = 'Citizen added as resident of home. Automatic votes ran.'
                
                let automaticVotesResult =  this.automaticVotes(input.citizen);
                if(automaticVotesResult.success === false) result = automaticVotesResult;

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
            let home = undefined;

            if(input.home) {
                home = this.getHome(input);
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
                    //for posts
                    if(!home) home = 'todas las registradas';
                    let postInput = {
                        post:{
                            type: 'removeResident',
                        },
                        home: home,
                        citizen: {
                            _id: input.citizen._id
                        }
                    }
                    await this.addPost(postInput);
                    
                    //save doc
                    await this.save();
                    await this.updateAllRecords();
                    result.success = true;
                    result.message = 'Citizen removed as resident of home.'

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
                result.success = true;
                result.message = 'Owner added to home'
                
                //for posts
                let postInput = {
                    post: {
                        type: 'addOwner'
                    },
                    home: home,
                    citizen: {
                        _id: input.citizen._id
                    }
                }
                await this.addPost(postInput);

                //automatic votes
                let automaticVotesResult = await this.automaticVotes(input.citizen);
                if(automaticVotesResult.success === false) result = automaticVotesResult;

                //save doc
                await this.save();
                await this.updateAllRecords();
            }catch(error){
                result.success = false;
                result.message = error;
            }
            return result;
        }, 

        removeOwner: async function(input){
            //Need to pass house only. Whichever owner is there gets removed
            //if no owner return return.success = false
            let result = {};
            let home = this.getHome(input);

            let previousOwner = home.owner; //for post

            if(home.owner) {
                home.owner = null;
                try{
                    //for posts
                    postInput = {
                        post: {
                            type: 'removeOwner',
                        },
                        home: home,
                        citizen: previousOwner
                    }
                    await this.addPost(postInput);

                    //save doc
                    await this.save();
                    await this.updateAllRecords();
                    result.success = true;
                    result.message = 'Owner removed'
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
            //create a record with proposal status. input.proposal, input.citizen 
            let result = {};
            //is citizen a member of community?
            if(!this.isCitizenMember(input.citizen._id)){
                result.success = false;
                result.message = 'This citizen is not a member of this community';
                return result;
            }
            //create new record
            //sanitize variables
            let newRecord = {};
 
            newRecord.author = input.citizen._id;
            newRecord.title = input.proposal.title;
            newRecord.body = input.proposal.body;
            newRecord.description = input.proposal.description;
            newRecord.salary = input.proposal.salary;
            newRecord.cost = input.proposal.cost;
            newRecord.admin = input.proposal.admin;
            newRecord.effectiveDate = input.proposal.effectiveDate;
            newRecord.expirationDate = input.proposal.expirationDate;
            newRecord.number = input.proposal.number;
            newRecord.type = input.proposal.type;
            newRecord.proposalLimit = input.proposal.proposalLimit;
            newRecord.previousProposalLimit = input.proposal.previousProposalLimit;
            newRecord.lawCategory = input.proposal.lawCategory;
            newRecord.lawCategoryNumber = input.proposal.lawCategoryNumber;
            newRecord.statusUpdateDate = Date.now();       
            newRecord.votes = []
            
            newRecord.identifier = this.generateUniqueIdentifier();
            this.records.push(newRecord);
            try{
                //for post
                let postInput = {
                    post:{
                        type: 'createProposal'
                    },
                    record:{
                        identifier: newRecord.identifier
                    },
                    citizen:{
                        _id: input.citizen._id
                    }
                }
                this.addPost(postInput);

                //save doc
                await this.save();
                result.success = true;
                result.message = 'Proposal created successfully.'
                result.record = newRecord;
            } catch(error){
                result.success = false;
                result.message = error;
            }
            return result
        },

        vote: async function(input){
            let result = {}; 
            //input: input.record, input.citizen, input.vote. If no input citizen, it will look for input.vote.citizen (_id)
            //if input.vote.citizen is provided, it will use that, otherwise it will use input.citizen._id
            //**In controller: ensure that it is the signed-in user being passed in input.vote.citizen */
            //make sure the vote is saved correctly
            //if citizen is not resident or owner, cannot vote. 
            if(!this.isCitizenMember(input.citizen._id)){
                result.success = false;
                result.message = 'This citizen is not a member of this community';
                return result;
            }
            if(input.vote.vote !== 'plug' && input.vote.vote !== 'unplug'){
                result.message = 'input.citizen.vote.vote is not in a valid form';
                result.success = false;
                return result
            }
            if(!input.citizen && !input.vote.citizen){
                result.message = 'Missing citizen information on vote';
                result.success = false;
                return result;
            } 

            let record = this.getRecord(input);
            if(!record){
                result.success = false;
                result.message = `vote: no record found for identifier ${input.record.identifier}`
                return result;
            }

            //update all record statuses
            await this.updateRecord(record);
            //if the status of the record is inactive, you cannot vote on it
            if(record.status === 'inactive'){
                result.success = false;
                result.message = 'cannot vote on an inactive record';
                return result;
            }
            //sanitize variables
            let vote = {
                    citizen: input.citizen._id,
                    vote: input.vote.vote,
                }
            
            //has this citizen voted on this record?
            let voteIndex = record.votes.findIndex(vote => vote.citizen.equals(input.citizen._id));
            if(voteIndex === -1){ //this citizen hasn't voted on this record
                
                record.votes.push(vote);
                result.message = `New vote added to record ${record.identifier}`;
            } else {
                record.votes[voteIndex].vote = vote.vote;
                record.votes[voteIndex].updatedAt = Date.now();
                result.message = `Existing vote updated on record ${record.identifier}`;
            }
            result.success = true;
            result.record = record;
            //save changes
            try {
                //for post:
                postInput = {
                    vote: vote,
                    post: {
                        type: 'vote'
                    },
                    citizen: input.citizen,
                    record: record,
                }
                this.addPost(postInput);

                //save doc
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
                for(const home of this.homes){
                    if(home.owner){
                        let isInArray = citizens.some((citizen) => citizen.equals(home.owner));
                        if(!isInArray) citizens.push(home.owner);
                    }
                    for(const resident of home.residents){
                        let isInArray = citizens.some((citizen) => citizen.equals(resident));
                        if(!isInArray) citizens.push(resident);
                    }
                }
                return citizens;
            }
        },

        residents: {
            get(){
                let residents = [];
                for(const home of this.homes){
                    for(const resident of home.residents){
                        if(!residents.includes(resident)) residents.push(resident);
                    }
                }
                return residents;
            }
        },
        
        owners: {
            //returns array of owners without repeating
            get(){
                let owners = [];
                for(const home of this.homes){
                    if(home.owner){
                        let isInArray = owners.some((owner) => owner.equals(home.owner));
                        if(!isInArray) owners.push(home.owner);
                    }
                }
                return owners;
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

        lawCategories: {
            get(){
                let categories = [];
                let activeLawsWithCategory = this.laws.filter(record => record.lawCategory);
                for(const record of activeLawsWithCategory){
                    if(!categories.includes(record.lawCategory)) categories.push(record.lawCategory);
                }
                return categories;
            }
        },

        constitution: {
            //return an object that contains law categories with the laws in each category sorted by record.categoryNumber. 
            //The first element of the array is the laws that don't have a category ordered by record.Number
            get(){
                let constitution = {};
                let lawCategories = this.lawCategories;
                constitution[''] = this.records.filter(record => record.status === 'active' && !record.lawCategory).sort((a,b) => a.number - b.number);
                for(let i = 0; i < this.lawCategories.length; i++){
                    constitution[lawCategories[i]] = this.records.filter(record => record.status === 'active' && record.lawCategory === lawCategories[i]);
                    constitution[lawCategories[i]].sort((a,b) => a.lawCategoryNumber - b.lawCategoryNumber);
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

        inactives: {
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

        admins:{
            get(){
                let adminRecords = this.records.filter(record => record.type === 'role' && record.admin === true && record.status === 'active');
                let admins = adminRecords.map(record => record.citizen);
                return admins
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
        
        proposalLimitMilliseconds:{
            get(){
                return this.proposalLimit*86400000;
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

const communityRequestSchema = new Schema({
    //community information
    name: {type: String, required: true},

    votingUnit: {type: String, enum:['community.citizens', 'homes.owner'], required: true},

    address: {type: String, required: true},

    homesStartingNumber: {type: Number, required: true},

    homesEndingNumber: {type: Number, required: true},

    //information regarding temporary admin role
    citizen: {type: Schema.Types.ObjectId, ref: 'Citizen'},

    title: String,

    body: String,

    //information regarding current status of request
    status: {type: String, enum:['new','approved', 'denied'], default: 'new' },
}, 
{timestamps: true});

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

    superAdmin: {type: Boolean, default: false},
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
const communityRequest = mongoose.model('communityRequest', communityRequestSchema);

module.exports = {
    Community,
    Citizen,
    communityRequest,
};