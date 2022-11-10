const express = require('express');
const mongoose = require('mongoose');


//express app 
const DDapp = express();

//connect to mongoDB
const dbURI = 'mongodb+srv://joedd:jegm1986@cluster0.hbch2i1.mongodb.net/DD?retryWrites=true&w=majority'
mongoose.connect(dbURI)
    .then((result) => console.log(`Connected to Data Base: ${result}`))
    .catch((error) => console.log(`Error connecting to DB: ${error}`));

//register view engine
DDapp.set('view engine', 'ejs');

//listen for requests
DDapp.listen(8080);

DDapp.get('/', (request, response) => {
    response.render('index',{title: 'Democracia Directa'});
});

DDapp.use((request, response) => {
    response.status(404).render('404', {title: '404'});
});