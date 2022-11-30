const express = require('express');
const mongoose = require('mongoose');
const Community = require('./models/community');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const key = require('./keys');

//routes
const authRoutes = require('./routes/auth');
const errorsRoutes = require('./routes/errors');
const createCommunityRoutes = require('./routes/mycommunity');

//tr
const data = require('./demoData');

//const Community = require('./models/community');
const Law = require('./models/law');

//express app 
const DDapp = express();
const dbURI = 'mongodb+srv://'+key+'@ddcluster.z8oz5ye.mongodb.net/?retryWrites=true&w=majority';

//register view engine
DDapp.set('view engine', 'ejs'); 

//connect to mongoDB
mongoose.connect(dbURI)
    .then((result) => {
        console.log(`Connected to Data Base`);
        DDapp.listen(8080); //listen for requests
        console.log('listening on port 8080...');
        const community = new Community.Community({
            name: data.community.communityName,
            communityAddress: data.community.communityAddress,
        });
        let homes = [];
        for(let i = data.community.communityStartingNumber; i <= data.community.communityEndingNumber; i++){
            let home = new Community.Home({
                innerNumber: i, 
                community:community,
            });
            homes.push(home);
            //community.innerHomes.push(new Community.Home({innerNumber: i}));
            community.innerHomes.push(home);
        }
        
        //Create citizens
        
        
        function createCitizen(elem){
            const citizen = new Community.Citizen({
               firstName: elem.firstName,
               lastName: elem.lastName,
               secondLastName: elem.secondLastName,
               email: elem.email,
               password: elem.password,
           })
           return citizen;
        }
        
        let citizens = []
        
        for (let i = 0; i < data.citizens.length; i++){
            let citizen = createCitizen(data.citizens[i]);
            citizen.home = homes[i];
            citizen.community = community;
            
            community.citizens.push(citizen);
            homes[i].citizen = citizen;
            
            citizens.push(citizen);
        }
        
        //Save 
        //citizens.save (for loop)
        //homes.save (for loop)
        //community.save
        async function saveHomesCitizens(){
            for (let i = 0; i < citizens.length; i++){
                await citizens[i].save();
                await homes[i].save();
            }
        }
        
        //Create laws & votes
        //create proposal first, then vote on it
        let proposals = []
        async function createProposals(){
            for (let i = 0; i < data.laws.length; i++){
                let originalLawNumber = i + 1;
                randomInt = Math.floor(Math.random()*11);
            
                const proposal = new Law.Proposal({
                    proposal: data.laws[i],
                    type: 'create',
                    author: citizens[randomInt],
                    votesInFavor: 0,
                    votesAgainst: 0,
                    law: '',  //for when deleting law
                    originalLawNumber: originalLawNumber,
                    community: community
                });
            
                proposals.push(proposal);
                community.proposals.push(proposal);
            
                await community.save();
                await proposal.save();
            
            }
        }
        
        createProposals();
        
        
        //Create votes and populate proposals, proposal by proposal with random votes
        //for each proposal and for each citizen. Each citizen give a probability of voting accept
        async function createVotes(){
            for (let i = 0; i < proposals.length; i++){
                for(let j = 0; j < citizens.length; j++){
                    
                    let probInFavor = Math.random()
                    const inFavor = (probInFavor > 0.2) ? true : false;
        
                    const vote = new Law.Vote({
                        citizen: citizens[j],
                        inFavor: inFavor,
                        proposal: proposals[i],
                    });
        
                    //update vote count on proposal
                    prevVotesInFavor = proposals[i].votesInFavor;
                    prevVotesAgainst = proposals[i].votesAgainst;
        
                    if (vote.inFavor == true){
                        proposals[i].votesInFavor = prevVotesInFavor + 1;
                    } else if(vote.inFavor == false) {
                        proposals[i].votesAgainst = prevVotesAgainst + 1;
                    } else{
                        throw 'Unexpected value for proposals.votesInFavor';
                    }
                    /////////////////
                    amountHomes = community.innerHomes.length;
                    //Is the votes in favor the majority? 
                    if (proposals[i].votesInFavor > amountHomes/2){
                        //proposal passed
                        
                        proposals[i].passedDate = Date.now();
                        //if proposal of type to create law
                        if(proposals[i].type === 'create' && proposals[i].passed !== true && proposals[i].passed !== false){
        
                            const newLaw = new Law.Law({
                                law: proposals[i].proposal,
                                author: proposals[i].author,
                                proposal: proposals[i].id,
                                community: proposals[i].community,
                            });
                            
                            proposals[i].law = newLaw.id;
                            await newLaw.save();
                            //add new law to community model
                            community.laws.push(newLaw);
                            await community.save();
                        }else if(proposals[i].type === 'delete' && proposals[i].passed !== true && proposals[i].passed !== false) { //if proposal of type to delete law
                            //delete law object & splice law from community laws array
                            //find law object & delete
                            let law = await Law.Law.findById(proposals[i].law);
                            law.deleteOne;
        
                            let index = community.laws.indexOf(proposals[i].law);
                            community.laws.splice(index, 1);
        
                            //law.save();
                            await community.save();
                        }
                        proposals[i].passed = true;
                    } else if(proposals[i].votesAgainst > amountHomes/2){
                        proposals[i].passed = false;
                        proposals[i].passedDate = Date.now();
                    }

                    //save the vote
                    await vote.save();
                    //push vote to proposals.votes array & save
                    proposals[i].votes.push(vote);
                    await proposals[i].save();
                }
            }
        }
        
        createVotes();
    })
    .catch((error) => {
        console.log(`Error connecting to DB: ${error}`);
        console.log(`Error Object [key, value] pairs:`);
        console.log(Object.entries(error));
    });

//middleware
DDapp.use(express.json()); //parse request body as JSON
DDapp.use(express.urlencoded({extended:true}));
DDapp.use(express.static('public')); //static files
//DDapp.use(cookieParser());
DDapp.use(session ({
    secret: 'directdemocracy',
    resave: false,
    saveUninitialized: false, 
    })
);

DDapp.use(passport.initialize());
DDapp.use(passport.session());

//serializeUser function
passport.serializeUser((citizen, done) => {
    done(null, citizen._id);
});

//deserializeUser function
passport.deserializeUser((id, done) => {
    Community.Citizen.findById(id, function(err, citizen) {
        if(err) return done(err);
        done(null, citizen);
    })
});

//local Strategy
passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password',
    },
    function verify (email, password, done) {
        //look up user in DB
        Community.Citizen.findOne({'email': email}, (err, citizen) => {
            //if there's an error in db lookup, return err callback
            if(err) {
                console.log(err);
                return done(err); 
            }
            //if user not found, return null and false in callback
            if(!citizen){
                console.log('!citizen');
                return done(null, false);
            } 
            //if user found, but password not valid, return err and false in callback
            if(password != citizen.password){
                console.log('wrong password');
                return done(null, false);
            } 
            //if user found and password valid, return user object in callback
            if(password == citizen.password){
                console.log('User authenticated');
                return done(null, citizen);
            } 
        });
    })
);

//console log incoming requests
DDapp.use((request, respond, next) => {
    console.log(`Request Method: "${request.method}" => Request URL: "${request.url}"`);
    next();
});

DDapp.get('/', (request, response) => {
    response.render('index', request.user);
});

DDapp.use(authRoutes);
DDapp.use(createCommunityRoutes);
DDapp.use(errorsRoutes);