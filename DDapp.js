const express = require('express');
const mongoose = require('mongoose');


//express app 
const DDapp = express();

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

//register view engine
DDapp.set('view engine', 'ejs');

//static files
DDapp.use(express.static('public'));

DDapp.get('/', (request, response) => {
    console.log('get request for index');
    response.status(200).render('index',{title: 'Democracia Directa'});
});

DDapp.use((request, response) => {
    response.status(404).render('404', {title: '404'});
});