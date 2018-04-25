//TESTING TO SEE IF PYTHON CAN BE INJECTED INTO NODE

exports.py_main_cb = function (data, callback) {
    var spawn = require("child_process").spawn;
    console.log('py_main_cb', data);
    var pythonProcess = spawn('python', data);

    pythonProcess.stdout.on('data', function (data) {
        console.log('py_main_cb return');
        console.log(data.toString('utf8'));
        callback(data);
    });
}

exports.py_main_cb_pt = function (data, callback, data2) {
    var spawn = require("child_process").spawn;
    console.log('py_main_cb', data);
    var pythonProcess = spawn('python', data);

    pythonProcess.stdout.on('data', function (data) {
        console.log('py_main_cb return');
        console.log(data.toString('utf8'));
        callback(data, data2);
    });
}
