var whitelist = require('./whitelist.js')
var cors = require('cors')
var list = whitelist.Whitelist();
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var add_todb = require('./add.js');
var loaddb = require('./loaddb.js');
var datalayer = require('./datalayer.js');
var emailer = require('./ema.js');
var pydatalayer = require('./pydata.js');
var getWebReports = require('./getwebreports.js');
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var AWS = require('aws-sdk');
var adri = require('./getWebreports_DL.js')
var urlCrypt = require('url-crypt')('~{ry*I)==yU/]9<7DPk!Hj"R#:-/Z7(hTBnlRS=4CXF');
var nodemailer = require('nodemailer');
var ses = require('nodemailer-ses-transport');
var formidable = require('formidable');
var fs = require('fs');
AWS.config.update({ region: 'us-west-2' });
var sns = new AWS.SNS();

app.use(cors());

app.use(express.static(__dirname + '/public'));

//const compiledFunction = pug.compileFile('index.pug');

datalayer.start_conn();

console.log(__dirname + '/public');

app.get('/', (req, res) => {
    console.log('inside the / endpoint');
    res.sendFile('lp.html', { root: __dirname })
})

app.get('/newuser', (req, res) => {
    console.log('inside the newUser endpoint');
    res.sendFile('newUser.html', { root: __dirname })
})

app.get('/Audrey', (req, res) => {
    console.log('inside the Audrey endpoint');
    res.sendFile('lp.html', { root: __dirname })
})

app.get('/Dashboard', (req, res) => {
    console.log('inside the Dashboard endpoint');
    res.sendFile('dash.html', { root: __dirname })
})

app.get('/Main', (req, res) => {
    console.log('inside the main endpoint');
    //emailer.mgr_lack_available();
    //emailer.mgr_lack_available(conn);
    res.sendFile('main.html', { root: __dirname });

})

app.get('/Candidate', (req, res) => {
    console.log('inside the candidate endpoint');
    //
    //
    res.sendFile('candidate.html', { root: __dirname });
})

app.post('/fileupload', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        var oldpath = files.filetoupload.path;
        var newpath = '/home/ubuntu/files/' + files.filetoupload.name;
        fs.rename(oldpath, newpath, function (err) {
            if (err) throw err;
            res.sendFile('act_post.html', { root: __dirname })
        });
    });
});


function encrypt(data) { return urlCrypt.cryptObj(data); }
function decrypt(data) {
    if ((data.length) < 2) {
        return -1;
    } else {
        return urlCrypt.decryptObj(data);
    }
}

