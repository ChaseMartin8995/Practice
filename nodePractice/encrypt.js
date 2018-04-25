var express = require('express');
var app = express();
var path = require('path');
var server = require('http').createServer(app);  
var AWS = require('aws-sdk');
var urlCrypt = require('url-crypt')('~{ry*I)==yU/]9<7DPk!Hj"R#:-/Z7(hTBnlRS=4CXF');

app.use(express.static(__dirname + '/public'));

const mysql = require('mysql');
const conn = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: '',
    multipleStatements: true
});

conn.connect((err) => {
  if (err) throw err;
  console.log('Connected! to the database 6');
  throw_query_at_db(conn);
});

function encrypt(data){return urlCrypt.cryptObj(data);}
function decrypt(data){ return urlCrypt.decryptObj(data);}

function setkey (conn, theid, thekey) {
  

  var sql = "update demo_people set encrypted = '" + thekey + "' where personid = " + theid + "";
  console.log(sql);
  conn.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result.affectedRows + " record(s) updated");
  });

};

function throw_query_at_db (conn) {

    conn.query('select personid from demo_people where encrypted is null', function(err, rows, fields) {
        for (var i = 0; i < rows.length; i++) { 
            theid = rows[i].personid;

            setkey(conn, theid, encrypt(theid));
      }
      

  });

};