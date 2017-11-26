window.addEventListener('load', init, false);
window.addEventListener("keydown", keyEvent);
var cd = {d:0, num:0};

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

function getDate(n) {
  var sDate = new Date();
  sDate.setDate(sDate.getDate() + n);
  return sDate;
}

function printDate(sDate) {
  var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
  var strDate = monthNames[sDate.getMonth()] + " " + sDate.getDate() + ", " + sDate.getFullYear();
  document.getElementById('date').innerHTML = `${strDate}`;
}

function datef(sDate) {
  var y = sDate.getFullYear();
  var m = sDate.getMonth()+1;
  var d = sDate.getDate();
  if (m < 10) {
    m = '0' + m;
  } else {
    m = m.toString();
  }
  if (d < 10) {
    d = '0' + d;
  } else {
    d = d.toString();
  }

  var datef = y.toString() + m + d;
  return datef;
}

function showScores(d) {
  $.getJSON("http://data.nba.com/json/cms/noseason/scoreboard/" + datef(getDate(d)) + "/games.json", function(data) {
    console.log('success');
    printDate(getDate(d));
    var games = data.sports_content.games.game;
    var gamesList = [];
    for (var i = 0; i < games.length; i++) {
      if (parseInt(games[i].period_time.game_status) == 2) {
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
    document.getElementsByClassName('card')[i].style.backgroundColor = "#FAFAFA";
    if (game.period_time.game_clock == 0.0) {
      document.getElementById('status'+i).innerHTML = "End of " + game.period_time.period_value + "Q";
    } else {
      document.getElementById('status'+i).innerHTML = game.period_time.period_value + "Q: " + game.period_time.game_clock;
      document.getElementById('status'+i).style.color = "#43A047";
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

function getNumGames(callback, d) {
  $.getJSON("http://data.nba.com/5s/prod/v1/" + datef(getDate(d)) + "/scoreboard.json", function(data) {
    callback(data.numGames);
  });
}

function render(n, d) {
  document.getElementById("container").innerHTML = "";
  if (n == 0) {
    printDate(getDate(d));
    $("#container").append(`
    <div class="card">
        <h3>No games today.</h3>
    </div>`);
  } else {
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
    showScores(d);
  }
}

function refresh() {
  $(".spinner").fadeIn("slow");
  showScores(cd.d);
  $(".spinner").fadeOut("slow");
}

function init() {
  cd.d = 0;
  time();
  setInterval(time, 5000);
  getNumGames(function (num) {
    cd.num = num;
    render(num, cd.d);
  }, cd.d);
  setInterval(refresh, 10000);
}

function keyEvent(e) {
  var keyCode = e.keyCode;
  if (keyCode == 39) {
    cd.d += 1;
    var d = cd.d;
    getNumGames(function (num) {
      cd.num = num;
      render(num, cd.d);
      refresh();
    }, cd.d);
  } else if (keyCode == 37) {
    cd.d -= 1;
    var d = cd.d;
    getNumGames(function (num) {
      cd.num = num;
      render(num, cd.d);
      refresh();
    }, cd.d);
  }
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
