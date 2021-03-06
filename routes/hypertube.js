var http = require("https");
var Request = require("request");

class   Hypertube {
    constructor() {
        this.currentResult = null;
        this.currentPath = null;
    }

    searchTvShows(object, callback) {
        this.currentPath = "/3/search/tv?query=" + object.query + "&include_adult=false&page=1";
        this.display(function(tvShows){
            callback(tvShows);
        });
    }

    getTvShow(object, callback){
        this.currentPath = "/3/tv/" + object.id + "?";
        this.display(function(tvShow){
            callback(tvShow);
        });
    }

    searchMovies(object, callback) {
        this.currentPath = "https://yts.ag/api/v2/list_movies.json?&query_term=" + object.query;
        this.ytsDisplay(function(movies){
            callback(movies);
        });
    }

    getMovie(object, callback) {
        this.currentPath = "https://yts.ag/api/v2/movie_details.json?movie_id=" + object.id;
        this.ytsDisplay(function(movie){
            callback(movie);
        });
    }

    getSimilarMovies(object, callback) {
        this.currentPath = "https://yts.mx/api/v2/movie_suggestions.json?movie_id=" + object.id;
        this.ytsDisplay(function(movies){
            callback(movies);
        });
    }

    discoverMovies(callback) {
        this.currentPath = "https://yts.ag/api/v2/list_movies.json?limit=20&sort_by=year&page=1";
        this.ytsDisplay(function(movies){
            callback(movies);
        });
    }

    display(callback) {
        var movies;
        var options = {
            "method": "GET",
            "hostname": "api.themoviedb.org",
            "port": null,
            "path": encodeURI(this.currentPath + "&language=en-US&api_key=adc880e87d64c28aac3558c838b71d56"),
            "headers": {}
          };
    
        var req = http.request(options, function (res) {
            var chunks = [];
          
            res.on("data", function (chunk) {
              chunks.push(chunk);
            });
            res.on("end", function () {
              var body = Buffer.concat(chunks);
              movies = JSON.parse(body.toString());
              callback(movies);
            });
        });
        req.end();
    }

    ytsDisplay(callback) {
        var movies;
        var res;
        var options = {
            method: 'GET',
            url: this.currentPath
        };
        Request(options, function (err, response, body) {
           res = JSON.parse(body);
           callback(res);
        });
    }
}

module.exports = new Hypertube;