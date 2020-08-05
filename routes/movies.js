const express = require('express');
const movieTrailer = require('movie-trailer');
const movieArt = require('movie-art');
const router = express.Router();
const hypertube = require('./hypertube');
const image_url = "http://image.tmdb.org/t/p/original/";
const torrentService = require("../services/torrentService");

router.post('/', function(req, res, next) {
    //on movie search display all movies matching query
    hypertube.searchMovies({query: req.body.searchText} , function(movies) {
        res.render("display_movies", {
            title:'Hypertube | Movies',
            movies: movies.data.movies,
            image_url: image_url
        });
    });
});


router.get('/display', function(req, res, next) {
    var id = req.query.id;
    var trailer;
    hypertube.getMovie({id: id}, function(movie){
        console.log(movie.data.movie);
        trailer = 'https://www.youtube.com/embed/' + movie.data.movie.yt_trailer_code;
        hypertube.getSimilarMovies({id : id}, function(similarMovies) {
            res.render("display_movies", {
                title: movie.title + ' | Hypertube',
                trailer: trailer,
                movie: movie,
                similarMovies: similarMovies.data.movies,
                image_url: image_url
            });
        });
    });
});

router.get("/downloadMovie", function(req, res, next){
    torrentService.getMovie(req, res, next);
});

module.exports = router;
