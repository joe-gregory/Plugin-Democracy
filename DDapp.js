const express = require('express');

//express app 
const ddapp = express();

//listen for requests
ddapp.listen(8080);

ddapp.get('/', (request, response) => {
    response.sendFile('./views/index.html', {root: __dirname});
});