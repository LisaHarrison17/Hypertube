var path =	require('path');
var Request = require('request');
var torrentStream = require('torrent-stream');
var fs = require('fs');

exports.getMovie = function (req, res) {
	createFolders();
	if (req.query.id) {
		var torrents;
		var magnet = "magnet:?xt=urn:btih:"

		var options = {
			method: 'GET',
			url: 'https://yts.ag/api/v2/movie_details.json?movie_id=' + req.query.id
		};

		Request(options, function (err, response, body) {
			var movie = JSON.parse(body);
			torrents = movie.data.movie.torrents;
			var index = 0;
			//This checks if the quality the user has selected is in the torrent list
			// for (var i = 0; i < torrents.length; i++) {
			// 	if (torrents[i].quality === req.params.quality)
			// 		index = i;
			// }
			magnet += torrents[index].hash;
			magnet += "&dn=" + encodeURIComponent(movie.data.movie.title_long);
			magnet += "&tr=udp://open.demonii.com:1337/announce";
			magnet += "&tr=udp://tracker.openbittorrent.com:80";
			magnet += "&tr=udp://tracker.coppersurfer.tk:6969";
			magnet += "&tr=udp://glotorrents.pw:6969/announce";
			console.log(magnet);

			var engine = new torrentStream(magnet, {
				connections: 100,
				uploads: 10,
				verify: true,
				path: path.resolve('public/movies'),
				trackers: [
					'udp://tracker.opentrackr.org:1337/announce',
					'udp://torrent.gresille.org:80/announce',
					'udp://p4p.arenabg.com:1337',
					'udp://tracker.leechers-paradise.org:6969'
				]
			});
			engine.on('ready', function () {
				engine.files.forEach(function (file) {
                    const fileSize = file.length;
					const end = fileSize - 1;
					console.log("Filesize: " + fileSize);

					var extension = path.extname(file.path)
					if (extension === '.mp4' || extension === '.mkv' || extension === '.avi') {
						var stream = file.createReadStream(0, end);
                        console.log('filename:', file.name);
                        stream.pipe(res);
					}
				});
			});
		});
	}
}

function createFolders() {
	var publicDir = path.resolve('./public');
	if (!fs.existsSync(publicDir))
		fs.mkdirSync(publicDir);
	var moviesDir = path.resolve('./public/movies');
	if (!fs.existsSync(moviesDir))
		fs.mkdirSync(moviesDir);
}