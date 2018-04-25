var fs = require('fs');

exports.writethefile = function(fileupload, callback) {
    var arr = getdirpath_files(fileupload);
    console.log(fileupload);

    fs.writeFile(arr.filepath, fileupload.filedata, function(err) {
        if(err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
    callback(arr);
  }

function getdirpath_files(data) {
    var rand = getRandomInt(100000000);
    var thepath = '/home/ubuntu/files/' + rand.toString() + '.csv'
    console.log(thepath);
    var newarr = {filepath: thepath, random_number: rand, userid: data.userID, filename: data.filename}
    return newarr
    //return "/Users/bryceroche/desktop/pylam/";
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}
