const mongoose = require('mongoose');
const Schema = mongoose.Schema; 

const communitySchema = new Schema(
{   
    name : {type: String, required: true,},

    address : { type: String, required: true, unique: true, },
    
    votingUnit: {type: String, enum:['homes.citizens', 'homes.owner'], required: true},

    proposalLimit: {type: Number, default: 30},

    homes : [{
        identifier: String,
        
        number : {type: Number, required: true,},

        residents: [{ type: Schema.Types.ObjectId, ref: 'Citizen' }], 

        owner: {type: Schema.Types.ObjectId, ref: 'Citizen'},
        }],

    records: {
        type: [{
            identifier: {type: String, required: true},
        
            title: {type: String, required: true},
            
            body: {type: String, required: true},

            effectiveDate : {
                date: Date,
                days: Number,
            },

            expirationDate : {
                date: Date,
                days: Number,
            },

            number: {type: Number, required: true, min: 1} ,

            category: {type: String, default: 'main'},

            categoryNumber:{type: Number, min: 1},

            status: {type: String, enum: ['proposal', 'law','inactive'], required: true, default :'proposal'},

            votes: [{
                citizen: {type: Schema.Types.ObjectId, ref: 'Citizen'},
                vote: {type: String, enum: ['plug', 'unplug']}
            }],
        }],
        
        timestamps: true,

        set: function(record){
            //I either get an initial proposal or an update to an existing proposal or law
            //check if it's a new proposal or an update to an existing proposal
            if(this.isModified('records')){
                //current records are being modified

                //Laws number 1 and 2 are reserved
                //ensure that no new law tries to become law #1 and #2. Those are going to be reserved.  
            }else{
                //a new record is being added
                let newRecord = {};

                //Identifier: provide new identifier ensuring there are no collisions
                let success = false;
                let identifier;
                while(!success){
                    identifier = this.constructor.communitySchema.generateIdentifier();
                    console.log(identifier);
                    if(!this.find(record => record.identifier == identifier)) success = true;
                }
                record.identifier = identifier;

                //Title & Body: ensure title and body are provided
                if(!(record.title && record.body)) throw new Error('No title or body provided for new proposal');
                newRecord.title = record.title;
                newRecord.body = record.body;
                
                //effectiveDate and expirationDate
                if(record.effectiveDate) newRecord.effectiveDate = record.effectiveDate;
                if(record.expirationDate) newRecord.expirationDate = record.expirationDate;
                
                //Requested number, category and categoryNumber if passed
                if(record.number) newRecord.number = record.number;
                if(record.category) newRecord.category = record.category;
                if(record.categoryNumber) newRecord.categoryNumber = record.categoryNumber;

                newRecord.number = record.number;
                newRecord.category = record.category;
                newRecord.categorynumber = record.categoryNumber;

                //save new element or save community document to include history
                //save in history
                newRecord.save();
                return newRecord;
            }
            //assign number field to record
            //if a number field is provided in the middle, push the other numbers in front of this one. 
            //if no number provided or number bigger than last current number, add to the end

            //assign categoryNumber to record
            //if a categoryNumber field is provided in the middle, push the other numbers in front of this one.
            //if no number provided or number bigger than last current number, add to the end

            //save new element or save community document to include history
            //save in history
        }
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
    
    methods: {
        addCitizen: async function (citizenId, houseNumber){
            homeIndex = this.homes.findIndex(home => home.number === houseNumber);
            if (homeIndex === -1) throw new Error('No home with given identifier');
            //Ensure that this citizen doesn't live in this community already
            this.homes[homeIndex].residents.push(citizenId);
            await this.save();
        }, 

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
        }
    },

    virtuals: {
        citizens: {
            get() {
                //get all the homes.residents and homes.owners
                let citizens = [];
                for (const home of this.homes){
                    if(home.owner !== undefined) citizens.push(home.owner);
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