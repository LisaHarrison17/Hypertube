const express = require('express');
const movieTrailer = require('movie-trailer');
const movieArt = require('movie-art');
const router = express.Router();
const hypertube = require('./hypertube');
const image_url = "http://image.tmdb.org/t/p/original/";

router.post('/', function(req, res, next) {
    //on movie search display all movies matching query
    hypertube.searchMovies({query: req.body.searchText} , function(movies) {
        res.render("display_movies", {
            title:'Hypertube | Movies',
            movies: movies.results,
            image_url: image_url
        });
    });
});


router.get('/display', function(req, res, next) {
    var id = req.query.id;
    var trailer;

    hypertube.getMovie({id: id}, function(movie){
        movieTrailer(movie.data.movie.title).then(function (response, error) {
            if (error) {
                trailer = "https://www.youtube.com/embed/coD8Yem9K7I?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0";
            }
            else {
                trailer = response.replace('watch?v=', 'embed/');
                trailer = trailer + '?rel=0&vq=hd720&showinfo=0'; //youtube trailer options
            }

        }).then(function(){
            if (!movie.poster_path || !movie.backdrop_path) {
                //!movie.data.movie.background_image || !movie.data.movie.background_image_original
                //if failed to get poster from original query. Use this method as fallback
                movieArt(movie.data.movie.title, movie.data.movie.year).then(function(response) {
                    movie.poster_path = response;
                    movie.backdrop_path = response;

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
            }
            else {
                hypertube.getSimilarMovies({id : id}, function(similarMovies) {
                    res.render("display_movies", {
                        title: movie.title + ' | Hypertube',
                        trailer: trailer,
                        movie: movie,
                        similarMovies: similarMovies.data.movies,
                        image_url: image_url
                    });
                });
            }
        });
    });
});

module.exports = router;
