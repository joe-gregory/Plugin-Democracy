const express = require('express');
const mongoose = require('mongoose');
const Community = require('./models/community');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

//express app 
const DDapp = express();

const dbURI = 'mongodb+srv://joedd:jegm1986@cluster0.hbch2i1.mongodb.net/DD?retryWrites=true&w=majority'

//register view engine
DDapp.set('view engine', 'ejs'); 

//connect to mongoDB
mongoose.connect(dbURI)
    .then((result) => {
        console.log(`Connected to Data Base`);
        //console.log('Result Object [key, value] pairs: ');
        //console.log(Object.entries(result));
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

DDapp.get('/signup', (request, response) => {
    response.render('signup', function (err, html) {
        if(err){
            console.log('500 Error');
            console.log(err);
            response.redirect('/500');
        }
        else{
            response.render('signup', request.user);
        }
    });
});

DDapp.post('/signup', (request, response) => {
    console.log(request.body.firstName);
     const citizen = new Community.Citizen({
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        secondLastName: request.body.secondLastName,
        email: request.body.email,
        password: request.body.password,
        cellphone: request.body.cellphone,
    });
    citizen.save()
        .then((result) => response.send(result))
        .catch((error) => response.send(error));
    //response.render('signup', {message: 'redirected back'});
});
//login
DDapp.get('/login', (request, response) => {
    response.render('login', (err, html) =>{
        console.log('req.user before:');
        console.log(request.user);
        if(err){
            response.redirect('/404', {'message': [err,html]});
        }else{
            response.render('login', request.user);
        }
    });
});

DDapp.post('/login', passport.authenticate('local', {failureRedirect: '/login', failureMessage: true}),
    (request, response) => {        
        if(request.Url){
            response.redirect(request.url)
        }else{
            console.log(request.user);
            response.redirect('profile');
        }
    }
);

DDapp.post('/logout', function(request, response, next) {
    request.logout(function(error) {
        if(error) {return next(error);}
        response.redirect('/');
    });
});

DDapp.get('/profile', (request, response) => {
    if (!request.user){
        request.url = '/profile';
        response.redirect('/login');
    } else{
        response.render('profile', request.user);
    }
    });

DDapp.get('/community', (request, response) => {
    if(!request.user){
        response.redirect('/login');
    } else{
        response.render('mycommunity', request.user)
    }
});

DDapp.get('/500', (request, response) => {
    console.log('500 Error, rerouting...');
    response.status(500).render('500');
});

DDapp.use((request, response) => {
    response.status(404).render('404', {title: '404'});
});

