var fs = require('fs');
var app = require('http').createServer(theHandler);
var path = require('path');
var util = require('util');
var oldPath = __dirname;
var cnt = 0;
var wtch = 0;
var fLen = 5;

function parseName(filename) {
    var ext = path.extname(filename);
    var fullPath = path.join(__dirname, filename);
    var name = path.basename(fullPath, ext);
    var nameArr = [name, ext, fullPath];

    return nameArr;
}

function renameFile(theNew, theOld) {
    fs.rename(theOld, theNew, function () {
        watcher();
    });
}

function watcher() {
    wtch++;
    console.log('wtch', wtch);
    if (wtch === fLen) {
        console.log('success');
        setTimeout(init, 1000, 1);
        //init(1);
    }
}

function appendData(type, file, fpath) {
    if (type === '.txt') {
        var txt = '\r\n' + file + '\r\n' + fpath;
        fs.appendFile(fpath, txt, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                //Done
            }
        });
    }
    else if (type === '.json') {
        var theFile = require(fpath);

        theFile["originalName"] = file;
        theFile["originalPath"] = fpath;

        fs.writeFile(fpath, JSON.stringify(theFile), function () { });
    }
}

function appendNewData(type, file, fpath) {
    console.log('APPEND NEW');
    if (type === '.txt') {
        var txt = '\r\n' + file + '\r\n' + fpath;
        console.log(txt);
        fs.appendFile(fpath, txt, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                //Done
            }
        });
    }
    else if (type === '.json') {
        var theFile = require(fpath);

        theFile["newFileName"] = file;
        theFile["newFilePath"] = fpath;

        fs.writeFile(fpath, JSON.stringify(theFile), function () { });
    }
}

function initProcess(file, chk) {
    var year;
    var month;
    var hrs;
    var day;
    var min;
    var sec;
    var sdate = new Date();
    var theDate;

    year = sdate.getFullYear();
    month = sdate.getMonth();
    month = month + 1;
    day = sdate.getDate();
    min = (sdate.getMinutes() < 10 ? '0' : '') + sdate.getMinutes();
    hrs = sdate.getHours();
    sec = sdate.getSeconds();
    theDate = year + '-' + month + '-' + day + '_' + hrs + '-' + sec;
    //var fullname = file;
    var fullname = file;
    var sname = parseName(fullname);
    if (sname[1] === '.json' || sname[1] === '.txt') {
        var newname = sname[0] + '_edited_' + theDate + sname[1];
        if (chk === 1) {
            appendNewData(sname[1], fullname, sname[2]);
        }
        else {
            appendData(sname[1], fullname, sname[2]);
            renameFile(newname, fullname);
        }
    }
    else {
        // DO NOTHING
    }
}

function theHandler(req, res) {
    init();
}

function init(check) {
    //var fileArr = [];

    fs.readdir(oldPath, function (err, items) {
        items.forEach(function (file) {
            initProcess(file, check);
            //fileArr.push(file);
        });
    });
}

app.listen(8080, () => console.log('Server running on port 8080'))