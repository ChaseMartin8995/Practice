
String.prototype.toPhone = function () {
    return this.replace(/(\d\d\d)(\d\d\d)(\d\d\d\d)/, '$1-$2-$3');
};

window.constants = {
    interview: {// Mark
        id: 'QURSSTAwMDItNTIyNzY1LVI1NTM0',
        user: 'MTAwMjA4MDI=',
        client: 'UkJTREVNTzIwMTcwODE4',
        ui: 'aHR0cHM6Ly9zMy11cy13ZXN0LTIuYW1hem9uYXdzLmNvbS93d3cucmVjcnVpdGluZy5hZHJpLXN5cy5jb20v'
    },
    urls: {
        getTimeSlots: appconfig.api.base + '/' + appconfig.api.stage + '/getTimeSlots',
        addTimeSlot: appconfig.api.base + '/' + appconfig.api.stage + '/addTimeSlot',
        getInterview: appconfig.api.base + '/' + appconfig.api.stage + '/GetInterviewDetails',
        addInterview: appconfig.api.base + '/' + appconfig.api.stage + '/AddEvent',
        validateUser: appconfig.api.base + '/' + appconfig.api.stage + '/validateUser',
        getUsers: appconfig.api.base + '/' + appconfig.api.stage + '/getUsers',
        deleteTimeSlot: appconfig.api.base + '/' + appconfig.api.stage + '/deleteTimeslot',
        deleteUser: appconfig.api.base + '/' + appconfig.api.stage + '/deleteUser',
        addUsers: appconfig.api.base + '/' + appconfig.api.stage + '/addUsers',
        getUnscheduledInterviews: appconfig.api.base + '/' + appconfig.api.stage + '/getInterviews',
        getInterviewsDate: appconfig.api.base + '/' + appconfig.api.stage + '/getInterviewsDate',
        getPositions: appconfig.api.base + '/' + appconfig.api.stage + '/getPositions',
        addPosition: appconfig.api.base + '/' + appconfig.api.stage + '/addPosition',
        getUserTimeSlots: appconfig.api.base + '/' + appconfig.api.stage + '/getAvailabilityUser',
        notifyUser: appconfig.api.base + '/' + appconfig.api.stage + '/NotifyUser',
        persistentAvailability: appconfig.api.base + '/' + appconfig.api.stage + '/updatePersistentUserInfo',
        optout: appconfig.api.base + '/' + appconfig.api.stage + '/optOut',
        uploadFile: appconfig.api.base + '/' + appconfig.api.stage + '/uploadFile',
        removeReq: appconfig.api.base + '/' + appconfig.api.stage + '/removeReq'
    },
    messages: {

    }
};

