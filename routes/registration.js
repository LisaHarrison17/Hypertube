const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

let User = require('../models/users');

router.get('/', function(req, res, next) {
    res.redirect('/home');
});

router.post('/login', function(req, res, next){
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/loginForm',
        failureFlash: true
    })(req, res, next);
});

router.post('/signup', function(req, res, next){
    req.checkBody('confirmPassword', 'Passwords do not match').equals(req.body.password);
    let errors = req.validationErrors();
    if (errors){
        res.render('signup', {
            title: 'Hypertube | Sign Up',
            errors: errors
        });
    }
    else{
        passport.authenticate('local-signup', {
            successRedirect: '/user/loginForm',
            failureRedirect: '/user/signupForm',
            failureFlash: true,
            passReqToCallback: true
        })(req, res, next);
    }
});

router.get('/signupForm', function(req, res, next){
    if(req.user)
    {
        req.flash('success', 'User '+req.user.username+' already logged in');
        res.redirect('/home');
    }
    else
    {
        res.render("signup", {
            title:'Hypertube | Sign Up',
        });
    }
    next();
});

router.get('/loginForm', function(req, res, next){
    if(req.user)
    {
        req.flash('success', 'User '+req.user.username+' already logged in');
        res.redirect('/home');
    }
    else
    {
        res.render("login", {
            title:'Hypertube | Login'
        });
    }
    next();
});

router.get('/logout', function(req, res, next){
    req.user = null;
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/user/loginform');
    next();
});

router.get('/auth/github',
  passport.authenticate('github'));

router.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });


module.exports = router;