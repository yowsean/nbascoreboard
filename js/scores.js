window.addEventListener('load', init, false);

function time() {
  var currTime = new Date();
  var h = currTime.getHours();
  var m = currTime.getMinutes();
  var s = currTime.getSeconds();
  var am = true;
  if (h >= 12) {
      am = false;
      h = h - 12;
  }
  if (h == 0) {
    h = 12;
  }
  if (m < 10) {
    m = "0" + m;
  }
  if (am == true) {
    am = 'AM';
  } else {
    am = 'PM';
  }
  document.getElementById('time').innerHTML = h + ":" + m;
}

function today() {
  var datef = new Date();
  var y = datef.getFullYear();
  var m = datef.getMonth()+1;
  var d = datef.getDate();
  var datef = y.toString() + m.toString() + d.toString();
  return datef;
}

function showScores() {
  $(".spinner").fadeIn("slow");
  $.getJSON("http://data.nba.com/json/cms/noseason/scoreboard/" + today() + "/games.json", function(data) {
    console.log('success');
    var games = data.sports_content.games.game;
    /*  hTeam: games[i].hTeam.triCode,
        vTeam: games[i].vTeam.triCode,
        active: games[i].isGameActivated,
        startTime: games[i].startTimeEastern,
        status: games[i].statusNum,
        clock: games[i].clock,
        period: games[i].period
    */
    var gamesList = [];
    for (var i = 0; i < games.length; i++) {
      if (games[i].period_time.game_status == 2) {
        gamesList.unshift(games[i]);
      } else {
        gamesList.push(games[i]);
      }
      //document.getElementById('game'+i).href = "https://stats.nba.com/game/";
    }
    for (var i = 0; i < gamesList.length; i++) {
      gameDisp(i, gamesList[i]);
    }
  });
  $(".spinner").delay(1400).fadeOut("slow");
}

function gameDisp(i, game) {
  document.getElementById('game'+i+'v').innerHTML = `
  <div class="s1"><img src="/images/teams/${game.visitor.team_key}.png" height="25">${game.visitor.nickname}</div>
  <div class="s2">${game.visitor.score}</div>`;
  document.getElementById('game'+i+'h').innerHTML = `
  <div class="s1"><img src="/images/teams/${game.home.team_key}.png" height="25">${game.home.nickname}</div>
  <div class="s2">${game.home.score}</div>`;

  if (game.period_time.game_status == 1) {
    document.getElementsByClassName('s2')[i*2].style.display = 'none';
    document.getElementsByClassName('s2')[i*2+1].style.display = 'none';
    document.getElementById('status'+i).innerHTML = game.period_time.period_status;
  } else if (game.period_time.game_status == 2) {
    document.getElementById('card').style.backgroundColor = "#F5F5F5";
    if (game.period_time.game_clock == 0.0) {
      document.getElementById('status'+i).innerHTML = "End of " + game.period_time.period_value + "Q.";
    } else {
      document.getElementById('status'+i).innerHTML = game.period_time.period_value + "Q: " + game.period_time.game_clock;
    }
  } else if (game.period_time.game_status == 3) {
    if (parseInt(game.home.score) > parseInt(game.visitor.score)) {
      document.getElementById('game'+i+'v').style.opacity = "0.5";
    } else {
      document.getElementById('game'+i+'h').style.opacity = "0.5";
    }
    document.getElementById('status'+i).innerHTML = game.period_time.period_status;
  }
}

function getNumGames(callback) {
  $.getJSON("http://data.nba.com/5s/prod/v1/" + today() + "/scoreboard.json", function(data) {
    callback(data.numGames);
  });
}

function render(n) {
  for (var i = 0; i < n; i++) {
    $("#container").append(`
    <div class="card">
      <div class="card-container">
        <div class="c1">
          <div id="game${i}v"></div>
          <div id="game${i}h"></div></div>
        <div class="divider"></div>
        <div class="c2">
          <div id="status${i}"></div>
        </div>
      </div>
    </div>`);
  }
}

function init() {
  getNumGames(function (num) {
    if (num == 0) {
      time();
      setInterval(time, 5000);
      $("#container").append("<h2>No games today.</h2>");
    } else {
      time();
      setInterval(time, 5000);
      render(num);
      showScores();
      setInterval(showScores, 10000);
      console.log('done');
    }
  });
}
/*
var teams = {
  "PHI":"76ers",
  "MIL":"Bucks",
  "CHI":"Bulls",
  "CLE":"Cavaliers",
  "BOS":"Celtics",
  "LAC":"Clippers",
  "MEM":"Grizzlies",
  "ATL":"Hawks",
  "MIA":"Heat",
  "CHA":"Hornets",
  "UTA":"Jazz",
  "SAC":"Kings",
  "NYK":"Knicks",
  "LAL":"Lakers",
  "ORL":"Magic",
  "DAL":"Mavericks",
  "BKN":"Nets",
  "DEN":"Nuggets",
  "IND":"Pacers",
  "NOP":"Pelicans",
  "DET":"Pistons",
  "TOR":"Raptors",
  "HOU":"Rockets",
  "SAS":"Spurs",
  "PHX":"Suns",
  "OKC":"Thunder",
  "MIN":"Timberwolves",
  "POR":"Trail Blazers",
  "GSW":"Warriors",
  "WAS":"Wizards"
}
*/
