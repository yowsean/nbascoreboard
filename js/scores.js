window.addEventListener('load', init, false);
window.addEventListener("keydown", keyEvent);
document.getElementById("left-btn")
.addEventListener("click", function(){changeDate(-1)});
document.getElementById("right-btn")
.addEventListener("click", function(){changeDate(1)});
document.getElementById("date")
.addEventListener("dblclick", function(){changeDate(-sb.d)});

var sb = {d:0};

function init() {
  sb.d = 0;
  time();
  render();
}

function keyEvent(e) {
  var keyCode = e.keyCode;
  if (keyCode == 39) {
    changeDate(1);
  } else if (keyCode == 37) {
    changeDate(-1);
  }
}

function changeDate(n) {
  sb.d += n;
  render();
}

function render() {
  $.getJSON("http://data.nba.com/10s/prod/v1/" + datef(getDate(sb.d))
  + "/scoreboard.json", function(data) {
    renderCards(data.numGames);
    var activeGame = false;
    var upcomingGame = false;
    var nextGame = false;
    var timeout = 10000;
    for (var i = 0; i < data.numGames; i++) {
      if (data.games[i].statusNum == 2) {
        activeGame = true;
      }
      if (data.games[i].statusNum == 1 && nextGame == false) {
        upcomingGame = true;
        if (nextGame == false) {
          nextGame = i;
        }
      }
    }
    if (!activeGame && upcomingGame && sb.d == 0) {
      var startTime = new Date(data.games[nextGame].startTimeUTC);
      var currTime = new Date();
      timeout = startTime.getTime()-currTime.getTime();
    } else if (!activeGame) {
      timeout = 43200000;
    }
    if (timeout < 0) {
      timeout = 10000;
    }
    clearTimeout(sb.refresh);
    renderScores(activeGame, timeout);
  });
  setTimeout(render, 43200000);
}

function renderScores(activeGame, timeout) {
  if (sb.d == 0) {
    $(".spinner").fadeIn("fast");
  }
  $.getJSON("http://data.nba.com/json/cms/noseason/scoreboard/"
  + datef(getDate(sb.d)) + "/games.json", function(data) {
    printDate(getDate(sb.d));
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
  $(".spinner").delay(1000).fadeOut("slow");
  sb.refresh = setTimeout(function() {
    renderScores(activeGame, timeout);
  }, timeout);
}

function renderCards(n) {
  document.getElementById("container").innerHTML = "";
  if (n == 0) {
    printDate(getDate(sb.d));
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
  }
}

function gameDisp(i, game) {
  document.getElementById('game'+i+'v').innerHTML = `
  <div class="s1"><img src="/images/teams/${game.visitor.team_key}.png"
  height="25">${game.visitor.nickname}</div>
  <div class="s2">${game.visitor.score}</div>`;
  document.getElementById('game'+i+'h').innerHTML = `
  <div class="s1"><img src="/images/teams/${game.home.team_key}.png"
  height="25">${game.home.nickname}</div>
  <div class="s2">${game.home.score}</div>`;

  if (game.period_time.game_status == 1) {
    document.getElementsByClassName('s2')[i*2].style.opacity = '0';
    document.getElementsByClassName('s2')[i*2+1].style.opacity = '0';
    document.getElementById('status'+i).innerHTML = convertTime(game.date,game.time);
  } else if (game.period_time.game_status == 2) {
    document.getElementsByClassName('s2')[i*2].style.opacity = '1';
    document.getElementsByClassName('s2')[i*2+1].style.opacity = '1';
    document.getElementsByClassName('card')[i].style.backgroundColor = "#FAFAFA";
    document.getElementById('status'+i).style.color = "#43A047";
    if (game.period_time.game_clock == 0.0) {
      if (game.period_time.period_value == 2) {
        document.getElementById('status'+i).innerHTML = "Halftime"
      } else {
        document.getElementById('status'+i).innerHTML = "End of Q"
        + game.period_time.period_value;
      }
    } else {
      document.getElementById('status'+i).innerHTML = `
      Q${game.period_time.period_value} - ${game.period_time.game_clock}`;
    }
  } else if (game.period_time.game_status == 3) {
    if (parseInt(game.home.score) > parseInt(game.visitor.score)) {
      document.getElementById('game'+i+'v').style.opacity = "0.5";
    } else {
      document.getElementById('game'+i+'h').style.opacity = "0.5";
    }
    document.getElementById('status'+i).style.color = "#212121";
    document.getElementsByClassName('card')[i].style.backgroundColor = "#EEEEEE";
    document.getElementById('status'+i).innerHTML = game.period_time.period_status;
  }
}

function convertTime(d, t) {
  var localTime = new Date(d.slice(0,4) + "-" + d.slice(4,6) + "-" + d.slice(6,8)
                          + " " + t.slice(0,2) + ":" + t.slice(2,4) + " EST");
  var h = localTime.getHours();
  var m = localTime.getMinutes();
  var am = "AM";
  if (h >= 12) {
      am = "PM";
      h = h - 12;
  }
  if (h == 0) {
    h = 12;
  }
  if (m < 10) {
    m = "0" + m;
  }
  return h + ":" + m + " " + am;
}

function time() {
  var currTime = new Date();
  var h = currTime.getHours();
  var m = currTime.getMinutes();
  var s = currTime.getSeconds();
  if (h >= 12) {
      h = h - 12;
  }
  if (h == 0) {
    h = 12;
  }
  if (m < 10) {
    m = "0" + m;
  }
  document.getElementById('time').innerHTML = h + ":" + m;
  setTimeout(time, 60-s);
}

function getDate(n) {
  var sDate = new Date();
  sDate.setDate(sDate.getDate() + n);
  return sDate;
}

function printDate(sDate) {
  var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];
  var strDate = monthNames[sDate.getMonth()] + " "
                          + sDate.getDate() + ", "
                          + sDate.getFullYear();
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
