const express = require('express');
const router = express.Router();

router.get('/createCommunity', (request, response) =>{
    response.render('createCommunity');
})

module.exports = router;