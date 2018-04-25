var AWS = require('aws-sdk');
//var mysql = require('node_modules/mysql');
var mysql = require('mysql');
var s3 = new AWS.S3();
var fcsv = require('fast-csv');
var masterPool;
var clientPool;

function postValidation(cDetails, queries, onComplete){
        function execProcedure(cDetails){
                var conn = mysql.createConnection(cDetails);
                console.log("connecting...");
                var nQueries = queries.length;
                var qCount = 0;
                function postConnection(){
                        var output = {};
                        function procDone(err, rows){
                                if(qCount === nQueries){
                                        conn.end();
                                        if(err){
                                                throw err;
                                        }
                                        onComplete(rows);
                                }
                        }

                        for(var i = 0; i < nQueries; i++){
                                conn.query(queries[i].statement, queries[i].params, function(err, rows){
                                        var name = queries[qCount].name || qCount;
                                        qCount++;
                                        output[name] = rows;
                                        procDone(err, output);
                                });
                        }
                }

                conn.connect(function(err){
                        if (err){
                                console.error("couldn't connect",err);
                        }
                        else{
                                console.log("mysql connected");
                                postConnection();
                        }
                });
        }


        if(cDetails === 'INVALID USER'){
                var msg = {
                        type: 'error',
                        markup: '<div class="er-msg">We\'re sorry, but we were unable to locate your user ID. Please contact                                                  your company\'s recruiting administrator for assistance.</div>',
                        text: 'We\'re sorry, but we were unable to locate your user ID. Please contact your company\'s recrui                                                 ting administrator for assistance.'
                };
                onComplete(msg);
        }
        else{
                execProcedure(cDetails);
        }


}

function postAdminValidation(cDetails, queries, instance, onComplete){
        function execProcedure(cDetails){
                var conn = mysql.createConnection(cDetails);
                console.log("connecting...");
                var nQueries = queries.length;
                var qCount = 0;
                function postConnection(){
                        var output = {
                                instance: instance
                        };

                        function procDone(err, rows){
                                if(qCount === nQueries){
                                        conn.end();
                                        if(err){
                                                throw err;
                                        }
                                        onComplete(rows);
                                }
                        }

                        for(var i = 0; i < nQueries; i++){
                                conn.query(queries[i].statement, queries[i].params, function(err, rows){
                                        var name = queries[qCount].name || qCount;
                                        qCount++;
                                        output[name] = rows;
                                        procDone(err, output);
                                });
                        }
                }

                conn.connect(function(err){
                        if (err){
                                console.error("couldn't connect",err);
                        }
                        else{
                                console.log("mysql connected");
                                postConnection();
                        }
                });
        }

        if(cDetails === 'INVALID USER'){
                var msg = {
                        type: 'error',
                        markup: '<div class="er-msg">We\'re sorry, but we were unable to locate your user ID. Please contact                                                  your company\'s recruiting administrator for assistance.</div>',
                        text: 'We\'re sorry, but we were unable to locate your user ID. Please contact your company\'s recrui                                                 ting administrator for assistance.'
                };
                onComplete(msg);
        }
        else{
                execProcedure(cDetails);
        }
}

function getClientConnection(onComplete){
        clientPool.getConnection(function(err, connection) {
        onComplete(err, connection);
    });
}

function createClientPool(cDetails, onComplete){
        clientPool = mysql.createPool(cDetails);
        onComplete();
}

exports.executePooledQuery = function executePooledQuery(queries, onComplete){
        var nQueries = queries.length;
        var output = {};
        var qCount = 0;
        var qy;
        var errors = [];

        for(var i = 0; i < nQueries; i++){
                qy = queries[i];
                console.log('inside the executePooledQuery');
                //console.log(queries);


                getConn(qy, function(conn, qry){
                        conn.query(qry.statement, qry.params, function(err, rows){
                                conn.release();
                                var name = qry.name || qCount;
                                qCount++;
                                output[name] = rows;
                                procDone(err, output);
                        });
                });
        }

        function getConn(query, callback){
                getClientConnection(function(err, conn){
                        if(err){
                                conn.release();
                        }
                        else{
                                callback(conn, query);
                        }
                });
        }

        function procDone(err, rows){
                if(err){
                        errors.push(err);
                        throw err;
                }

                if(qCount === nQueries){
                        onComplete(errors,rows, clientPool);
                }
        }


};