window.adri = (function () {

    function ADRITime(d, h, m, p, s) {
        this.interviewID = constants.interview.id;
        this.userID = adri.interview.scheduling.userID;
        this.date = d;
        this.hour = h;
        this.minute = m;
        this.period = p;
        this.status = s;
    }

    function APITimeSlot(timeslot) {
        this.interviewID = timeslot.interviewID;
        this.userID = timeslot.userID;
        this.status = timeslot.status;

        var ts = +timeslot.hour;
        if (timeslot.period.toLowerCase() == 'pm' && timeslot.hour != 12) {
            ts += 12;
        }
        else if (timeslot.period.toLowerCase() == 'am' && timeslot.hour == 12) {
            ts = '00';
        }
        ts = '' + ts + ':' + timeslot.minute + ':00';
        ts = timeslot.date + ' ' + ts;

        this.timeSlot = ts;
        this.clientID = constants.interview.client;
        this.uiID = constants.interview.ui;

    }

    function APITimeInstance(timeslot) {
        this.interviewID = timeslot.interviewID;
        this.userID = timeslot.userID;
        this.status = timeslot.status;
        var inst = timeslot.schedule.starttime;
        inst.hour = +inst.hour;

        if (inst.period.toLowerCase() == 'pm' && inst.hour != 12) {
            inst.hour += 12;
        }
        else if (inst.period.toLowerCase() == 'am' && inst.hour == 12) {
            inst.hour = '00';
        }

        var ts = timeslot.date + ' ' + inst.hour + ':' + inst.minutes + ':00';

        this.timeSlot = ts;
        this.clientID = constants.interview.client;
        this.uiID = constants.interview.ui;

    }

    function timePeriod(h, m, p) {
        this.hour = h || '7';
        this.minutes = m || '00';
        this.period = p || 'AM';
    }

    function ADRIBlock() {
        this.startTime = new timePeriod();
        this.endTime = new timePeriod();
        this.lunchTime = new timePeriod();
    }

    function BlockDay(d) {
        this.day = d || '';
        this.schedule = new ADRIBlock();
    }

    function BlockDate(d) {
        this.date = d || '';
        this.schedule = new ADRIBlock();
    }

    function DDOption(value, text) {
        text = text || value;
        return '<option value="' + value + '">' + text + '</option>';
    }

    function DDSelectedOption(value, text) {
        text = text || value;
        return '<option selected="selected" value="' + value + '">' + text + '</option>';
    }

    var adri = {
        data: {},
        colors: ['#FFD555', '#6764E6', '#FFB955', '#348CD5', '#6416C6', '#1172C2', '#FFF156', '#07589C'],
        tcolors: ['#6764E6', '#348CD5', '#6416C6', '#1172C2', '#07589C'],
        id: '',
        init: function () {
            adri.ui.loader(true, "dynamic-content-loader");
            adri.util.getURLParams();
            adri.ui.zone();
            adri.ui.nav.setup();
            adri.ui.dashboard.open();
        },
        error: {
            noParams: function () {
                $('#adri-ras-content').html('Sorry, but we couldn\'t find your information. Please try clicking your invitation link again.');
            }
        },
        ui: {
            selectedDate: '',
            labels: {
                data: {
                    ths: '',
                    id: '',
                    height: '',
                    width: '',
                    mheight: '',
                    mwidth: '',
                    delay: 500
                },
                initLabels: function () {
                    $(document).ready(function () {

                        //$(document).tooltip();
                    });
                }
            },
            settings: {
                setupReq: function () {
                    adri.ui.selected('dashboard-sub-icon4', 'control-sub-label-act');
                    var $Content = $('.ui-content-body');
                    var iCard = '<div id="db-weekly-view" class="centered dashMain-title">' +
                        '<div style="margin-left:0;" class="dashboard-header-block"><div class="dashboard-header-text">Positions Overview</div></div>' +
                        '</div>' +
                        '<div id="db-scheduling" class="dashboard-scheduling">' +
                        '<div id="scheduled-interviews-container" class="fullWidth-container ">' +
                        '<div id="interviews-table"></div>' +
                        '</div>' +
                        '</div>' +
                        '<div id="modal-form" class="modal-form"></div>' +
                        '<div id="smallModal" class="modal-small"></div>' +
                        '<div id="largeModal" class="modal-large"><div class="modal-header-wrap" id="modalLargeHeader"></div><div style="display:table" id="modalLargeBody"></div></div>' +
                        '<div id="modal-bg-overlay" class="modal-overlay" onclick="adri.timeslot.removeControls();"></div>' +
                        '<div id="small-modal-bg-overlay" class="modal-overlay" onclick="adri.ui.modal.small.close();"></div>' +
                        '<div id="error-modal" class="modal">' +
                        '<div id="availError" class="modal-content">' +
                        '<button id="closeModal" class="close-modal" onclick="adri.ui.modal.error.close();">&times;</button>' +
                        '</div>' +
                        '</div>';
                    $Content.html(iCard);
                },
                setupCandidates: function () {
                    var $Content = $('.ui-content-body');
                    var $header = $('db-weekly-view');
                    var iCard = '<div id="db-weekly-view" class="dashMain-title">' +
                        '<div class="dashboard-header-block"><div class="dashboard-header-text"></div></div>' +
                        '</div>' +
                        '<div id="db-scheduling" class="dashboard-scheduling">' +
                        '<div id="scheduled-interviews-container" class="fullWidth-container ">' +
                        '<div id="interviews"><div id="interviews-table" class="ui-table spanned"></div></div>' +
                        '</div>' +
                        '</div>' +
                        '<div id="modal-form" class="modal-form"></div>' +
                        '<div id="smallModal" class="modal-small"></div>' +
                        '<div id="largeModal" class="modal-large"><div class="modal-header-wrap" id="modalLargeHeader"></div><div style="display:table" id="modalLargeBody"></div></div>' +
                        '<div id="modal-bg-overlay" class="modal-overlay" onclick="adri.timeslot.removeControls();"></div>' +
                        '<div id="small-modal-bg-overlay" class="modal-overlay" onclick="adri.ui.modal.small.close();"></div>' +
                        '<div id="error-modal" class="modal">' +
                        '<div id="availError" class="modal-content">' +
                        '<button id="closeModal" class="close-modal" onclick="adri.ui.modal.error.close();">&times;</button>' +
                        '</div>' +
                        '</div>';
                    $Content.html(iCard);
                    adri.ui.dashboard.getUnscheduledInterviews();
                },
                addPositions: function () {
                    adri.ui.selected('dashboard-sub-icon1', 'control-sub-label-act');
                    var db = adri.ui.dashboard;

                    var $Content = $('.ui-content-body');
                    var iCard = '<div id="db-weekly-view" class="centered dashMain-title">' +
                        '<div style="margin-left:0;" class="dashboard-header-block"><div class="dashboard-header-text">Add Position</div></div>' +
                        '</div>' +
                        '<div id="db-scheduling" class="dashboard-scheduling">' +
                        '<div id="scheduled-interviews-container" class="fullWidth-container ">' +
                        '<div id="position-pool"></div>' +
                        '</div>' +
                        '</div>';
                    $Content.html(iCard);
                    adri.ui.dashboard.addPosition();
                    var $options = $('#scheduled-interviews-container');
                    var control = '<div class="spacer"></div><div class="spacer"></div>' +
                        //'<button onclick="adri.ui.dashboard.addPosition();" class="button thin hlBG negTxt"><span>ADD POSITION</span></button>' +
                        '<button class="bigButton mainBG negTxt ckable" onclick="adri.ui.submitPosition(adri.ui.dashboard.refreshPool)">SUBMIT</button>';
                    //TEMP '<button class="bigButton mainBG negTxt ckable" onclick="adri.ui.submitPosition(adri.ui.dashboard.refreshPool)">SUBMIT</button>';

                    $options.append(control);
                },
                openReqs: function () {
                    var db = adri.ui.dashboard;
                    adri.ui.loader(true, "dynamic-content-loader");
                    adri.ui.settings.setupReq();
                    db.getPositions(function (data) {
                        db.drawPositionPool(data);
                    });
                },
                addCandidates: function () {
                    adri.ui.loader(true, "dynamic-content-loader");
                    adri.ui.selected('dashboard-sub-icon7', 'control-sub-label-act');
                    var db = adri.ui.dashboard;
                    db.getPositions('', function () {

                        var $Content = $('.ui-content-body');

                        var iCard = '<div id="db-weekly-view" class="centered dashMain-title">' +
                            '<div style="margin-left:0;" class="dashboard-header-block"><div class="dashboard-header-text">Add Candidate</div></div>' +
                            '</div>' +
                            '<div id="db-scheduling" class="dashboard-scheduling">' +
                            '<div id="scheduled-interviews-container" class="fullWidth-container ">' +
                            '<div id="position-pool"></div>' +
                            '</div>' +
                            '</div>';
                        $Content.html(iCard);
                        adri.ui.addCandidateForm();
                        var $options = $('#scheduled-interviews-container');
                        var control = '<div class="spacer"></div><div class="spacer"></div>' +
                            '<button onclick="adri.ui.addCandidateForm();" class="button thin hlBG negTxt"><span>ADD CANDIDATE</span></button>' +
                            '<button class="bigButton mainBG negTxt ckable" onclick="adri.ui.submitCandidates(adri.ui.dashboard.refreshPool)">SUBMIT</button>';

                        $options.append(control);
                        adri.ui.loader(false, "dynamic-content-loader");
                    });

                },
                addManagers: function () {
                    adri.ui.selected('dashboard-sub-icon3', 'control-sub-label-act');
                    var db = adri.ui.dashboard;
                    var $Content = $('.ui-content-body');

                    var iCard = '<div id="db-weekly-view" class="centered dashMain-title">' +
                        '<div style="margin-left:0;" class="dashboard-header-block"><div class="dashboard-header-text">Add Manager</div></div>' +
                        '</div>' +
                        '<div id="db-scheduling" class="dashboard-scheduling">' +
                        '<div id="scheduled-interviews-container" class="fullWidth-container ">' +
                        '<div id="position-pool"></div>' +
                        '</div>' +
                        '</div>';
                    $Content.html(iCard);
                    adri.ui.addManagerForm();
                    var $options = $('#scheduled-interviews-container');
                    var control = '<div class="spacer"></div><div class="spacer"></div>' +
                        '<button onclick="adri.ui.addManagerForm();" class="button thin hlBG negTxt"><span>ADD MANAGER</span></button>' +
                        '<button class="bigButton mainBG negTxt ckable" onclick="adri.ui.submitPosition(adri.ui.dashboard.refreshPool)">SUBMIT</button>';

                    $options.append(control);
                },
                addRecruiters: function () {
                    adri.ui.selected('dashboard-sub-icon2', 'control-sub-label-act');
                    var db = adri.ui.dashboard;
                    var $Content = $('.ui-content-body');

                    var iCard = '<div id="db-weekly-view" class="centered dashMain-title">' +
                        '<div style="margin-left:0;" class="dashboard-header-block"><div class="dashboard-header-text">Add Recruiter</div></div>' +
                        '</div>' +
                        '<div id="db-scheduling" class="dashboard-scheduling">' +
                        '<div id="scheduled-interviews-container" class="fullWidth-container ">' +
                        '<div id="position-pool"></div>' +
                        '</div>' +
                        '</div>';
                    $Content.html(iCard);
                    adri.ui.addRecruiterForm();
                    var $options = $('#scheduled-interviews-container');
                    var control = '<div class="spacer"></div><div class="spacer"></div>' +
                        '<button onclick="adri.ui.addRecruiterForm();" class="button thin hlBG negTxt"><span>ADD RECRUITER</span></button>' +
                        '<button class="bigButton mainBG negTxt ckable" onclick="adri.ui.submitRecruiters(adri.ui.dashboard.refreshPool)">SUBMIT</button>';

                    $options.append(control);
                },
                notifyCandidates: function (data) {
                    var dInfo = data.dataMain;
                    console.log('Top data', data);
                    data = data.results[0];
                    var $tab = $('.ui-content-body');
                    $tab.html('');

                    var header = '<div id="db-weekly-view" class="centered dashMain-title">' +
                        '<div style="margin-left:0;" class="dashboard-header-block"><div class="dashboard-header-text">Select notification.</div></div>' +
                        '</div>';
                    $tab.html(header);

                    var lim = data.length;

                    var dtlBar = '';
                    var canName = '';
                    var phone = '';
                    var fullName = '';
                    var rowColors = adri.colors;
                    console.log('email data', data);
                    for (var i = 0; i < lim; i++) {

                        var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                        var rowID = 'emailNum' + i;
                        // random_number template
                        dtlBar = '<li title="Select the message you wish to send." class="block email-subject-text">' + data[i].subject + '</li>' +
                            '<li title="Select the message you wish to send." class="block email-body-text">' + data[i].clean_msg + '</li>';
                        $tab.append('<div class="ui-row-spacer-main"></div><ul onclick="adri.ui.settings.checkMsgType(\'' + data[i].clean_msg + '\',\'' + data[i].subject + '\',' + data[i].templateid + ', ' + dInfo.random_number + ');" id="' + rowID + '" class="email-row-wrap">' + dtlBar + '</ul>');
                        console.log($('#' + rowID));
                        $('#' + rowID).css('border-left', '3px solid ' + getRandomColor);
                        $('#' + rowID).hover(function () {
                            $(this).css('border-left-width', '6px');
                        }, function () {
                            $(this).css('border-left-width', '3px');
                        });
                    }

                    $('.selAll').on('click', function () {
                        $(this).select();
                    });

                    adri.ui.loader(false, "dynamic-content-loader");
                },
                checkMsgType: function (msg, subject, tempid, batchid) {

                    var choices = {
                        email: false,
                        sns: false,
                        msg: msg,
                        subject: subject,
                        tempid: tempid,
                        batchid: batchid
                    };
                    var chkbox = '<div style="margin-top: 10%; width:100%; text-align: center;"><p style="display: inline-block; font-size:18pt" class="ui-cell-pad">' +
                        '<input style="display: block;" type="checkbox" id="chkEmail" ></>' +
                        '<label for="chkEmail">SEND EMAIL</label>' +
                        '</p>' +
                        '<p style="display: inline-block; font-size:18pt" class="ui-cell-pad">' +
                        '<input style="display: block;" type="checkbox" id="chkSNS" ></>' +
                        '<label for="chkSNS">SEND SMS</label>' +
                        '</p></div>' +
                        '<div style="width:100%; text-align: center;"><div style="float:none; margin-top: 8px; margin-right: 15px;" class="modal-controls"><div id="cancel" class="cancelButton"></div></div>' +
                        '<div style="margin-top: 8px; float:none;" class="modal-controls"><div id="confirm" class="submitButton"></div></div></div>';

                    adri.ui.modal.large.open(chkbox);

                    $('input[id=chkEmail]').change(
                        function () {
                            if (this.checked) {
                                choices.email = true;
                            }
                            else {
                                choices.email = false;
                            }
                        });
                    $('input[id=chkSNS]').change(
                        function () {
                            if (this.checked) {
                                choices.sns = true;
                            }
                            else {
                                choices.sns = false;
                            }
                        });

                    adri.util.btns.confirmationBtns('confirm', 'cancel', adri.ui.settings.sendEmail, choices, adri.util.uploaderNew.open);
                },
                sendEmail: function (args) {
                    var message = args.msg;
                    var subject = args.subject;
                    console.log('args', args);
                    $('.ui-content-body').html('');
                    adri.ui.modal.error.open('Message Sent!');

                    if (args.email === true) {
                        console.log('firing email');
                        var message = {
                            templateid: args.tempid,
                            batchid: args.batchid
                        };

                    }
                    if (args.sns === true) {
                        console.log('firing SMS');
                        var message = {
                            templateid: args.tempid,
                            batchid: args.batchid
                        };

                    }
                    adri.ui.settings.setupCandidates();
                },
            },
            zone: function () {
                //Mark: Removed splash class/id and added the control-ribbon element. Also changed it to update the adri-ras-content id instead of the core-content id.
                var elid = "dynamic-content-loader";
                var zones = '<div id="adri-ras-content" class="content-area mainScroller">' +
                    '<div class="ui-zone-tabular">' +
                    '<div class="ui-zone-row">' +
                    '<div id="left-nav" class="control-ribbon"></div>' +
                    '<div id="dynamic-content-area" class="ui-content-slide"></div>' +
                    '<div id=' + elid + ' class="loaderContainer"></div>' +
                    '</div>' +
                    '</div>' +
                    //'<div id="core-content" class="dynamicContent" style="display: block;"></div>' +
                    '</div>';


                $('body').html(zones);
            },
            selected: function (id, cl) {
                cl = cl || '';
                $('.' + cl).removeClass(cl);
                $('#' + id).toggleClass(cl);
            },
            nav: {
                reset: function () {
                    adri.ui.nav.template.idcount = {
                        main: 0,
                        sub: 0
                    };
                },
                setup: function () {
                    var nav = '';
                    var menu = [ //<i class="material-icons">&#xE8B6;</i>
                        { adr: '', txt: '', type: 'lLogo', icon: '' },
                        { adr: 'adri.init();', txt: 'Dashboard', type: 'dashBtn', icon: '&#xE7FB;' },
                        { adr: 'adri.ui.nav.actionsSetup();', txt: 'Actions', type: 'dashBtn', icon: '&#xE3C9;' },
                        { adr: 'adri.ui.modal.open();', txt: 'Edit Availability', type: 'dashBtn', icon: '&#xE8F9;' },
                        { adr: 'adri.ui.nav.reportsSetup();', txt: 'Reports', type: 'dashBtn', icon: '&#xE8F9;' },
                        { adr: 'adri.ui.nav.searchSetup();', txt: 'Search', type: 'dashBtn', icon: '&#xE8B6;' }
                    ];

                    var lim = menu.length;
                    for (var i = 0; i < lim; i++) {
                        nav = nav + adri.ui.nav.template[menu[i].type](menu[i].txt, menu[i].adr, menu[i].icon);
                    }
                    $('#rpts-widget').attr('onclick', 'adri.ui.nav.open(\'' + atob(constants.interview.ui) + 'reports.html?cliid=' + constants.interview.client + '\');');
                    $('#left-nav').html(nav);
                    adri.ui.labels.data.height = document.documentElement.clientHeight;
                    adri.ui.labels.data.width = document.documentElement.clientWidth;
                    $('#dashboard-icon1').toggleClass('control-wrap-act');
                    adri.ui.nav.template.idcount.main = 0;
                    adri.ui.nav.template.idcount.sub = 0;
                },
                actionsSetup: function () {
                    adri.ui.nav.reset();
                    var nav = '';
                    var menu = [
                        { txt: 'Recruiters', type: 'subHeader' },
                        { adr: 'adri.ui.actions.positions.getAssociatedRecruiters();', txt: 'Overview', type: 'dashSubBtn' },
                        { adr: 'adri.ui.settings.addRecruiters();', txt: 'Add Recruiters', type: 'dashSubBtn' },
                        { type: 'subSpacer' },
                        { txt: 'Hiring Managers', type: 'subHeader' },
                        { adr: 'adri.ui.nav.searchSetup();', txt: 'Add Hiring Managers', type: 'dashSubBtn' },
                        { type: 'subSpacer' },
                        { txt: 'Positions', type: 'subHeader' },
                        { adr: 'adri.ui.settings.openReqs();', txt: 'Overview', type: 'dashSubBtn' },
                        { adr: 'adri.ui.settings.addPositions();', txt: 'Add Positions', type: 'dashSubBtn' },
                        { type: 'subSpacer' },
                        { txt: 'Candidates', type: 'subHeader' },
                        { adr: 'adri.ui.settings.setupCandidates();', txt: 'Overview', type: 'dashSubBtn' },
                        { adr: 'adri.ui.settings.addCandidates();', txt: 'Add Candidates', type: 'dashSubBtn' },
                        { adr: 'adri.util.uploaderNew.open();', txt: 'Upload Candidates', type: 'dashSubBtn' },
                        { type: 'subSpacer' },
                        { txt: 'Template Library', type: 'subHeader' },
                        { adr: 'adri.ui.nav.searchSetup();', txt: 'Add New Messages', type: 'dashSubBtn' },
                        { adr: 'adri.ui.actions.messages.getCandidateMsgs();', txt: 'Candidate Messages', type: 'dashSubBtn' },
                        { adr: 'adri.ui.actions.messages.getRecruiterMsgs();', txt: 'Recruiter Messages', type: 'dashSubBtn' },
                        { adr: 'adri.ui.actions.messages.getManagerMsgs();', txt: 'Manager Messages', type: 'dashSubBtn' },
                        { type: 'subSpacer' },
                        { txt: 'Settings', type: 'subHeader' },
                        { adr: 'adri.ui.nav.searchSetup();', txt: 'Roles and Access', type: 'dashSubBtn' },
                    ];

                    var lim = menu.length;
                    for (var i = 0; i < lim; i++) {
                        nav = nav + adri.ui.nav.template[menu[i].type](menu[i].txt, menu[i].adr, menu[i].icon);
                    }
                    $('#contentRibbon').html(nav);
                    adri.ui.actions.positions.getAssociatedRecruiters();
                    adri.ui.selected('dashboard-sub-icon1', 'control-sub-label-act');
                },
                reportsSetup: function () {
                    adri.ui.nav.reset();
                    var nav = '';
                    var menu = [
                        { txt: 'Reports', type: 'subHeader' },
                        { adr: 'adri.ui.dashboard.reports.open();', txt: 'Interactions', type: 'dashSubBtn' },
                        { adr: 'adri.ui.nav.open(\'' + atob(constants.interview.ui) + 'reports.html?cliid=' + constants.interview.client + '\');', txt: 'My Reports', type: 'dashSubBtn' }
                    ];

                    var lim = menu.length;
                    for (var i = 0; i < lim; i++) {
                        nav = nav + adri.ui.nav.template[menu[i].type](menu[i].txt, menu[i].adr, menu[i].icon);
                    }
                    $('#contentRibbon').html(nav);
                    adri.ui.dashboard.reports.open();
                },
                searchSetup: function () {
                    adri.ui.modal.error.open('Coming Soon!');
                },
                template: {
                    idcount: {
                        main: 0,
                        sub: 0
                    },
                    dashBtn: function (txt, adr, icon) {
                        adri.ui.nav.template.idcount.main++;
                        var count = adri.ui.nav.template.idcount.main;
                        var theid = 'dashboard-icon' + count;
                        var cl = 'control-wrap-act';
                        var clk = 'adri.ui.selected(\'' + theid + '\', \'' + cl + '\');';
                        return '<div onclick="' + adr + clk + '" id="' + theid + '" class="control-wrap">' +
                            '<div class="control-button">' +
                            '<i class="material-icons">' + icon + '</i>' +
                            '</div>' +
                            '<div class="control-label">' + txt + '</div>' +
                            '</div>';
                    },
                    dashSubBtn: function (txt, adr, icon) {
                        adri.ui.nav.template.idcount.sub++;
                        var count = adri.ui.nav.template.idcount.sub;
                        var theid = 'dashboard-sub-icon' + count;
                        var cl = 'control-sub-label-act';
                        var clk = 'adri.ui.selected(\'' + theid + '\', \'' + cl + '\');';
                        return '<div onclick="' + adr + clk + '" class="control-sub-wrap">' +
                            '<div id="' + theid + '" class="control-sub-label"><span>' + txt + '</span></div>' +
                            '</div>';
                    },
                    subHeader: function (txt) {
                        return '<div class="subHeader">' + txt + '</div>';
                    },
                    subSpacer: function (txt) {
                        return '<div class="spacer"></div>';
                    },
                    lLogo: function (txt, adr, icon) {
                        return '<div class="companyLogo">A<div class="logo-dot"></div> </div>';
                    },
                    link: function (txt, adr) {
                        return '<div class="ckablef maintxt offset-l small-pad" onclick="' + adr + '">' + txt + '</div>';
                    },
                    linkHeader: function (txt, adr) {
                        return '<div class="ckablef maintxt med-pad" onclick="' + adr + '">' + txt + '</div>';
                    },
                    staticHeader: function (txt, adr) {
                        return '<div class="infoTxt med-pad">' + txt + '</div>';
                    }
                },
                open: function (url) {
                    var win = window.open(url, '_blank');
                    win.focus();
                }
            },
            initialize: function () {
                adri.user.validate(adri.ui.checkUser);
                /*
                adri.interview.getUsers(function (data) {
                    adri.interview.loadToUI(data);
                    adri.interview.addUserNodes(data);
                    adri.ui.availability.get(function (data) {
                        adri.ui.availability.drawUserTimes(data);
                    });
                });
                */
            },
            checkUser: function (user) {
                user = {
                    role: 'Recruiter',
                    name: 'Support'
                };
                var welcome = 'Welcome, ' + user.firstName + ' ' + user.lastName + '!';
                $('#welcome-box').html(welcome);
                adri.ui.route[user.role](user);
            },
            route: {
                'Recruiter': function (user) {
                    adri.interview.getUsers(function (data) {
                        adri.interview.loadToUI(data);
                        adri.interview.addUserNodes(data);
                        adri.ui.availability.get(function (data) {
                            adri.ui.availability.drawUserTimes(data);
                        });
                    });
                },
                'Candidate': function (user) {

                },
                'Interviewer': function (user) {
                    adri.interview.get(function (data) {

                        adri.interview.loadToUI(data);
                        adri.interview.getUsers(function (data) {
                            adri.interview.addUserNodes(data);
                            adri.ui.availability.get(function (data) {
                                adri.ui.availability.drawUserTimes(data);
                            });
                        });
                    });
                },
                'INVALID': function () {

                }
            },
            dashboard: {
                range: {
                    begin: '',
                    end: 0
                },
                open: function () {
                    adri.user.validate(adri.ui.dashboard.checkUser);
                },
                checkUser: function (user) {
                    //Mark: Manually entering the user. Need to remove when beginning to test. 
                    user = {
                        role: 'Recruiter',
                        name: 'Support'
                    };
                    var welcome = 'Welcome, ' + user.firstName + ' ' + user.lastName + '!';
                    $('#welcome-box').html(welcome);
                    adri.ui.dashboard.route[user.role](user);
                },
                route: {
                    'Recruiter': function (user) {

                        var db = adri.ui.dashboard;

                        db.setup();
                        $('.dynamicContent').fadeIn('fast');

                        db.getPositions(function (data) {
                            db.setPositionFilters(data);
                        });

                        db.getInterviews(function (data) {
                            data = [{
                                CANDIDATE_EMAIL: "bryce.roche@gmail.com",
                                CANDIDATE_ID: "ADRI0002",
                                CANDIDATE_PHONE: "",
                                C_FNAME: "Bruce",
                                C_LNAME: "Roushe",
                                FULL_NAME: "Bruce Roushe",
                                INTERVIEW_REFERENCE_ID: "ADRI0002-522765-R5534",
                                POSITION_ID: "R5534",
                                POSITION_NAME: "Customer Service - Personal Banker - Penicuik - 9 Month Fixed Term Contract - Part Time",
                                ROW_ID: 37,
                                USER_EMAIL: "support@adri-sys.com",
                                USER_FNAME: "Adri-sys",
                                USER_ID: "10020802",
                                USER_LNAME: "Support",
                                USER_PHONE: "",
                                TIME_SLOT: "9:45am",
                                USER_ROLE: "Interviewer"
                            },
                            {
                                CANDIDATE_EMAIL: "bryce.roche@gmail.com",
                                CANDIDATE_ID: "ADRI0002",
                                CANDIDATE_PHONE: "",
                                C_FNAME: "Bruce",
                                C_LNAME: "Roushe",
                                FULL_NAME: "Bruce Roushe",
                                INTERVIEW_REFERENCE_ID: "ADRI0002-522765-R5534",
                                POSITION_ID: "R5534",
                                POSITION_NAME: "Customer Service - Personal Banker - Penicuik - 9 Month Fixed Term Contract - Part Time",
                                ROW_ID: 590,
                                USER_EMAIL: "support@adri-sys.com",
                                USER_FNAME: "Adri-sys",
                                USER_ID: "10020802",
                                USER_LNAME: "Support",
                                USER_PHONE: "",
                                TIME_SLOT: "2:30pm",
                                USER_ROLE: "Interviewer"
                            }];
                            db.drawInterviews(data);
                        });
                        var elid = "dynamic-content-loader";
                        adri.ui.loader(false, elid);
                    },
                    'Candidate': function (user) {

                    },
                    'Interviewer': function (user) {
                        var db = adri.ui.dashboard;

                        db.setup();
                        //$('.dynamicContent').fadeIn('fast');

                        db.getPositions(function (data) {
                            db.setPositionFilters(data);
                        });

                        db.getInterviews(function (data) { //MARK DELETE
                            db.drawInterviews(data);
                        });
                    },
                    'INVALID': function () {

                    }
                },
                deleteUser: function (id, interviewID) {
                    var db = adri.ui.dashboard;

                    $('#loader-' + id).html('<div class="centered vCenter">Removing...</div>');
                    $('#loader-' + id).stop();
                    $('#loader-' + id).fadeIn(50);

                    var jsData = {
                        id: id,
                        clientID: constants.interview.client,
                        userID: constants.interview.user,
                        uiID: constants.interview.ui,
                        interviewID: btoa(interviewID)
                    };

                    $.ajax({
                        type: "POST",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.deleteUser,
                        data: JSON.stringify(jsData),
                        success: function (data) {
                            db.getUnscheduledInterviews(function (data) {
                                db.drawUnscheduledInterviews(data);
                            });
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                setup: function () {
                    /*Mark: Added the .loadNew function to invoke automatically as part of the chain. 
                    Changes had to be made to .load for the new calendar on the left-hand side of dashboard.
                    Unscheduled-interviews-container has been removed from this view. Moved the day range display to 
					the frameWeeklyView function in order for it to display further up.*/
                    $('#page-title').html('Scheduling Dashboard');
                    var $el = $('#dynamic-content-area');
                    var wkDate = new Date();
                    var getUnscheduled = function (data) {
                        adri.ui.dashboard.drawUnscheduledInterviews(data);
                    };

                    var dash = '<div id="contentRibbon" class="ui-content-ribbon subScroller">' +
                        '<div id="availabilityView" class="timeContainerSmall"></div>' +
                        '</div>' +
                        '<div id="modal-form" class="modal-form"></div>' +
                        '<div id="smallModal" class="modal-small"></div>' +
                        '<div id="largeModal" class="modal-large"><div class="modal-header-wrap" id="modalLargeHeader"></div><div style="display:table" id="modalLargeBody"></div></div>' +
                        '<div id="modal-bg-overlay" class="modal-overlay" onclick="adri.timeslot.removeControls();"></div>' +
                        '<div id="small-modal-bg-overlay" class="modal-overlay" onclick="adri.ui.modal.small.close();"></div>' +
                        '<div id="error-modal" class="modal">' +
                        '<div id="availError" class="modal-content">' +
                        '<button id="closeModal" class="close-modal" onclick="adri.ui.modal.error.close();">&times;</button>' +
                        '</div>' +
                        '</div>' +
                        '<div class="ui-content-body">' +
                        '<div id="db-weekly-view" class="dashMain-title">' +
                        '<button id="toggleScheduled" class="mediumClear" title="Check your unscheduled prospects" onclick="adri.ui.dashboard.getUnscheduledInterviews(' + getUnscheduled + ');"></button>' +
                        '<div class="lineSpacer"></div>' +
                        adri.util.controls.calendarSmall.drawWeeklyView(wkDate) +
                        '<button onclick="adri.util.getURLParams();" title="Refresh" class="refresh-button">&#xE5D5;</button>' +
                        '</div>' +
                        '<div id="db-scheduling" class="dashboard-scheduling">' +
                        '<div id="scheduled-interviews-container" class="fullWidth-container ">' +
                        '<div id="interviews"></div>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    $el.html(dash);
                    adri.ui.time.loadNew('contentRibbon');
                },
                dateReset: {
                    scheduled: function () {
                        var db = adri.ui.dashboard;
                        db.getInterviews(function (data) {
                            $('#sch-selected-date').html('Next 7 Days');
                            db.drawInterviews(data);
                            db.drawInterviewsForDate(data);
                        });
                    }
                },
                filter: {
                    scheduled: function () {
                        var db = adri.ui.dashboard;

                        if (!adri.ui.selectedDate || adri.ui.selectedDate === '') {
                            db.getInterviews(function (data) {
                                db.drawInterviews(data);
                                //db.drawInterviewsForDate(data);
                            });
                        }
                        else {
                            db.getInterviewsDate(adri.ui.selectedDate, function (data) {
                                db.drawInterviewsForDate(data);
                            });
                        }

                    },
                    unscheduled: function () {
                        var db = adri.ui.dashboard;
                        db.getUnscheduledInterviews(function (data) {
                            db.drawUnscheduledInterviews(data);
                        });
                    }
                },
                getInterviewsForDate: function (date, id) {
                    var db = adri.ui.dashboard;
                    adri.ui.selectedDate = date;
                    $('#sch-selected-date').html(dis);
                    db.getInterviewsDate(date, function (data) {
                        db.drawInterviewsForDate(data);
                    });
                },
                getInterviews: function (onComplete) {
                    var posFilter = $('#sch-position-filter').val() || 'All';
                    $.ajax({
                        type: "GET",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.getUserTimeSlots + "?uid=" + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client + '&pfl=' + btoa(posFilter),
                        success: function (data) {
                            onComplete(data[0]);
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });

                },
                getPositions: function (onComplete) {

                    $.ajax({
                        type: "GET",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.getPositions + '?uid=' + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client,
                        success: function (data) {
                            onComplete(data[0]);
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                getScheduledInterviews: function (onComplete) {

                    $.ajax({
                        type: "GET",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.getTimeSlots + "?uid=" + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client,
                        success: function (data) {
                            onComplete(data[0][0]);
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                getUnscheduledInterviews: function () {
                    var elid = "dynamic-content-loader";
                    adri.ui.loader(true, elid);
                    var posFilter = $('#unsch-position-filter').val() || 'All';
                    $.ajax({
                        type: "GET",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.getUnscheduledInterviews + '?uid=' + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client + '&pfl=' + btoa(posFilter),
                        success: function (data) {
                            adri.ui.dashboard.drawUnscheduledInterviews(data[0]);
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                setPositionFilters: function (data) {
                    var $sch = $('#sch-position-filter');
                    var $unsch = $('#unsch-position-filter');
                    var lim = data.length;
                    $sch.html('<option value="All">All</option>');
                    $unsch.html('<option value="All">All</option>');
                    var map = {};
                    for (var i = 0; i < lim; i++) {
                        if (!map[data[i].POSITION_NAME]) {
                            map[data[i].POSITION_NAME] = data[i].POSITION_NAME;
                            $sch.append('<option value="' + data[i].POSITION_NAME + '">' + data[i].POSITION_NAME + '</option>');
                            $unsch.append('<option value="' + data[i].POSITION_NAME + '">' + data[i].POSITION_NAME + '</option>');
                        }
                    }

                },
                drawInterviewsForDate: function (data) { //MARK: modified to be very similar to drawSInterviews. Change is mainly to make the header perform differently when selecting a specific date. 

                    var lim = data.length;
                    var $schArea = $('#interviews');
                    $schArea.html('<div id="interviews-table" class="ui-table spanned"></div>');

                    var $tab = $('#interviews-table');

                    var row = '<div class="ui-row-header">' +
                        '<div class="ui-cell-med roboto ui-cell-pad left ">Call Time <span class="block">(Click for more details)</span></div>' +
                        '<div class="ui-cell-med roboto left">Prospect</div>' +
                        '<div class="ui-cell-med roboto left">Position</div>' +
                        '<div class="ui-cell-sm roboto ui-cell-pad left">Req</div>' +
                        '<div class="ui-cell-sm roboto left">Phone</div>' +
                        '<div class="ui-cell-med roboto left">Email</div>' +
                        '</div>';
                    $tab.append(row);

                    var lim = data.length;

                    var dtlBar = '';
                    var canName = '';
                    var tslot = '';
                    var phone = '';
                    var rowColors = adri.colors;

                    for (var i = 0; i < lim; i++) {
                        var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                        var rowID = 'rowNum' + i;

                        if (data[i]['CANDIDATE_ID'] !== null) {
                            canName = data[i]['FULL_NAME']
                        }
                        else {
                            canName = 'TBD';
                        }

                        if (data[i]['TIME_SLOT'] !== undefined) {
                            tslot = data[i]['CLEAN_DATE'];
                        }
                        else {
                            tslot = 'TBD';
                        }

                        phone = data[i]['CANDIDATE_PHONE'] || '';

                        if (phone === null) {
                            phone = '';
                        }
                        else {
                            phone = phone.replace('/^1/', '');
                        }
                        console.log('phone', phone);
                        dtlBar = '<div class="ui-cell-med roboto ui-cell-pad small"> ' + tslot + '</div>' +
                            '<div class="ui-cell-med roboto small"> ' + canName + '</div>' +
                            '<div class="ui-cell-med roboto small"> ' + data[i]['POSITION_NAME'] + '</div>' +
                            '<div class="ui-cell-sm ui-cell-pad roboto small"> ' + data[i]['POSITION_ID'] + '</div>' +
                            '<div class="ui-cell-sm roboto small"> ' + phone.toPhone() + '</div>' +
                            '<div class="ui-cell-med roboto small"> ' + data[i]['CANDIDATE_EMAIL'] + '</div>';
                        $tab.append('<div class="ui-row-spacer-main"></div><div onclick="adri.ui.dashboard.getInterview(\'' + data[i]['INTERVIEW_REFERENCE_ID'] + '\');" id="' + rowID + '" class="ui-main-row-inert tableBG">' + dtlBar + '</div>');

                        $('#' + rowID).css('border-left', '5px solid ' + getRandomColor);
                    }

                    $('.selAll').on('click', function () {
                        $(this).select();
                    });
                    var elid = "dynamic-content-loader";
                    adri.ui.loader(false, elid);
                },
                drawUnscheduledInterviews: function (data) {

                    //$('#toggleScheduled').text('Unscheduled Prospects');
                    $('#toggleScheduled').html('<div title="Check your unscheduled prospects">Unscheduled Prospects</div>');
                    $('#toggleScheduled').removeAttr('onclick');
                    $('#toggleScheduled').attr('onclick', 'adri.ui.dashboard.getUnscheduledInterviews()');
                    $('.dashboard-header-text').html('Candidate Overview');
                    var lim = data.length;
                    var $schArea = $('#interviews');
                    $schArea.html('<div id="interviews-table" class="ui-table spanned"></div>');
                    var $tab = $('#interviews-table');

                    var row = '<div class="ui-row-header">' +
                        '<div class="ui-cell-med roboto ui-cell-pad left ">Call Time <span class="block">(Click for more details)</span></div>' +
                        '<div class="ui-cell-med roboto left">Prospect</div>' +
                        '<div class="ui-cell-med roboto left">Position</div>' +
                        '<div class="ui-cell-sm roboto ui-cell-pad left">Req</div>' +
                        '<div class="ui-cell-sm roboto left">Phone</div>' +
                        '<div class="ui-cell-med roboto left">Email</div>' +
                        '</div>';
                    $tab.html(row);

                    var lim = data.length;

                    var dtlBar = '';
                    var canName = '';
                    var tslot = '';
                    var phone = '';
                    var fullName = '';
                    var sdate = '';
                    var rowColors = adri.colors;
                    var month;
                    var hrs;
                    var day;
                    var min;

                    for (var i = 0; i < lim; i++) {
                        //sdate = data[i]['startdate'].split('T').join(', ');

                        var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                        var rowID = 'rowNum' + i;
                        fullName = data[i]['C_FNAME'] + ' ' + data[i]['C_LNAME'];
                        if (data[i]['C_FNAME'] !== null) {
                            canName = fullName;
                        }
                        else {
                            canName = 'TBD';
                        }

                        if (data[i]['POSITION_ID'] === null) {
                            data[i]['POSITION_ID'] = 'None';
                        }

                        tslot = 'TBD';

                        phone = data[i]['CANDIDATE_PHONE'] || 'None';

                        if (phone === null) {
                            phone = '';
                        }
                        else {
                            phone = phone.replace('/^1/', '');
                        }
                        dtlBar = '<div title="Click to view Call Details" class="ui-cell-med roboto ui-cell-pad small">' + tslot + '</div>' +
                            '<div title="Click to view Call Details" class="ui-cell-med roboto small">' + canName + '</div>' +
                            '<div title="Click to view Call Details" class="ui-cell-med roboto small">' + data[i]['POSITION_NAME'] + '</div>' +
                            '<div title="Click to view Call Details" class="ui-cell-sm ui-cell-pad roboto small">' + data[i]['POSITION_ID'] + '</div>' +
                            '<div title="Click to view Call Details" class="ui-cell-sm roboto small">' + phone + '</div>' +
                            '<div title="Click to view Call Details" class="ui-cell-med roboto small">' + data[i]['CANDIDATE_EMAIL'] + '</div>';
                        $tab.append('<div class="ui-row-spacer-main"></div><div onclick="adri.ui.dashboard.getInterview(\'' + data[i]['INTERVIEW_REFERENCE_ID'] + '\');" id="' + rowID + '" class="ui-main-row-inert tableBG">' + dtlBar + '</div>');

                        $('#' + rowID).css('border-left', '5px solid ' + getRandomColor);
                    }

                    $('.selAll').on('click', function () {
                        $(this).select();
                    });

                    adri.ui.loader(false, "dynamic-content-loader");
                },
                drawInterviews: function (data, btn) {
                    btn = btn || '';

                    $('#toggleScheduled').html('<div title="Check your unscheduled prospects">Unscheduled Prospects</div>');
                    $('#toggleScheduled').removeAttr('onclick');
                    $('#toggleScheduled').attr('onclick', 'adri.ui.dashboard.getUnscheduledInterviews()');
                    $('#sch-selected-date').html('Upcoming Scheduled Calls');
                    var lim = data.length;
                    var $schArea = $('#interviews');
                    $schArea.html('<div id="interviews-table" class="ui-table spanned"></div>');

                    var $tab = $('#interviews-table');

                    var row = '<div class="ui-row-header">' +
                        '<div class="ui-cell-med roboto ui-cell-pad left ">Call Time <span class="block">(Click for more details)</span></div>' +
                        '<div class="ui-cell-med roboto left">Prospect</div>' +
                        '<div class="ui-cell-med roboto left">Position</div>' +
                        '<div class="ui-cell-sm roboto ui-cell-pad left">Req</div>' +
                        '<div class="ui-cell-sm roboto left">Phone</div>' +
                        '<div class="ui-cell-med roboto left">Email</div>' +
                        '</div>';
                    $tab.append(row);

                    var lim = data.length;

                    var dtlBar = '';
                    var canName = '';
                    var tslot = '';
                    var phone = '';
                    var fullName = '';
                    var sdate = '';
                    var rowColors = adri.colors;
                    var month;
                    var hrs;
                    var day;
                    var min;

                    for (var i = 0; i < lim; i++) {
                        for (var e in data[i]) {
                            if (data[i][e] === null || data[i][e] === '') {
                                data[i][e] = 'None';
                            }
                        }

                        var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                        var rowID = 'rowNum' + i;
                        fullName = data[i]['C_FNAME'] + ' ' + data[i]['C_LNAME'];
                        if (data[i]['C_FNAME'] !== null) {
                            canName = fullName;
                        }
                        else {
                            canName = 'TBD';
                        }

                        if (data[i]['TIME_SLOT'] !== undefined || data[i]['TIME_SLOT'] !== null) {

                            tslot = data[i]['TIME_SLOT'];
                        }
                        else {
                            tslot = 'TBD';
                        }
                        phone = data[i]['CANDIDATE_PHONE'] || '';
                        if (phone === null) {
                            phone = '';
                        }
                        else {
                            phone = phone.replace('/^1/', '');
                        }
                        dtlBar = '<div title="Click to view Call Details" class="ui-cell-med roboto ui-cell-pad small">' + tslot + '</div>' +
                            '<div title="Click to view Call Details" class="ui-cell-med roboto small">' + canName + '</div>' +
                            '<div title="Click to view Call Details" class="ui-cell-med roboto small">' + data[i]['USER_ROLE'] + '</div>' +
                            '<div title="Click to view Call Details" class="ui-cell-sm ui-cell-pad roboto small">' + data[i]['POSITION_ID'] + '</div>' +
                            '<div title="Click to view Call Details" class="ui-cell-sm roboto small">' + phone.toPhone() + '</div>' +
                            '<div title="Click to view Call Details" class="ui-cell-med roboto small">' + data[i]['CANDIDATE_PHONE'] + '</div>';
                        $tab.append('<div class="ui-row-spacer-main"></div><div onclick="adri.ui.dashboard.getInterview(\'' + data[i]['INTERVIEW_REFERENCE_ID'] + '\');" id="' + rowID + '" class="ui-main-row-inert tableBG">' + dtlBar + '</div>');

                        $('#' + rowID).css('border-left', '5px solid ' + getRandomColor);
                    }

                    $('.selAll').on('click', function () {
                        $(this).select();
                    });

                    adri.ui.loader(false, "dynamic-content-loader");
                },
                drawPositionPool: function (data) {
                    console.log('drawPositionPool ', data);
                    adri.ui.form.data.positionids = [];
                    var lim = data.length;
                    var $schArea = $('#scheduled-interviews-container');

                    $schArea.html('<div id="interviews-table" class="ui-table spanned"></div>');
                    var $tab = $('#interviews-table');

                    var row = '<div class="ui-row-header">' +
                        //'<div class="ui-cell-btn-header roboto left">Delete</div>' +
                        '<div class="ui-cell-sm roboto ui-cell-pad left ">Req #</div>' +
                        '<div class="ui-cell-sm roboto left">Req Type</div>' +
                        '<div class="ui-cell-med roboto left">Req Name</div>' +
                        '</div>';
                    $tab.append(row);

                    var dtlBar = '';
                    var canName = '';
                    var tslot = '';
                    var phone = '';
                    var rowColors = adri.colors;

                    for (var i = 0; i < lim; i++) {
                        adri.ui.form.data.positionids.push(data[i]['POSITION_ID']);
                        var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                        var rowID = 'positionRow' + i;
                        dtlBar = //'<div class="ui-cell-btn left" onclick="adri.ui.dashboard.confirmRemoveReq(\'' + data[i]['role_code'] + '\');">&#xE5CD;</div>' +
                            '<div class="ui-cell-sm ui-cell-pad roboto small">' + data[i]['POSITION_ID'] + '</div>' +
                            '<div class="ui-cell-med roboto small">' + data[i]['POSITION_TYPE'] + '</div>' +
                            '<div class="ui-cell-med roboto small">' + data[i]['POSITION_NAME'] + '</div>' +
                            '</div>';
                        $tab.append('<div class="ui-row-spacer-main"></div><div title="Click to add users to ' + data[i]['POSITION_ID'] + '" id="' + rowID + '" onclick="adri.ui.actions.positions.getUsersByPosition(\'' + data[i]['POSITION_ID'] + '\');" class="ui-main-row-inert tableBG">' + dtlBar + '</div>');
                        $('#' + rowID).css('border-left', '5px solid ' + getRandomColor);
                    }

                    $('.selAll').on('click', function () {
                        $(this).select();
                    });

                    var elid = "dynamic-content-loader";
                    adri.ui.loader(false, elid);
                },
                getReqLink: function (reqnum) {
                    var link = window.location.href.split('rctrinfsys')[0] + 'candidate.html?rec=' + reqnum + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client;
                    var markup = '<div class="repeaterField"><div class="formHeader centered">Requisition Link</div><input id="req-input" class="infoTxt repeaterField" value="' + link + '" readonly /></div>';
                    $('#smallModal').html(markup);
                    $('#req-input').on('click', function () {
                        $(this).select();
                    });
                    adri.ui.modal.small.open();
                },
                confirmRemoveReq: function (reqnum) {
                    var conf = confirm('Are you sure you want to remove yourself from requisition ' + reqnum + '?');
                    if (conf) {
                        adri.ui.dashboard.removeReq(reqnum);
                    }
                },
                removeReq: function (reqnum) {
                    var jsData = {
                        reqnum: btoa(reqnum),
                        clientID: constants.interview.client,
                        userID: constants.interview.user,
                        uiID: constants.interview.ui,
                        interviewID: constants.interview.id
                    };

                    $.ajax({
                        type: "POST",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.removeReq,
                        data: JSON.stringify(jsData),
                        success: function (data) {
                            adri.ui.settings.open();
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                getInterview: function (id) {
                    adri.ui.loader(true, "dynamic-content-loader");
                    constants.interview.id = btoa(id);
                    adri.ui.initialize();
                },
                addPosition: function () {
                    adri.ui.addPositionForm();
                },
                scheduleInterview: function (positionID) {
                    adri.ui.scheduleInterviewForm(positionID);
                },
                addParty: function () {
                    adri.interview.addUserForm();
                },
                notifyParties: function () {

                },
                refreshPool: function () {
                    var db = adri.ui.dashboard;
                    adri.ui.modal.close();
                    adri.ui.settings.addPositions();
                },
                refreshInterviews: function () {
                    adri.ui.selectedDate = adri.ui.selectedDate || '';
                    adri.ui.modal.close();
                    if (adri.ui.selectedDate !== '') {
                        adri.ui.dashboard.getInterviewsForDate(adri.ui.selectedDate);
                    }
                },
                reports: {
                    open: function () {
                        //adri.ui.selected('dashboard-sub-icon1', 'control-sub-label-act');
                        var $Content = $('.ui-content-body')
                        var iCard = '<div id="db-weekly-view" class="centered dashMain-title">' +
                            '<div style="margin-left:0;" class="dashboard-header-block"><div class="dashboard-header-text">Interactions</div></div>' +
                            '</div>' +
                            '<div id="db-scheduling" class="dashboard-scheduling">' +
                            '<div id="scheduled-interviews-container" class="fullWidth-container ">' +
                            '<div id="position-pool"></div>' +
                            '</div>' +
                            '</div>';
                        $Content.html(iCard);
                    }
                }
            },
            actions: {
                data: {
                },
                messages: {
                    getCandidateMsgs: function (onComplete) {
                        adri.ui.loader(true, "dynamic-content-loader");
                        //var socket = io.connect('http://ec2-54-244-71-87.us-west-2.compute.amazonaws.com/');
                        var intInfo = [1, 'candidate'];
                        console.log(intInfo);
                        socket.on('connect', function (data) {
                            socket.emit('getMessages', intInfo);
                        });

                        socket.on('receiveMessages', function (data) {
                            socket.disconnect();
                            console.log('messages ', data[0]);
                            adri.ui.actions.messages.drawMsgs(data[0], intInfo[1]);
                        });
                    },
                    getRecruiterMsgs: function (onComplete) {
                        adri.ui.loader(true, "dynamic-content-loader");
                        //var socket = io.connect('http://ec2-54-244-71-87.us-west-2.compute.amazonaws.com/');
                        var intInfo = [1, 'manager'];
                        console.log(intInfo);
                        socket.on('connect', function (data) {
                            socket.emit('getMessages', intInfo);
                        });

                        socket.on('receiveMessages', function (data) {
                            socket.disconnect();
                            console.log('messages ', data[0]);
                            adri.ui.actions.messages.drawMsgs(data[0], 'recruiter');
                        });
                    },
                    getManagerMsgs: function (onComplete) {
                        adri.ui.loader(true, "dynamic-content-loader");
                        //var socket = io.connect('http://ec2-54-244-71-87.us-west-2.compute.amazonaws.com/');
                        var intInfo = [1, 'manager'];
                        console.log(intInfo);
                        socket.on('connect', function (data) {
                            socket.emit('getMessages', intInfo);
                        });

                        socket.on('receiveMessages', function (data) {
                            socket.disconnect();
                            console.log('messages ', data[0]);
                            adri.ui.actions.messages.drawMsgs(data[0], intInfo[1]);
                        });
                    },
                    drawMsgs: function (data, msgType) {
                        var dInfo = data;
                        console.log('notifyCandidates ', data);
                        var $tab = $('.ui-content-body');
                        $tab.html('');

                        var header = '<div id="db-weekly-view" class="centered dashMain-title">' +
                            '<div style="margin-left:0;" class="dashboard-header-block"><div class="dashboard-header-text">Messages for ' + msgType + '.</div></div>' +
                            '</div>';
                        $tab.html(header);

                        var lim = data.length;

                        var dtlBar = '';
                        var canName = '';
                        var phone = '';
                        var fullName = '';
                        var rowColors = adri.colors;
                        console.log(constants.interview);
                        for (var i = 0; i < lim; i++) {

                            var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                            var rowID = 'emailNum' + i;
                            // random_number template
                            dtlBar = '<li class="block email-subject-text">' + data[i].subject + '</li>' +
                                '<li class="block email-body-text">' + data[i].clean_msg + '</li>';
                            $tab.append('<div class="ui-row-spacer-main"></div><ul id="' + rowID + '" class="email-row-wrap">' + dtlBar + '</ul>');
                            console.log($('#' + rowID));
                            $('#' + rowID).css('border-left', '3px solid ' + getRandomColor);
                            $('#' + rowID).css('cursor', 'default');
                        }

                        $('.selAll').on('click', function () {
                            $(this).select();
                        });

                        adri.ui.loader(false, "dynamic-content-loader");
                    }
                },
                positions: {
                    getUsersByPosition: function (pid) {
                        adri.ui.loader(true, "dynamic-content-loader");
                        var txt = 'Select Users to add or remove for ' + pid + '';
                        var buttons = '<div style="margin-top: 8px; margin-right: 15px;" class="modal-controls"><div id="cancel" class="cancelButton"></div></div>' +
                            '<div style="margin-top: 8px;" class="modal-controls"><div id="confirm" class="submitButton"></div></div>';

                        adri.ui.actions.positions.drawUsers('', pid, txt, buttons);

                    },
                    getAssociatedRecruiters: function () {
                        adri.ui.loader(true, "dynamic-content-loader");
                        var txt = 'Recruiter Overview';
                        //var socket = io.connect('http://ec2-54-244-71-87.us-west-2.compute.amazonaws.com/');
                        //var intInfo = [constants.interview.user];

                        socket.on('connect', function (data) {
                            socket.emit('getPositionAssociations', constants.interview.user);
                        });

                        socket.on('receivePositionAssociations', function (data) {
                            socket.disconnect();
                            adri.ui.actions.positions.setupAssociations(txt);
                            adri.ui.actions.positions.drawAssociations();
                        });
                    },
                    getAssociatedManagers: {

                    },
                    getAssociatedCandidates: {

                    },
                    setupAssociations: function (txt, btns) {
                        btns = btns || '';

                        var $Content = $('.ui-content-body');
                        var $header = $('db-weekly-view');
                        var iCard = '<div id="db-weekly-view" class="dashMain-title">' +
                            '<div class="dashboard-header-block"><div class="dashboard-header-text">' + txt + '</div></div>' +
                            btns +
                            '</div>' +
                            '<div id="db-scheduling" class="dashboard-scheduling">' +
                            '<div id="scheduled-interviews-container" class="fullWidth-container ">' +
                            '<div id="position-pool"></div>' +
                            '</div>' +
                            '</div>' +
                            '<div id="modal-form" class="modal-form"></div>' +
                            '<div id="smallModal" class="modal-small"></div>' +
                            '<div id="largeModal" class="modal-large"><div class="modal-header-wrap" id="modalLargeHeader"></div><div style="display:table" id="modalLargeBody"></div></div>' +
                            '<div id="modal-bg-overlay" class="modal-overlay" onclick="adri.timeslot.removeControls();"></div>' +
                            '<div id="small-modal-bg-overlay" class="modal-overlay" onclick="adri.ui.modal.small.close();"></div>' +
                            '<div id="error-modal" class="modal">' +
                            '<div id="availError" class="modal-content">' +
                            '<button id="closeModal" class="close-modal" onclick="adri.ui.modal.error.close();">&times;</button>' +
                            '</div>' +
                            '</div>';
                        $Content.html(iCard);
                        adri.util.btns.confirmationBtns('confirm', 'cancel', adri.ui.actions.positions.updatePositions, '', adri.ui.settings.openReqs);
                    },
                    drawAssociations: function (data) {
                        data = adri.ui.form.data.users.recruiters;

                        var lim = data.length;
                        var $schArea = $('#position-pool');
                        $schArea.html('<div id="interviews-table" class="ui-table spanned"></div>');
                        var $tab = $('#interviews-table');
                        $tab.html('');
                        var row = '<div class="ui-row-header">' +
                            '<div class="ui-cell-sm roboto ui-cell-pad left ">Name</div>' +
                            '<div class="ui-cell-sm roboto ui-cell-pad left ">Positions</div>' +
                            '<div class="ui-cell-sm roboto left">Phone</div>' +
                            '<div class="ui-cell-med roboto left">Email</div>' +
                            '</div>';
                        $tab.append(row);

                        var lim = data.length;
                        var dtlBar = '';
                        var canName = '';
                        var tslot = '';
                        var phone = '';
                        var fullName = '';
                        var otherName = '';
                        var sdate = '';
                        var rowColors = adri.colors;
                        var month;
                        var hrs;
                        var day;
                        var min;
                        var next;

                        var newRow;
                        var names = [];
                        var uniqueNames = [];
                        var output = [];
                        // create new array with fullName
                        for (var s = 0; s < lim; s++) {
                            newRow = {
                                fullName: data[s]['fname'] + ' ' + data[s]['lname'],
                                pid: data[s]['role_code'],
                                phone: data[s]['mobilenumber'],
                                email: data[s]['emailaddress'],
                                userid: data[s]['userid']
                            };
                            fullName = data[s]['fname'] + ' ' + data[s]['lname'];
                            names.push(newRow);
                        }
                        // walk through new array and concat any duplicate position IDs into single row
                        names.forEach(function (value) {
                            var existing = output.filter(function (v) {
                                return v.fullName == value.fullName;
                            });
                            if (existing.length) {
                                var existingIndex = output.indexOf(existing[0]);
                                output[existingIndex].pid = output[existingIndex].pid.concat(value.pid);
                            }
                            else {
                                if (typeof value.pid == 'string') {
                                    value.pid = [value.pid];
                                    output.push(value);
                                }
                            }
                        });
                        console.log('drawAssociations', output);
                        adri.ui.actions.data.recruiters = output;
                        data = output;
                        var dLen = data.length;
                        for (var i = 0; i < dLen; i++) {
                            var positionids = '';
                            var pLen = data[i]['pid'].length;
                            for (var e = 0; e < pLen; e++) {
                                data[i]['pid'] = data[i]['pid'] || '';
                                if (data[i]['pid'] && e < pLen - 1) {
                                    positionids = positionids + data[i]['pid'][e] + ', ';
                                }
                                else {
                                    positionids = positionids + data[i]['pid'][e];
                                }
                            }

                            var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                            var rowID = 'rowNum' + i;
                            phone = data[i]['phone'];
                            if (data[i]['fullName'] !== null) {
                                //do nothing
                            }
                            else {
                                fullName = 'TBD';
                            }

                            if (phone === null) {
                                phone = '';
                            }
                            else {
                                phone = phone.replace('/^1/', '');
                            }
                            dtlBar = '<div class="ui-cell-med ui-cell-pad roboto small">' + data[i]['fullName'] + '</div>' +
                                '<div class="ui-cell-sm roboto small">' + positionids + '</div>' +
                                '<div class="ui-cell-sm roboto small">' + phone + '</div>' +
                                '<div class="ui-cell-med roboto small">' + data[i]['email'] + '</div>';
                            $tab.append('<div class="ui-row-spacer-main"></div><div id="' + rowID + '" class="ui-main-row-view tableBG">' + dtlBar + '</div>');

                            $('#' + rowID).css('border-left', '5px solid ' + getRandomColor);
                        }

                        $('.selAll').on('click', function () {
                            $(this).select();
                        });

                        adri.ui.loader(false, "dynamic-content-loader");
                    },
                    setupPositionAssociations: function (txt, btns) {
                        btns = btns || '';

                        var $Content = $('.ui-content-body');
                        var $header = $('db-weekly-view');
                        var iCard = '<div id="db-weekly-view" class="dashMain-title">' +
                            '<div class="dashboard-header-block"><div class="dashboard-header-text">' + txt + '</div></div>' +
                            btns +
                            '</div>' +
                            '<div id="db-scheduling" class="dashboard-scheduling">' +
                            '<div id="scheduled-interviews-container" class="fullWidth-container ">' +
                            '<div id="position-pool"></div>' +
                            '</div>' +
                            '</div>' +
                            '<div id="modal-form" class="modal-form"></div>' +
                            '<div id="smallModal" class="modal-small"></div>' +
                            '<div id="largeModal" class="modal-large"><div class="modal-header-wrap" id="modalLargeHeader"></div><div style="display:table" id="modalLargeBody"></div></div>' +
                            '<div id="modal-bg-overlay" class="modal-overlay" onclick="adri.timeslot.removeControls();"></div>' +
                            '<div id="small-modal-bg-overlay" class="modal-overlay" onclick="adri.ui.modal.small.close();"></div>' +
                            '<div id="error-modal" class="modal">' +
                            '<div id="availError" class="modal-content">' +
                            '<button id="closeModal" class="close-modal" onclick="adri.ui.modal.error.close();">&times;</button>' +
                            '</div>' +
                            '</div>';
                        $Content.html(iCard);
                        adri.util.btns.confirmationBtns('confirm', 'cancel', adri.ui.actions.positions.updatePositions, '', adri.ui.settings.openReqs);
                    },
                    drawUsers: function (data, pid, txt, buttons) {
                        adri.ui.actions.positions.setupPositionAssociations(txt, buttons);
                        data = adri.ui.actions.data.recruiters;
                        console.log(data);
                        var lim = data.length;
                        var $schArea = $('#position-pool');

                        $schArea.html('<div id="interviews-table" class="ui-table spanned"></div>');
                        var $tab = $('#interviews-table');
                        $tab.html('');
                        var row = '<div class="ui-row-header">' +
                            '<div class="ui-cell-sm roboto ui-cell-pad left">Select <span class="block">(Select to add)</span></div>' +
                            '<div class="ui-cell-sm roboto ui-cell-pad left ">Name</div>' +
                            '<div class="ui-cell-sm roboto left">Phone</div>' +
                            '<div class="ui-cell-med roboto left">Email</div>' +
                            '</div>';
                        $tab.append(row);

                        var lim = data.length;

                        var dtlBar = '';
                        var canName = '';
                        var tslot = '';
                        var phone = '';
                        var fullName = '';
                        var sdate = '';
                        var rowColors = adri.colors;
                        var month;
                        var hrs;
                        var day;
                        var min;
                        var chkbox;

                        for (var i = 0; i < lim; i++) {
                            for (var e in data[i]) {
                                if (data[i][e] === null || data[i][e] === '') {
                                    data[i][e] = 'None';
                                }
                            }

                            var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                            var rowID = 'rowNum' + i;
                            phone = data[i]['phone'];
                            fullName = data[i]['fullName'];
                            if (fullName !== null) {
                                //do nothing
                            }
                            else {
                                fullName = 'TBD';
                            }


                            var userid = data[i]['userid'];

                            for (var e in data[i]['pid']) {
                                if (pid === data[i]['pid'][e]) {
                                    chkbox = '<p class="ui-cell-pad">' +
                                        '<input checked onclick="adri.ui.actions.positions.setData(' + pid + ', ' + data[i]['userid'] + ');" type="checkbox" id="chkBox' + rowID + '" ></>' +
                                        '<label for="chkBox' + rowID + '"></label>' +
                                        '</p>';
                                    break;
                                }
                                else {
                                    chkbox = '<p class="ui-cell-pad">' +
                                        '<input onclick="adri.ui.actions.positions.setData(\'' + pid + '\',' + data[i]['userid'] + ');" type="checkbox" id="chkBox' + rowID + '" ></>' +
                                        '<label for="chkBox' + rowID + '"></label>' +
                                        '</p>';
                                }
                            }
                            /*
                            chkbox = '<p class="ui-cell-pad">' +
                                '<input onclick="adri.ui.actions.positions.setData(' + pid + ', ' + data[i]['userid'] + ');" type="checkbox" id="chkBox' + rowID + '" ></>' +
                                '<label for="chkBox' + rowID + '"></label>' +
                                '</p>';
                            */
                            dtlBar = '' + chkbox + '<div class="ui-cell-med ui-cell-pad roboto small">' + fullName + '</div>' +
                                '<div class="ui-cell-sm roboto small">' + phone + '</div>' +
                                '<div class="ui-cell-med roboto small">' + data[i]['email'] + '</div>';
                            $tab.append('<div class="ui-row-spacer-main"></div><div title="Use the checkboxes to add or remove from ' + pid + '" id="' + rowID + '" class="ui-main-row-view tableBG">' + dtlBar + '</div>');
                            $()
                            $('#' + rowID).css('border-left', '5px solid ' + getRandomColor);
                        }

                        $('.selAll').on('click', function () {
                            $(this).select();
                        });


                        adri.ui.loader(false, "dynamic-content-loader");
                    },
                    setData: function (posid, userid) {
                        var rec = adri.ui.actions.data.recruiters;

                        for (var e = 0; e < rec.length; e++) {
                            if (rec[e].userid === userid) {
                                console.log('true0', rec[e].userid, userid);
                                var iLen = adri.ui.actions.data.recruiters[e].pid.length;
                                for (var i = 0; i < iLen; i++) {
                                    if (adri.ui.actions.data.recruiters[e].pid[i] === posid) {
                                        console.log(adri.ui.actions.data.recruiters[e].pid[i]);
                                        //adri.ui.actions.data.recruiters[e].pid[i] = '';
                                    }
                                    else {
                                        console.log('false', adri.ui.actions.data.recruiters[e]);
                                        adri.ui.actions.data.recruiters[e].pid.push(posid);
                                    }
                                }
                            }
                        }
                    },
                    updatePositions: function (user) {
                        adri.ui.settings.openReqs();
                    }
                },
            },
            modal: {
                open: function () {
                    $('#modal-form').stop();
                    $('#modal-bg-overlay').stop();
                    $('#modal-bg-overlay').fadeIn(400, function () {
                        $('#modal-form').fadeIn(400);
                    });
                },
                close: function () {
                    $('#modal-form').stop();
                    $('#modal-bg-overlay').stop();
                    $('#modal-form').fadeOut(400, function () {
                        $('#modal-bg-overlay').fadeOut(400);
                    });
                },
                small: {
                    open: function () {
                        $('#small-modal-bg-overlay').stop();
                        $('#smallModal').stop();
                        $('#small-modal-bg-overlay').fadeIn(400, function () {
                            $('#smallModal').fadeIn(400);
                        });
                    },
                    close: function () {
                        $('#small-modal-bg-overlay').stop();
                        $('#smallModal').stop();
                        $('#smallModal').fadeOut(400, function () {
                            $('#small-modal-bg-overlay').fadeOut(400);
                        });
                    }
                },
                large: {
                    open: function (t) {
                        t = t || '';
                        $('#small-modal-bg-overlay').stop();
                        $('#largeModal').stop();
                        $('#small-modal-bg-overlay').fadeIn(400, function () {
                            $('#largeModal').fadeIn(400);
                        });
                        if (t !== '') {
                            $('#largeModal').html(t);
                        }
                    },
                    close: function () {
                        $('#small-modal-bg-overlay').stop();
                        $('#largeModal').stop();
                        $('#largeModal').fadeOut(400, function () {
                            $('#small-modal-bg-overlay').fadeOut(400);
                        });
                    }
                },
                error: {//Mark: Added different modal markup for errors and important notifications. 
                    open: function (t) {
                        $('#small-modal-bg-overlay').stop();
                        $('#error-modal').stop();
                        $('#small-modal-bg-overlay').fadeIn(400, function () {
                            $('#error-modal').fadeIn(400);
                        });
                        $('#availError').html(t);
                        $('#availError').append('<button id="closeModal" class="close-modal" onclick="adri.ui.modal.error.close();">&times;</button>');
                    },
                    close: function () {
                        $('#small-modal-bg-overlay').stop();
                        $('#error-modal').stop();
                        $('#error-modal').fadeOut(400, function () {
                            $('#small-modal-bg-overlay').fadeOut(400);
                        });
                    }
                }
            },
            addPositionForm: function () {
                var currentLength = adri.ui.form.data.positions.length;

                var nodes = currentLength + $('.smallFormFields').length;
                var $schArea = $('#position-pool');
                var field = adri.ui.template.field;
                adri.ui.form.data.positions[nodes] = {
                    rolename: "",
                    role_code: "",
                    role_type: "",
                    count: nodes
                }; //label, updates, field, setType, value, index  //label, updates, field, choices, setType, index
                var posFields = field.input('Position ID', 'positions', 'role_code', '', '', nodes) + '<br/>' +
                    field.input('Position Name', 'positions', 'rolename', '', '', nodes) + '<br/>' +
                    field.selectNew('Position Type', 'positions', 'role_type', ['Vacancy', 'Evergreen'], '', nodes); //TO-DO: un-hardcode this

                posFields = '<div class="smallForm"><div class="smallFormFields"><div class="formHeader">New Position</div>' + posFields + '</div></div>';
                $schArea.append(posFields);
            },
            addRecruiterForm: function () {
                var currentLength = adri.ui.form.data.users.recruiters.length;

                var nodes = currentLength + $('.largeFormFields').length;
                var $schArea = $('#position-pool');
                var field = adri.ui.template.field;
                adri.ui.form.data.users.recruiters[nodes] = {
                    userid: nodes + 1000,
                    fname: '',
                    lname: '',
                    emailaddress: '',
                    mobilenumber: '',
                    role_code: ''
                };
                var posFields = field.input('Email Address', 'recruiters', 'emailaddress', 'User', '', nodes) +
                    field.inputSmall('First Name', 'recruiters', 'fname', 'User', '', nodes) +
                    field.inputSmall('Last Name', 'recruiters', 'lname', 'User', '', nodes) +
                    field.inputSmall('Phone Number', 'recruiters', 'mobilenumber', 'User', '', nodes);

                posFields = '<div class="smallForm"><div class="largeFormFields"><div class="formHeader">New Recruiter</div>' + posFields + '</div></div>';
                $schArea.append(posFields);
            },
            addManagerForm: function () {
                var nodes = $('.largeFormFields').length;
                console.log(nodes);
                var $schArea = $('#position-pool');
                var field = adri.ui.template.field;
                adri.ui.form.data.users.managers[nodes] = {};
                var posFields = field.input('Email Address', 'managers', 'email', 'User', '', nodes) +
                    field.inputSmall('First Name', 'managers', 'fname', 'User', '', nodes) +
                    field.inputSmall('Last Name', 'managers', 'lname', 'User', '', nodes) +
                    field.inputSmall('Phone Number', 'managers', 'phone', 'User', '', nodes);

                posFields = '<div class="smallForm"><div class="largeFormFields"><div class="formHeader">New Manager</div>' + posFields + '</div></div>';
                $schArea.append(posFields);
            },
            addCandidateForm: function () {
                var currentLength = adri.ui.form.data.users.candidates.length;

                var nodes = currentLength + $('.largeFormFields').length;
                var $schArea = $('#position-pool');
                var field = adri.ui.template.field;
                adri.ui.form.data.users.candidates[nodes] = {
                    c_email: '',
                    c_fname: '',
                    c_lname: '',
                    c_phone: '',
                    role_code: '',
                    rolename: ''
                };
                var posFields = field.input('Email Address', 'candidates', 'c_email', 'User', '', nodes) +
                    field.inputSmall('First Name', 'candidates', 'c_fname', 'User', '', nodes) +
                    field.inputSmall('Last Name', 'candidates', 'c_lname', 'User', '', nodes) +
                    field.inputSmall('Phone Number', 'candidates', 'c_phone', 'User', '', nodes) +
                    field.input('Role Name', 'candidates', 'rolename', 'User', '', nodes) +
                    field.selectNew('Position ID', 'candidates', 'role_code', adri.ui.form.data.positionids, 'User', nodes);

                posFields = '<div class="smallForm"><div class="largeFormFields"><div class="formHeader">New Candidate</div>' + posFields + '</div></div>';
                $schArea.append(posFields);
            },
            submitCandidates: function (onComplete) {
                var jData = adri.ui.form.data.users.candidates;
                console.log(jData);
                adri.ui.settings.setupCandidates();
                adri.ui.selected('dashboard-sub-icon6', 'control-sub-label-act');
            },
            submitRecruiters: function (onComplete) {
                var jData = adri.ui.form.data.users.recruiters;
                console.log(jData);
                adri.ui.actions.positions.getAssociatedRecruiters();
                adri.ui.selected('dashboard-sub-icon1', 'control-sub-label-act');

            },
            submitPosition: function (onComplete) {

                var jData = adri.ui.form.data.positions;
                jData.clientID = constants.interview.client;
                jData.userID = constants.interview.user;
                jData.uiID = constants.interview.ui;

                $.ajax({
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.addPosition,
                    data: JSON.stringify(jData),
                    success: function (data) {
                        adri.ui.form.resetData();
                        onComplete();
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            },
            submitInterview: function () {
                adri.ui.form.submit();
            },
            accordion: function (id) {
                var accItem = document.getElementsByClassName();
                var accHeader = document.getElementsByClassName();

                accHeader[id].addEventListener('click', theToggle, false);

                function theToggle() {
                    var theClass = this.parentNode.className;
                    for (e = 0; e < accItem.length; e++) {
                        accItem[e].className = '';
                    }
                    if (theClass == '') {
                        this.parentNode.className = '';
                    }
                }
            },
            debug: function () {
                var $Content = $('#adri-ras-content');
                var b1 = '<button type="button" onclick="adri.interview.get()">Get ' + appconfig.alias.interview + ' Info</button>';
                var b2 = '<button type="button" onclick="adri.ui.time.load(\'adri-ras-content\')">Load Time Controls</button>';
                var b3 = '<button type="button" onclick="adri.ui.availability.load()">Get Availability</button>';
                var b4 = '<button type="button" onclick="adri.ui.form.newEvent()">Create Event</button>';
                var markup = '<div style="text-align:center;">' +
                    b1 +
                    b2 +
                    b3 +
                    b4 +
                    '</div>';
                $Content.html(markup);
            },
            setData: function (id, field, value) {
                adri.data[id][field] = value;
            },
            time: {
                load: function (elmt) {
                    adri.ui.form.data = {
                        userID: constants.interview.user,
                        interviewID: constants.interview.id,
                        clientID: constants.interview.client,
                        uiID: constants.interview.ui,
                        availability: []
                    };
                    var today = new Date();
                    var cctr = '<div id="adri-ras-calendar-control" style="height:45%;width:90%;margin:0 auto;"></div>'; //maybe add to css
                    $('#' + elmt).html(cctr);
                    adri.util.controls.calendar.draw('adri-ras-calendar-control', today.getMonth(), today.getFullYear());
                },
                loadNew: function (elmt) { //Mark: loadNew added instead of load. The calendar function needed to be modified. Changed style as well. Chain needs to be modified so that availabilityView id doesn't have to be here.
                    $('#' + elmt).html('');
                    adri.ui.form.data = {
                        userID: constants.interview.user,
                        interviewID: constants.interview.id,
                        clientID: constants.interview.client,
                        uiID: constants.interview.ui,
                        availability: []
                    };
                    var today = new Date();
                    var cctr = '<div id="ribbon-header" class="dashHeader centered roboto">ADRI</div><div id="adri-ras-calendar-control"></div>' +
                        '<div id="availabilityView" class="timeContainerSmall"></div>';
                    $('#' + elmt).html(cctr);
                    adri.util.controls.calendarSmall.draw('adri-ras-calendar-control', today.getMonth(), today.getFullYear());
                    adri.user.info.launchEditForm();
                },
                submit: function () {
                    var jData = adri.timeslot.wrap();
                    adri.timeslot.add(jData);
                },
                dateNode: {
                    add: function (date, element) {
                        var dtNode = adri.ui.template.dateNode(adri.ui.time.dateNode.count, date);
                        var schdate = new BlockDate(date);
                        schdate.userID = atob(constants.interview.user);
                        schdate.status = 'Proposed';
                        schdate.interviewID = constants.interview.id;
                        adri.ui.form.data.availability.push([schdate]);
                        $('#' + element).append(dtNode);
                        adri.data[adri.ui.time.dateNode.count] = new ADRITime(date, '12', '00', 'AM', 'Accepted');
                        adri.ui.time.dateNode.count++;
                    },
                    remove: function (id) {
                        var $nodeID = $('#datetime-node-' + id);
                        $nodeID.remove();
                    },
                    count: 0
                }
            },
            availability: {
                load: function () {
                    adri.ui.availability.get();
                },
                get: function (onComplete) {
                    var svc = '';
                    onComplete('');
                },
                drawNodes: function (data) {
                    var lim = data.length;
                    var $Content = $('#adri-ras-timeNodes');
                    $Content.html('');
                    var map = {};
                    for (var i = 0; i < lim; i++) {
                        if (!map[data[i]['TIME_SLOT']]) {
                            map[data[i]['TIME_SLOT']] = data[i];
                            map[data[i]['TIME_SLOT']].users = [];
                        }

                        map[data[i]['TIME_SLOT']].users.push(data[i]['USER_FNAME'] + ' ' + data[i]['USER_LNAME']);
                    }

                    for (var time in map) {
                        $Content.append(adri.ui.template.availabilityNode(map[time]));
                    }
                },
                drawUserTimes: function (data) {
                    var lim = data.length;
                    var $user = '';
                    var map = {};

                    $('.user-date-node-struct').html('');

                    for (var i = 0; i < lim; i++) {
                        data['TIME_SLOT'] = data['TIME_SLOT'] || '';

                        if (data[i]['TIME_SLOT'] != '' && data[i]['TIME_SLOT'] != null) {
                            $user = $('#user-availability-' + data[i]['USER_ID']);

                            if (!map[data[i]['USER_ID']]) {
                                map[data[i]['USER_ID']] = data[i];
                                $user.html('');
                            }
                            $user.append(adri.ui.template.availabilityNodeSingle(data[i]));
                            if (data[i]['CANDIDATE_ID'] !== null) {
                                $('#user-availability-' + data[i]['CANDIDATE_ID']).append(adri.ui.template.availabilityNodeSingle(data[i]));
                            }
                        }
                    }

                }
            },
            template: {
                field: {
                    wrap: function (label, field) {
                        var markup = '<div class="repeaterField centered">' +
                            '<span class="fheader block">' + label + '</span>' +

                            field +
                            '</div>';
                        return markup;
                    },
                    wrapDay: function (label, field) { //MARK
                        var markup = '<div class="repeaterFieldSpanned">' +
                            '<span class="fheader block">' + label + '</span>' +

                            field +
                            '</div>';
                        return markup;
                    },
                    wrapSmall: function (field, id) {//Mark: 
                        var markup = '<div class="time-block-repeater" >' +
                            '<div class="repeaterFieldSmall left">' +
                            field +
                            '</div>' +
                            '</div>';
                        return markup;
                    },
                    timeWrap: function (field, id) {//Mark:  
                        var markup = '<div class="time-block-repeater" >' +
                            '<div class="repeaterFieldSmall left">' +
                            field +
                            '</div>' +
                            '</div>';
                        return markup;
                    },
                    toggler: function (label, icon, updates, field, value) {
                        var markup = '<div class="field-wrapper">' +
                            '<span class="secHTxt">' + label + '</span>' +
                            '<div class="field-toggler ckable" data-state="off" data-value="' + value + '" onclick="adri.ui.form.setToggler($(this)); adri.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).attr(\'data-value\'));"><div>' + icon + '</div></div>' +
                            '</div>';
                        return markup;
                    },
                    groupToggle: function (icon, updates, field) {
                        var markup = '<div class="field-toggler ckable" data-state="off" data-value="no" onclick="adri.ui.form.setToggler($(this)); adri.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).attr(\'data-value\'));"><div>' + icon + '</div></div>';
                        return markup;
                    },
                    dayToggleOld: function (icon, updates, index) {
                        var markup = '<div class="field-toggler ckable" id="day-toggle-' + index + '-' + updates + '" data-state="off" data-value="no" onclick="adri.ui.form.setToggler($(this)); adri.ui.form.instantiateDay(\'' + updates + '\',\'' + index + '\');"><div>' + icon + '</div></div>';
                        return markup;
                    },
                    dayToggle: function (icon, updates, index) {//MARK: altered dayToggle to work with new markup. 
                        var markup = '<div title="Choose the days you are available!" class="day-toggler" id="day-toggle-' + index + '-' + updates + '" data-state="off" data-value="no" onclick="adri.ui.form.setToggler($(this)); adri.ui.form.instantiateDay(\'' + updates + '\',\'' + index + '\');"><div>' + icon + '</div></div>';
                        return markup;
                    },
                    dayToggleSmall: function (icon, updates, index) { //MARK: added smaller dayToggle
                        var markup = '<div class="field-viewer" id="day-toggle-' + index + '-' + updates + '"><div>' + icon + '</div></div>';
                        return markup;
                    },
                    selectNew: function (label, updates, field, choices) {
                        var lim = choices.length;
                        var opts = '';
                        for (var i = 0; i < lim; i++) {
                            opts = opts + '<option value="' + choices[i] + '">' + choices[i] + '</option>';
                        }

                        adri.ui.form.setData(updates, field, choices[0]);
                        //'<select onchange="adri.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).val());">' + opts + '</select>' +
                        var markup = '<div class="field-wrapper">' +
                            '<span>' + label + '</span>' +
                            '<div class="containerFull"><select class="" onchange="adri.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).val());">' + opts + '</select></div>'
                        '</div>';
                        return markup;
                    },
                    select: function (label, updates, field, choices) {
                        var lim = choices.length;
                        var opts = '';
                        for (var i = 0; i < lim; i++) {
                            opts = opts + '<option value="' + choices[i] + '">' + choices[i] + '</option>';
                        }

                        adri.ui.form.setData(updates, field, choices[0]);

                        var markup = '<div class="field-wrapper">' +
                            '<span>' + label + '</span>' +
                            '<select onchange="adri.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).val());">' + opts + '</select>' +
                            '</div>';
                        return markup;
                    },
                    input: function (label, updates, field, setType, value, index) {
                        console.log(label, updates, field, setType, value, index);
                        value = value || '';
                        setType = setType || '';
                        var markup = '<div class="field-wrapper">' +
                            '<span>' + label + '</span>' +                  //updates, index, field, val
                            '<input id="field-' + field + '" onchange="adri.ui.form.set' + setType + 'Data(\'' + updates + '\',\'' + index + '\',\'' + field + '\',$(this).val());">' + value + '</input>' +
                            '</div>';

                        return markup;
                    },
                    inputSmall: function (label, updates, field, setType, value, index) {
                        value = value || '';
                        setType = setType || '';
                        var markup = '<div class="field-wrapper-small">' +
                            '<span>' + label + '</span>' +
                            '<input id="field-' + field + '" onchange="adri.ui.form.set' + setType + 'Data(\'' + updates + '\',\'' + index + '\',\'' + field + '\',$(this).val());">' + value + '</input>' +
                            '</div>';
                        return markup;
                    },
                    number: function (label, updates, field, step, value, min) {
                        min = min || 0;
                        value = value || '';
                        step = step || '1';
                        var markup = '<div class="field-wrapper">' +
                            '<span>' + label + '</span>' +
                            '<input type="number" min="' + min + '" id="field-' + field + '" step="' + step + '" value="' + value + '" onchange="adri.util.checkNumValue($(this),' + min + ',' + step + ');adri.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).val());"></input>' +
                            '</div>';
                        return markup;
                    },
                    userInput: function (label, role, index, field) {
                        var markup = '<div class="field-wrapper">' +
                            '<span>' + label + '</span>' +
                            '<input onchange="adri.ui.form.setUserData(\'' + role + '\',\'' + index + '\',\'' + field + '\',$(this).val());"></input>' +
                            '</div>';
                        return markup;
                    },
                    userRepeater: function (label, updates, field) {
                        var rid = label.split(/[^A-Za-z0-9]/).join('');
                        var markup = '<div title="Add a range of time. You can use this for more control of your schedule." id="user-repeater-' + rid + '"></div><button class="button thin hlBG negTxt ckable" onclick="adri.ui.form.addUser(\'user-repeater-' + rid + '\',\'' + label + '\',\'' + updates + '\',\'' + field + '\')"><span>Add ' + label + '</span></button>';
                        return markup;
                    },
                    user: function (role, updates, fld) {
                        var nodes = $('.form-user-node-struct').length;
                        adri.ui.form.data.users[fld][nodes] = {};
                        var field = adri.ui.template.field;
                        var markup = '<div id="user-' + nodes + '" class="form-user-node">' +
                            '<div id="user-' + nodes + '" class="formHeader">Enter ' + role + ' Information</div>' +
                            field.userInput(role + ' ID', fld, nodes, 'id') +
                            field.userInput(role + ' First Name', fld, nodes, 'firstName') +
                            field.userInput(role + ' Last Name', fld, nodes, 'lastName') +
                            field.userInput(role + ' Email', fld, nodes, 'email') +
                            field.userInput(role + ' Phone', fld, nodes, 'phone') +
                            '</div>';
                        return markup;
                    },
                    timeNodes: function (category, index) {
                        var zone;
                        var markup = '';
                        var mkup = '';
                        var timeData = adri.util.time.propagateWorkhoursArray();
                        var hours = timeData.hours;
                        var minutes = timeData.minutes;
                        var period = timeData.period;
                        var hrs = hours.length;
                        var mins = minutes.length;

                        var hmkup = '';
                        for (var i = 0; i < hrs; i++) {
                            hmkup = hmkup + '<option value="' + hours[i] + '">' + hours[i][0] + '</option>';
                        }

                        var id = 'selector-hours' + index + '-' + category;
                        adri.id = id;                                                                                                                                             ////onclick="adri.ui.form.setBlockTime(\'' + category + '\',\'' + index + '\',\'hour\',\'' + value[0] + '\'); adri.ui.form.setBlockTime(\'' + category + '\',\'' + index + '\',\'period\',\'' + value[1] + '\');"          
                        markup = '<div title="Use these fields to choose a time range for your availability" id="selector-hours-' + index + '-' + category + '" class="container"><select onchange="adri.ui.form.setBlockHour(\'' + category + '\',\'' + index + '\',$(this).val());" class="dropdown" name="radio-hours-' + index + '-' + category + '" id="radio-hours-' + index + '-' + category + '" >' + hmkup + '</select></div>';

                        for (var e = 0; e < mins; e++) {
                            mkup = mkup + '<option value="' + minutes[e] + '">' + minutes[e] + '</option>';
                        }

                        markup = markup + '<div title="Use these fields to choose a time range for your availability" class="container"><select onchange="adri.ui.form.setBlockMinute(\'' + category + '\',\'' + index + '\',\'minutes\',$(this).val());" class="dropdown" name="radio-minutes-' + index + '-' + category + '" id="radio-minutes-' + index + '-' + category + '" >' + mkup + '</select></div>';

                        return markup;
                    },
                    workHourNode: function (category, index, zone, value) {
                        var markup = '<option id="' + zone + '-' + index + '-' + value.join('') + '" class="option" data-value="' + value[0] + '">' + value[0] + '</option>';
                        return markup;
                    },
                    timeNode: function (category, index, zone, value, icon) {
                        var markup = '<option id="' + zone + '-' + index + '-' + value + '" onclick="adri.ui.form.setBlockTime(\'' + category + '\',\'' + index + '\',\'minutes\',\'' + value + '\');">' + icon + '</option>';
                        return markup;
                    },
                    timeNodeSmall: function (category, index, zone, value, args) {//Mark: added "small" function as the timeNode function is still needed for the editing form.           
                        var icon = args['hr'] + ':' + args['min'] + args['per'];
                        var markup = '<div class="time-section"><div class="field-viewer" id="' + zone + '-' + index + '-' + value + '" >' + icon + '</div></div>';
                        return markup;
                    }
                },
                availabilityNode: function (data) {
                    var fields = [
                        'INTERVIEW_REFERENCE_ID',
                        'TIME_SLOT',
                        'TIME_SLOT_STATUS',
                        'TSID',
                        'USER_FNAME',
                        'USER_ID',
                        'USER_LNAME',
                        'USER_ROLE'
                    ];

                    data['TIME_SLOT'] = data['TIME_SLOT'] || '';

                    var nodeID = data['TIME_SLOT'].split(/[^0-9]/).join('-');
                    var markup = '<div id="availability-node-' + nodeID + '" class="date-node">' +
                        adri.ui.template.date(data['TIME_SLOT'].split('T')[0]) +
                        '<div>' + data['TIME_SLOT'].split('T')[1].split('Z')[0] + '</div>' +
                        '<div>' + data.users.join('\<br\/\>') + '</div>' +
                        '</div>';
                    return markup;

                },
                availabilityNodeSingle: function (data) {
                    var nodeID = data['TIME_SLOT'].split(/[^0-9]/).join('-');
                    var markup = '<div id="availability-node-' + nodeID + '" class="date-node-single">' +
                        adri.ui.template.date(data['TIME_SLOT'].split('T')[0]) +
                        '<div>' + data['TIME_SLOT'].split('T')[1].split('Z')[0] + '</div>' + //<i class="material-icons">&#xE5CD;</i>
                        '<div class="remove-widget" onclick="adri.timeslot.deleteSlot(\'' + data['TSID'] + '\');">&#xE5CD;</div>' +
                        '</div>';
                    return markup;
                },
                userNode: function (data) {

                    var fields = [
                        'INTERVIEW_REFERENCE_ID',
                        'USER_FNAME',
                        'USER_ID',
                        'USER_LNAME',
                        'USER_ROLE',
                        'USER_PHONE',
                        'USER_EMAIL',
                        'ROW_ID'
                    ];

                    var fullName = data['USER_FNAME'] + ' ' + data['USER_LNAME'];

                    var nodeID = data['USER_ID'];

                    if (data['USER_PHONE'] === null) {
                        data['USER_PHONE'] = '';
                    }

                    var uid = constants.interview.user; //<i class="material-icons">&#xE5CD;</i> onclick="adri.interview.deleteUser(\'' + data['ROW_ID'] + '\');"
                    var delUser = '';//'<div title="Delete this user from this call." class="remove-widget">&#xE5CD;</div>';
                    if (uid === data.personcode || appconfig.page.interviewdetail.controls.deleteuser === false) {
                        delUser = '';
                    }

                    var role = data['USER_ROLE'] || '';
                    if (role === null) {
                        role = '';
                    }

                    role = role.split('Interviewer').join(appconfig.alias.interviewer);
                    role = role.split('Candidate').join(appconfig.alias.candidate);
                    role = role.split('Recruiter').join(appconfig.alias.recruiter);
                    var etxt = '<p>Email sent!</p>';
                    var mtxt = '<p>Text sent!</p>';
                    var calwidget = '<div title="Offer a specific time." class="add-widget" onclick="adri.timeslot.addControls(\'modal-form\',\'' + data['USER_ID'] + '\',\'' + fullName + '\',\'' + data['USER_ROLE'] + '\');">&#xE878;</div>';
                    var emlwidget = '<div title="Email this user a new link." class="add-widget" onclick="adri.util.emailUser(\'' + 6 + '\', \'' + data['USER_ID'] + '\');adri.ui.modal.error.open(\'' + etxt + '\');">&#xE0BE;</div>';
                    var smswidget = '<div title="Send a mobile text to this user." class="add-widget" onclick="adri.util.smsUser(\'' + data['USER_ID'] + '\');adri.ui.modal.error.open(\'' + mtxt + '\');">&#xE0D8;</div>';

                    if (appconfig.page.interviewdetail.controls.calendar !== true) {
                        calwidget = '';
                    }

                    if (appconfig.page.interviewdetail.controls.email !== true) {
                        emlwidget = '';
                    }

                    if (appconfig.page.interviewdetail.controls.sms !== true) {
                        smswidget = '';
                    }

                    var markup = '<div id="user-node-' + nodeID + '" class="ui-user-node">' +
                        delUser +
                        '<div class="ui-user-node-info">' +
                        '<div class="ui-user-node-header">' + fullName + '</div>' +
                        '<hr />' +
                        '<div class="ui-user-node-body">' + role + '</div>' +
                        '<div class="ui-user-node-body">' + data['USER_PHONE'] + '</div>' +
                        '<div class="ui-user-node-body">' + data['USER_EMAIL'] + '</div>' +
                        '<div id="user-availability-' + nodeID + '" class="user-date-node"></div>' +
                        '<div style="margin-top:10%;" class="spanned centered block">' +
                        calwidget +
                        emlwidget +
                        smswidget +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    return markup;
                },
                addUserNode: function () {
                    return '<div onclick="adri.interview.addUserForm();" class="add-user-container"><div class="add-user-widget">&#xf234;</div></div>';
                },
                dateNode: function (nodeID, date) {
                    var field = adri.ui.template.field;
                    var index = $('.ti-schedule-node').length;
                    var startSelector = field.timeNodes('startTime', index);
                    var markup = '<div id="datetime-node-' + nodeID + '" class="ti-schedule-node pBG">' +
                        adri.ui.template.date(date) +
                        field.wrap('Start Time', startSelector) + '<br />' +
                        '</div>';
                    return markup;
                },
                timeSelect: function (id, opts, field) {
                    return '<select id="' + id + '" class="time-select" onchange="adri.ui.setData(\'' + id + '\',\'' + field + '\',$(this).val())">' + opts + '</select>';
                },
                date: function (date) {
                    var da = date.split('-');
                    var formattedDate = da[1] + '/' + da[2] + '/' + da[0];
                    var markup = '<span>' + formattedDate + ': </span>'; //fix this up
                    return markup;
                }
            },
            form: {
                data: {
                    clientID: constants.interview.client,
                    userID: constants.interview.user,
                    uiID: constants.interview.ui,
                    interview: {},
                    positions: [ //TEMP
                        {
                            rolename: "Commercial Lawn Specialist",
                            role_code: "R8464",
                            role_type: "Job Requisition",
                            count: 1
                        },
                        {
                            rolename: "Commercial Lawn Specialist",
                            role_code: "R7540",
                            role_type: "Job Requisition",
                            count: 2
                        },
                        {
                            rolename: "Residential Laborer",
                            role_code: "R7160",
                            role_type: "Job Requisition",
                            count: 3
                        },
                        {
                            rolename: "Commercial Lawn Specialist",
                            role_code: "R7146",
                            role_type: "Job Requisition",
                            count: 4
                        },
                        {
                            rolename: "RESIDENTIAL SALES REP",
                            role_code: "R7150",
                            role_type: "Job Requisition",
                            count: 5
                        },
                        {
                            rolename: "RESIDENTIAL SALES REP",
                            role_code: "R7156",
                            role_type: "Job Requisition",
                            count: 6
                        },
                        {
                            rolename: "RESIDENTIAL SALES REP",
                            role_code: "R7543",
                            role_type: "Job Requisition",
                            count: 7
                        },
                    ],
                    positionids: [],
                    users: {
                        candidates: [
                            {
                                c_email: 'support@adri-sys.com',
                                c_fname: 'Jordan',
                                c_lname: 'Marshall',
                                c_phone: '12059151006',
                                rolename: "Commercial Lawn Specialist",
                                INTERVIEW_REFERENCE_ID: "C00831124-99841928-R7540",
                                role_code: "R7540"
                            },
                            {
                                c_email: 'support@adri-sys.com',
                                c_fname: 'Peter',
                                c_lname: 'Parker',
                                c_phone: '12059151006',
                                rolename: "Commercial Lawn Specialist",
                                INTERVIEW_REFERENCE_ID: "C00831124-99841928-R7540",
                                role_code: "R7540"
                            },
                            {
                                c_email: 'support@adri-sys.com',
                                c_fname: 'Will',
                                c_lname: 'Smith',
                                c_phone: '12059151006',
                                rolename: "Residential Worker",
                                INTERVIEW_REFERENCE_ID: "C00831124-99841928-R7160",
                                role_code: "R7160"
                            },
                        ],
                        recruiters: [
                            {
                                userid: 1319,
                                fname: "Billie",
                                lname: "Hook",
                                emailaddress: "support@adri-sys.com",
                                mobilenumber: "12059151006",
                                role_code: "R7150"
                            },
                            {
                                userid: 1319,
                                fname: "Billie",
                                lname: "Hook",
                                emailaddress: "support@adri-sys.com",
                                mobilenumber: "12059151006",
                                role_code: "R7160"
                            },
                            {
                                userid: 1319,
                                fname: "Billie",
                                lname: "Hook",
                                emailaddress: "support@adri-sys.com",
                                mobilenumber: "12059151006",
                                role_code: "R7540"
                            },
                            {
                                userid: 92990,
                                fname: "Mikesha",
                                lname: "Charles",
                                emailaddress: "support@adri-sys.com",
                                mobilenumber: "12059151006",
                                role_code: "R7146"
                            },
                            {
                                userid: 92990,
                                fname: "Mikesha",
                                lname: "Charles",
                                emailaddress: "support@adri-sys.com",
                                mobilenumber: "12059151006",
                                role_code: "R7150"
                            },
                            {
                                userid: 92990,
                                fname: "Mikesha",
                                lname: "Charles",
                                emailaddress: "support@adri-sys.com",
                                mobilenumber: "12059151006",
                                role_code: "R7156"
                            },
                            {
                                userid: 92990,
                                fname: "Mikesha",
                                lname: "Charles",
                                emailaddress: "support@adri-sys.com",
                                mobilenumber: "12059151006",
                                role_code: "R7540"
                            },
                            {
                                userid: 92990,
                                fname: "Mikesha",
                                lname: "Charles",
                                emailaddress: "support@adri-sys.com",
                                mobilenumber: "12059151006",
                                role_code: "R7543"
                            },
                            {
                                userid: 92990,
                                fname: "Mikesha",
                                lname: "Charles",
                                emailaddress: "support@adri-sys.com",
                                mobilenumber: "12059151006",
                                role_code: "R8477"
                            },
                            {
                                userid: 92990,
                                fname: "Mikesha",
                                lname: "Charles",
                                emailaddress: "support@adri-sys.com",
                                mobilenumber: "12059151006",
                                role_code: "R8632"
                            },
                            {
                                userid: 77767,
                                fname: "Emily",
                                lname: "LAROCHE",
                                emailaddress: "support@adri-sys.com",
                                mobilenumber: "12059151006",
                                role_code: "R7150"
                            },
                            {
                                userid: 12345,
                                fname: "Clinton",
                                lname: "White",
                                emailaddress: "support@adri-sys.com",
                                mobilenumber: "12059151006",
                                role_code: "R7150"
                            },
                            {
                                userid: 12345,
                                fname: "Clinton",
                                lname: "White",
                                emailaddress: "support@adri-sys.com",
                                mobilenumber: "12059151006",
                                role_code: "R7156"
                            },
                            {
                                userid: 93452,
                                fname: "Amber",
                                lname: "Jones",
                                emailaddress: "support@adri-sys.com",
                                mobilenumber: "12059151006",
                                role_code: "R8464"
                            },
                        ],
                        managers: {}
                    }
                },
                resetData: function () {
                    adri.ui.form.data = {
                        clientID: constants.interview.client,
                        userID: constants.interview.user,
                        uiID: constants.interview.ui,
                        interview: {},
                        positions: [ //TEMP
                            {
                                rolename: "Commercial Lawn Specialist",
                                role_code: "R8464",
                                role_type: "Job Requisition",
                                count: 1
                            },
                            {
                                rolename: "Commercial Lawn Specialist",
                                role_code: "R7540",
                                role_type: "Job Requisition",
                                count: 2
                            },
                            {
                                rolename: "Residential Laborer",
                                role_code: "R7160",
                                role_type: "Job Requisition",
                                count: 3
                            },
                            {
                                rolename: "Commercial Lawn Specialist",
                                role_code: "R7146",
                                role_type: "Job Requisition",
                                count: 4
                            },
                            {
                                rolename: "RESIDENTIAL SALES REP",
                                role_code: "R7150",
                                role_type: "Job Requisition",
                                count: 5
                            },
                            {
                                rolename: "RESIDENTIAL SALES REP",
                                role_code: "R7156",
                                role_type: "Job Requisition",
                                count: 6
                            },
                            {
                                rolename: "RESIDENTIAL SALES REP",
                                role_code: "R7543",
                                role_type: "Job Requisition",
                                count: 7
                            },
                        ],
                        positionids: [],
                        users: {
                            candidates: [
                                {
                                    c_email: 'support@adri-sys.com',
                                    c_fname: 'Jordan',
                                    c_lname: 'Marshall',
                                    c_phone: '12059151006',
                                    rolename: "Commercial Lawn Specialist",
                                    INTERVIEW_REFERENCE_ID: "C00831124-99841928-R7540",
                                    role_code: "R7540"
                                },
                                {
                                    c_email: 'support@adri-sys.com',
                                    c_fname: 'Peter',
                                    c_lname: 'Parker',
                                    c_phone: '12059151006',
                                    rolename: "Commercial Lawn Specialist",
                                    INTERVIEW_REFERENCE_ID: "C00831124-99841928-R7540",
                                    role_code: "R7540"
                                },
                                {
                                    c_email: 'support@adri-sys.com',
                                    c_fname: 'Will',
                                    c_lname: 'Smith',
                                    c_phone: '12059151006',
                                    rolename: "Residential Worker",
                                    INTERVIEW_REFERENCE_ID: "C00831124-99841928-R7160",
                                    role_code: "R7160"
                                },
                            ],
                            recruiters: [
                                {
                                    userid: 1319,
                                    fname: "Billie",
                                    lname: "Hook",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7150"
                                },
                                {
                                    userid: 1319,
                                    fname: "Billie",
                                    lname: "Hook",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7160"
                                },
                                {
                                    userid: 1319,
                                    fname: "Billie",
                                    lname: "Hook",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7540"
                                },
                                {
                                    userid: 92990,
                                    fname: "Mikesha",
                                    lname: "Charles",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7146"
                                },
                                {
                                    userid: 92990,
                                    fname: "Mikesha",
                                    lname: "Charles",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7150"
                                },
                                {
                                    userid: 92990,
                                    fname: "Mikesha",
                                    lname: "Charles",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7156"
                                },
                                {
                                    userid: 92990,
                                    fname: "Mikesha",
                                    lname: "Charles",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7540"
                                },
                                {
                                    userid: 92990,
                                    fname: "Mikesha",
                                    lname: "Charles",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7543"
                                },
                                {
                                    userid: 92990,
                                    fname: "Mikesha",
                                    lname: "Charles",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R8477"
                                },
                                {
                                    userid: 92990,
                                    fname: "Mikesha",
                                    lname: "Charles",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R8632"
                                },
                                {
                                    userid: 77767,
                                    fname: "Emily",
                                    lname: "LAROCHE",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7150"
                                },
                                {
                                    userid: 12345,
                                    fname: "Clinton",
                                    lname: "White",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7150"
                                },
                                {
                                    userid: 12345,
                                    fname: "Clinton",
                                    lname: "White",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7156"
                                },
                                {
                                    userid: 93452,
                                    fname: "Amber",
                                    lname: "Jones",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R8464"
                                },
                            ],
                            managers: {}
                        }
                    };
                },
                setData: function (updates, index, field, val) {
                    adri.ui.form.dtemp[updates][field] = val;
                },
                setUserData: function (updates, index, field, val) {
                    adri.ui.form.dtemp.users[updates][index][field] = val;
                },
                setSubData: function (updates, field, subField, val) {
                    adri.ui.form.data[updates][field][subField] = val;
                },
                setBlockTime: function (category, index, field, value) {

                    var lim = adri.ui.form.data.availability[index].length;
                    for (var i = 0; i < lim; i++) {
                        adri.ui.form.data.availability[index][i].schedule[category][field] = value;
                    }
                },
                setBlockHour: function (category, index, value) {
                    var val = value.split(',');
                    console.log();
                    var time = val[0];
                    var period = val[1];

                    var lim = adri.ui.form.data.availability[index].length;
                    for (var i = 0; i < lim; i++) {
                        adri.ui.form.data.availability[index][i].schedule[category]['period'] = period;
                    }

                    for (var i = 0; i < lim; i++) {
                        adri.ui.form.data.availability[index][i].schedule[category]['hour'] = time;
                    }
                    //console.log(category, index, value);
                    //console.log(adri.ui.form.data.availability[index]);
                },
                setBlockMinute: function (category, index, field, value) {
                    var lim = adri.ui.form.data.availability[index].length;
                    for (var i = 0; i < lim; i++) {
                        adri.ui.form.data.availability[index][i].schedule[category][field] = value;
                    }
                },
                instantiateDay: function (day, index) {

                    var $node = $('#day-toggle-' + index + '-' + day);
                    var state = $node.attr('data-state');

                    if (state === 'off') {
                        var lim = adri.ui.form.data.availability[index].length;
                        var ids = [];
                        for (var i = 0; i < lim; i++) {
                            if (adri.ui.form.data.availability[index][i].day === day) {
                                ids.push(i);
                            }
                        }

                        for (var n = ids.length - 1; n > -1; n--) {
                            adri.ui.form.data.availability[index].splice(ids[n], 1);
                        }
                    }
                    else {
                        var block = new BlockDay(day);
                        if (!adri.ui.form.data.availability[index]) {
                            adri.ui.form.data.availability.push([block]);
                        }
                        else {
                            block.schedule = adri.ui.form.data.availability[index][0].schedule;
                            adri.ui.form.data.availability[index].push(block);
                        }
                    }
                },
                addUser: function (el, role, updates, field) {
                    var markup = adri.ui.template.field.user(role, updates, field);
                    $('#' + el).append(markup);
                },
                removeUser: function (id, updates) {

                },
                newEvent: function () {
                    var $content = $('#adri-ras-content');
                    var field = adri.ui.template.field;
                    var interview = adri.ui.form.data.interview;
                    var position = adri.ui.form.data.positions;
                    var users = adri.ui.form.data.users;
                    var form = '<div id="new-event-form" class="form-event">' +
                        '<div class="formHeader">Enter ' + appconfig.alias.interview + ' Information</div>' +        //hard-coded
                        field.input(appconfig.alias.interview + ' Title', 'interview', 'title') +                       //hard-coded
                        '<div style="display:none;">' + field.input(appconfig.alias.interview + ' ID', 'interview', 'id') + '</div>' +
                        //field.input(appconfig.alias.interview + ' Address', 'interview', 'address') +
                        //field.input(appconfig.alias.interview + ' City', 'interview', 'city') +
                        //field.input(appconfig.alias.interview + ' State', 'interview', 'state') +
                        //field.input(appconfig.alias.interview + ' Zip', 'interview', 'zip') +
                        field.input('Phone/ Conference Number', 'interview', 'conferenceNumber') +   //hard-coded
                        field.input('Conference ID', 'interview', 'conferenceID') +           //hard-coded
                        field.input('Conference Code', 'interview', 'conferenceCode') +       //hard-coded
                        '<hr/>' +
                        field.input('Position ID', 'positions', 'id') +
                        field.input('Position Name', 'positions', 'name') +
                        '<hr/>' +
                        field.userRepeater(appconfig.alias.candidate, 'users', 'candidates') +
                        '<hr/>' +
                        field.userRepeater(appconfig.alias.recruiter, 'users', 'recruiters') +
                        '<hr/>' +
                        field.userRepeater(appconfig.alias.interviewer, 'users', 'interviewers') +      //hard-coded
                        '</div>' +
                        '<div style="width:100%;text-align:center;"><button type="button" onclick="adri.ui.form.submit()">Create Event!</button></div>';
                    $content.html(form);

                    var dNow = new Date();
                    var iid = dNow.getTime() + '-' + atob(constants.interview.user);
                    $('#field-id').val(iid);
                    $('#field-id').change();
                },
                submit: function (onComplete) {


                    $.ajax({
                        type: "POST",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.addInterview,
                        data: JSON.stringify(adri.ui.form.data),
                        success: function (data) {
                            adri.ui.form.resetData();

                            if (typeof onComplete === "function") {
                                onComplete();
                            }
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                setToggler: function ($toggler) {
                    var state = $toggler.attr('data-state');
                    if (state === 'off') {
                        $toggler.attr('data-state', 'on');
                        $toggler.attr('data-value', 'yes');
                        $toggler.addClass('cked');
                    }
                    else {
                        $toggler.attr('data-state', 'off');
                        $toggler.attr('data-value', 'no');
                        $toggler.removeClass('cked');
                    }
                },
                setRadio: function (zone, $radio) {
                    $('#' + zone + ' .radio').removeClass('cked');
                    $radio.addClass('cked');
                }
            },
            loaderLong: function (isLoading, id) {
                var element = '<div class="spinnerContainer"><div class="loader"></div><div class="spanned loadertxt">Please allow up to 30 seconds for your data to be uploaded</div></div>';
                var theEl = $('#' + id);

                if (isLoading === true) {
                    theEl.css('display', '');
                    theEl.html(element);
                    var spinner = $(".loader");

                    setTimeout(function () {
                        spinner.css('transform', 'rotate(216000deg)');
                    }, 100);

                }

                else {
                    adri.ui.labels.initLabels();
                    theEl.css('display', 'none');
                }
            },
            loader: function (isLoading, id) {
                var element = '<div class="spinnerContainer"><div class="loader"></div></div>';
                var theEl = $('#' + id);

                if (isLoading === true) {
                    theEl.css('display', '');
                    theEl.html(element);
                    var spinner = $(".loader");

                    setTimeout(function () {
                        spinner.css('transform', 'rotate(216000deg)');
                    }, 100);

                }

                else {
                    adri.ui.labels.initLabels();
                    theEl.css('display', 'none');
                }
            }
        },
        interview: {
            scheduling: {
                userID: '',
                userName: '',
                userRole: ''
            },
            get: function (onComplete) {
                $.ajax({
                    type: "GET",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.getInterview + "?iref=" + constants.interview.id + '&uid=' + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client,
                    success: function (data) {
                        onComplete(data[0][0]);
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            },
            loadToUI: function (data) {
                $('#page-title').html(appconfig.alias.interview + ' Details');
                var $el = $('#contentRibbon');
                $el.html('');
                var interview = data;
                var mainNumber;
                var canName;

                for (var e = 0; e < data.length; e++) {
                    if (data[e].user_role === "Candidate" || data[e].user_role === 'Prospect') {
                        mainNumber = data[e].mobilenumber || 'None';
                        canName = data[e].fname + ' ' + data[e].lname;
                    }
                };
                var iFields = [
                    //['ID', 'INTERVIEW_REFERENCE_ID'], //hard-coded
                    ['Title', 'INTERVIEW_TITLE'],
                    //['Address', 'INTERVIEW_ADDRESS'], //hard-coded
                    //['City', 'INTERVIEW_CITY'],           //hard-coded
                    //['State', 'INTERVIEW_STATE'],         //hard-coded
                    //['Zip', 'INTERVIEW_ZIP'],             //hard-coded
                    ['Conference Number', 'INTERVIEW_CONFERENCE_NUMBER'],
                    ['Conference Code', 'INTERVIEW_CONFERENCE_CODE'],
                    ['Conference ID', 'INTERVIEW_CONFERENCE_ID']
                ];
                console.log('interview', interview);
                var iCard = '<div id="interview-info-container" class="int-info-container">' +
                    '<div id="dtl-' + interview['INTERVIEW_REFERENCE_ID'] + '" class="interviewInfo">' +
                    '<div id="dtl-txt-' + interview['INTERVIEW_REFERENCE_ID'] + '" class="interviewCardContents ">' +
                    '<div id="interview-info-header" class="formHeader secHTxt roboto">' + appconfig.alias.interview + ' for ' + interview['POSITION_NAME'] + '</div>' +  //hard-coded
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="interviewNodeArea ">' +
                    //'<div class="formHeader secHTxt">Users Associated with ' + appconfig.alias.interview + '</div>' +    //hard-coded
                    '<div id="adri-ras-timeNodes"></div>' +
                    '</div>' +
                    '<div id="modal-form" class="modal-form"></div>' +
                    '<div id="smallModal" class="modal-small"></div>' +
                    '<div id="largeModal" class="modal-large"><div class="modal-header-wrap" id="modalLargeHeader"></div><div style="display:table" id="modalLargeBody"></div></div>' +
                    '<div id="modal-bg-overlay" class="modal-overlay" onclick="adri.timeslot.removeControls();"></div>' +
                    '<div id="small-modal-bg-overlay" class="modal-overlay" onclick="adri.ui.modal.small.close();"></div>';

                $el.html(iCard);
                var tMarkup = '';
                for (var i = 0; i < iFields.length; i++) {
                    if (interview[iFields[i][1]] === null) {
                        interview[iFields[i][1]] = '';
                    }
                    tMarkup = '<div class="icardFldWrap">' +
                        '<div class="secHTxt roboto bold block">' + iFields[i][0] + '</div><div class="secHTxt roboto fixedHgt">' + interview[iFields[i][1]] + '</div>' +
                        '</div>';
                    $('#dtl-txt-' + interview['INTERVIEW_REFERENCE_ID']).append(tMarkup);
                }

                //$('.dynamicContent').fadeIn('fast');
            },
            getUsers: function (onComplete) {
                console.log('getUsers');
                var svc = constants.urls.getUsers + '?iref=' + constants.interview.id + '&uid=' + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client;
                $.ajax({
                    type: "GET",
                    contentType: 'application/json',
                    dataType: "json",
                    url: svc,
                    success: function (data) {
                        onComplete(data[0]);
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            },
            addUserNodes: function (data) {
                var lim = data.length;
                var $Content = $('.ui-content-body');
                $Content.html('');
                var header = '<div id="db-weekly-view" class="centered dashMain-title">' +
                    '<div style="margin-left:0;" class="dashboard-header-block"><div class="dashboard-header-text">Users Associated with ' + appconfig.alias.interview + '</div></div>' +
                    '</div>';
                $Content.html(header);

                var modal = '<div id="error-modal" class="modal">' +
                    '<div id="availError" class="modal-content">' +
                    '</div>' +
                    '</div>';
                $Content.append(modal);

                var map = {};

                for (var i = 0; i < lim; i++) {
                    if (!map[data[i]['USER_ID']]) {
                        map[data[i]['USER_ID']] = data[i];
                    }
                }

                for (var user in map) {
                    $Content.append(adri.ui.template.userNode(map[user]));
                }

                var rowColors = adri.tcolors;
                var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                $('.user-date-node').css('background', getRandomColor);

                if (appconfig.page.interviewdetail.controls.adduser === true) {
                    $Content.append(adri.ui.template.addUserNode());
                }
                adri.ui.loader(false, "dynamic-content-loader");
            },
            addUserForm: function () {
                adri.ui.form.resetData();
                var $modal = $('#modal-form');
                var field = adri.ui.template.field;
                var userFields = field.userRepeater(appconfig.alias.candidate, 'users', 'candidates') +
                    field.userRepeater(appconfig.alias.recruiter, 'users', 'recruiters') +
                    field.userRepeater(appconfig.alias.interviewer, 'users', 'interviewers') +    //hard-coded
                    '<hr \>' +
                    '<button class="bigButton mainBG negTxt ckable" onclick="adri.interview.submitUsers()">SUBMIT</button>';
                $modal.html(userFields);
                adri.ui.modal.open();
            },
            submitUsers: function () {
                adri.ui.form.data.interview.id = constants.interview.id;

                $.ajax({
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.addUsers,
                    data: JSON.stringify(adri.ui.form.data),
                    success: function (data) {
                        adri.ui.form.resetData();
                        adri.interview.getUsers(function (data) {
                            adri.interview.addUserNodes(data);
                            adri.ui.availability.get(function (data) {
                                adri.ui.availability.drawUserTimes(data);
                            });
                        });
                        adri.ui.modal.close();
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });

            },
            deleteUser: function (id) {
                var jsData = {
                    id: id,
                    clientID: constants.interview.client,
                    userID: constants.interview.user,
                    uiID: constants.interview.ui,
                    interviewID: constants.interview.id
                };

                $.ajax({
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.deleteUser,
                    data: JSON.stringify(jsData),
                    success: function (data) {
                        adri.interview.getUsers(function (data) {
                            adri.interview.addUserNodes(data);
                            adri.ui.availability.get(function (data) {
                                adri.ui.availability.drawUserTimes(data);
                            });
                        });
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            }
        },
        timeslot: {
            wrap: function () {
                var jsData = {
                    data: [],
                    info: {
                        uiID: constants.interview.ui,
                        userID: constants.interview.user,
                        clientID: constants.interview.client
                    }
                };
                var index = 0;
                var timeslot;

                var lim = adri.ui.form.data.availability.length;

                for (var i = 0; i < lim; i++) {
                    timeslot = adri.ui.form.data.availability[i][0];
                    jsData.data[index] = new APITimeInstance(timeslot);
                    index++;
                }

                return jsData;
            },
            add: function (jsData) {
                $.ajax({
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.addTimeSlot,
                    data: JSON.stringify(jsData),
                    success: function (data) {
                        adri.data = {};
                        adri.timeslot.removeControls();
                        adri.ui.availability.get(function (data) {
                            adri.ui.availability.drawUserTimes(data);
                        });
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            },
            addControls: function (elmt, userID, userName, userRole) {
                adri.interview.scheduling = {
                    userID: userID,
                    userName: userName,
                    userRole: userRole
                };
                adri.ui.time.load(elmt);
                adri.ui.modal.open();
            },
            removeControls: function () {
                adri.interview.scheduling = {
                    userID: '',
                    userName: '',
                    userRole: ''
                };
                adri.ui.modal.close();
            },
            deleteSlot: function (id) {
                var jsData = {
                    id: id,
                    interviewID: constants.interview.id,
                    uiID: constants.interview.ui,
                    userID: constants.interview.user,
                    clientID: constants.interview.client
                };

                $.ajax({
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.deleteTimeSlot,
                    data: JSON.stringify(jsData),
                    success: function (data) {
                        adri.ui.availability.get(function (data) {
                            adri.ui.availability.drawUserTimes(data);
                        });
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            }
        },
        user: {
            validate: function (onComplete) {
                var svc = constants.urls.validateUser + '?iref=' + constants.interview.id + '&uid=' + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client;
                console.log(constants);
                $.ajax({
                    type: "GET",
                    contentType: 'application/json',
                    dataType: "json",
                    url: svc,
                    success: function (data) {
                        onComplete(data);
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                        console.log(error);
                    }
                });
            },
            info: {
                launchEditForm: function () {
                    adri.user.info.edit(constants.interview.user);
                },
                edit: function (userID, check) {
                    var $vc = $('#availabilityView');
                    var $modal = $('#modal-form');
                    var form = adri.user.info.form(userID);
                    var view = adri.user.info.view();
                    $vc.html(view);
                    $modal.html(form);
                    adri.user.info.load(userID);
                },
                form: function (userID) {
                    var field = adri.ui.template.field;
                    var wdGroup = field.dayToggle('Su', 'sunday', 0) +
                        field.dayToggle('Mo', 'monday', 0) +
                        field.dayToggle('Tu', 'tuesday', 0) +
                        field.dayToggle('We', 'wednesday', 0) +
                        field.dayToggle('Th', 'thursday', 0) +
                        field.dayToggle('Fr', 'friday', 0) +
                        field.dayToggle('Sa', 'saturday', 0);

                    var startSelector = field.timeNodes('startTime', 0);
                    var endSelector = field.timeNodes('endTime', 0);
                    var lunchSelector = field.timeNodes('lunchTime', 0);

                    var form = '<div class="formContent">' +
                        '<div class="dashMain-title centered">' +
                        '<div class="dashboard-header-block">' +
                        '<div class="dashboard-header-text">Persistent Availability</div>' +
                        '</div>' +
                        '</div>' +
                        '<div id="block-schedule-area" class="block-container">' +
                        '<div id="block-repeater-edit centered" class="block-repeater">' +
                        field.wrapDay('Days Available', wdGroup) +
                        '<div class="repeaterFieldSpanned">' +
                        field.wrap('Start', startSelector) +
                        field.wrap('End', endSelector) +
                        field.wrap('Lunch', lunchSelector) +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="block-repeater-add">' +
                        '<div title="Add an additional range of time to your schedule." class="block-text fheader">&nbsp;Add Another Schedule</div><div class="stdWidget" onclick="adri.user.info.addBlockRepeater();">&#xE146;</div>' +
                        '</div>' +
                        field.number('Default ' + appconfig.alias.interview + ' Length (Minutes)', 'info', 'defaultInterviewMinutes', 5, 20, 10) +           //hard-coded
                        field.number(appconfig.alias.interviewer + ' Rank', 'info', 'ranking', 1, 1, 0) +
                        '<div class="centered spanned"><button type="button" class="bigButton mainBG negTxt ckable" onclick="adri.user.info.update(\'' + userID + '\',adri.user.info.updated)">Submit</button></div><div class="spacer"></div>' +
                        '</div>';
                    return form;
                },
                personalInfo: function (userID) {
                    var info = '<div class="formHeader secHTxt centered">Identifying Information</div>' +
                        field.input('First Name', 'info', 'fName') +
                        field.input('Last Name', 'info', 'lName') +
                        field.input('Email Address', 'info', 'email') +
                        field.input('Phone Number', 'info', 'phone') +
                        field.input('Location', 'info', 'location') +
                        '<button class="bigButton mainBG negTxt ckable" onclick="adri.user.info.update(\'' + userID + '\',adri.user.info.updated)">Submit</button>';
                    return info;
                },
                view: function () {//Mark: view created for display under mini calendar. Most markup not needed as it is mostly drawn depending on the data pulled. 
                    var field = adri.ui.template.field;
                    var form = '<div class="formContent">' +
                        '<div class="dashHeader">Current Availability</div>' +
                        '<div title="Edit Availability" id="block-schedule-view" class="block-container" onclick="adri.ui.modal.open();">' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    return form;
                },
                addBlockRepeater: function () { // MARK: Might need to create view version of block repeater
                    var index = $('.block-repeater').length;
                    var field = adri.ui.template.field;
                    var wdGroup = field.dayToggle('Su', 'sunday', index) +
                        field.dayToggle('Mo', 'monday', index) +
                        field.dayToggle('Tu', 'tuesday', index) +
                        field.dayToggle('We', 'wednesday', index) +
                        field.dayToggle('Th', 'thursday', index) +
                        field.dayToggle('Fr', 'friday', index) +
                        field.dayToggle('Sa', 'saturday', index);

                    var startSelector = field.timeNodes('startTime', index);
                    var endSelector = field.timeNodes('endTime', index);
                    var lunchSelector = field.timeNodes('lunchTime', index);
                    var block = '<div class="block-repeater">' +
                        field.wrapDay('Days Available', wdGroup) +
                        '<div class="repeaterFieldSpanned">' +
                        field.wrap('Start', startSelector) +
                        field.wrap('End', endSelector) +
                        field.wrap('Lunch', lunchSelector) +
                        '</div>' +
                        '</div>';
                    $('#block-schedule-area').append(block);
                    //dropdowns();
                },
                addBlockView: function () { // MARK: View function created to handle the dashboard preview of availability. (Cleanup.)
                    $('#block-schedule-view').html('');
                    var index = $('.block-repeater').length;

                    var field = adri.ui.template.field;
                    var fWrap;
                    var avail = adri.ui.form.data.availability;
                    var aLen = avail.length;
                    var rowColors = adri.colors;

                    if (avail[0]) {
                        var wkDays = {
                            'sunday': 'Su',
                            'monday': 'Mo',
                            'tuesday': 'Tu',
                            'wednesday': 'We',
                            'thursday': 'Th',
                            'friday': 'Fr',
                            'saturday': 'Sa'
                        };
                        var pMap = [
                            'endTime',
                            'lunchTime',
                            'startTime'
                        ];


                        function setTimeNode(t, tInstance, field, id) {
                            var temp = adri.ui.template.field;
                            var h = tInstance.hour;
                            var m = tInstance.minutes;
                            var p = '';
                            var tm;
                            var args = {
                                'hr': h,
                                'min': m,
                                'per': p
                            };

                            if (field === 'lunchTime') {

                            }
                            else {
                                if (field === 'startTime') {
                                    args.per = p + ' -';
                                    var hWrap = temp.timeNodeSmall(field, t, '#radio-hours-' + t + '-' + field, h, args);

                                    $('#' + id).append(temp.timeWrap(hWrap));
                                }
                                else {
                                    var hWrap = temp.timeNodeSmall(field, t, '#radio-hours-' + t + '-' + field, h, args);

                                    $('#' + id).append(temp.timeWrap(hWrap));
                                }
                            }
                        }

                        for (var e = 0; e < aLen; e++) {
                            var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                            var id = 'view' + e;
                            var dayID = 'day' + e;
                            var timeID = 'time' + e;



                            avail[e][0] = avail[e][0] || '';
                            if (avail[e][0] !== '') {
                                var block = '<div id="' + id + '" class="repeater-section">' +
                                    '<div id="' + dayID + '" class="day-section"></div>' +
                                    '<div id="' + timeID + '" class="time-section right"></div>' +
                                    '</div>';
                                $('#block-schedule-view').append(block);
                                $('#' + id).css('border-left', '5px solid ' + getRandomColor);

                                var sched = avail[e][0].schedule || '';
                                setTimeNode(e, sched.startTime, 'startTime', timeID);
                                setTimeNode(e, sched.endTime, 'endTime', timeID);
                                setTimeNode(e, sched.lunchTime, 'lunchTime', timeID);
                            }

                            for (var c = 0; c < avail[e].length; c++) {

                                var data = avail[e][c];
                                var dLen = data.length;
                                var day = data.day;
                                if (avail[e][(c + 1)] !== undefined) {
                                    var wkDay = wkDays[day] + ',';
                                }
                                else {
                                    var wkDay = wkDays[day];
                                }

                                var wdGroup = field.dayToggleSmall(wkDay, day, e);
                                var fWrap = field.wrapSmall(wdGroup, e);

                                $('#' + dayID).append(fWrap);
                            }
                        }
                    }
                    else {
                        var id = 'view';
                        var txt = '<p>Your availability needs to be set. Click "Edit Availability" to begin.</p>';
                        var block = '<div id="' + id + '" style="text-align:left; color:white; padding:4px; font-size:14pt;" class="repeater-section">Your availability is not set up.</div>';

                        $('#block-schedule-view').append(block);
                        adri.ui.modal.error.open(txt);
                    }
                },
                load: function (userID) {
                    adri.user.info.get(userID, function (data) {
                        adri.user.info.set(data);
                    });
                },
                get: function (userID, onComplete) {
                    var svc = constants.urls.persistentAvailability + '?uid=' + userID + '&cliid=' + constants.interview.client + '&uiid=' + constants.interview.ui;
                    $.ajax({
                        type: "GET",
                        contentType: 'application/json',
                        dataType: "json",
                        url: svc,
                        success: function (data) {
                            onComplete(data);
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                set: function (data) {
                    var pa = data.persistentAvailability[0];
                    var uInfo = data.userInfo[0][0];
                    adri.ui.form.data = {
                        userID: btoa(pa.personid),
                        interviewID: constants.interview.id,
                        clientID: constants.interview.client,
                        interview: {},
                        positions: [ //TEMP
                            {
                                rolename: "Commercial Lawn Specialist",
                                role_code: "R8464",
                                role_type: "Job Requisition",
                                count: 1
                            },
                            {
                                rolename: "Commercial Lawn Specialist",
                                role_code: "R7540",
                                role_type: "Job Requisition",
                                count: 2
                            },
                            {
                                rolename: "Residential Laborer",
                                role_code: "R7160",
                                role_type: "Job Requisition",
                                count: 3
                            },
                            {
                                rolename: "Commercial Lawn Specialist",
                                role_code: "R7146",
                                role_type: "Job Requisition",
                                count: 4
                            },
                            {
                                rolename: "RESIDENTIAL SALES REP",
                                role_code: "R7150",
                                role_type: "Job Requisition",
                                count: 5
                            },
                            {
                                rolename: "RESIDENTIAL SALES REP",
                                role_code: "R7156",
                                role_type: "Job Requisition",
                                count: 6
                            },
                            {
                                rolename: "RESIDENTIAL SALES REP",
                                role_code: "R7543",
                                role_type: "Job Requisition",
                                count: 7
                            },
                        ],
                        positionids: [],
                        users: {
                            candidates: [
                                {
                                    c_email: 'support@adri-sys.com',
                                    c_fname: 'Jordan',
                                    c_lname: 'Marshall',
                                    c_phone: '12059151006',
                                    rolename: "Commercial Lawn Specialist",
                                    INTERVIEW_REFERENCE_ID: "C00831124-99841928-R7540",
                                    role_code: "R7540"
                                },
                                {
                                    c_email: 'support@adri-sys.com',
                                    c_fname: 'Peter',
                                    c_lname: 'Parker',
                                    c_phone: '12059151006',
                                    rolename: "Commercial Lawn Specialist",
                                    INTERVIEW_REFERENCE_ID: "C00831124-99841928-R7540",
                                    role_code: "R7540"
                                },
                                {
                                    c_email: 'support@adri-sys.com',
                                    c_fname: 'Will',
                                    c_lname: 'Smith',
                                    c_phone: '12059151006',
                                    rolename: "Residential Worker",
                                    INTERVIEW_REFERENCE_ID: "C00831124-99841928-R7160",
                                    role_code: "R7160"
                                },
                            ],
                            recruiters: [
                                {
                                    userid: 1319,
                                    fname: "Billie",
                                    lname: "Hook",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7150"
                                },
                                {
                                    userid: 1319,
                                    fname: "Billie",
                                    lname: "Hook",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7160"
                                },
                                {
                                    userid: 1319,
                                    fname: "Billie",
                                    lname: "Hook",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7540"
                                },
                                {
                                    userid: 92990,
                                    fname: "Mikesha",
                                    lname: "Charles",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7146"
                                },
                                {
                                    userid: 92990,
                                    fname: "Mikesha",
                                    lname: "Charles",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7150"
                                },
                                {
                                    userid: 92990,
                                    fname: "Mikesha",
                                    lname: "Charles",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7156"
                                },
                                {
                                    userid: 92990,
                                    fname: "Mikesha",
                                    lname: "Charles",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7540"
                                },
                                {
                                    userid: 92990,
                                    fname: "Mikesha",
                                    lname: "Charles",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7543"
                                },
                                {
                                    userid: 92990,
                                    fname: "Mikesha",
                                    lname: "Charles",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R8477"
                                },
                                {
                                    userid: 92990,
                                    fname: "Mikesha",
                                    lname: "Charles",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R8632"
                                },
                                {
                                    userid: 77767,
                                    fname: "Emily",
                                    lname: "LAROCHE",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7150"
                                },
                                {
                                    userid: 12345,
                                    fname: "Clinton",
                                    lname: "White",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7150"
                                },
                                {
                                    userid: 12345,
                                    fname: "Clinton",
                                    lname: "White",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R7156"
                                },
                                {
                                    userid: 93452,
                                    fname: "Amber",
                                    lname: "Jones",
                                    emailaddress: "support@adri-sys.com",
                                    mobilenumber: "12059151006",
                                    role_code: "R8464"
                                },
                            ],
                            managers: {}
                        },
                        uiID: constants.interview.ui,
                        info: {
                            id: btoa(pa.personid),
                            fName: '',
                            lName: '',
                            email: '',
                            phone: '',
                            location: '',
                            defaultInterviewMinutes: '20',
                            ranking: '1'
                        },
                        availability: []
                    };

                    var flds = [
                        ['fName', 'USER_FNAME'],
                        ['lName', 'USER_LNAME'],
                        ['email', 'USER_EMAIL'],
                        ['phone', 'USER_PHONE'],
                        ['location', 'LOCATION'],
                        ['defaultInterviewMinutes', 'DEFAULT_INTERVIEW_LENGTH'],
                        ['ranking', 'INTERVIEW_RANK']
                    ];

                    var lim = flds.length;
                    /*
                    for (var i = 0; i < lim; i++) {
                        $('#field-' + flds[i][0]).val(uInfo[flds[i][1]]);
                        adri.ui.form.data.info[flds[i][0]] = uInfo[flds[i][1]];
                    }
                    */
                    var dlm = adri.ui.form.data.info.defaultInterviewMinutes;

                    if (dlm === '' || dlm === null) {
                        adri.ui.form.data.info.defaultInterviewMinutes = 20;
                        $('#field-defaultInterviewMinutes').val(20);
                    }

                    function timeConvert(ts) {
                        var tps = ts.split('\:');
                        if (tps[0] == '12') {
                            tps[0] = '12'
                        }
                        else if (+tps[0] > 12) {
                            tps[0] = (+tps[0] - 12);
                        }
                        else {
                            tps[0] = +tps[0];
                        }

                        var o = {
                            hour: tps[0],
                            minute: tps[1]
                        };
                        return o;
                    }

                    function setTimeNode(t, tInstance, field) {
                        var h;
                        var m;
                        var p;
                        var tm;

                        var theHour = tInstance.split('\:');
                        var $hr = 'radio-hours-' + t + '-' + field;
                        var $min = 'radio-minutes-' + t + '-' + field;
                        var el = document.getElementById($hr);
                        var elhr = document.getElementById($min);
                        tm = timeConvert(tInstance);
                        h = tm.hour;
                        m = tm.minute;

                        if (h === 1) {

                        }

                        if (theHour[0] > 11) {
                            //MARK
                            adri.ui.form.setBlockHour(field, t, h + ',PM');
                            adri.ui.form.setBlockMinute(field, t, 'minutes', m);

                            $('[name=' + $hr + ']').val(h + ',PM');
                            $('[name=' + $min + ']').val(m);
                        }
                        else {
                            //MARK
                            adri.ui.form.setBlockHour(field, t, h + ',AM');
                            adri.ui.form.setBlockMinute(field, t, 'minutes', m);
                            $('[name=' + $hr + ']').val(h + ',AM');
                            $('[name=' + $min + ']').val(m);
                        }
                    }

                    var tLim = pa.length;
                    var tMap = {};
                    var dateKey = '';
                    var cIndex = 0;

                    for (var n = 0; n < tLim; n++) {
                        dateKey = pa[n].AVAILABLE_START + '-' + pa[n].AVAILABLE_END + '-' + pa[n].LUNCH_START;
                        if (typeof tMap[dateKey] === 'undefined') {

                            if (n !== 0) {
                                adri.user.info.addBlockRepeater();
                            }
                            cIndex = adri.ui.form.data.availability.length;
                            tMap[dateKey] = cIndex;
                            $('#day-toggle-' + cIndex + '-' + pa[n].AVAILABLE_DAY.toLowerCase()).click();

                            setTimeNode(cIndex, pa[n].AVAILABLE_START, 'startTime');
                            setTimeNode(cIndex, pa[n].AVAILABLE_END, 'endTime');
                            setTimeNode(cIndex, pa[n].LUNCH_START, 'lunchTime');
                        }
                        else {
                            cIndex = tMap[dateKey];
                            $('#day-toggle-' + cIndex + '-' + pa[n].AVAILABLE_DAY.toLowerCase()).click();
                        }
                    }
                    adri.user.info.addBlockView();
                },
                update: function (userID, onComplete) {
                    var jData = adri.user.info.setJson();
                    console.log(jData);
                    $.ajax({
                        type: "POST",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.persistentAvailability,
                        data: jData,
                        success: function (data) {
                            onComplete();
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                updated: function () { //Mark: added loadNew to refresh dash availability view along with loading animation close. 
                    var elid = "dynamic-content-loader";

                    adri.ui.form.resetData();
                    adri.ui.time.loadNew('contentRibbon');
                    adri.ui.loader(false, elid);
                    adri.ui.modal.close();
                },
                setJson: function () {
                    var jData = adri.ui.form.data;
                    return JSON.stringify(jData);
                }
            }
        },
        util: {
            checkNumValue: function ($el, min, step) {
                var vl = $el.val();

                step = step || 1;
                if (step > 1) {
                    vl = step * Math.round(vl / step);
                    $el.val(vl);
                }

                $el.val(Math.max(min, vl));

            },
            emailUser: function (userID) {
                var data = {
                    interviewID: constants.interview.id,
                    userID: btoa(userID),
                    type: btoa('email'),
                    clientID: constants.interview.client,
                    uiID: constants.interview.ui
                };

                $.ajax({
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.notifyUser,
                    data: JSON.stringify(data),
                    success: function (data) {

                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            },
            smsUser: function (userID) {
                var data = {
                    interviewID: constants.interview.id,
                    userID: btoa(userID),
                    type: btoa('sms'),
                    clientID: constants.interview.client,
                    uiID: constants.interview.ui
                };
                $.ajax({
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.notifyUser,
                    data: JSON.stringify(data),
                    success: function (data) {

                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            },
            getURLParams: function () {
                //var testurl = 'https://s3-us-west-2.amazonaws.com/www.recruiting.adri-sys.com/candidate.html?iref=QURSSTAwMTktNTIyNzY1LVI1NTM0&uid=QURSSTAwMTk=&cliid=UkJTREVNTzIwMTcwODE4&uiid=aHR0cHM6Ly9zMy11cy13ZXN0LTIuYW1hem9uYXdzLmNvbS93d3cucmVjcnVpdGluZy5hZHJpLXN5cy5jb20v';
                //var uParts = testurl.split('?');
                var uParts = window.location.href.split('?');
                var pObj = {};
                if (uParts.length > 1) {
                    var paramString = uParts[1];
                    var params = paramString.split('\&');
                    var pInfo;
                    for (var i = 0; i < params.length; i++) {
                        pInfo = params[i].split(/=(.+)/);
                        pInfo.push('');
                        pObj[pInfo[0]] = pInfo[1];
                    }

                    var ui = location.href.substring(0, location.href.lastIndexOf("/") + 1);
                    ui = btoa(ui);
                    constants.interview.id = pObj.iref;
                    constants.interview.user = pObj.uid;
                    constants.interview.ui = ui;
                    constants.interview.client = pObj.cliid;
                }
                else {
                    // Do nothing
                }
            },
            testFormat: function () {
                var frmt = $('#test-format').val();
                var args = { format: frmt }
                var rtv = adri.util.date.fmt(args);
                $('#test-format-out').html(rtv);
            },
            str: {
                pad: function (str, character, len, direction) {
                    len = len || 0;
                    len = len - str.length;
                    if (len < str.length) {
                        len = 0;
                    }
                    var d = direction || 'left';
                    d = d.toLowerCase();
                    var fString = '';
                    var padding = {
                        'left': function () {
                            for (var i = 0; i < len; i++) {
                                fString = '' + fString + character;
                            }
                            fString = '' + fString + str;
                        },
                        'right': function () {
                            fString = '' + str;
                            for (var i = 0; i < len; i++) {
                                fString = '' + fString + character;
                            }
                        }
                    };
                    padding[d]();
                    return fString;
                }
            },
            table: {
                headerCell: function (data) {
                    return '<div class="ui-header-cell">' + data + '</div>';
                },
                headerRow: function (data) {
                    var lim = data.length;
                    var cells = '';
                    for (var i = 0; i < lim; i++) {
                        cells = cells + adri.util.table.headerCell(data[i]);
                    }
                    return '<div class="ui-header-row">' + cells + '</div>';
                },
                dataCell: function (data) {
                    return '<div class="ui-cell">' + data + '</div>';
                },
                indicatorCell: function (data) {
                    //not currently used
                    return '<div class="ui-cell"><div class="indicator-cell"></div></div>';
                },
                dataRow: function (data, fields, id) {
                    var flds = fields.length;
                    var cells = '';
                    for (var i = 0; i < flds; i++) {
                        if (fields[i][1] == 'value') {
                            cells = cells + adri.util.table.dataCell(data[fields[i][0]]);
                        }
                        else {
                            cells = cells + adri.util.table.indicatorCell(data[fields[i][0]]);
                        }
                    }
                    return '<div class="ui-row" onclick="adri.ui.dashboard.getInterview(\'' + id + '\')">' + cells + '</div>';
                },
                dataRows: function (data, fields) {
                    var rows = '';
                    for (var row in data) {
                        rows = rows + adri.util.table.dataRow(data[row], fields, data[row][fields[0][0]]);
                    }
                    return rows;
                },
                body: function (rows) {
                    return '<div class="spacer"></div><div class="ui-table">' + rows + '</div><div class="spacer"></div>';
                }
            },
            date: {
                propagate: function (minDate, maxDate) {
                    //returns all dates between min and max date
                    var min = minDate.getDate() - 1;
                    var max = maxDate.getDate();
                    var dates = '';
                    var d;
                    var y = minDate.getFullYear();
                    var m = minDate.getMonth();
                    var dates = [];

                    for (var i = min; i < max; i++) {
                        d = new Date(y, m, min + i);
                        dates.push(d);
                    }

                    return dates;
                },
                fmt: function (args) {
                    var format = args.format || 'MM/dd/yyyy';
                    var dt = args.date || new Date();
                    var mth = '' + dt.getMonth();
                    var day = '' + dt.getDate();
                    var year = '' + dt.getFullYear();
                    var hrs = '' + dt.getHours();
                    var min = '' + dt.getMinutes();
                    var sec = '' + dt.getSeconds();
                    var wkdy = '' + dt.getDay();
                    var util = adri.util;

                    var patterns = [
                        { pattern: 'dd', out: util.str.pad(day, '0', 2) },
                        { pattern: 'd', out: day },
                        { pattern: 'DDDD', out: util.date.days[wkdy].name },
                        { pattern: 'DDD', out: util.date.days[wkdy].abbreviation },
                        { pattern: 'DD', out: util.str.pad(util.date.days[wkdy].number, '0', 2) },
                        { pattern: 'D', out: util.date.days[wkdy].number },
                        { pattern: 'MMMM', out: util.date.months[mth].name },
                        { pattern: 'MMM', out: util.date.months[mth].abbreviation },
                        { pattern: 'MM', out: util.str.pad(util.date.months[mth].number, '0', 2) },
                        { pattern: 'M', out: util.date.months[mth].number },
                        { pattern: 'yyyy', out: year },
                        { pattern: 'yy', out: year.slice(-2) },
                        { pattern: 'hh', out: util.str.pad(hrs, '0', 2) },
                        { pattern: 'h', out: hrs },
                        { pattern: 'mm', out: util.str.pad(min, '0', 2) },
                        { pattern: 'm', out: min },
                        { pattern: 'ss', out: util.str.pad(sec, '0', 2) },
                        { pattern: 's', out: sec }
                    ];

                    var pLen = patterns.length;
                    var out = format;
                    var ptn;
                    for (var p = 0; p < pLen; p++) {
                        ptn = new RegExp(patterns[p].pattern + '(?=[^\\]]*(?:\\[|$))');
                        out = out.split(ptn).join('[' + patterns[p].out + ']');
                    }
                    return out.split(/[\[\]]/).join('');
                },
                resolve: function (pattern) {

                },
                monthIndexes: {
                    'January': 0,
                    'February': 1,
                    'March': 2,
                    'April': 3,
                    'May': 4,
                    'June': 5,
                    'July': 6,
                    'August': 7,
                    'September': 8,
                    'October': 9,
                    'November': 10,
                    'December': 11
                },
                months: [
                    { name: 'January', abbreviation: 'Jan', number: '1' },
                    { name: 'February', abbreviation: 'Feb', number: '2' },
                    { name: 'March', abbreviation: 'Mar', number: '3' },
                    { name: 'April', abbreviation: 'Apr', number: '4' },
                    { name: 'May', abbreviation: 'May', number: '5' },
                    { name: 'June', abbreviation: 'Jun', number: '6' },
                    { name: 'July', abbreviation: 'Jul', number: '7' },
                    { name: 'August', abbreviation: 'Aug', number: '8' },
                    { name: 'September', abbreviation: 'Sep', number: '9' },
                    { name: 'October', abbreviation: 'Oct', number: '10' },
                    { name: 'November', abbreviation: 'Nov', number: '11' },
                    { name: 'December', abbreviation: 'Dec', number: '12' }
                ],
                days: [
                    { name: 'Sunday', abbreviation: 'Sun', number: '1' },
                    { name: 'Monday', abbreviation: 'Mon', number: '2' },
                    { name: 'Tuesday', abbreviation: 'Tue', number: '3' },
                    { name: 'Wednesday', abbreviation: 'Wed', number: '4' },
                    { name: 'Thursday', abbreviation: 'Thu', number: '5' },
                    { name: 'Friday', abbreviation: 'Fri', number: '6' },
                    { name: 'Saturday', abbreviation: 'Sat', number: '7' }
                ],
                daysSmall: [ //Mark Smaller abbreviation added
                    { name: 'Sunday', abbreviation: 'S', number: '1' },
                    { name: 'Monday', abbreviation: 'M', number: '2' },
                    { name: 'Tuesday', abbreviation: 'T', number: '3' },
                    { name: 'Wednesday', abbreviation: 'W', number: '4' },
                    { name: 'Thursday', abbreviation: 'T', number: '5' },
                    { name: 'Friday', abbreviation: 'F', number: '6' },
                    { name: 'Saturday', abbreviation: 'S', number: '7' }
                ],
                getFirstDayOfWeek: function (d) {
                    var day = d.getDay();
                    var diff = d.getDate() - day;
                    return new Date(d.setDate(diff));
                }
            },
            time: {
                propagate: function () {
                    var hours = '';
                    var minutes = DDSelectedOption('00', '00') + DDOption('15', '15') + DDOption('30', '30') + DDOption('45', '45');
                    var period = DDSelectedOption('AM', 'AM') + DDOption('PM', 'PM');

                    for (var i = 0; i < 11; i++) {
                        hours = hours + DDOption(+i + 1, +i + 1);
                    }
                    hours = hours + DDSelectedOption('12', '12');

                    return { hours: hours, minutes: minutes, period: period };
                },
                propagateArray: function () {
                    var hours = [];
                    var minutes = ['00', '15', '30', '45'];
                    var period = ['AM', 'PM'];

                    for (var i = 0; i < 12; i++) {
                        hours.push(+i + 1);
                    }

                    return { hours: hours, minutes: minutes, period: period };
                },
                propagateWorkhoursArray: function () {
                    var hours = [];
                    var minutes = ['00', '15', '30', '45'];
                    var period = ['AM', 'PM'];
                    var arr;
                    var hr = '';

                    for (var i = 0; i < 5; i++) {
                        hr = +i + 7;
                        arr = [
                            hr,
                            'AM'
                        ];
                        hours.push(arr);
                    }

                    arr = [
                        '12',
                        'PM'
                    ];
                    hours.push(arr);

                    for (var i = 0; i < 7; i++) {
                        hr = +i + 1;
                        arr = [
                            hr,
                            'PM'
                        ];
                        hours.push(arr);
                    }

                    return { hours: hours, minutes: minutes, period: period };
                }
            },
            controls: {
                calendar: {
                    template: {
                        body: function (rows) {
                            return '<div class="cal-body">' + rows + '</div>';
                        },
                        wvbody: function (rows) {
                            return '<div class="wvCalBody">' + rows + '</div>';
                        },
                        row: function (cells) {
                            return '<div class="cal-row">' + cells + '</div>';
                        },
                        headerRow: function (cells) {
                            return '<div class="cal-header-row">' + cells + '</div>';
                        },
                        cell: function (date) {
                            var cellid = adri.util.date.fmt({ date: date, format: 'MM-dd-yyyy' });
                            var sDate = adri.util.date.fmt({ date: date, format: 'yyyy-MM-dd' });
                            return '<div id="cal-cell-' + cellid + '" class="cal-cell" onclick="adri.ui.time.dateNode.add(\'' + sDate + '\',\'ui-datenodes\')">' +
                                '<div nohighlight class="cal-cell-date">' + date.getDate() + '</div>' +
                                '</div>';
                        },
                        inactiveCell: function (date) {
                            var cellid = date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
                            return '<div id="cal-cell-' + cellid + '" class="cal-inactive-cell">' +
                                '<div nohighlight class="cal-cell-date">' + date.getDate() + '</div>' +
                                '</div>';
                        },
                        title: function (date) {
                            return '<div nohighlight class="cal-title">' + adri.util.date.fmt({ date: date, format: 'MMMM yyyy' }) + '</div>';
                        },
                        wkviewTitle: function (date) {
                            return '<div nohighlight class="title-weekly-calendar vCenter centered">Week of ' + adri.util.date.fmt({ date: date, format: 'MMMM dd, yyyy' }) + '</div>';
                        },
                        header: function (wkdy) {
                            return '<div class="cal-header secHTxt">' + wkdy + '</div>';
                        },
                        wvheader: function (wkdy) {
                            return '<div class="wvHeader">' + wkdy + '<hr class="smallHR" /></div>';
                        },
                        button: function (date, dir, elmt) {
                            var cMap = {
                                'up': {
                                    icon: '&#xf138;',
                                    i: 1
                                },
                                'down': {
                                    icon: '&#xf137;',
                                    i: -1
                                }
                            };

                            dir = cMap[dir];

                            var d = new Date(date.getFullYear(), date.getMonth() + dir.i, 1);
                            var mthYr = adri.util.date.fmt({ date: d, format: 'MMMM yyyy' });
                            var clk = 'adri.util.controls.calendar.draw(\'' + elmt + '\',\'' + d.getMonth() + '\',\'' + d.getFullYear() + '\')';

                            return '<div nohighlight class="cal-button" onclick="' + clk + ';">' + dir.icon + '</div>';
                        },
                        controls: function (date, elmt) {
                            var tmp = adri.util.controls.calendar.template;
                            return tmp.button(date, 'down', elmt) + tmp.title(date) + tmp.button(date, 'up', elmt);
                        },
                        wvCell: function (date) {
                            var cellid = adri.util.date.fmt({ date: date, format: 'MM-dd-yyyy' });
                            var sDate = adri.util.date.fmt({ date: date, format: 'yyyy-MM-dd' });
                            var cellDate = adri.util.date.fmt({ date: date, format: 'MMM d' });

                            return '<div id="cal-cell-' + cellid + '" class="wvCell pBG ckable" onclick="adri.ui.dashboard.getInterviewsForDate(\'' + sDate + '\')">' +
                                '<div nohighlight class="wv-cell-date">' + cellDate + '</div>' +
                                '<div id="cal-cell-nodes-' + cellid + '"></div>' +
                                '</div>';
                        }
                    },
                    frame: function (minDate, maxDate, elmt) {
                        var tmp = adri.util.controls.calendar.template;
                        var header = '';
                        for (var d = 0; d < 7; d++) {
                            header = header + tmp.header(adri.util.date.days[d].abbreviation);
                        }

                        var row = '';
                        var cell = '';
                        var body = '';
                        var firstWeekday = minDate.getDay();
                        var firstDayDifference = 0 - firstWeekday;
                        var calDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() + firstDayDifference);
                        var exNodes = $('#ui-datenodes').html();
                        if (exNodes === undefined) {
                            exNodes = '';
                        }

                        for (var w = 0; w < 6; w++) {
                            row = '';
                            for (var d = 0; d < 7; d++) {
                                if (calDate < minDate || calDate > maxDate) {
                                    cell = tmp.inactiveCell(calDate);
                                }
                                else {
                                    cell = tmp.cell(calDate);
                                }

                                row = row + cell;
                                calDate.setDate(calDate.getDate() + 1);
                            }
                            row = tmp.row(row);
                            body = body + row;
                        }

                        header = tmp.headerRow(header, elmt);
                        body = '<div class="cal-monthHeader">' + tmp.controls(minDate, elmt) + '</div><div class="cal-body">' + header + body + '</div>';
                        body = body + '<div id="ui-datenodes" class="ti-schedule-nodes">' + exNodes + '</div>';
                        body = body + '<div class="cal-footer-row"><button class="bigButton mainBG negTxt ckable" type="button" onclick="adri.ui.time.submit()">Add Times</button></div>';
                        return body;
                    },
                    draw: function (elmt, mth, yr) {
                        var cal = adri.util.controls.calendar;
                        var minDate = new Date(yr, mth, 1);
                        var maxDate = new Date(yr, (+mth + 1), 0);

                        var dates = adri.util.date.propagate(minDate, maxDate);
                        var times = adri.util.time.propagate();

                        var $el = $('#' + elmt);
                        $el.html(cal.frame(minDate, maxDate, elmt));
                    },
                    frameWeeklyView: function (wkDate) {
                        var fDate = adri.util.date.getFirstDayOfWeek(wkDate);
                        var tmp = adri.util.controls.calendar.template;
                        var header = '';
                        for (var d = 0; d < 7; d++) {
                            header = header + tmp.wvheader(adri.util.date.days[d].abbreviation);
                        }

                        var row = '';
                        var cell = '';
                        var body = '';

                        row = '';
                        for (var d = 0; d < 7; d++) {
                            cell = tmp.wvCell(fDate);
                            row = row + cell;
                            fDate.setDate(fDate.getDate() + 1);
                        }
                        row = tmp.row(row);
                        body = body + row;

                        header = tmp.headerRow(header);
                        body = '<div class="mobile-hscroll"><div class="wvCalBody">' + header + body + '</div></div>';
                        body = body + '<div id="ui-datenodes" class="date-nodes"></div>';
                        body = body + '<div class="cal-footer-row"></div>';
                        body = '<div class="cycle-weekly-calendar"><div class="stdWidget vCenter right ckablef" onclick="adri.util.controls.calendar.cycleWeeklyView(-1,\'' + wkDate + '\');">&#xf137;</div></div>' +
                            '<div class="weekly-cal-title-cntr">' + tmp.wkviewTitle(wkDate) + '</div>' +
                            '<div class="cycle-weekly-calendar"><div class="stdWidget vCenter left ckablef" onclick="adri.util.controls.calendar.cycleWeeklyView(1,\'' + wkDate + '\');">&#xf138;</div></div>' +
                            '<hr class="titleHR" />' +
                            body;
                        return body;
                    },
                    drawWeeklyView: function (wkDate) {
                        var wkvw = adri.util.controls.calendar.frameWeeklyView(wkDate);
                        return wkvw;
                    },
                    cycleWeeklyView: function (m, wkDate) {
                        m = m * 7;
                        var db = adri.ui.dashboard;
                        var d = new Date(wkDate);
                        d.setDate(d.getDate() + m);

                        $('#db-weekly-view').html(adri.util.controls.calendar.drawWeeklyView(d));
                        db.getInterviews(function (data) {
                            db.drawInterviews(data);
                        });
                    }
                },
                calendarSmall: {
                    template: {
                        body: function (rows) {
                            return '<div class="cal-body">' + rows + '</div>';
                        },
                        wvbody: function (rows) {
                            return '<div class="wvCalBody">' + rows + '</div>';
                        },
                        row: function (cells) {
                            return '<div class="cal-row">' + cells + '</div>';
                        },
                        headerRow: function (cells) { //Mark: Spacer added
                            return '<div class="cal-header-row">' + cells + '</div><div class="cal-header-row spacer"></div>';
                        },
                        cell: function (date) { //Mark: Removed onclick="adri.ui.time.dateNode.add(\'' + sDate + '\',\'ui-datenodes\')"
                            var cellid = adri.util.date.fmt({ date: date, format: 'MM-dd-yyyy' });
                            var sDate = adri.util.date.fmt({ date: date, format: 'yyyy-MM-dd' });
                            //adri.ui.time.dateNode.add(sDate, 'ui-datenodes');
                            return '<div id="cal-cell-' + cellid + '" class="cal-cell hover-underline" onclick="adri.ui.dashboard.getInterviewsForDate(\'' + sDate + '\', \'cal-cell-' + cellid + '\')">' +
                                '<div nohighlight class="cal-cell-date">' + date.getDate() + '</div>' +
                                '</div>';
                        },
                        inactiveCell: function (date) {
                            var cellid = date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
                            return '<div id="cal-cell-' + cellid + '" class="cal-inactive-cell">' +
                                '<div nohighlight class="cal-cell-date">' + date.getDate() + '</div>' +
                                '</div>';
                        },
                        title: function (date) {
                            return '<div nohighlight class="cal-title">' + adri.util.date.fmt({ date: date, format: 'MMMM yyyy' }) + '</div>';
                        },
                        wkviewTitle: function (date) { //Mark: Changing date format to be returned
                            return '<div nohighlight class="title-weekly-calendar right">' + adri.util.date.fmt({ date: date, format: 'MMM dd' }) + '</div>';
                        },
                        header: function (wkdy) {
                            return '<div class="cal-header secHTxt">' + wkdy + '</div>';
                        },
                        wvheader: function (wkdy) {
                            return '<div class="wvHeader">' + wkdy + '<hr class="smallHR" /></div>';
                        },
                        button: function (date, dir, elmt) {
                            var cMap = {
                                'up': {
                                    icon: '&#xE315;',
                                    i: 1
                                },
                                'down': {
                                    icon: '&#xE314;',
                                    i: -1
                                }
                            };

                            dir = cMap[dir];

                            var d = new Date(date.getFullYear(), date.getMonth() + dir.i, 1);
                            var mthYr = adri.util.date.fmt({ date: d, format: 'MMMM yyyy' });
                            var clk = 'adri.util.controls.calendarSmall.draw(\'' + elmt + '\',\'' + d.getMonth() + '\',\'' + d.getFullYear() + '\')';

                            return '<div nohighlight class="cal-button" onclick="' + clk + ';">' + dir.icon + '</div>';
                        },
                        controls: function (date, elmt) {
                            var tmp = adri.util.controls.calendarSmall.template;
                            return tmp.button(date, 'down', elmt) + tmp.title(date) + tmp.button(date, 'up', elmt);
                        },
                        wvCell: function (date) {
                            var cellid = adri.util.date.fmt({ date: date, format: 'MM-dd-yyyy' });
                            var sDate = adri.util.date.fmt({ date: date, format: 'yyyy-MM-dd' });
                            var cellDate = adri.util.date.fmt({ date: date, format: 'MMM d' });

                            return '<div id="cal-cell-' + cellid + '" class="wvCell pBG ckable" onclick="adri.ui.dashboard.getInterviewsForDate(\'' + sDate + '\', \'cal-cell-' + cellid + '\')">' +
                                '<div nohighlight class="wv-cell-date">' + cellDate + '</div>' +
                                '<div id="cal-cell-nodes-' + cellid + '"></div>' +
                                '</div>';
                        }
                    },
                    frame: function (minDate, maxDate, elmt) { //Mark: added modified frame function for opening dashboard. Changes include the removal of the Add Times button.
                        var tmp = adri.util.controls.calendarSmall.template;
                        var header = '';
                        for (var d = 0; d < 7; d++) {
                            header = header + tmp.header(adri.util.date.daysSmall[d].abbreviation);
                        }

                        var row = '';
                        var cell = '';
                        var body = '';
                        var firstWeekday = minDate.getDay();
                        var firstDayDifference = 0 - firstWeekday;
                        var calDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate() + firstDayDifference);
                        var exNodes = $('#ui-datenodes').html();
                        if (exNodes === undefined) {
                            exNodes = '';
                        }

                        for (var w = 0; w < 6; w++) {
                            row = '';
                            for (var d = 0; d < 7; d++) {
                                if (calDate < minDate || calDate > maxDate) {
                                    cell = tmp.inactiveCell(calDate);
                                }
                                else {
                                    cell = tmp.cell(calDate);
                                }

                                row = row + cell;
                                calDate.setDate(calDate.getDate() + 1);
                            }
                            row = tmp.row(row);
                            body = body + row;
                        }

                        header = tmp.headerRow(header, elmt);
                        body = '<div class="cal-monthHeader">' + tmp.controls(minDate, elmt) + '</div><div class="cal-body">' + header + body + '</div>';
                        body = body + '<div id="ui-datenodes" class="ti-schedule-nodes">' + exNodes + '</div>';
                        body = body + '<div class="cal-footer-row"></div>';
                        return body;
                    },
                    draw: function (elmt, mth, yr) {
                        var cal = adri.util.controls.calendarSmall;
                        var minDate = new Date(yr, mth, 1);
                        var maxDate = new Date(yr, (+mth + 1), 0);

                        var dates = adri.util.date.propagate(minDate, maxDate);
                        var times = adri.util.time.propagate();

                        var $el = $('#' + elmt);
                        $el.html(cal.frame(minDate, maxDate, elmt));
                        $('.cal-cell').click(function () {
                            $('.cal-cell').removeClass('cal-cell-active');
                            $(this).addClass('cal-cell-active');
                        });
                        //$el.html(cal.frame(minDate, maxDate, elmt));
                    },
                    frameWeeklyView: function (wkDate) { //Mark: cycleWeekly View markup changed. template.row is no longer being used. 
                        var cDay = new Date;

                        if (cDay.getDay === wkDate.getDay) {
                            cDay = 'Today\'s Calls';
                        }

                        var tmp = adri.util.controls.calendarSmall.template;
                        var header = '';
                        for (var d = 0; d < 7; d++) {
                            header = header + tmp.wvheader(adri.util.date.days[d].abbreviation);
                        }

                        var row = '';
                        var cell = '';
                        var body = '';

                        row = '';
                        row = tmp.row(row);

                        body = '<div class="dashboard-header-block">' +
                            '<span id="sch-selected-date" class="dashboard-header-text"></span>' +
                            '</div>' +
                            body;
                        return body;
                    },
                    drawWeeklyView: function (wkDate) {
                        var wkvw = adri.util.controls.calendarSmall.frameWeeklyView(wkDate);
                        return wkvw;
                    },
                    cycleWeeklyView: function (m, wkDate) {
                        m = m * 7;
                        var db = adri.ui.dashboard;
                        var d = new Date(wkDate);
                        d.setDate(d.getDate() + m);

                        $('#db-weekly-view').html(adri.util.controls.calendarSmall.drawWeeklyView(d));
                        db.getInterviews(function (data) {
                            db.drawInterviews(data);
                        });
                    }
                },
                switchCSS: function () {
                    $('#css-switch-trugreen').click(function () {
                        $('link[href="adri/adri.ras.generic.css"]').attr('href', 'adri/adri.ras.css');
                    });
                    $('#css-switch-adri').click(function () {
                        $('link[href="adri/adri.ras.css"]').attr('href', 'adri/adri.ras.generic.css');
                    });
                },
                reloadLocation: function () {
                    location.reload();
                }
            },
            btns: {
                confirmationBtns: function (id, id2, confirm, cb, cancel) {
                    cb = cb || '';
                    $(function () {
                        $("#" + id).click(function () {
                            $("#" + id).addClass("submit-onclic").delay(450).queue(function () {
                                validateSubmit();
                            });
                        });

                        function validateSubmit() {
                            setTimeout(function () {
                                $("#" + id).removeClass("submit-onclic");
                                $("#" + id).addClass("submit-validate");
                                callbackSubmit();
                            }, 2250);
                        }
                        function callbackSubmit() {
                            setTimeout(function () {
                                $("#" + id).removeClass("submit-validate");
                                adri.ui.modal.large.close();
                                confirm(cb);
                            }, 400);
                        }
                    });
                    $(function () {
                        $("#" + id2).click(function () {
                            $("#" + id2).addClass("cancel-onclic").delay(450).queue(function () {
                                validateCancel();
                            });
                        });
                        function validateCancel() {
                            setTimeout(function () {
                                $("#" + id2).removeClass("cancel-onclic");
                                $("#" + id2).addClass("cancel-validate");
                                callbackCancel();
                            }, 2250);
                        }
                        function callbackCancel() {
                            setTimeout(function () {
                                $("#" + id2).removeClass("cancel-validate");
                                adri.ui.modal.large.close();
                                cancel();
                            }, 400);
                        }
                    });
                }
            },
            uploaderNew: {
                files: {},
                data: [],
                intInfo: {
                    userID: constants.interview.user,
                    filename: '',
                    filedata: ''
                },
                template: function () {
                    var headers = 'Candidate_ID,Candidate,Candidate_Phone_Number,Candidate_E-Mail,Candidate_Source,Date_Candidate_was_Added_to_Requisition,Requisition_Number,Requisition_Title,Requisition_Type,Requisition_Status,Division,Region,Location,Job_Code,Job_Title,Job_Family,Recruiter_1_Employee_ID,Recruiter_1_Name,Recruiter_1_E-Mail,Recruiter_1_Work_City,Recruiter_1_Work_State,Recruiter_2_Name,Recruiter_2_E-Mail,Recruiter_3_Employee_ID,Recruiter_3_Name,Recruiter_3_E-Mail,Recruiter_4_Employee_ID,Recruiter_4_Name,Recruiter_4_E-Mail,Recruiter_5_Employee_ID,Recruiter_5_Name,Recruiter_5_E-Mail,Linked_Requisition_Number,Linked_Requisition_Title,Linked_Requisition_Type,Linked_Requisition_Status,Linked_Requisition_External_Career_Site_URL\r\n';
                    var encodedUri = encodeURI(headers);
                    var link = document.createElement("a");
                    link.href = window.URL.createObjectURL(new Blob([headers], { type: 'text/csv' }));
                    link.download = "template.csv";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                },
                open: function () {
                    var $Content = $('.ui-content-body');
                    $Content.html('');
                    adri.util.uploaderNew.files = {};
                    adri.util.uploaderNew.intInfo = {
                        userID: constants.interview.user,
                        filename: '',
                        filedata: ''
                    };
                    var dz = '<div class="file-drop" id="dz-input"><div style="margin-top:100px;" class="vCenter">Drop files here</div></div>' +
                        '<div id="progress-bars" class="file-progress"></div>' +
                        '<div id="upload-msg"></div>' +
                        '<div><button type="button" class="bigButton mainBG negTxt ckable" onclick="adri.util.uploaderNew.upload();" id="upload-button">Upload!</button></div>';
                    $($Content).html(dz);

                    function handleFileSelect(evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        $('#progress-bars').html('');
                        var files = evt.dataTransfer.files;
                        var len = files.length;
                        for (var i = 0; i < len; i++) {
                            $('#progress-bars').append('<div id="progress-bar-' + i + '" class="file-progress"><div id="pct-' + i + '" class="percent">0%</div></div>');
                            $('#pct-' + i).css('max-width', '0%');
                            $('#pct-' + i).html('0%');
                            adri.util.uploaderNew.read(files[i], i);
                        }

                    }

                    function handleDragOver(evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        evt.dataTransfer.dropEffect = 'copy';
                    }

                    // Setup the dnd listeners.
                    var dropZone = document.getElementById('dz-input');
                    dropZone.addEventListener('dragover', handleDragOver, false);
                    dropZone.addEventListener('drop', handleFileSelect, false);

                },
                read: function (file, i) {
                    var reader = new FileReader();
                    reader.onerror = errorHandler;
                    reader.onprogress = function (e) {
                        updateProgress(e, i);
                    };
                    reader.onabort = function (e) {
                        alert('File read cancelled');
                    };

                    reader.onloadstart = function (e) {
                        $('#progress-bar-' + i).addClass('loading');
                    };
                    reader.onload = function (e) {
                        $('#pct-' + i).css('max-width', '100%');
                        $('#pct-' + i).html('\'' + file.name + '\' is ready to upload');
                        setTimeout(function () {
                            $('#progress-bar-' + i).removeClass('loading');
                        }, 2000);
                        adri.util.uploaderNew.files[file.name] = {
                            name: file.name,
                            data: e.target.result,
                            //data: btoa(unescape(encodeURIComponent(e.target.result))), //btoa(e.target.result) MARK This was needed due to error "Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range."
                            index: i
                        };
                    }
                    $('#dz-cancel').click(function () {
                        adri.util.uploaderNew.abort(reader);
                    });

                    // Read in as text
                    reader.readAsText(file);

                    function errorHandler(evt) {
                        switch (evt.target.error.code) {
                            case evt.target.error.NOT_FOUND_ERR:
                                alert('File Not Found!');
                                break;
                            case evt.target.error.NOT_READABLE_ERR:
                                alert('File is not readable');
                                break;
                            case evt.target.error.ABORT_ERR:
                                break; // noop
                            default:
                                alert('An error occurred reading this file.');
                        };
                    }

                    function updateProgress(evt, i) {
                        if (evt.lengthComputable) {
                            var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
                            // Increase the progress bar length.
                            if (percentLoaded < 100) {
                                $('#pct-' + i).css('max-width', percentLoaded + '%');
                                $('#pct-' + i).html(percentLoaded + '%');
                            }
                        }
                    }

                },
                abort: function (reader) {
                    reader.abort();
                },
                upload: function () {
                    var files = adri.util.uploaderNew.files;
                    if ($.isEmptyObject(files) === true) {
                        adri.ui.modal.error.open('There do not seem to be any files uploaded.');
                    }
                    else {
                        adri.ui.loaderLong(true, "dynamic-content-loader");
                        //iterate through each member of adri.util.uploader.files, call service to check file contents and upload or reject
                        $('#upload-msg').html(''); // FIX THIS
                        for (var f in adri.util.uploaderNew.files) {
                            var file = adri.util.uploaderNew.files[f];
                            var intInfo = adri.util.uploaderNew.intInfo;
                            intInfo.filename = file.name;
                            intInfo.filedata = file.data;
                            adri.util.uploaderNew.process(file, adri.util.uploaderNew.complete, adri.util.uploaderNew.reject);
                        }
                    }
                },
                process: function (file, onComplete, reject) {
                    var data = {
                        userID: constants.interview.user,
                        clientID: constants.interview.client,
                        uiID: constants.interview.ui,
                        filename: file.name,
                        filedata: file.data
                    };

                    $.ajax({
                        type: "POST",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.uploadFile,
                        data: JSON.stringify(data),
                        success: function (response) {
                            onComplete(response, file);
                        },
                        error: function (xhr, ajaxOptions, error) {
                            reject(xhr, file);
                        }
                    });

                },
                reject: function (response, file) {
                    $('#pct-' + file.index).css('background-color', '#8a110e');
                    $('#pct-' + file.index).css('color', 'white');
                    $('#pct-' + file.index).html('Failed to Upload');
                }
            }
        }
    };
    return adri;
})();

$(document).ready(function () {
    adri.init();
});