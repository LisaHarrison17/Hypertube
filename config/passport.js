const LocalStrategy = require('passport-local').Strategy;
const User =  require('../models/users');
const config = require('../config/database');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
var GitHubStrategy = require('passport-github').Strategy;
var FortyTwoStrategy = require('passport-42').Strategy;



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

    passport.use(new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/user/auth/github/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        var result = profile._json;

        let query = {$or : [{username:result.login}, {email:result.email}]};

        console.log(result.login);

        User.findOne(query, function(err, user){
            if (err)
            {
                console.log('Error trying to find user');
                return done(err);
            }
            if(!user){
                let newUser = new User();
                newUser.username = result.login;
                newUser.password = profile.id;

                newUser.save(function(err){
                    if (err) throw err;
                    else{
                        console.log("User successfully registered");
                        return done(null, newUser);
                    }
                });
            }
            else{
                return done(null, user);
            }
        });
      }
    ));

    passport.use(new FortyTwoStrategy({
        clientID: FORTYTWO_APP_ID,
        clientSecret: FORTYTWO_APP_SECRET,
        callbackURL: "http://localhost:3000/user/auth/42/callback"
      },
      function(accessToken, refreshToken, profile, done) {
        let query = {username:profile.username};
        User.findOne(query, function(err, user){
            if (err)
            {
                console.log('Error trying to find user');
                return done(err);
            }
            if(!user){
                let newUser = new User();
                newUser.username = profile.username
                newUser.firstname = profile.name.givenName;
                newUser.lastname = profile.name.familyName;
                newUser.password = profile.id;

                newUser.save(function(err){
                    if (err) throw err;
                    else{
                        console.log("User successfully registered");
                        return done(null, newUser);
                    }
                });
            }
            else{
                return done(null, user);
            }
        });
      }
    ));

    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });

}