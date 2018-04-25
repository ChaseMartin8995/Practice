var datalayer = require('./datalayer.js');
var nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');
var urlCrypt = require('url-crypt')('~{ry*I)==yU/]9<7DPk!Hj"R#:-/Z7(hTBnlRS=4CXF');

function encrypt(data) { return urlCrypt.cryptObj(data); }
function decrypt(data) { return urlCrypt.decryptObj(data); }

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
    console.log('Connected! to the database ema.js');
});

exports.update_encrpyted_field = function (data, callback) {
    console.log('in the update_encrpyted_field');
    var total = [];
    conn.query('select a.userid from users a left join email_encrypt b on b.userid = a. userid where b.userid is null limit 35000', function (err, rows, fields) {
        for (var i = 0; i < rows.length; i++) {
            var abc = [rows[i].userid, theencrp = encrypt(rows[i].userid)]
            total.push(abc);
        }
        if (rows.length > 0) {
            updatetable(total);
        }
        callback(err, rows, data);
    });
}

function updatetable(item) {
    var queries = '';
    console.log('loading rows', item.length);
    var sql = "INSERT INTO email_encrypt (userid, encrypted) VALUES ?";

    conn.query(sql, [item], function (err) {
        if (err) throw err;
        conn.end();
    });
}

function sendEmail(theemail, themessage, thetitle) {
    console.log('in sendEmail');

    var transporter = nodemailer.createTransport(ses({
        accessKeyId: 'AKIAIGVJSH44VJLXCLOA',
        secretAccessKey: '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'
    }));

    var mailOptions = {
        from: 'people@ffawet34435354.com',
        to: theemail,
        subject: thetitle,
        html: themessage
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
    });
}

function setupemail1(err, rows) {
    console.log(rows[0].length);

    for (var i = 0; i < rows[0].length; i++) {
        userid = rows[0][i].userid;
        fname = rows[0][i].fname;
        lname = rows[0][i].lname;
        emailaddress = rows[0][i].emailaddress;
        encrypted = rows[0][i].encrypted;
        thetitle = 'Audrey'
        var themessage = 'Hi ' + fname + ' ' + lname + '!  The manager paired with you is available to interview.  Please follow this link to setup a time.  <a class="ulink" href="http://stuff' + encrypted + '" target="_blank">Link to Audrey</a>';
        console.log(themessage);
        sendEmail(emailaddress, themessage, thetitle);
        var msglog = { userid: userid, msgtype: 1, msgtemplate: 1, companyid: 1 };
        log_msg(msglog);
    }
}


function log_msg(data) {
    console.log('log_msg', data);

    var sql = conn.query('call api_log_msg(?,?,?,?)', [data.userid, data.msgtype, data.msgtemplate, data.companyid], function (error, results) {
        if (error) {
            console.log('log_msg failed');
            conn.end();
            return console.error(error.message);
        }
    });
}

exports.mgr_lack_available = function () {
    console.log('mgr_lack_available');
    //db2(em2);
    datalayer.dl_main_cb1('api_mgr_lack_avail', [2], em2);
}

function em2(err, rows) {
    console.log('in em2 emailer');
    for (var i = 0; i < rows[0].length; i++) {
        userid = rows[0][i].userid;
        fname = rows[0][i].fname;
        lname = rows[0][i].lname;
        emailaddress = rows[0][i].emailaddress;
        encrypted = rows[0][i].encrypted;
        thetitle = 'Please Set Availability'
        var themessage = 'Hi ' + fname + ' ' + lname + '!  Please set your availability.  <a class="ulink" href="http://stuff/?=' + encrypted + '" target="_blank">Link to main page</a>';
        console.log(themessage);
        sendEmail(emailaddress, themessage, thetitle);
        var msglog = { userid: userid, msgtype: 1, msgtemplate: 2, companyid: 1 };
        log_msg(msglog);
    }
}

function step2(rows_added, data) {
    console.log('in step2...', rows_added);
    if (rows_added > 0) {
        //passing through the conn (that is why passed in twice)
        datalayer.dl_main_cb1_pt('api_email_encrypt', [data], step3);
        //api_email_encrypt(step3, data, conn);
    } else {
        step3(null, data);
    }
}
//api_email_can
function step3(err, data) {
    console.log('in step3', data);
    datalayer.dl_main_cb1_pt('api_email_can', [data.message], setupemail1);
    //setupemail(data, conn);
}


