const express = require('express');
const router = express.Router();

router.get('/login', (request, response) => {
    response.render('login', (err, html) =>{
        if(err){
            response.redirect('/404', {'message': [err,html]});
        }else{
            response.render('login', request.user);
        }
    });
});

router.post('/login', passport.authenticate('local', {failureRedirect: '/login', failureMessage: true}),
    (request, response) => {
        if(request.originalUrl){
            response.redirect(request.url)
        }else{
            response.redirect('profile');
        }
    }
);

module.exports = router;