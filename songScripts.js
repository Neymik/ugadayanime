
var fs = require('fs')

var songsArray = []
var songsFolder = 'public/songsArchive/'

//fs.readFile("hello.txt", "utf8", function(error,data){ });

function songsInitialise () {

  var songsFolders = []

  songsFolders = fs.readdirSync('./' + songsFolder)

  for (var song of songsFolders) {

    var songData = {}

    songDataDirs = fs.readdirSync('./' + songsFolder + song)

    songData.nameDir = './' + songsFolder + song
    songData.name = song



    songData.songDir = songDataDirs.find(function(element, index, array) {
      return element.substr(-4) == '.mp3'
    })

    if (songData.songDir == undefined) {
      continue
    } else {
      songData.songDir = songData.nameDir + '/' + songData.songDir
    }



    songData.picDir  = songDataDirs.find(function(element, index, array) {
      return element.substr(-4) == '.jpg'
    })

    if (songData.picDir == undefined) {
      songData.picDir = './public/images/macsimNeSkacal.bmp'
    } else {
      songData.picDir = songData.nameDir + '/' + songData.picDir
    }



    songData.dataDir = songDataDirs.find(function(element, index, array) {
      return element.substr(-4) == '.txt'
    })

    if (songData.dataDir == undefined) {
      songData.data = '0'
    } else {
      songData.dataDir = songData.nameDir + '/' + songData.dataDir
      songData.data = fs.readFileSync(songData.dataDir, "utf8")
      songData.data = songData.data.replace(/[^\d]/g, '')

    }



    songsArray.push(songData)

  }
}


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function makeToken() {
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 20; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}


function songSet (players, folder = 'base') {

  var randSongNums = []

  for ( let songNum in songsArray) {
    randSongNums.push(songNum)

  }

  randSongNums = shuffle(randSongNums) //перетасовка

  var newRandSong = {}

  newRandSong.name0 = songsArray[randSongNums[0]].name
  newRandSong.name1 = songsArray[randSongNums[1]].name
  newRandSong.name2 = songsArray[randSongNums[2]].name
  newRandSong.name3 = songsArray[randSongNums[3]].name

  newRandSongResultNum = Math.floor(Math.random() * 4)

  let rightSong = songsArray[randSongNums[newRandSongResultNum]]

  newRandSong.rightname = rightSong.name

  newRandSong.songDir = rightSong.songDir
  newRandSong.picDir = rightSong.picDir

  // newRandSong.songDirHidden = 'public/songs/' + folder + '/' + makeToken() + rightSong.songDir.substr(-4)
  //
  // oldFiles = songDataDirs = fs.readdirSync('./' + 'public/songs/' + folder)
  // for (let oldFile of oldFiles) {
  //
  //   fs.unlink('./' + 'public/songs/' + folder + '/' + oldFile, function (err) {
  //     if (err) {
  //       console.log("file NOT deleted")
  //       console.log(err)
  //     }
  //   });
  // }
  //
  // fs.copyFile(rightSong.songDir, newRandSong.songDirHidden, (err) => {
  //   if (err) throw err;
  //   //console.log(rightSong.songDir + ' was copied to ' + newRandSong.songDir);
  // });

  // newRandSong.songDirHidden = newRandSong.songDirHidden.slice(7)

  // newRandSong.picDirHidden = 'public/songs/' + folder + '/' + makeToken() + rightSong.picDir.substr(-4)
  //
  // fs.copyFile(rightSong.picDir, newRandSong.picDirHidden, (err) => {
  //   if (err) throw err;
  //   //console.log(rightSong.picDir + ' was copied to ' + newRandSong.picDir);
  // });

  newRandSong.songDirHidden = newRandSong.songDir.slice(9)
  newRandSong.picDirHidden = newRandSong.picDir.slice(9)

  songScripts.lastSong = songScripts.nowSong
  songScripts.nowSong = newRandSong



  console.log(newRandSong)

}


songsInitialise ()

var songScripts = {}
songScripts.nowSong = {}
songScripts.lastSong = {}
songScripts.songs = songsArray
songScripts.songSet = songSet
module.exports = songScripts