exports.executeStoredProcedure = function executeStoredProcedure(params, storedProdecure, onComplete) {
        var cDetails = {
                host: '',
                user: '',
                password: '',
                database: '',
                multipleStatements: 'true'
        };

        function postConnection(){
                function logMainSequence(err, rows){
                        conn.end();
                        if(err){
                                throw err;
                        }
                        var rcnt = rows[0].length;

                        var cData;

                        if(rcnt > 0){
                                var cd = rows[0][0];
                                cData = {
                                        host: cd.CLIENT_DB_INSTANCE,
                                        user: cd.CLIENT_DB_CRN,
                                        password: cd.CLIENT_DB_CRP,
                                        database: cd.CLIENT_DB_NAME,
                                        multipleStatements: 'true'
                                };
                                var data = rows[0][0];
                        }
                        else{
                                cData = 'INVALID USER';
                        }

                        postValidation(cData, [storedProdecure], onComplete);
                }

                var clientData = [
                        params.clientID,
                        params.userID,
                        params.uiID
                ];

                conn.query('CALL SP_VALIDATE_CLIENT_USER(?,?,?);', clientData, logMainSequence);

        }

        var conn = mysql.createConnection(cDetails);
        console.log("connecting...");

        conn.connect(function(err){
                if (err){
                        console.error("couldn't connect",err);
                }
                else{
                        console.log("mysql connected");
                        postConnection();
                }
        });
};

exports.executeQuery = function executeQuery(params, queries, onComplete) {
        var cDetails = {
                host: '',
                user: '',
                password: '',
                database: '',
                multipleStatements: 'true'
        };

        function postConnection(){
                function logMainSequence(err, rows){
                        conn.end();
                        if(err){
                                throw err;
                        }
                        var rcnt = rows[0].length;

                        var cData;

                        if(rcnt > 0){
                                var cd = rows[0][0];
                                cData = {
                                        host: cd.CLIENT_DB_INSTANCE,
                                        user: cd.CLIENT_DB_CRN,
                                        password: cd.CLIENT_DB_CRP,
                                        database: cd.CLIENT_DB_NAME,
                                        multipleStatements: 'true'
                                };
                                var data = rows[0][0];
                        }
                        else{
                                cData = 'INVALID USER';
                        }

                        postValidation(cData, queries, onComplete);
                }

                var clientData = [
                        params.clientID,
                        params.userID,
                        params.uiID
                ];

                params.instantiateUser = params.instantiateUser || false;

                function runValidation(){
                        conn.query('CALL SP_VALIDATE_CLIENT_USER(?,?,?);', clientData, logMainSequence);
                }

                if(params.instantiateUser){
                        var lim = params.users.length;
                        var qp = [];
                        var cmd = '';
                        count = 0;
                        total = Math.ceil(lim/1000);

                        cmd = 'INSERT INTO STUFF.T_CLIENT_USERS (CLIENT_ID, USER_ID) VALUES ' + params.users.join(',') +                                                  ' ON DUPLICATE KEY UPDATE USER_ID = USER_ID;'
                        conn.query(cmd, [], runValidation);

                        function checkInserts(){
                                count++;
                                if(count === total){
                                        runValidation();
                                }
                        }

                }
                else{
                        runValidation();
                }

        }

        var conn = mysql.createConnection(cDetails);
        console.log("connecting...");

        conn.connect(function(err){
                if (err){
                        console.error("couldn't connect",err);
                }
                else{
                        console.log("mysql connected");
                        postConnection();
                }
        });
};

exports.createPool = function createPool(params, onComplete){
        var cDetails = {
                host: '',
                user: '',
                password: '',
                database: '',
                multipleStatements: 'true'
        };

        function postConnection(){
                function logMainSequence(err, rows){
                        conn.end();
                        if(err){
                                throw err;
                        }
                        var rcnt = rows[0].length;

                        var cData;
                        var instanceData;
                        if(rcnt > 0){
                                var cd = rows[0][0];
                                cData = {
                                        host: cd.CLIENT_DB_INSTANCE,
                                        user: cd.CLIENT_DB_CRN,
                                        password: cd.CLIENT_DB_CRP,
                                        database: cd.CLIENT_DB_NAME,
                                        multipleStatements: 'true'
                                };
                                var data = rows[0][0];
                                instanceData = {
                                        ui: cd.CLIENT_UI_INSTANCE,
                                        clientID: params.clientID,
                                        dbName: cd.CLIENT_DB_NAME
                                };
                        }
                        else{
                                cData = 'INVALID USER';
                        }

                        createClientPool(cData, onComplete);
                }

                var clientData = [
                        params.clientID
                ];

                conn.query('CALL SP_GET_CLIENT_CONNECTION(?);', clientData, logMainSequence);
        }

        var conn = mysql.createConnection(cDetails);
        console.log("connecting...");

        conn.connect(function(err){
                if (err){
                        console.error("couldn't connect",err);
                }
                else{
                        console.log("mysql connected");
                        postConnection();
                }
        });
}

