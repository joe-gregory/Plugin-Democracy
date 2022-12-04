const express = require('express');
const router = express.Router();

const passport = require('passport');
const Community = require('../models/communityModels');


router.get('/signup', (request, response) => {
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

router.post('/signup', (request, response) => {
     const citizen = new Community.Citizen({
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        secondLastName: request.body.secondLastName,
        email: request.body.email,
        password: request.body.password,
        cellphone: request.body.cellphone,
    });
    citizen.save()
        .then((result) => response.redirect('/profile'))
        .catch((error) => response.send(error));
});

router.get('/login', (request, response) => {
    response.render('login', (err, html) =>{
        if(err){
            response.redirect('/404', {'message': [err,html]});
        }else{
            response.render('login', request.user);
        }
    });
});

router.post('/login', passport.authenticate('local', {failureRedirect: '/404', failureMessage: true}),
    (request, response) => {        
            response.redirect('/mycommunity');
    }
);

router.get('/profile', (request, response) => {
    if (!request.user){
        request.url = '/profile';
        response.redirect('/login');
    } else{
        Community.Community.findById(request.user.community, function(err, community) {
            Community.Home.findById(request.user.home, function(err, home){
                response.locals.community = community;
                response.locals.home = home;
                response.locals.firstName = request.user.firstName;
                response.locals.lastName = request.user.lastName;
                response.locals.secondLastName = request.user.secondLastName;
                response.render('profile')
            })
        })
    }
});

router.post('/logout', function(request, response, next) {
    request.logout(function(error) {
        if(error) {return next(error);}
        response.redirect('/');
    });
});

module.exports = router;