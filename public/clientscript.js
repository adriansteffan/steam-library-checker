
var gameLibraries = {};
var profiles = {};
var totalPlaytimes = {};
var weightPlaytimes = {};
var timeSpentOnSteam = {};

var profilesListDivName = "#steam_profiles";
var gamesListDivName = "#gamelist";

//imported from config.js
hostip = HOST;
port = PORT;

function diff(arr1, arr2) {
    var ret = [];
    for (var i in arr1) {
        for (var j in arr2) {
            if (arr2[j].appid == arr1[i].appid) {
                ret.push(arr1[i]);
            }
        }
    }

    return ret;
};


function compareLibraries(libraries) {

    //console.log(libraries[Object.keys(libraries)[0]]);
    var intersectingGames = libraries[Object.keys(libraries)[0]];
    for (var i = 1; i < Object.keys(libraries).length; i++) {
        //console.log(libraries[Object.keys(libraries)[1]]);
        intersectingGames = diff(intersectingGames, libraries[Object.keys(libraries)[i]]);
    }

    return intersectingGames;
}

var ComparingFuncs = {

    compareAlphabetical: function (game1, game2) {
        if (game1.name < game2.name)
            return -1;
        if (game1.name > game2.name)
            return 1;
        return 0;
    },

    compareAlphabeticalReverse: function (game1, game2) {
        return ComparingFuncs.compareAlphabetical(game1, game2) * (-1);
    },

    compareTotalPlaytime: function (game1, game2) {
        if (totalPlaytimes[game1.appid] > totalPlaytimes[game2.appid])
            return -1;
        if (totalPlaytimes[game1.appid] < totalPlaytimes[game2.appid])
            return 1;
        return 0;
    },

    compareTotalPlaytimeReverse: function (game1, game2) {
        return ComparingFuncs.compareTotalPlaytime(game1, game2) * (-1);
    },

    compareWeightedPlaytime: function (game1, game2) {
        if (weightPlaytimes[game1.appid] > weightPlaytimes[game2.appid])
            return -1;
        if (weightPlaytimes[game1.appid] < weightPlaytimes[game2.appid])
            return 1;
        return 0;
    },

    compareWeightedPlaytimeReverse: function (game1, game2) {
        return ComparingFuncs.compareWeightedPlaytime(game1, game2) * (-1);
    }

};




function renderGameList(library, compareFunc) {


    //console.log(library);
    var renderedGames = '<div class="row">';

    if (typeof library !== 'undefined') {
        compareFunc = typeof compareFunc !== 'undefined' ? compareFunc : ComparingFuncs.compareAlphabetical;
        library.sort(compareFunc);
        for (var game of library) {
            renderedGames += '<div class="col-sm-3 gamecontainer"><a href="https://store.steampowered.com/app/' + game.appid + ' " target="_blank"><img class="gamelogo" src="http://media.steampowered.com/steamcommunity/public/images/apps/' + game.appid + '/' + game.img_logo_url + '.jpg" alt="' + game.name + '"></a><div class="default-text gametitle">' + game.name + '</div></div>';
        }
    }
    renderedGames += "</div>"
    $(gamesListDivName).html(renderedGames).show();
}



function renderProfileList() {

    $(profilesListDivName).empty();
    for (var key in profiles) {
        var profile = profiles[key];
		
        var renderedProfile = '<img src="' + profile.avatar + '" alt="' + profile.name + '" class="profile-picture">';
        renderedProfile += '<span class="default-text">  ' + profile.name + '  </span>';
        renderedProfile += '<input type="button" value="X" onclick=removeId("' + key + '") class="btn btn-outline-danger"></input><br><br>';

        $(profilesListDivName).append(renderedProfile).show();
    }

}

/**
 * Resolves the steam_id from a given input. Possible inputs are:
 * steamID
 * vanityID
 * profileURL
 * **/
function resolveId(input) {
    if (input == "") {
        return;
    }

    if (input.startsWith("http") || input.startsWith("steam")) {
        var splitInput = input.split("/");
        if (splitInput.slice(-1)[0] != "") {
            input = splitInput.slice(-1)[0];
        } else {
            input = splitInput.slice(-2)[0];
        }
    }

    if (!isNaN(input)) {

        addId(input);
    } else {
        $.ajax({
            url: "http://"+hostip+":"+port+"/resolveid_post",
            method: 'GET',
            data: { vanityurl: input }
        }).done(function (data) {
            if (data.success) {
                addId(data.data);
                return;
            }
        }).fail(function () {
            console.log('failed to resolve vanityurl');
            return;
        });
    }
}


function addId(input_id) {

    if (typeof gameLibraries[input_id] !== 'undefined') {
        return;
    }

    $.ajax({
        url: "http://"+hostip+":"+port+"/games_post",
        method: 'GET',
        data: { steam_id: input_id }
    }).done(function (data) {


        if (data.success && data.data) {
			console.log(data);
            gameLibraries[input_id] = data.data;
            for (var game of data.data) {
                if (typeof timeSpentOnSteam[input_id] === 'undefined') { timeSpentOnSteam[input_id] = 0; }
                timeSpentOnSteam[input_id] += game.playtime_forever;
            }

            for (var game of data.data) {
                if (typeof totalPlaytimes[game.appid] === 'undefined') {
                    totalPlaytimes[game.appid] = 0;
                    weightPlaytimes[game.appid] = 0;
                }
                weightPlaytimes[game.appid] += game.playtime_forever / timeSpentOnSteam[input_id];
                totalPlaytimes[game.appid] += game.playtime_forever;
            }
            renderGameList(compareLibraries(gameLibraries), ComparingFuncs[$("#sortResult").val()]);
 
			
			//Only add user profile if game library retrieval was successful (move code?)
			
			$.ajax({
				url: "http://"+hostip+":"+port+"/playerinfo_post",
				method: 'GET',
				data: { steam_id: input_id }
				}).done(function (data) {


					if (data.success && (typeof data.data !== "undefined")) {
						profiles[input_id] = { name: data.data.personaname, avatar: data.data.avatarmedium };
						renderProfileList();
						return;
					}
				}).fail(function () {
					console.log('failed to load playerinfo');
					return;
				});
	
            return;
        }
    }).fail(function () {
        console.log('failed to load games');
        return;
    });


    
};


function removeId(user_id) {
    console.log("removeid: " + user_id + " " + profiles[user_id]);
    for (var game of gameLibraries[user_id]) {
        totalPlaytimes[game.appid] -= game.playtime_forever;
        weightPlaytimes[game.appid] -= game.playtime_forever / timeSpentOnSteam[user_id];
    }
    delete timeSpentOnSteam[user_id];
    delete gameLibraries[user_id];
    delete profiles[user_id];
    renderGameList(compareLibraries(gameLibraries, ComparingFuncs[$("#sortResult").val()]));
    renderProfileList();
}


$(document).on("click", "#addId", function () {
    resolveId($('#steam_id').val());
});

$(document).on("change", "#sortResult", function () {
    console.log("select");
    renderGameList(compareLibraries(gameLibraries), ComparingFuncs[$("#sortResult").val()]);
});

//Add enter key functionality
$(document).keypress(function(event){
	var keycode = (event.keyCode ? event.keyCode : event.which);
	if(keycode == '13'){
		document.getElementById("addId").click();
	}
});