exports.executeAdminQuery = function executeAdminQuery(params, queries, onComplete) {
        var cDetails = {
                host: '',
                user: '',
                password: '',
                database: '',
                multipleStatements: 'true',
                connectionLimit : 100,
                acquireTimeout: 1000000

        };

        function postConnection(){
                function logMainSequence(err, rows){
                        conn.end();
                        if(err){
                                throw err;
                        }
                        var rcnt = rows[0].length;

                        var cData;
                        var instanceData;
                        if(rcnt > 0){
                                var cd = rows[0][0];
                                cData = {
                                        host: cd.CLIENT_DB_INSTANCE,
                                        user: cd.CLIENT_DB_CRN,
                                        password: cd.CLIENT_DB_CRP,
                                        database: cd.CLIENT_DB_NAME,
                                        multipleStatements: 'true'
                                };
                                var data = rows[0][0];
                                instanceData = {
                                        ui: cd.CLIENT_UI_INSTANCE,
                                        clientID: params.clientID,
                                        dbName: cd.CLIENT_DB_NAME
                                };
                        }
                        else{
                                cData = 'INVALID USER';
                        }

                        postAdminValidation(cData, queries, instanceData, onComplete);
                }

                var clientData = [
                        params.clientID
                ];

                conn.query('CALL SP_GET_CLIENT_CONNECTION(?);', clientData, logMainSequence);
        }

        var conn = mysql.createConnection(cDetails);
        console.log("connecting...");

        conn.connect(function(err){
                if (err){
                        console.error("couldn't connect",err);
                }
                else{
                        console.log("mysql connected");
                        postConnection();
                }
        });
};

exports.getClientList = function getClientInfo(onComplete) {
        var cDetails = {
                host: '',
                user: '',
                password: '',
                database: '',
                multipleStatements: 'true',
                connectionLimit : 100,
                acquireTimeout: 1000000

        };

        function postConnection(){
                function logMainSequence(err, rows){
                        conn.end();
                        if(err){
                                throw err;
                        }

                        onComplete(rows[0]);
                }

                conn.query('CALL SP_GET_CLIENT_LIST();', [], logMainSequence);
        }

        var conn = mysql.createConnection(cDetails);
        console.log("connecting...");

        conn.connect(function(err){
                if (err){
                        console.error("couldn't connect",err);
                }
                else{
                        console.log("mysql connected");
                        postConnection();
                }
        });
};

exports.readS3 = function readS3(bucket, prefix, oncomplete){
        var allKeys = [];
        var csvData = [];
        var counter = {
                completed: 0,
                total: 0
        };

        function fileComplete(){
                counter.completed++;
                if(counter.completed === counter.total){
                        //csvData is the complete array of data
                        oncomplete(null, csvData);
                }
        }

        function readFiles(){
                var lim = allKeys.length;
                //oncomplete(null, allKeys);
                for(var i = 0; i < lim; i++){
                        if(allKeys[i].Size !== 0){
                                counter.total++;
                                readFile(bucket, allKeys[i].Key);
                        }
                }
        }

        function readFile(b, k){
                var params = {
                        Bucket: b,
                        Key: k
                };
                var s3Stream = s3.getObject(params).createReadStream();
                fcsv.fromStream(s3Stream,{headers: true})
                .on('data', (data) => {
                        csvData.push(data);
                })
                .on('end', (data) => {
                        fileComplete();
                });
        }

        function listAllKeys(marker)
        {
          s3.listObjects({Bucket: bucket, Prefix: prefix}, function(err, data){
                var len = data.Contents.length;
                for(var i = 0; i < len; i++){
                        allKeys.push(data.Contents[i]);
                }

                if(data.IsTruncated){
                  listAllKeys(data.NextMarker);
                }
                else{
                        //callback(null,allKeys);
                        readFiles();
                }
          });
        }

         listAllKeys(null);
};
