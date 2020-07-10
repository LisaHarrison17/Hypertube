const express = require('express');
const path = require('path');
const imdb = require('imdb-node-api');
const mongoose = require('mongoose');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const session = require('express-session');
const config = require('./config/database');
const passport = require('passport');
const app = express();
const hypertube = require('./routes/hypertube');
const image_url = "http://image.tmdb.org/t/p/original/";

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(require('connect-flash')());
app.use(session({
    secret: 'hypertube',
    resave: true,
    saveUninitialized: true
}));

app.use(function(req, res, next){
    res.locals.messages = require('express-messages')(req, res);
    next();
});

app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return{
            param : formParam,
            msg : msg,
            value : value
        };
    }
}));

//setting passport congigurations.
let User = require('./models/users');
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

//adding user login status to all pages.
app.get('*', function(req, res, next){
    res.locals.user = req.user || null;
    next();
});

//setting url paths.
let registration = require('./routes/registration');
let movies = require('./routes/movies');
app.use('/movies', movies);
app.use('/user', registration);

//connecting to db.
mongoose.connect(config.database);
let db = mongoose.connection;
db.once('open', function(){
    console.log('Connected');
});
db.on('error', function(err){
    console.log(err);
});

app.get('/auth/42/callback',
    passport.authenticate('42', {
        failureRedirect: '/user/login'
    }),

    function(req, res) {
        res.redirect('/home');
    });

app.get('/', function(req, res, next){
    res.redirect('/home');
});

app.get('/home', function(req, res, next){
    if(req.user)
    {
        hypertube.discoverMovies(function(movies) {
            res.render("display_movies", {
                title:'Hypertube | Movies',
                movies: movies.results,
                image_url: image_url
            });
        });
    }
    else
    {
        req.flash("danger", "You need to be logged in or signup");
        res.redirect('/user/loginForm');
    }
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
});