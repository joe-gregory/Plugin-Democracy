 const mongoose = require('mongoose');
 const mongooseSchema = mongoose.Schema; 

 const communitySchema = new mongooseSchema({
   
    name : {
        type: String,
        required: true
    },
    
    communityAddress : {
        type: String,
        required: true,
    },
    
    innerHomes : [{ 
         type: mongooseSchema.Types.ObjectId, ref: 'home'
    }],

    president : { type: mongooseSchema.Types.ObjectId, ref: 'citizen'},

    treasurer : { type: mongooseSchema.Types.ObjectId, ref: 'citizen' },
});

const homeSchema = new mongooseSchema({
    
    innerNumber : Number,
    
    citizen: {
        type: mongooseSchema.Types.ObjectId, ref: 'citizen'
    }
})

const citizenSchema = new mongooseSchema({
    
    firstName: {
        type: String,
        required: true
    },
    
    lastName: {
        type: String,
        required: true
    },
    
    secondLastName: String,
    
    email: String,

    cellPhone: String, 

    home: { type: mongooseSchema.Types.ObjectId, ref : 'home' }

}, {timestamps: true});