function standardinterview(mgr, interviewminutes, random_number) {
    console.log('heu');
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function functionfour24(data) {
    loaddb.insert_db_avail(data);
}

function readthefile(filename, callback) {
    fs.readFile(filename, 'utf8', function (err, data) {
        if (err) throw err;
        console.log('OK: ' + filename);
        callback(JSON.parse(data));
    });
}


io.on('connection', function (client, res) {
    console.log('Client connected...');

    // BEGIN CANDIDATE

    client.on('canGetInterview', function (data) {
        console.log('canGetInterview', data);

        var cid = decrypt(data.canid);
        console.log('in canGetInterview', cid);
        datalayer.dl_main_cb1('api_get_mgr', [cid], recieveCanInterviewInfo);
        //schedule.can_get_interview(cid, conn, recieveCanInterviewInfo);
    });

    function recieveCanInterviewInfo(err, results, cid) {
        results = [results, cid];
        console.log('in recieveCanInterviewInfo', cid);
        client.emit('recieveCanInterviewInfo', results);
    }

    client.on('getStandardInterview', function (data) {
        console.log('getStandardInterview', data);
        //refid:   canid:   deflen:

        //data.canid = decrypt(data.canid); MARK
        datalayer.dl_main_cb1_pt('can_check_slot', [data.canid], standardstep2, data);
        //schedule.can_check_slot(data, conn, standardstep2);
    });

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }
    function getdirpath() {
        return "/home/ubuntu/pylam/";
    }

    function standardstep2(err, row_count, data) {
        console.log('standardstep2', row_count[0][0]);
        if (row_count[0][0].num_rows > 0) {
            deny_new_slot();//already scheduled
            //schedule.get_or_full_join(data, getTimeSlots); //just testing
        } else {
            var rand = getRandomInt(100000000);
            var dirpath = getdirpath() + 'or_full_join.py';
            pydatalayer.py_main_cb([dirpath, data.refid, data.deflen, rand], getTimeSlots);
            //schedule.get_or_full_join(data, getTimeSlots);
        }
    }

    function deny_new_slot() {
        console.log('deny_new_slot');
        client.emit('recieveTimeSlots', -1);
    }

    client.on('uploadCandidate', function (uploadfile) {
        console.log('uploadCandidate', uploadfile);
        add_todb.writethefile(uploadfile, call_add_userpy);
    });

    function call_add_userpy(data) {
        console.log('in call_add_userpy', data);
        var dirpath = getdirpath() + 'add_user.py';
        pydatalayer.py_main_cb_pt([dirpath, data.random_number, data.userid, data.filename], get_msg_template1, data);
        //add_todb.python_load_newuser(data, get_msg_template1);
    }

    function get_msg_template1(data0, data) {
        console.log('get_msg_template1', data);
        var companyid = 1;
        datalayer.dl_main_cb1_pt('api_msg_template', [companyid, 'candidate'], recieveCanConf, data);
        datalayer.dl_main_cb1('api_load_users', [], writelog);

        //add_todb.get_msg_template(companyid, data, conn, recieveCanConf);
    }

    function writelog(err, data) {
        console.log('writelog');

    }

    function recieveCanConf(err, results, data) {
        console.log('in recieveCanConf');
        var combine = {
            dataMain: data,
            results: results
        };
        deletefile(data.filepath.toString());
        client.emit('recieveCanConf', combine);
    }
    function deletefile(filename) {
        console.log('deletefile', filename);
        fs.unlink(filename, (err) => {
            if (err) throw err;
            console.log('successfully deleted ' + filename);
        });
    }

    client.on('deleteSlot', function (refid) {
        console.log('deleteSlot', refid);
        datalayer.dl_main_cb1('can_delete_slot', [refid], confirm_delete_slot);
        //schedule.can_delete_slot(refid, int_min, confirm_delete_slot);
    });

    function confirm_delete_slot(error, refid) {
        console.log('in confirm_delete_slot');
        client.emit('confirm_delete_slot', refid);
    }

    function getTimeSlots(uniqueid, data) {
        console.log('in getTimeSlots', uniqueid);
        datalayer.dl_main_cb1('can_get_answer', [uniqueid], recieveTimeSlots);
        //schedule.can_get_answer(uniqueid, conn, recieveTimeSlots);
    }

    function recieveTimeSlots(error, results, int_min) {
        console.log('in recieveTimeSlots');
        client.emit('recieveTimeSlots', results);
    }
    function return_pyseq(data) {
        console.log('in the return_pyseq');
        client.emit('updateSelection', data);
    }
    function return_sett(err, data) {
        console.log('in the return_sett');
        client.emit('update_sett', data);
    }
    function return_dash(err, data) {
        console.log('in the return_dash');
        client.emit('update_dash', data);
    }
    function functionfour(err, data) {
        console.log('in the functionfour');
        client.emit('updatelabel', data[0][0]);
    }
    function functionTwo(error, data) {
        console.log('functionTwo');
        client.emit('updatelabel', data);
    }
    function sendtoreportsclient(data) {
        console.log('sendtoreportsclient');
        client.emit('recieve_reports', data);
    }
    function recieveGet(err, results) {
        console.log('in recieveGet');
        client.emit('recieveGet', results);
    }
    function recieveUnscheduled(err, results) {
        console.log('recieveUnscheduled');
        client.emit('recieveUnscheduled', results);
    }
    function recieveCallInfo(err, results) {
        console.log('in recieveCallInfo');
        client.emit('recieveCallInfo', results);
    }

    // END CANDIDATE

    // BEGIN MAIN
    client.on('getMainData', function (data) {
        var mid = decrypt(data);
        console.log('in getMainData', mid);
        datalayer.dl_main_cb1('api_get_main', [mid], recieveMainData);
        //schedule.can_get_interview(cid, conn, recieveCanInterviewInfo);
    });

    function recieveMainData(err, results) {
        console.log('in recieveMainData');
        client.emit('recieveMainData', results);
    }

    client.on('getUsersByPosition', function (data) {
        console.log('in getUsersByPosition');
        datalayer.dl_main_cb1('api_mgr_users', [data], receiveUsersByPosition);
    });

    function receiveUsersByPosition(err, results) {
        console.log('in recieveMainData');
        client.emit('receiveUsersByPosition', results);
    }

    client.on('getMessages', function (data) {
        console.log('in getMessages');
        datalayer.dl_main_cb1('api_msg_template', [data[0], data[1]], receiveMessages);
    });

    function receiveMessages(err, results) {
        console.log('in receiveMessages');
        client.emit('receiveMessages', results);
    }

    client.on('getPositions', function (data) {
        console.log('in getPositions', data);
        datalayer.dl_main_cb1('api_mgr_roles', [data], receivePositions);
    });

    function receivePositions(err, results) {
        console.log('in receivePositions');
        client.emit('receivePositions', results);
    }

    client.on('getPositionAssociations', function (data) {
        console.log('in getPositionAssociations', data);
        datalayer.dl_main_cb1('api_mgr_role_association', [data], receivePositionAssociations);
    });

    function receivePositionAssociations(err, results) {
        console.log('in receivePositionAssociations');
        client.emit('receivePositionAssociations', results);
    }

    client.on('translatecsv', function (data) {
        datalayer.translatecsv(data, receivecsv);
    });

    function receivecsv(data) {
        console.log('in receivecsv', data);
        client.emit('receivecsv', data);
    }

    client.on('join', function (data) {
        console.log('join', data);

        //hello.get_user_idv3(functionfour, theid);
    });

    client.on('setTimeSlot', function (data) {
        console.log('setTimeSlot', data);

        // insert data into interview TABLE
        // email managerid alert new interview
        // email candidate alert new interview
        emailer.add_slot(data);
    });

    client.on('cancel_slot', function (data) {
        console.log('cancel_slot', data);
        // pass in refid
        // delete from interview table
        // email both mgr and candid
        // log message sent
        // (done)
        emailer.cancel_slot(data);

    });

    function array_equals(a, b) {
        return a.length === b.length && a.every(function (value, index) {
            return value === b[index];
        });
    }

    function getdim(arr) {
        if (!arr.length) {
            return [];
        }
        var dim = arr.reduce(function (result, current) {

            return array_equals(result, getdim(current)) ? result : false;
        }, getdim(arr[0]));

        return dim && [arr.length].concat(dim);
    }

    client.on('uploadFormCandidates', function (data) {
        console.log('uploadFormCandidates', data);
        var sql = "INSERT INTO users (fname, lname, emailaddress, mobilenumber, roleid) VALUES ?,?,?,?,?";
        datalayer.addUserForm(sql, data, recieveFormCanConf);
    });

    function recieveFormCanConf(err, results) {
        console.log('in recieveFormCanConf');
        client.emit('recieveFormCanConf', results);
    }

    client.on('join_dash', function (data) {
        console.log('join_dash', data);
        newUser.get_missed_location(return_dash);
    });

    client.on('join_sett', function (data) {
        console.log('join_sett', data);
        newUser.get_interviewstuff(return_sett);
    });

    client.on('call_person', function (data) {
        console.log('call_person ');
        console.log(data);
        //twilio_module.twilio_send_text(data);
    });

    client.on('getreportdata', function (data) {
        console.log('getreportdata');
        sendtoreportsclient(data);
    });

    client.on('submitUser', function (data) {
        data.personcode = encrypt(data.personcode);
        console.log('in submitUser');
        newUser.add_user(newUser.update_encrpyted_field, data.email, data.name, data.personcode);
    });

    client.on('setAvail', function (data, mgrid) {
        console.log('in setAvail', data, mgrid);
        loaddb.insert_db_avail(data, mgrid);
    });

    function step2a(err, results, data) {
        console.log('step2a', data);
        var dirpath = getdirpath() + 'msg.py';
        pydatalayer.py_main_cb([dirpath, data.templateid, data.batchid], recieveBatchConfirmation);
    }

    function recieveBatchConfirmation(err, results) {
        console.log('in recieveBatchConfirmation');
        client.emit('recieveBatchConfirmation', results);
    }

    client.on('getAvail', function (data) {
        console.log('in getAvail', data);
        datalayer.dl_main_cb1('api_get_avail', [data], recieveGet);
        //schedule.get_availability(data, conn, recieveGet);
    });

    client.on('getInterviews', function (data) {
        console.log('in getInterviews');
        datalayer.dl_main_cb1('api_get_interview', [data[0]], recieveGet);

    });

    client.on('getUnscheduled', function (data) {
        console.log('in getUnscheduled');
        datalayer.dl_main_cb1('api_get_interview_info_null', [data], recieveUnscheduled);
        //schedule.api_get_unscheduled(data, conn, recieveUnscheduled);
    });

    client.on('deleteUser', function (data) {
        console.log('in deleteUser');
        datalayer.dl_main_cb1('api_delete_user', [data], no_callback);
        //schedule.api_delete_user(data, conn);
    });

    client.on('getInterviewInfo', function (data) {
        console.log('in getInterviewInfo');
        datalayer.dl_main_cb1('api_get_interview', [data], recieveCallInfo);
        //schedule.api_get_interview(data, recieveCallInfo);
    });

    function no_callback(err, data) {
        //console.log(data);
    }

    client.on('sendSMS', function (data) {
        console.log('in sendSMS');
        //schedule.sendSMS(data); //needs to be built
    });


    client.on('getpy', function (data) {
        console.log('attempt to run python routine...');

        var spawn = require("child_process").spawn;
        var pythonProcess = spawn('python', ["/home/ubuntu/pylam/seq.py"]);

        pythonProcess.stdout.on('data', function (data) {
            data = data.toString('utf8');
            console.log('python routine returned!');
            return_pyseq(data);
        });
    });


    function processsms(err, results, data) {
        console.log('processsms', data);
        var dirpath = getdirpath() + 'sms.py';
        pydatalayer.py_main_cb([dirpath, data.templateid, data.batchid], recieveSMSConfirmation);
    }

    function recieveSMSConfirmation(err, results) {
        console.log('in recieveSMSConfirmation');
        client.emit('recieveSMSConfirmation', results);
    }

    function shrinkURL(lUrl, onComplete) {

        request.post('https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyBNaP2FPRqbeV2ioQsuSIj9WmeZZahGwdA', {
            json: {
                'longUrl': lUrl
            }
        }, function (error, response, body) {
            if (error) {
                console.log(error);
            }
            else {
                onComplete(body);
            }
        });
    };
});

function functionOne(x) { console.log(x); }



server.listen(3000, () => console.log('Server running on port 3000'))
server.timeout = 5000;
