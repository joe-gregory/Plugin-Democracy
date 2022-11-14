const express = require('express');
const router = express.Router();

router.get('/500', (request, response) => {
    console.log('500 Error, rerouting...');
    response.status(500).render('500');
});

router.use((request, response) => {
    response.status(404).render('404', {title: '404'});
});

module.exports = router;