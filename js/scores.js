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
  $(".spinner").fadeOut("slow");
  $.getJSON("http://data.nba.com/5s/prod/v1/" + "20171122" + "/scoreboard.json", function(data) {
    console.log('success');
      var games = data.games;
      /*  hTeam: games[i].hTeam.triCode,
          vTeam: games[i].vTeam.triCode,
          active: games[i].isGameActivated,
          startTime: games[i].startTimeEastern,
          status: games[i].statusNum,
          clock: games[i].clock,
          period: games[i].period
      */
      for (var i = 1; i <= data.numGames; i++) {
        document.getElementById('game'+i).innerHTML = games[i-1].vTeam.triCode + '-' + games[i-1].vTeam.score;
        //document.getElementById('game'+i).href = "https://stats.nba.com/game/";
      }
  });
  $(".spinner").delay(1000).fadeIn("slow");
}

function getNumGames(callback) {
  $.getJSON("http://data.nba.com/5s/prod/v1/" + "20171122" + "/scoreboard.json", function(data) {
    callback(data.numGames);
  });
}

function render(n) {
  for (var i = 1; i <= n; i++) {
    $("#container").append("<div class=\"card\"><div class=\"card-container\"><div id=\"game"+i+"\"><h1></h1></div></div>");
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
      setInterval(showScores, 5000);
      console.log('done');
    }
  });
}
