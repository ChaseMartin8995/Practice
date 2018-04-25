const mysql = require('mysql');
const conn = mysql.createConnection({
    host: '',
    user: '',
    password: '',
    database: '',
    multipleStatements: true
});

exports.start_conn = function () {
  conn.connect((err) => {
      if (err) throw err;
      console.log('Connected! to the database 4');
  });
}

exports.translatecsv = function (data, callback) {
    var csv = require('csv');
    var array;
    console.log('IN CSV');
    csv.parse(data,
        {
            delimeter: ',',  
        },
        (err, data) => {
            if (err) console.log(err);
            array = data;
            callback(array);
        });
    
}

exports.dl_main_cb1  = function (sp_name, data, callback) {
    var thecall = 'call ' + sp_name + stringthing(data);
    console.log(thecall, data);

    var sql = conn.query(thecall, data, function (error, results) {
    if (error) {
        console.log(thecall);
        conn.end();
        return console.error(error.message);
    }
    callback(error, results, data);
});
}

exports.dl_main_cb1_pt  = function (sp_name, data, callback, data2) {
  //pass through data2
    var thecall = 'call ' + sp_name + stringthing(data);
    console.log(thecall, data);

    var sql = conn.query(thecall, data, function (error, results) {
    if (error) {
        console.log(thecall);
        conn.end();
        return console.error(error.message);
    }
    callback(error, results, data2);
});
}

function stringthing(data) {
  var s1 = '(';
  for (var i = 0; i < data.length; i++) {
    s1 = s1 + '?,';
  }
  if(data.length > 0){
    return s1.substring(0, s1.length-1) + ')';
  }
  else {
    return s1 + ')';
  }
}

exports.addUserForm = function (sql, data, callback) {
    //pass through data2
    var theResult = [];
    for (var e = 0; e < data.length; e++) {
        //(fname, lname, emailaddress, mobilenumber, roleid)
        conn.query("INSERT INTO users (fname, lname, emailaddress, mobilenumber, roleid) VALUES ?,?,?,?,?", [data[e].fname, data[e].lname, data[e].emailaddress, data[e].mobilenumber, data[e].roleid], function (err, results) {
            if (err) throw err;
            theResult.push(results);
            conn.end();
        });
    }
    callback(theResult);
}