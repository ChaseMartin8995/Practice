
exports.get = function (event, callback, adri) {
    event = event.body;
    var rid = event.id;
    console.log('this is the rid ... ' + rid)
    console.log('in the getwebreports module.. ')
    console.log(event);
    event.clientID = new Buffer(event.clientID, 'base64');
    var output = {
        errors: [],
        info: {}
    };


    var stmt = 'CALL SP_GET_WEB_REPORTS(?);';
    var prms = [rid];
    var complete = reportInfoReceived;
    console.log('****************************');
    console.log('****** report id is ' + rid + ' ******');
    console.log('****************************');

    if (rid === '' || rid === undefined) {
        console.log('rid = undefined');
        stmt = 'CALL SP_GET_REPORT_CATALOG();';
        prms = [];
        complete = reportCatalogReceived;
    }

    function getReportInfo() {
        console.log('Pool created.');
        console.log('inside getReportInfo');
        var reportInfo = {
            name: 'reports',
            statement: stmt,
            params: prms
        };

        var queries = [
            reportInfo
        ];

        console.log(stmt);


        adri.executePooledQuery(queries, complete);
    }

    function reportCatalogReceived(errors, data, pool) {
        console.log('in reportCatalogReceived');
        //console.log(data.reports[0]);
        var lim = data.reports[0].length;
        output.catalog = [];
        output.templates = [];
        var markup = '';
        for (var i = 0; i < lim; i++) {
            output.catalog.push(data.reports[0][i].REPORT_ID);
            markup = '<div class="halfWidth-container pBG">' +
                '<div class="chart-header secHTxt">' + data.reports[0][i].REPORT_NAME + '</div>' +
                '<div class="chart-infomainTxt">' + data.reports[0][i].REPORT_DESC + '</div>' +
                '<div id="rpt-' + data.reports[0][i].REPORT_ID + '-frame" class="chart-container"></div>' +
                    '<div id="rpt-' + data.reports[0][i].REPORT_ID + '-output" class="chart-info"></div>' +
                        '</div>';

            output.templates.push(markup);
        }
        pool.end();
        console.log('getwebreports .. reportCatalogReceived..  before callback');
        callback(null, output);
    }

    function reportInfoReceived(errors, data) {
        console.log('Connection received from pool... web reports retrie                                             ved.');
        var lim = data.reports[0].length;
        var queries = [];
        var qy = {};
        var rpt = '';

        for (var i = 0; i < lim; i++) {
            rpt = data.reports[0][i];
            qy = {
                name: 'rpt-' + rid,
                statement: 'SELECT * FROM ' + rpt.REPORT_VIEW + ';',
                params: []
            };
            queries.push(qy);

            output.info['rpt-' + rid] = data.reports[0][i];
        }

        adri.executePooledQuery(queries, reportDataReceived);
    }

    function reportDataReceived(errors, data, pool) {
        output.data = data;
        console.log('reportDataReceived... getwebreports');
        pool.end();
        callback(null, output);
    }

    var params = {
        clientID: event.clientID
    };

    adri.createPool(params, getReportInfo);
};