
//////////////////////////////////////////
//////////// Датабаза
//////////////////////////////////
var mysql = require("mysql2");
var connection = mysql.createConnection({
varhost: "localhost",
    user: "root",
    database: "ugadayanime",
    password: "qwer1234"
});

connection.connect(function(err){
  if (err) {
    return console.error("Ошибка: " + err.message);
  }
    else{
      console.log("Подключение к серверу MySQL успешно установлено!");
  }
});