exports.cancel_slot = function (data, conn) {
    console.log('cancel_slot');
    datalayer.dl_main_cb1_pt('api_slot_email', [data], em3);
    //slot_email(data, conn, em3);
    datalayer.dl_main_cb1('api_delete_slot', data, writelog);
    //db4(data);

}

function writelog() {
    console.log('writelog');
}

function em3(err, rows) {
    console.log('in em3 emailer', rows);
    for (var i = 0; i < rows[0].length; i++) {
        userid = rows[0][i].userid;
        fname = rows[0][i].fname;
        lname = rows[0][i].lname;
        emailaddress = rows[0][i].emailaddress;
        encrypted = rows[0][i].encrypted;
        thetitle = 'Interview Cancelled'
        mgr = rows[0][i].manager;

        if (mgr == 1) {
            var themessage = 'Hi ' + fname + ' ' + lname + '!  An interview has been cancelled.  Intended for manager.  <a class="ulink" href="http://stuff?id=' + encrypted + '" target="_blank">Link to main page</a>';
        } else {
            var themessage = 'Hi ' + fname + ' ' + lname + '!  Your interview has been cancelled.  Intended for candidate.  <a class="ulink" href="http://link?id=' + encrypted + '" target="_blank">Link to main page</a>';
        }
        console.log(themessage);
        sendEmail(emailaddress, themessage, thetitle);


        var msglog = { userid: userid, msgtype: 1, msgtemplate: 3, companyid: 1 };
        log_msg(msglog);
    }
}

exports.add_slot = function (data) {
    console.log('add_slot', data);
    db5(data, em5);

}

function db5(data, callback) {
    console.log('in db5 emailer');

    var ds1 = new Date(data.starttime);
    var de1 = new Date(data.enddate);

    candid = decrypt(data.userID);
    var sql = conn.query('call api_add_slot(?,?,?,?,?)', [data.mgrid, candid, ds1, de1, data.refid], function (error, results) {
        if (error) {
            console.log('api_add_slot failed');
            conn.end();
            return console.error(error.message);
        }
        callback(data);
    });
}

function em5(data) {
    slot_email(data.refid, em4);
}

function em4(rows) {
    console.log('in em4 emailer', rows);
    for (var i = 0; i < rows[0].length; i++) {
        userid = rows[0][i].userid;
        fname = rows[0][i].fname;
        lname = rows[0][i].lname;
        emailaddress = rows[0][i].emailaddress;
        encrypted = rows[0][i].encrypted;
        thetitle = 'Interview Scheduled'
        mgr = rows[0][i].manager;

        if (mgr == 1) {
            var themessage = 'Hi ' + fname + ' ' + lname + '!  An interview has been scheduled.  Intended for manager.  <a class="ulink" href="http://Main?id=' + encrypted + '" target="_blank">Link to main page</a>';
        } else {
            var themessage = 'Hi ' + fname + ' ' + lname + '!  Your interview has been scheduled.  Intended for candidate.  <a class="ulink" href="http://second?id=' + encrypted + '" target="_blank">Link to main page</a>';
        }

        console.log(themessage);
        sendEmail(emailaddress, themessage, thetitle);


        var msglog = { userid: userid, msgtype: 1, msgtemplate: 4, companyid: 1 };
        log_msg(msglog);
    }
}



function setupemailbatch(err, rows) {
    console.log('setupemail', rows);

    console.log(rows[0].length);

    for (var i = 0; i < rows[0].length; i++) {
        userid = rows[0][i].userid;
        fname = rows[0][i].fname;
        lname = rows[0][i].lname;
        emailaddress = rows[0][i].emailaddress;
        encrypted = rows[0][i].encrypted;
        thetitle = 'Audrey'
        var themessage = 'Hi ' + fname + ' ' + lname + '!  The manager paired with you is available to interview.  Please follow this link to setup a time.  <a class="ulink" href="http://stuff?id=' + encrypted + '" target="_blank">Link to Audrey</a>';
        console.log(themessage);
        sendEmail(emailaddress, themessage, thetitle);
        var msglog = { userid: userid, msgtype: 1, msgtemplate: 1, companyid: 1 };
        log_msg(msglog);
    }
}



//
