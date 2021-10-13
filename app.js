
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var favicon = require('serve-favicon');
var async = require('async');

//var mysql = require("./sql.js");
var songScripts = require("./songScripts.js");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


app.all("/", function (request, response) {
    //response.redirect(my_uri)
    response.send("':|'");
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


const port = 1337
app.set('port', port);
var server = app.listen(port, function () {
    console.log('Express server listening on port ' + server.address().port)
});



var users = []


function getUserUpdate (token, name, answer = undefined) {

  let totSamiy = users.find(function(element, index, array) {
    return element.token == token
  })

  if (totSamiy == undefined) {

    totSamiy = {}
    totSamiy.token = token
    totSamiy.name = name
    totSamiy.answer = answer
    totSamiy.lastAnswer = undefined
    totSamiy.pts = 0
    users.push(totSamiy)

  }

  totSamiy.name = name

  if (answer != undefined) {
    totSamiy.answer = answer
  }

  roundBroadcastUserUpdate ()

  return totSamiy

}

function userMessageSend (user, message) {

  var jsonRes = new Object()
  jsonRes.type = 'userMessage'
  jsonRes.userName = user.name
  jsonRes.message = message
  wsServer.broadcast(JSON.stringify(jsonRes))

}


function roundBroadcastStart () {

  var nowSongForUgaday = {}

  nowSongForUgaday.name0 = songScripts.nowSong.name0;
  nowSongForUgaday.name1 = songScripts.nowSong.name1;
  nowSongForUgaday.name2 = songScripts.nowSong.name2;
  nowSongForUgaday.name3 = songScripts.nowSong.name3;

  nowSongForUgaday.songDirHidden = songScripts.nowSong.songDirHidden; //picDirHidden

  var usersRes = []

  for (user of users) {

    newUserRes = {}

    newUserRes.name = user.name
    newUserRes.pts = user.pts
    newUserRes.lastAnswer = user.lastAnswer


    usersRes.push(newUserRes)

  }


  var jsonRes = new Object()
  jsonRes.type = 'roundBroadcastStart'
  jsonRes.users = getUsersForroundBroadcast ()
  jsonRes.nowSong = nowSongForUgaday
  jsonRes.lastSong = songScripts.lastSong
  wsServer.broadcast(JSON.stringify(jsonRes))
}

function roundBroadcastEnd () {

  var jsonRes = new Object()
  jsonRes.type = 'roundBroadcastEnd'
  jsonRes.users = getUsersForroundBroadcast ()
  jsonRes.nowSong = songScripts.nowSong
  jsonRes.lastSong = songScripts.lastSong
  wsServer.broadcast(JSON.stringify(jsonRes))
}

function roundBroadcastUserUpdate () {

  var jsonRes = new Object()
  jsonRes.type = 'roundBroadcastUserUpdate'
  jsonRes.users = getUsersForroundBroadcast ()
  wsServer.broadcast(JSON.stringify(jsonRes))
}

function getUsersForroundBroadcast () {

  var usersRes = []

  for (user of users) {

    newUserRes = {}

    newUserRes.name = user.name
    newUserRes.pts = user.pts
    newUserRes.lastAnswer = user.lastAnswer


    usersRes.push(newUserRes)

  }

  return usersRes

}

//module.exports = app;



function round () {

  songScripts.songSet()
  roundBroadcastStart ()

  setTimeout(checkAnswers, 10000, users)

}

function checkAnswers(users) {

  for (user of users) {

    if (user.answer == undefined) {
      user.lastAnswer = undefined

    } else if (user.answer == songScripts.nowSong.rightname) {

      user.pts = user.pts + 1
      user.lastAnswer = true
      user.answer = undefined

    } else {
      user.lastAnswer = false
      user.answer = undefined

    }
  }

  console.log(users)

  roundBroadcastEnd ()

}

function userNameFilter(name) {

  return name.slice(0, 20).replace(/</g,'&lt;').replace(/>/g,'&gt;')

}

setInterval(round, 20000)

//songScripts.songSet()

////////////////////////////////////////////////
////////////////// websocket ///////////////////
////////////////////////////////////////////////

var WebSocketServer = require('websocket').server;

var wsServer = new WebSocketServer({
    httpServer: server,
    port: port
});

function originIsAllowed(origin) {
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {

          // console.log('Received Message: ' + message.utf8Data);
          var jsonReq = JSON.parse(message.utf8Data)

          if (jsonReq.type == 'ping') {

            var jsonRes = new Object()
            jsonRes.type = 'ping'
            connection.sendUTF(JSON.stringify(jsonRes))

          } else if (jsonReq.type == 'button') {

            jsonReq.userName = userNameFilter(jsonReq.userName)

            getUserUpdate (jsonReq.token, jsonReq.userName, jsonReq.songName)

            var jsonRes = new Object()
            jsonRes.type = 'button'
            connection.sendUTF(JSON.stringify(jsonRes))

          } else if (jsonReq.type == 'userMessage') {

            jsonReq.userName = userNameFilter(jsonReq.userName)
            jsonReq.message = userNameFilter(jsonReq.message)

            let user = getUserUpdate (jsonReq.token, jsonReq.userName)
            userMessageSend (user, jsonReq.message)

          }

        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

wsServer.broadcast = function broadcast(msg) {
    //console.log(msg);
    wsServer.connections.forEach(function each(client) {
        client.sendUTF(msg);
    });
};
