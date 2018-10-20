const request = require('request');
const express = require('express');


/**Backlog:
	Layout

	selection of tags

	Config file
	refactor
	
	Readme
	Comments
**/


const apikey = '889C6B1C909956CBE05B901E355D3EE9';
const port = 3000;

const headers = {
	'User-Agent': 'SteamAPITest',
	'Content-Type': 'application/json'
};



//76561198039144984
function getGames(id, res) {

	const options = {
		url: 'https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=' + apikey + '&steamid=' + id + '&format=json&include_appinfo=1',
		method: 'GET',
		headers: headers
	};

	request(options, function (error, response, body) {
		if(error){
			res.send({ success: false, error : error});
		}else{
			var games;
			try{
				games = JSON.parse(body).response.games
			}catch(parseError){
			res.send({ success: false, error : parseError});
			return;
			}
			res.send({ success: true, data:  games});
		}
		
	});
}

function getInfo(id, res) {

	const options = {
		url: 'https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=' + apikey + '&steamids=' + id,
		method: 'GET',
		headers: headers
	};

	var playerInfo;
	request(options, function (error, response, body) {
		if(error){
			res.send({ success: false, error : error});
			
		}else{
			try{
			    var jsonInfo = JSON.parse(body);
			}catch(parseError){
				res.send({ success: false, error : parseError});
				return;
			}
			var playerInfo = (({ steamid, personaname, avatarmedium }) => ({ steamid, personaname, avatarmedium }))(jsonInfo.response.players[0]);
			console.log(playerInfo);
			res.send({ success: true, data: playerInfo });
		}
		
	});

}

function getProfileId(name, res) {
	const options = {
		url: 'https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=' + apikey + '&vanityurl=' + name,
		method: 'GET',
		headers: headers
	};

	request(options, function(error, response, body) {
		if(error){
			res.send({ success: false, error : error});
		}else{
			try{
				var jsonInfo = JSON.parse(body);
			}catch(parseError){
				res.send({ success: false, error : parseError});
				return;
			}
			var profileId = jsonInfo.response.steamid;
			if (profileId === undefined){
				res.send({ success: false, error : "invalid"});
				return;
			}
			
			console.log("Parsed " + name + " to " + profileId);
			res.send({success: true, data: profileId}); 
		}
		
	});
}

const app = express();
app.use(express.static('public'));


app.get('/games_post', function (req, res) {
	console.log(req.query.steam_id);
	getGames(req.query.steam_id, res);
})

app.get('/playerinfo_post', function (req, res) {
	getInfo(req.query.steam_id, res);
})

app.get('/resolveid_post', function (req, res) {
	getProfileId(req.query.vanityurl, res);
})


// serve the homepage
app.get('/', (req, res) => {
	console.log(req);
	res.sendFile(__dirname + '/index.html');
});



app.listen(port, () => {
	console.log('listening on ' + port);
});







