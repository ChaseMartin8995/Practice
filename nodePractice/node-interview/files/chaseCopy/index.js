var http = require('http');
var express = require('express');
var fs = require('fs');
var app = express();
var server = require('http').createServer(app);
var path = require('path');

app.get('/', (req, res) => {
    console.log('inside the / endpoint');
    res.end('Hello Http');
    const testFolder = '.\\test\\';
    const testFolder2 = __dirname + '\\test\\';
    add_data_tofile(testFolder, testFolder2, step2);
})

function step2(testFolder, testFolder2) {
    renamefiles(testFolder, testFolder2, finish);
}

function finish(a, b) {
    console.log('done', a, b);
}


server.listen(8080);

function readthefile(filename, callback) {
    fs.readFile(filename, 'utf8', function (err, data) {
        if (err) throw err;
        console.log('OK: ' + filename);
        callback(JSON.parse(data));
    });
}

function add_data_tofile(testFolder, testFolder2, callback) {
    console.log('setup');


    fs.readdir(testFolder, (err, files) => {
        files.forEach(file => {
            var fullPath = path.join(testFolder2, file);

            add_json(fullPath, testFolder2, file);
        });
    })
    callback(testFolder, testFolder2);
}

function renamefiles(testFolder, testFolder2, callback) {
    console.log('renamefiles');

    fs.readdir(testFolder, (err, files) => {
        files.forEach(file => {
            var fullPath = path.join(testFolder2, file);
            var fullPathnew = path.join(testFolder2, date_name(file));
            fs.rename(fullPath, fullPathnew, function () { });
        });
    })
    callback(testFolder, testFolder2);

}

function add_json(fullpath, folder, file) {
    var extension = path.extname(fullpath);
    var newpath = date_name(file);
    newpath = folder + newpath;  
    if (extension == '.json') {
        var theFile = require(fullpath);      

        theFile["originalName"] = file;
        theFile["originalPath"] = folder + file;
        theFile["newFileName"] = date_name(file);
        theFile["newFilePath"] = newpath;

        fs.writeFile(fullpath, JSON.stringify(theFile), function () { });

    }
    if (extension === '.txt') {
        var newtxt = '\r\n' + 'originalPath: ' + folder + '\r\n' + 'originalName: ' + file + '\r\n' + 'newPath: ' + newpath + 'newName: ' + date_name(file);
        fs.appendFile(fullpath, newtxt, function (err) {
            if (err) {
                console.log(err);
            }
            else {
                //Done
            }
        });
    }
}

function date_name(file) {
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

    var sname = parseName(file);
    var newname = sname[0] + '_edited_' + theDate + sname[1];
    return newname;

}



function parseName(filename) {
    var ext = path.extname(filename);
    var fullPath = path.join(__dirname, filename);
    var name = path.basename(fullPath, ext);
    var nameArr = [name, ext, fullPath];

    return nameArr;
}

