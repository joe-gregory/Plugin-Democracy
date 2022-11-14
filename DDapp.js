const express = require('express');
const mongoose = require('mongoose');
const Community = require('./models/community');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

//routes
const authRoutes = require('./routes/auth');
const errorsRoutes = require('./routes/errors');

//express app 
const DDapp = express();

const dbURI = 'mongodb+srv://joedd:jegm1986@cluster0.hbch2i1.mongodb.net/DD?retryWrites=true&w=majority'

//register view engine
DDapp.set('view engine', 'ejs'); 

//connect to mongoDB
mongoose.connect(dbURI)
    .then((result) => {
        console.log(`Connected to Data Base`);
        DDapp.listen(8080); //listen for requests
        console.log('listening on port 8080...');
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
    console.log(citizen);
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
            if(citizen.password != citizen.password){
                console.log('wrong password');
                return done(null, false);
            } 
            //if user found and password valid, return user object in callback
            if(citizen.password == citizen.password){
                console.log('all good');
                return done(null, citizen);
            } 
        });
    })
);

//routes
DDapp.use((request, respond, next) => {
    console.log(`Request Method: "${request.method}" => Request URL: "${request.url}"`);
    next();
});

DDapp.get('/', (request, response) => {
    response.render('index', request.user);
});

DDapp.use(authRoutes);

DDapp.get('/community', (request, response) => {
    if(!request.user){
        response.redirect('/login');
    } else{
        response.render('mycommunity', request.user)
    }
});
DDapp.use(errorsRoutes);