const express = require('express');

//express app 
const DDapp = express();

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