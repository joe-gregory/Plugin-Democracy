const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const Community = require('./models/community');

const { application } = require('express');

//express app 
const DDapp = express();

//middleware
DDapp.use(express.json()); //parse request body as JSON
DDapp.set('view engine', 'ejs'); //register view engine
DDapp.use(express.static('public')); //static files
DDapp.use(cookieParser());

//connect to mongoDB
const dbURI = 'mongodb+srv://joedd:jegm1986@cluster0.hbch2i1.mongodb.net/DD?retryWrites=true&w=majority'
mongoose.connect(dbURI)
    .then((result) => {
        console.log(`Connected to Data Base`);
        console.log('Result Object [key, value] pairs: ');
        console.log(Object.entries(result));
        DDapp.listen(8080); //listen for requests
        console.log('listening on port 8080...');
    })
    .catch((error) => {
        console.log(`Error connecting to DB: ${error}`);
        console.log(`Error Object [key, value] pairs:`);
        console.log(Object.entries(error));
    });

//mongoose and mongo sandbox routes
/*DDapp.get('/add', (request, response) => {
    const citizen = new Community.Citizen({
        firstName: 'Pepe',
        lastName: 'Grillo'
    });
    citizen.save()
        .then( (result) => {
            response.send(result)
        })
        .catch((err) => {
            console.log(err);
        })

})*/

//routes
DDapp.get('/', (request, response) => {
    console.log('"get" request for index');
    response.status(200).render('index',{title: 'Democracia Directa'});
});

DDapp.get('/signup', (request, response) => {
    console.log('"get" request for /signup');
    response.render('signup',{}, function (err, html) {
        if(err){
            console.log('500 Error');
            console.log(err);
            response.redirect('/500');
        }
        else{
            response.render('signup');
        }
    });
});

DDapp.post('/signup', (request, response) => {
    console.log('Received "post" request on /signup');
    console.log(request.body.firstName);
    /* const citizen = new Community.Citizen({
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        secondLastName: request.body.secondLastName,
        email: request.body.email,
        password: request.body.password,
        cellphone: request.body.cellphone,
    });*/
});

DDapp.get('/500', (request, response) => {
    console.log('500 Error, rerouting...');
    response.status(500).render('500');
});

DDapp.use((request, response) => {
    response.status(404).render('404', {title: '404'});
});

