const LocalStrategy = require('passport-local').Strategy;
const User =  require('../models/users');
const config = require('../config/database');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const FortyTwoStrategy = require('passport-42').Strategy;

module.exports = function(passport){
    // local user authentiofication
    passport.use('local', new LocalStrategy(function(username, password, done){
        let query = {username:username};
        User.findOne(query, function(err, user){
            if (err)
            {
                console.log('error 01');
                return done(err);
            }
            if(!user)
                return done(null, false, {message: 'User not found'});
            
            bcrypt.compare(password, user.password, function(err, isMatch){
                if (err) throw err;
                if(isMatch){
                    return done(null, user);
                }
                else{
                    return done(null, false, {message: 'Incorrect password'});
                }
            });
        });
    }));


	passport.use(new FortyTwoStrategy({
        clientID: "insert uid",
        clientSecret: "insert client secret",
        callbackURL: "http://localhost:3000/auth/42/callback",
        passReqToCallback: true
    },
    function (accessToken, refreshToken, profile, cb) {
        var info = profile._json;
        console.log(profile); //I think profile is either the ACCESS_TOKEN needed to get the user info
                              // or the code needed to get ACCESS_TOKEN

        // if (!info.email) {
        //     req.flash('error', '42 email not found');
        //     return done(null, false)
        // }

        console.log("MADE IT TO LOG IN");
        // let newUser = new User();
        // newUser.firstname = info.first_name;
        // newUser.lastname = info.last_name;
        // newUser.username = info.user_name;
        // newUser.email = info.email;
        // newUser.password = info.login + info.id + '_42';


        // bcrypt.genSalt(10, function(err, salt){
        //     bcrypt.hash(newUser.password, salt, function(err, hash){
        //         if (err) throw err;
        //         newUser.password = hash;
        //         newUser.save(function(err){
        //             if (err) throw err;
        //             else{
        //                 req.flash('success', "User registered");
        //                 return done(null, newUser);
        //             }
        //         });
        //     });
        // });
    }
));

    passport.use('local-signup', new LocalStrategy({usernameField : 'username',passwordField : 'email', passReqToCallback: true}, function(req, username, email, done, res){
        let query = {username:username};
        User.findOne(query, function(err, user){
            if (err)
                return done(err);
            if(user)
                return done(null, false, {message: 'Username already exists'});
            else{
                let query = {email:email};
                User.findOne(query, function(err, mail){
                    if (err) return done(err);
                    if (mail)
                        return done(null, false, {message: 'Email already exists'});
                    else{
                        let newUser = new User();
                        newUser.firstname = req.body.firstname;
                        newUser.lastname = req.body.lastname;
                        newUser.username = req.body.username;
                        newUser.email = req.body.email;
                        newUser.password = req.body.password;

                        bcrypt.genSalt(10, function(err, salt){
                            bcrypt.hash(newUser.password, salt, function(err, hash){
                                if (err) throw err;
                                newUser.password = hash;
                                newUser.save(function(err){
                                    if (err) throw err;
                                    else{
                                        req.flash('success', "User registered");
                                        return done(null, newUser);
                                    }
                                });
                            });
                        });
                    }
                });
            }
        });
    }));
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });

}