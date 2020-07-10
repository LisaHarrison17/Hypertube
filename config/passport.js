const LocalStrategy = require('passport-local').Strategy;
const User =  require('../models/users');
const config = require('../config/database');
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
var GitHubStrategy = require('passport-github').Strategy;

const GITHUB_CLIENT_ID = "f3b0df2f2898166535c9";
const GITHUB_CLIENT_SECRET = "ffbb2143d7a6857614c4282d874a477144336e53";

    /* We had 42 authentication implemented. There was a change to the endpoint to get the access token using the code you 
     * get from intra after a user logs in. After the user logs in, you get a code that you're supposed to send to 
     * another endpoint to get an access token to use to get the user info (name, surname, username, email).
     * That endpoint has changed...The header that you need to specify the response type (we want the authorization_token)
     * changed, but the documentation on this endpoint has not been updated, there is no swagger for it either, so there
     * is no way to get the log in for 42 to work.
    */

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

        let query = {username:result.login};

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

    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });

}