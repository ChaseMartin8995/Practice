function convertTime (time) {
    if (time.period.toUpperCase() === 'PM' && time.hour != '12') {
        time.hour = (+time.hour + 12);
    }
    else {
        if (time.hour == '12') {
            time.hour == '00';
        }
    }
    return time.hour + ':' + time.minutes;
}

exports.insert_db_avail = function (event, mgrid, conn) {
    var messages = {};
    var messageLog = [];
    var queuedIDs = [];
    var sendCount = 0;
    var totalMessages = 0;
    var uiid = event.uiID;
    var cliid = event.clientID;
    
    event.clientID = new Buffer(event.clientID, 'base64');
    //event.userID = new Buffer(event.userID, 'base64');
    event.uiID = new Buffer(event.uiID, 'base64');

    var params = {
        'clientID': event.clientID,
        'userID': event.userID,
        'uiID': event.uiID
    };

    var info = [
        params.userID,
        event.info.fName,
        event.info.lName,
        event.info.email,
        event.info.phone,
        event.info.location,
        event.info.defaultInterviewMinutes,
        event.info.ranking,
        event.info.lunchMinutes
    ];

    var schedules = event.availability;
    var iSch = schedules.length;
    var schedule;
    var nSch;
    var sDay;
    var schRow = [];
    var schTable = [];
    var spCall = '';
    event.info.lunchMinutes = 60;

    clear_old_rows(mgrid, conn);

    for (var i = 0; i < iSch; i++) {       
        schedule = schedules[i];
        nSch = schedule.length;
        for (var n = 0; n < nSch; n++) {
            sDay = schedule[n];
            console.log(sDay.schedule.starttime.hour);
            sDay.schedule.starttime.hour = sDay.schedule.starttime.hour || '1';
            if (sDay.schedule.starttime.hour === '1' && sDay.schedule.starttime.period === 'AM') {
                sDay.schedule.starttime.hour = '10';
                sDay.schedule.starttime.minutes = '00';
                sDay.schedule.starttime.period = 'AM';
            }

            sDay.schedule.endtime.hour = sDay.schedule.endtime.hour || '1';
            if (sDay.schedule.endtime.hour === '1' && sDay.schedule.endtime.period === 'AM') {
                sDay.schedule.endtime.hour = '4';
                sDay.schedule.endtime.minutes = '00';
                sDay.schedule.endtime.period = 'PM';
            }

            sRow = [
                mgrid,
                sDay.day,
                convertTime(sDay.schedule.starttime),
                convertTime(sDay.schedule.endtime),
                event.info.defaultInterviewMinutes,
                event.info.ranking,
                convertTime(sDay.schedule.lunchstart),
                event.info.lunchMinutes
            ];
            schTable.push(sRow);
            insert_one_row(sRow, conn);
        }
    }
    return schTable;
};


function insert_one_row(d, conn){

  console.log(d);

  var sql = conn.query('call sp_set_hours(?,?,?,?,?,?,?,?)', [d[0], d[1], d[2], d[3], d[4], d[5], d[6], d[7]], function (error, results) {

  if (error) {
      console.log('insert_one_row failed');
      return console.error(error.message);
  }
  });
}


function clear_old_rows(d, conn){

  console.log(d);

  var sql = conn.query('call sp_avail_clear(?)', [d], function (error, results) {

  if (error) {
      console.log('clear_old_rows failed');
      return console.error(error.message);
  }
  });
}

