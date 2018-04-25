
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
    }
};

window.dashboard = (function () {   

    function ADRITime(d, h, m, p, s) {
        this.interviewID = constants.interview.id;
        this.userID = dashboard.interview.scheduling.userID;
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
        this.hour = h || '1';
        this.minutes = m || '00';
        this.period = p || 'AM';
    }

    function ADRIBlock() {
        this.starttime = new timePeriod();
        this.endtime = new timePeriod();
        this.lunchstart = new timePeriod();
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

    var dashboard = {
        data: {},
        colors: ['#FFD555', '#6764E6', '#FFB955', '#348CD5', '#6416C6', '#1172C2', '#FFF156', '#07589C'],
        tcolors: ['#6764E6', '#348CD5', '#6416C6', '#1172C2', '#07589C'],
        id: '',
        init: function () {
            dashboard.util.getURLParams();
            dashboard.ui.zone();
            dashboard.ui.nav.setup();
            dashboard.ui.dashboard.open(); 
           
            $(document).on("pagechange", function (event) {
                var screen = $.mobile.getScreenHeight();
                var header = $(".ui-header").hasClass("ui-header-fixed") ? $(".ui-header").outerHeight() - 1 : $(".ui-header").outerHeight();
                var footer = $(".ui-footer").hasClass("ui-footer-fixed") ? $(".ui-footer").outerHeight() - 1 : $(".ui-footer").outerHeight();
                var contentCurrent = $(".ui-content").outerHeight() - $(".ui-content").height();
                var content = screen - header - footer - contentCurrent;

                $(".ui-content").height(content);
            });
            $(document).ready(function () {              
                $(document).on("swiperight", "#dashboard-ras-content", function (e) {
                    // We check if there is no open panel on the page because otherwise
                    // a swipe to close the left panel would also open the right panel (and v.v.).
                    // We do this by checking the data that the framework stores on the page element (panel: open).
                    if ($.mobile.activePage.jqmData("panel") !== "open") {
                        if (e.type === "swiperight") {
                            $("#contentRibbon").panel("open");
                        }
                    }
                });
                $('#toggleMenu').on('click', function () {
                    $("#contentRibbon").panel("open");
                });
            });

        }, 
        error: {
            noParams: function () {
                $('#dashboard-ras-content').html('Sorry, but we couldn\'t find your information. Please try clicking your invitation link again.');
            }
        },
        ui: {
            selectedDate: '',        
            settings: {
                setupReq: function () {
                    var $Content = $('.ui-content-body');
                    var iCard =  '<div id="db-weekly-view" class="header-main-wrap block" data-role="header">' +
                                    '<h1>Requistions and Links</h1>' +
                                 '</div>' +
                                 '<div id="db-scheduling" class="dashboard-scheduling">' +
                                    '<div id="scheduled-interviews-container" class="fullWidth-container ">' +
                                       '<div id="position-pool"></div>' +
                                    '</div>' +
                                 '</div>' +
                                 '<div id="modal-form" class="modal-form"></div>' +
                                 '<div id="smallModal" class="modal-small"></div>' +
                                 '<div id="modal-bg-overlay" class="modal-overlay" onclick="dashboard.timeslot.removeControls();"></div>' +
                                 '<div id="small-modal-bg-overlay" class="modal-overlay" onclick="dashboard.ui.modal.small.close();"></div>' +
                                 '<div id="error-modal" class="modal">' +
                                    '<div id="availError" class="modal-content">' +
                                       '<button id="closeModal" class="close-modal" onclick="dashboard.ui.modal.error.close();">&times;</button>' +
                                    '</div>' +
                                 '</div>';
                    $Content.html(iCard);
                },
                addPositions: function () {
                    dashboard.ui.selected('dashboard-sub-icon1', 'control-sub-label-act');
                    var db = dashboard.ui.dashboard;

                    var $Content = $('.ui-content-body');
                    var iCard =  '<div id="db-weekly-view" class="header-main-wrap block" data-role="header">' +
                                    '<h1 style="margin:0 auto;padding:0;width:95%;">Add Position</h1>' +
                                 '</div>' +
                                 '<form><ul style="margin:0 auto;padding:0;width:95%;" id="db-scheduling" data-role="listview" data-inset="true">' +
                                 '</ul></form>';
                    $Content.html(iCard);
                    dashboard.ui.dashboard.addPosition();
                    var $options = $('#db-scheduling');
                    var control = '<div class="spacer"></div><div class="spacer"></div>' +
                                  //'<button onclick="dashboard.ui.dashboard.addPosition();" class="button thin hlBG negTxt"><span>ADD POSITION</span></button>' +
                                  '<fieldset class="ui-grid-a">' +
                                    '<div class="ui-block-b"><button type="submit" onclick="dashboard.ui.submitPosition(dashboard.ui.dashboard.refreshPool)" class="centered ui-btn ui-corner-all ui-btn-a">Submit</button></div>' +
                                  '</fieldset>';

                    $options.append(control);
                },
                openReqs: function () {
                    var elid = "dynamic-content-loader";
                    var db = dashboard.ui.dashboard;
                    dashboard.ui.loader(true, elid);
                    dashboard.ui.settings.setupReq();
                    db.getPositions(function (data) {
                        db.drawPositionPool(data);
                    });
                }
            },
            zone: function () {
                //Mark: Removed splash class/id and added the control-ribbon element. Also changed it to update the dashboard-ras-content id instead of the core-content id.
                var elid = "dynamic-content-loader";
                var getUnscheduled = function (data) {
                    dashboard.ui.dashboard.drawUnscheduledInterviews(data);
                };
                var wkDate = new Date();
                var zones = '<div tabindex="0" data-theme="c" data-role="page" data-url="dashboard-ras-content" id="dashboard-ras-content" data-cache="false">' +
                                '<div id="db-weekly-view" style="border:none;" class="header-main-wrap" data-role="header">' +   
                                    '<div id="db-weekly-view-grid" class="ui-grid-b">' +
                                        '<div class="ui-block-a" style="width:10%; height:50px;">' + 
                                            '<div class="button-wrap">' +
                                                '<button id="toggleMenu" style="height:24px; padding-top:2.3em;" class="ui-btn ui-btn-icon-left ui-icon-bars"></button>' + 
                                            '</div>' + 
                                        '</div>' + 
                                        '<div class="ui-block-b" style="height:50px;">' +
                                            '<label for="view-select" class="ui-hidden-accessible">Select</label>' +
                                            '<select data-iconpos="left" id="view-select" name="view-select" data-shadow="false">' +
                                                '<option>Today\'s Calls</option>' +
                                                '<option onclick="dashboard.ui.dashboard.getUnscheduledInterviews(' + getUnscheduled + ');" value="2">Unscheduled Calls</option>' +
                                            '</select>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' + 
                                '<div style="padding:0;" data-role="content" id="dynamic-content-area"></div>' +
                                '<div id=' + elid + ' class="loaderContainer"></div>' +
                                '<div data-role="footer" data-tap-toggle="false" data-position="fixed" id="nav-main" class="control-ribbon"></div>' +
                                '<div id="contentRibbon" data-role="panel" data-display="overlay" class="ui-content-ribbon" >' +
                                    '<div id="availabilityView" class="timeContainerSmall"></div>' +
                                '</div>' +
                            '</div>';
                $('body').html(zones);  
                dashboard.ui.loader(true, elid);
            },
            selected: function (id, cl) {
                cl = cl || '';
                $('.' + cl).removeClass(cl);
                $('#' + id).toggleClass(cl);
            },
            nav: {
                reset: function () {
                    dashboard.ui.nav.template.idcount = {
                        main: 0,
                        sub: 0
                    };
                },
                setup: function () {
                    var nav = '';
                    var menu = [
                        { adr: 'dashboard.ui.dashboard.open();', txt: 'Dashboard', type: 'dashBtn', icon: '&#xE7FB;' },
                        { adr: 'dashboard.ui.modal.open();', txt: 'Edit Availability', type: 'dashBtn', icon: '&#xE8F9;' },
                        { adr: 'dashboard.ui.nav.actionsSetup();', txt: 'Actions', type: 'dashBtn', icon: '&#xE3C9;' },
                        { adr: 'dashboard.ui.nav.reportsSetup();', txt: 'Reports', type: 'dashBtn', icon: '&#xE8F9;' },
                        { adr: 'dashboard.ui.nav.searchSetup();', txt: 'Search', type: 'dashBtn', icon: '&#xE8B6;' }
                    ];

                    var lim = menu.length;
                    for (var i = 0; i < lim; i++) {
                        nav = nav + dashboard.ui.nav.template[menu[i].type](menu[i].txt, menu[i].adr, menu[i].icon);
                    }
                    $('#rpts-widget').attr('onclick', 'dashboard.ui.nav.open(\'' + atob(constants.interview.ui) + 'reports.html?cliid=' + constants.interview.client + '\');');
                    $('#nav-main').html(nav);
                },
                actionsSetup: function () {
                    dashboard.ui.nav.reset();
                    var nav = '';
                    var menu = [
                        { txt: 'Positions', type: 'subHeader'},
                        { adr: 'dashboard.ui.settings.addPositions();', txt: 'Add Positions', type: 'dashSubBtn' },
                        { adr: 'dashboard.ui.settings.openReqs();', txt: 'Edit Requisitions', type: 'dashSubBtn' },
                        { type: 'subSpacer' },
                        { txt: 'Candidates', type: 'subHeader' },
                        { adr: 'dashboard.util.uploaderNew.open();', txt: 'Upload Candidates', type: 'dashSubBtn' },
                    ];

                    var lim = menu.length;
                    for (var i = 0; i < lim; i++) {
                        nav = nav + dashboard.ui.nav.template[menu[i].type](menu[i].txt, menu[i].adr, menu[i].icon);
                    }
                    $('#contentRibbon').html(nav);
                    dashboard.ui.settings.addPositions();
                    $("#contentRibbon").trigger("updatelayout");
                },
                reportsSetup: function () {
                    dashboard.ui.nav.reset();
                    var nav = '';
                    var menu = [
                        { txt: 'Reports', type: 'subHeader' },
                        { adr: 'dashboard.ui.dashboard.reports.open();', txt: 'Interactions', type: 'dashSubBtn' },
                        { adr: 'dashboard.ui.nav.open(\'' + atob(constants.interview.ui) + 'reports.html?cliid=' + constants.interview.client + '\');', txt: 'My Reports', type: 'dashSubBtn' }
                    ];

                    var lim = menu.length;
                    for (var i = 0; i < lim; i++) {
                        nav = nav + dashboard.ui.nav.template[menu[i].type](menu[i].txt, menu[i].adr, menu[i].icon);
                    }
                    $('#contentRibbon').html(nav);
                    dashboard.ui.dashboard.reports.open();
                },
                searchSetup: function () {
                    dashboard.ui.modal.error.open('Coming Soon!');
                },
                template: {
                    idcount: {
                        main: 0,
                        sub: 0
                    },
                    dashBtn: function (txt, adr, icon) {
                        dashboard.ui.nav.template.idcount.main++;
                        var count = dashboard.ui.nav.template.idcount.main;
                        var theid = 'dashboard-icon' + count;
                        var cl = 'control-wrap-act';
                        var clk = 'dashboard.ui.selected(\'' + theid + '\', \'' + cl + '\');';
                        return '<div onclick="' + adr + clk + '" id="' + theid + '" class="control-wrap">' +
                                    '<div class="control-button light">' +
                                        '<i class="material-icons">' + icon + '</i>' +
                                    '</div>' +
                                    '<div class="control-label">' + txt + '</div>' +
                               '</div>';
                    },
                    dashSubBtn: function (txt, adr, icon) {
                        dashboard.ui.nav.template.idcount.sub++;
                        var count = dashboard.ui.nav.template.idcount.sub;
                        var theid = 'dashboard-sub-icon' + count;
                        var cl = 'control-sub-label-act';
                        var clk = 'dashboard.ui.selected(\'' + theid + '\', \'' + cl + '\');';
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
            initialize: function () {//INCORRECT
                dashboard.interview.getUsers(function (data) {
                    dashboard.interview.loadToUI(data);
                    dashboard.interview.addUserNodes(data);
                    dashboard.ui.availability.get(function (data) {
                        dashboard.ui.availability.drawUserTimes(data);
                    });
                });
            },
            checkUser: function (user) {
                var welcome = 'Welcome, ' + user.firstName + ' ' + user.lastName + '!';
                $('#welcome-box').html(welcome);
                dashboard.ui.route[user.role](user);
            },
            route: {
                'Recruiter': function (user) {
                    dashboard.interview.getUsers(function (data) {
                        dashboard.interview.loadToUI(data);
                        dashboard.interview.addUserNodes(data);
                        dashboard.ui.availability.get(function (data) {
                            dashboard.ui.availability.drawUserTimes(data);
                        });
                    });
                },
                'Candidate': function (user) {

                },
                'Interviewer': function (user) {
                    dashboard.interview.get(function (data) {

                        dashboard.interview.loadToUI(data);
                        dashboard.interview.getUsers(function (data) {
                            dashboard.interview.addUserNodes(data);
                            dashboard.ui.availability.get(function (data) {
                                dashboard.ui.availability.drawUserTimes(data);
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
                    dashboard.user.validate(dashboard.ui.dashboard.checkUser);
                },
                checkUser: function (user) {
                    //Mark: Manually entering the user. Need to remove when beginning to test. 
                    user = {
                        role: 'Recruiter',
                        name: 'Support'
                    };
                    var welcome = 'Welcome, ' + user.firstName + ' ' + user.lastName + '!';
                    $('#welcome-box').html(welcome);
                    dashboard.ui.dashboard.route[user.role](user);
                },
                route: {
                    'Recruiter': function (user) {
                        
                        var db = dashboard.ui.dashboard;
                    
                        db.setup();
                        //$('.dynamicContent').fadeIn('fast');                       

                        db.getInterviews(function (data) {
                            db.drawInterviews(data);
                        });
                    },
                    'Candidate': function (user) {

                    },
                    'Interviewer': function (user) {
                        var db = dashboard.ui.dashboard;
                        db.setup();
                        //$('.dynamicContent').fadeIn('fast');

                        db.getPositions(function (data) {
                            db.setPositionFilters(data);
                        });

                        db.getInterviews(function (data) {
                            db.drawInterviews(data);
                        });

                        db.getUnscheduledInterviews(function (data) {
                            db.drawUnscheduledInterviews(data);
                        });
                    },
                    'INVALID': function () {

                    }
                },
                deleteUser: function (id, interviewID) {
                    var db = dashboard.ui.dashboard;

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
	                var $el = $('#dynamic-content-area');
                    				
                    var dash =  '<div id="smallModal" class="modal-small"></div>' +
                                '<div id="modal-bg-overlay" class="modal-overlay" onclick="dashboard.timeslot.removeControls();"></div>' +
                                '<div id="small-modal-bg-overlay" class="modal-overlay" onclick="dashboard.ui.modal.small.close();"></div>' +
                                '<div id="error-modal" class="modal">' +
                                    '<div id="availError" class="modal-content">' +
                                        '<button id="closeModal" class="close-modal" onclick="dashboard.ui.modal.error.close();">&times;</button>' +
                                    '</div>' +
                                '</div>' +
                                '<div id="content-body" class="ui-content-body">' +                        
                                    '<div id="db-scheduling" class="dashboard-scheduling">' +
                                        '<div id="scheduled-interviews-container" >' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div id="modal-form" class="modal-form"></div>' ;
                    $el.html(dash);
                    dashboard.ui.time.loadNew('contentRibbon');
                },
                dateReset: {
                    scheduled: function () {
                        var db = dashboard.ui.dashboard;
                        db.getInterviews(function (data) {
                            $('#sch-selected-date').html('Next 7 Days');
                            db.drawInterviews(data);
                            db.drawInterviewsForDate(data);
                        });
                    }
                },
                filter: {
                    scheduled: function () {
                        var db = dashboard.ui.dashboard;

                        if (!dashboard.ui.selectedDate || dashboard.ui.selectedDate === '') {
                            db.getInterviews(function (data) {
                                db.drawInterviews(data);
                                //db.drawInterviewsForDate(data);
                            });
                        }
                        else {
                            db.getInterviewsDate(dashboard.ui.selectedDate, function (data) {
                                db.drawInterviewsForDate(data);
                            });
                        }

                    },
                    unscheduled: function () {
                        var db = dashboard.ui.dashboard;
                        db.getUnscheduledInterviews(function (data) {
                            db.drawUnscheduledInterviews(data);
                        });
                    }
                },
                getInterviewsForDate: function (date, id) {
                    var range = dashboard.ui.dashboard.range;
                    var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                    var today = new Date();
                    date = new Date(date);
                    //$('#sch-selected-date').html(date);
                    if (range.begin !== '' && range.end !== '') {
                        range.begin = '';
                        range.end = '';
                    }

                    if (range.begin === '') {
                        range.begin = date;
                        range.end = date;
                    }
                    else {
                        range.end = date;
                    }
                    console.log(range.begin, range.end);
                    var start = Math.round(Math.abs((today.getTime() - range.begin.getTime()) / (oneDay)));
                    var diffDays = Math.round(Math.abs((range.begin.getTime() - range.end.getTime()) / (oneDay)));
                    var db = dashboard.ui.dashboard;
                    console.log(start, diffDays);
                    dashboard.ui.selectedDate = date;
                    $('#sch-selected-date').html('Interviews for Specified Date');
                    db.getInterviews(function (data) {
                        db.drawInterviews(data);
                    }, start, diffDays);
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
                getUnscheduledInterviews: function (onComplete) {
                    var elid = "dynamic-content-loader";
                    dashboard.ui.loader(true, elid);
                    var posFilter = $('#unsch-position-filter').val() || 'All';
                    $.ajax({
                        type: "GET",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.getUnscheduledInterviews + '?uid=' + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client + '&pfl=' + btoa(posFilter),
                        success: function (data) {
                            onComplete(data[0]);
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                getInterviewsDate: function (date, onComplete) {

                    var posFilter = $('#sch-position-filter').val() || 'All';

                    $.ajax({
                        type: "GET",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.getInterviewsDate + "?uid=" + constants.interview.user + "&adate=" + btoa(date) + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client + '&pfl=' + btoa(posFilter),
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
                    var $schArea = $('#scheduled-interviews-container');
                    $schArea.html('<ul data-theme="a" data-inset="true" data-role="listview" id="interviews-table"></ul>');

                    var $tab = $('#interviews-table');

                    var row = '<div class="ui-row-header">' +
                        '<div class="ui-cell-med roboto ui-cell-pad left ">Call Time</div>' +
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
                    var rowColors = dashboard.colors;

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
                        dtlBar = '<li class="roboto"><a onclick="dashboard.ui.dashboard.getInterview(\'' + data[i]['INTERVIEW_REFERENCE_ID'] + '\');">' + canName +
                            '<p class="roboto">' + data[i]['POSITION_NAME'] + '</p></a></li>';
                        $tab.append('<li data-role="list-divider" onclick="dashboard.ui.dashboard.getInterview(\'' + data[i]['INTERVIEW_REFERENCE_ID'] + '\');" id="' + rowID + '" >' + tslot + dtlBar + '</li>');
                    }

                    $('.selAll').on('click', function () {
                        $(this).select();
                    });                    
                    $('#interviews-table').listview().listview('refresh');
                    dashboard.ui.loader(false, "dynamic-content-loader");
                },
                drawUnscheduledInterviews: function (data) {
                  
                    var toggle = function () {
                        dashboard.ui.dashboard.filter.scheduled();
                    };
                    var htxt = 'Unscheduled Prospects';
                    $('#toggleScheduled').html('<div>Scheduled Prospects</div>');
                    $('#sch-selected-date').text(htxt);                                       
                    $('#toggleScheduled').removeAttr('onclick');
                    $('#toggleScheduled').attr('onclick', 'dashboard.ui.dashboard.getInterviews(' + toggle + ')');

                    var lim = data.length;
                    var $schArea = $('#scheduled-interviews-container');

                    $schArea.html('<ul data-theme="a" data-inset="true" data-role="listview" id="interviews-table"></ul>');

                    var $tab = $('#interviews-table');
              
                    var lim = data.length;

                    var dtlBar = '';
                    var canName = '';
                    var tslot = '';
                    var phone = '';
                    var rowColors = dashboard.colors;
                    
                    for (var i = 0; i < lim; i++) {
                        var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                        var rowID = 'rowNum' + i;

                        if (data[i]['CANDIDATE_ID'] !== null) {
                            canName = data[i]['FULL_NAME']
                        }
                        else {
                            canName = 'TBD';
                        }
                       
                        if (data[i]['TIME_SLOT'] !== null) {
                            tslot = data[i]['CLEAN_DATE'];
                        }
                        else {
                            tslot = 'TBD';
                        }

                        phone = data[i]['CANDIDATE_PHONE'] || '';

                        if (phone === null) {
                            phone = '';
                        } 
                        dtlBar = 'DELETE</a><li onclick="dashboard.ui.dashboard.getInterview(\'' + data[i]['INTERVIEW_REFERENCE_ID'] + '\');"><a> ' + canName + 
                            '<p> ' + data[i]['POSITION_NAME'] + '</p>' +
                            '<p> ' + phone.toPhone() + '</p>' +
                            '<p> ' + data[i]['CANDIDATE_EMAIL'] + '</p></a></li>';
                        $tab.append('<li data-icon="delete" id="' + rowID + '"><a onclick="dashboard.ui.dashboard.deleteUser(\'' + data[i]['ROW_ID'] + '\',\'' + data[i]['INTERVIEW_REFERENCE_ID'] + '\');">' + dtlBar + '</li>');
                        //$tab.append('<li data-role="list-divider" onclick="dashboard.ui.dashboard.getInterview(\'' + data[i]['INTERVIEW_REFERENCE_ID'] + '\');" id="' + rowID + '" >' + tslot + dtlBar + '</li>');;
                    }

                    $('.selAll').on('click', function () {
                        $(this).select();
                    });
                    $('#interviews-table').listview().listview('refresh');
                    dashboard.ui.loader(false, "dynamic-content-loader");
                   
                },
                drawInterviews: function (data) {
                    var toggle = function (data) {
                        dashboard.ui.dashboard.drawUnscheduledInterviews(data);
                    };
                    var htxt = 'All Scheduled Calls';

                    $('#sch-selected-date').text(htxt);
                    //$('#toggleScheduled').text('Unscheduled Prospects');
                    $('#toggleScheduled').text('Unscheduled Prospects');
                    $('#toggleScheduled').removeAttr('onclick');
                    $('#toggleScheduled').attr('onclick', 'dashboard.ui.dashboard.getUnscheduledInterviews(' + toggle + ')');

                    var lim = data.length;
                    var $schArea = $('#scheduled-interviews-container');
                    $schArea.html('<ul data-theme="a" data-inset="true" data-role="listview" id="interviews-table"></ul>');

                    var $tab = $('#interviews-table');                   

                    var lim = data.length;
                    var fullName = '';
                    var dtlBar = '';
                    var canName = '';
                    var tslot = '';
                    var phone = '';
                    var rowColors = dashboard.colors;
                    
                    for (var i = 0; i < lim; i++) {
                        var rowID = 'rowNum' + i;
                        fullName = data[i]['c_fname'] + ' ' + data[i]['c_lname'];

                        if (data[i]['c_fname'] !== null) {
                            canName = fullName;
                        }
                        else {
                            canName = 'TBD';
                        }

                        if (data[i]['startdate'] !== undefined) {
                            sdate = new Date(data[i]['startdate']);
                            sdate = new Date(sdate.getTime() + (sdate.getTimezoneOffset() * 60000));
                            month = sdate.getMonth();
                            month = month + 1;
                            day = sdate.getDate();
                            min = sdate.getMinutes();
                            hrs = sdate.getHours();

                            tslot = sdate.getFullYear();
                            tslot = tslot + '-' + month;
                            tslot = tslot + '-' + day;
                            if (sdate.getHours() > 12) {
                                tslot = tslot + ', ' + hrs;
                                tslot = tslot + ':' + min;
                                tslot = tslot + 'pm';
                            }
                            else {
                                tslot = tslot + ', ' + hrs;
                                tslot = tslot + ':' + min;
                                tslot = tslot + 'am';
                            }
                        }
                        else {
                            tslot = 'TBD';
                        }

                        phone = data[i]['c_phone'] || 'None';

                        if (phone === null) {
                            phone = '';
                        } 
                        dtlBar = '<li class="roboto"><a onclick="dashboard.ui.dashboard.getInterview(\'' + data[i]['INTERVIEW_REFERENCE_ID'] + '\');">' + canName + 
                                 '<p class="roboto">' + data[i]['rolename'] + '</p></a></li>';
                        $tab.append('<li data-role="list-divider" onclick="dashboard.ui.dashboard.getInterview(\'' + data[i]['INTERVIEW_REFERENCE_ID'] + '\');" id="' + rowID + '" >' + tslot + dtlBar + '</li>');                       
                    }
                    
                    $('.selAll').on('click', function () {
                        $(this).select();
                    });      
                    $('#interviews-table').listview().listview('refresh');
                    dashboard.ui.loader(false, "dynamic-content-loader");
                },
                drawPositionPool: function (data) {
                    var lim = data.length;
                    var $schArea = $('#position-pool');
                              
                    $schArea.html('<ul data-theme="a" data-inset="true" data-role="listview" id="interviews-table"></ul>');
                    var $tab = $('#interviews-table');                 

                    var dtlBar = '';
                    var canName = '';
                    var tslot = '';
                    var phone = '';
                    var rowColors = dashboard.colors;
                
                    for (var i = 0; i < lim; i++) {
                        var getRandomColor = rowColors[Math.floor(Math.random() * rowColors.length)];
                        var rowID = 'rowNum' + i;
                        var link = window.location.href.split('rctrinfsys')[0] + 'candidate.html?rec=' + btoa(data[i]['POSITION_ID']) + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client;
                        //$schArea.append('<div onclick="dashboard.ui.dashboard.scheduleInterview(\'' + data[i]['POSITION_ID'] + '\');" class="pool-node mainBG negTxt ckable">' + data[i]['LONG_NAME'] + '</div>');
                        //row = row + '<div class="ui-row ckable" onclick="dashboard.ui.dashboard.getReqLink(\'' + btoa(data[i]['POSITION_ID']) + '\');">';
                        dtlBar = '<li>' + data[i]['POSITION_NAME'] + 
                            '<p>' + data[i]['POSITION_TYPE'] + '</p>' +
                            '<p><input class="selAll spanned-field" value="' + link + '" readonly /></p>' +
                            '</li>'; //'<li data-role="list-divider" onclick="dashboard.ui.dashboard.getInterview(\'' + data[i]['POSITION_ID'] + '\');" id="' + rowID + '" >' + tslot + dtlBar + '</li>'
                        $tab.append('<li data-role="list-divider" onclick="dashboard.ui.dashboard.getInterview(\'' + data[i]['POSITION_ID'] + '\');" id="' + rowID + '" >' + data[i]['POSITION_ID'] + dtlBar + '</li>');                     
                    }

                    $('.selAll').on('click', function () {
                        $(this).select();
                    });
                    
                },
                getReqLink: function (reqnum) {
                    var link = window.location.href.split('rctrinfsys')[0] + 'candidate.html?rec=' + reqnum + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client;
                    var markup = '<div class="repeaterField"><div class="form-header centered">Requisition Link</div><input id="req-input" class="infoTxt repeaterField" value="' + link + '" readonly /></div>';
                    $('#smallModal').html(markup);
                    $('#req-input').on('click', function () {
                        $(this).select();
                    });
                    dashboard.ui.modal.small.open();
                },
                confirmRemoveReq: function (reqnum) {
                    var conf = confirm('Are you sure you want to remove yourself from requisition ' + reqnum + '?');
                    if (conf) {
                        dashboard.ui.dashboard.removeReq(reqnum);
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
                            dashboard.ui.settings.open();
                        },
                        error: function (xhr, ajaxOptions, error) {
                            console.log(xhr);
                        }
                    });
                },
                getInterview: function (id) {
                    dashboard.ui.loader(true, "dynamic-content-loader");
                    constants.interview.id = id;
                    dashboard.ui.initialize();
                },
                addPosition: function () {
                    dashboard.ui.addPositionForm();
                },
                scheduleInterview: function (positionID) {
                    dashboard.ui.scheduleInterviewForm(positionID);
                },
                addParty: function () {
                    dashboard.interview.addUserForm();
                },
                notifyParties: function () {

                },
                refreshPool: function () {
                    var db = dashboard.ui.dashboard;
                    dashboard.ui.modal.close(); 
                    dashboard.ui.settings.addPositions();
                    /*
                    db.getPositions(function (data) {
                        db.drawPositionPool(data);
                    });
                    */
                },
                refreshInterviews: function () {
                    dashboard.ui.selectedDate = dashboard.ui.selectedDate || '';
                    dashboard.ui.modal.close();
                    if (dashboard.ui.selectedDate !== '') {
                        dashboard.ui.dashboard.getInterviewsForDate(dashboard.ui.selectedDate);
                    }
                },
                reports: {
                    open: function () {
                        dashboard.ui.selected('dashboard-sub-icon1', 'control-sub-label-act');
                        var $Content = $('.ui-content-body')
                        var iCard =  '<div id="db-weekly-view" data-role="header">' +
                                        '<div style="margin-left:0;" class="dashboard-header-block"><div class="dashboard-header-text">Interactions</div></div>' +
                                     '</div>' +
                                     '<div id="db-scheduling" class="dashboard-scheduling">' +
                                        '<div id="scheduled-interviews-container" class="fullWidth-container ">' +
                                           '<div id="position-pool"></div>' +
                                        '</div>' +
                                     '</div>';
                        $Content.html(iCard);
                    }
                },
            },
            slideshow: {
                initialize: function () {
                    dashboard.ui.slideshow.populate();
                    dashboard.ui.slideshow.run();
                },
                populate: function () {
                    var slides = '<div class="ss-slide active-slide"><div class="vCenter slideTxt"><div style="display:inline-block;width:50%;">Need help?</div><div style="display:inline-block;width:50%;">Click the &quot;?&quot; on the bottom right of your screen.</div></div></div>' +
                        '<div class="ss-slide"><div class="vCenter slideTxt"><div style="display:inline-block;width:50%;height:100%;"><br/>Need to remove a req?<br/><br/></div><div style="display:inline-block;width:50%;">1) Navigate to &quot;My Positions&quot;<br/><br/>2) Click the &quot;X&quot; next to the desired req number.</div></div></div>' +
                        '<div class="ss-slide"><div class="vCenter slideTxt">Be sure to double-check your spam folder if you feel like you are missing notifications!</div></div>';
                    $('#main-splash').html(slides);
                },
                advance: function () {
                    var $active = $('#main-splash .active-slide');
                    var $next = $active.next();
                    if ($next.length === 0) {
                        $next = $('#main-splash .ss-slide').first();
                    }
                    $next.addClass('active-slide');
                    window.setTimeout(function () {
                        $active.removeClass('active-slide');
                    }, 300);
                },
                run: function () {
                    setInterval(dashboard.ui.slideshow.advance, 8000);
                }
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
                error: {//Mark: Added different modal markup for errors and important notifications. 
                    open: function (t) {
                        $('#small-modal-bg-overlay').stop();
                        $('#error-modal').stop();
                        $('#small-modal-bg-overlay').fadeIn(400, function () {
                            $('#error-modal').fadeIn(400);
                        });
                        $('#availError').append(t);
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
                var $schArea = $('#db-scheduling');
                var field = dashboard.ui.template.field;
                var posFields = field.input('Position ID', 'positions', 'id') +
                                field.input('Position Name', 'positions', 'name') +
                                field.selectNew('Position Type', 'positions', 'type', ['Vacancy', 'Evergreen']); //TO-DO: un-hardcode this
                
                $schArea.append(posFields);
                $("input").textinput();
                //dropdownsLarge();
            },
            scheduleInterviewForm: function (positionID) {
                dashboard.ui.form.resetData();
                dashboard.ui.form.data.positions[0] = {
                    id: positionID
                };
                var $modal = $('#modal-form');
                var field = dashboard.ui.template.field;
                var intFields = '<div id="new-event-form" class="form-event">' +
                    '<div class="formHeader">Enter ' + appconfig.alias.interview + ' Information</div>' +
                    field.input(appconfig.alias.interview + ' Title', 'interview', 'title') +
                    '<div style="display:none;">' + field.input(appconfig.alias.interview + ' ID', 'interview', 'id') + '</div>' +
                    //field.input(appconfig.alias.interview + ' Address', 'interview', 'address') +                             //hard-coded
                    //field.input(appconfig.alias.interview + ' City', 'interview', 'city') +                                   //hard-coded
                    //field.input(appconfig.alias.interview + ' State', 'interview', 'state') +                            //hard-coded
                    //field.input(appconfig.alias.interview + ' Zip', 'interview', 'zip') +                                //hard-coded
                    field.input('Phone/ Conference Number', 'interview', 'conferenceNumber') +
                    field.input('Conference ID', 'interview', 'conferenceID') +
                    field.input('Conference Code', 'interview', 'conferenceCode') +
                    '<hr/>' +
                    field.userRepeater(appconfig.alias.candidate, 'users', 'candidates') +
                    '<hr/>' +
                    field.userRepeater(appconfig.alias.recruiter, 'users', 'recruiters') +
                    '<hr/>' +
                    field.userRepeater(appconfig.alias.interviewer, 'users', 'interviewers') +
                    '</div>';

                intFields = intFields +
                    '<hr />' +
                    '<button class="bigButton mainBG negTxt ckable" onclick="dashboard.ui.form.submit(dashboard.ui.dashboard.refreshInterviews)">SUBMIT</button>';
                $modal.html(intFields);

                var dNow = new Date();
                var iid = dNow.getTime() + '-' + atob(constants.interview.user);
                $('#field-id').val(iid);
                $('#field-id').change();

                dashboard.ui.modal.open();
            },
            submitPosition: function (onComplete) {

                var jData = dashboard.ui.form.data.positions;
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
                        dashboard.ui.form.resetData();
                        onComplete();
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            },
            submitInterview: function () {
                dashboard.ui.form.submit();
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
                var $Content = $('#dashboard-ras-content');
                var b1 = '<button type="button" onclick="dashboard.interview.get()">Get ' + appconfig.alias.interview + ' Info</button>';
                var b2 = '<button type="button" onclick="dashboard.ui.time.load(\'dashboard-ras-content\')">Load Time Controls</button>';
                var b3 = '<button type="button" onclick="dashboard.ui.availability.load()">Get Availability</button>';
                var b4 = '<button type="button" onclick="dashboard.ui.form.newEvent()">Create Event</button>';
                var markup = '<div style="text-align:center;">' +
                    b1 +
                    b2 +
                    b3 +
                    b4 +
                    '</div>';
                $Content.html(markup);
            },
            setData: function (id, field, value) {
                dashboard.data[id][field] = value;
            },
            time: {
                load: function (elmt) {
                    dashboard.ui.form.data = {
                        userID: constants.interview.user,
                        interviewID: constants.interview.id,
                        clientID: constants.interview.client,
                        uiID: constants.interview.ui,
                        availability: []
                    };
                    var today = new Date();
                    var cctr = '<div id="dashboard-ras-calendar-control" class="dashboard-ras-calendar-control"></div>'; //maybe add to css
                    $('#' + elmt).html(cctr);
                    dashboard.util.controls.calendar.draw('dashboard-ras-calendar-control', today.getMonth(), today.getFullYear());
                },
                loadNew: function (elmt) { //Mark: loadNew added instead of load. The calendar function needed to be modified. Changed style as well. Chain needs to be modified so that availabilityView id doesn't have to be here.
                    $('#' + elmt).html('');
                    dashboard.ui.form.data = {
                        userID: constants.interview.user,
                        interviewID: constants.interview.id,
                        clientID: constants.interview.client,
                        uiID: constants.interview.ui,
                        availability: []
                    };
                    
                    var today = new Date();
                    var cctr = '<div id="dashboard-ras-calendar-control" class="dashboard-ras-calendar-control"></div>' +
                        '<div id="availabilityView" class="timeContainerSmall"></div>';
                    $('#' + elmt).html(cctr);
                    $("#contentRibbon").trigger("updatelayout");
                    dashboard.util.controls.calendarSmall.draw('dashboard-ras-calendar-control', today.getMonth(), today.getFullYear());
                    dashboard.user.info.launchEditForm();
                },
                submit: function () {
                    var jData = dashboard.timeslot.wrap();
                    dashboard.timeslot.add(jData);
                },
                dateNode: {
                    add: function (date, element) {
                        var dtNode = dashboard.ui.template.dateNode(dashboard.ui.time.dateNode.count, date);
                        var schdate = new BlockDate(date);
                        schdate.userID = atob(constants.interview.user);
                        schdate.status = 'Proposed';
                        schdate.interviewID = constants.interview.id;
                        dashboard.ui.form.data.availability.push([schdate]);
                        $('#' + element).append(dtNode);
                        dashboard.data[dashboard.ui.time.dateNode.count] = new ADRITime(date, '12', '00', 'AM', 'Accepted');
                        dashboard.ui.time.dateNode.count++;
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
                    dashboard.ui.availability.get();
                },
                get: function (onComplete) {
                    var svc = constants.urls.getTimeSlots + '?iref=' + constants.interview.id + '&uid=' + constants.interview.user + '&uiid=' + constants.interview.ui + '&cliid=' + constants.interview.client;
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
                drawNodes: function (data) {
                    var lim = data.length;
                    var $Content = $('#dashboard-ras-timeNodes');
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
                        $Content.append(dashboard.ui.template.availabilityNode(map[time]));
                    }
                },
                drawUserTimes: function (data) {
                    var lim = data.length;
                    var $user = '';
                    var map = {};
                    console.log(data);
                    $('.user-date-node-struct').html('');

                    for (var i = 0; i < lim; i++) {
                        data['TIME_SLOT'] = data['TIME_SLOT'] || '';

                        if (data[i]['TIME_SLOT'] != '' && data[i]['TIME_SLOT'] != null) {
                            $user = $('#user-availability-' + data[i]['USER_ID']);

                            if (!map[data[i]['USER_ID']]) {
                                map[data[i]['USER_ID']] = data[i];
                                $user.html('');
                            }
                            $user.append(dashboard.ui.template.availabilityNodeSingle(data[i]));
                            if (data[i]['CANDIDATE_ID'] !== null) {
                                $('#user-availability-' + data[i]['CANDIDATE_ID']).append(dashboard.ui.template.availabilityNodeSingle(data[i]));
                            }
                        }
                    }

                }
            },
            template: {
                field: {
                    wrap: function (label, field) {
                        var markup = '<div class="ui-field-contain">' +
                                        '<label style="margin-left:.446em;" class="fheader">' + label + '</label>' +
                            
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
                    wrapSmall: function (field, id) {//Mark: Created due to markup change. label parameter is not needed as result. 
                        var markup = '<div class="time-block-repeater" >' +
                            '<div class="repeaterFieldSmall left">' +
                            field +
                            '</div>' +
                            '</div>';
                        return markup;
                    },
                    timeWrap: function (field, id) {//Mark: Created due to markup change. label parameter is not needed as result. 
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
                            '<div class="field-toggler ckable" data-state="off" data-value="' + value + '" onclick="dashboard.ui.form.setToggler($(this)); dashboard.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).attr(\'data-value\'));"><div>' + icon + '</div></div>' +
                            '</div>';
                        return markup;
                    },
                    groupToggle: function (icon, updates, field) {
                        var markup = '<div class="field-toggler ckable" data-state="off" data-value="no" onclick="dashboard.ui.form.setToggler($(this)); dashboard.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).attr(\'data-value\'));"><div>' + icon + '</div></div>';
                        return markup;
                    },
                    dayToggleOld: function (icon, updates, index) {
                        var markup = '<div class="field-toggler ckable" id="day-toggle-' + index + '-' + updates + '" data-state="off" data-value="no" onclick="dashboard.ui.form.setToggler($(this)); dashboard.ui.form.instantiateDay(\'' + updates + '\',\'' + index + '\');"><div>' + icon + '</div></div>';
                        return markup;
                    },
                    dayToggle: function (icon, updates, index) {//MARK: altered dayToggle to work with new markup. 
                        var markup = '<div class="day-toggler" id="day-toggle-' + index + '-' + updates + '" data-state="off" data-value="no" onclick="dashboard.ui.form.setToggler($(this)); dashboard.ui.form.instantiateDay(\'' + updates + '\',\'' + index + '\');"><div>' + icon + '</div></div>';
                        return markup;
                    },
                    dayToggleSmall: function (icon, updates, index) { //MARK: added smaller dayToggle
                        var markup = '<div class="field-viewer" id="day-toggle-' + index + '-' + updates + '" data-state="off" data-value="no" dashboard.ui.form.instantiateDay(\'' + updates + '\',\'' + index + '\');"><div>' + icon + '</div></div>';
                        return markup;
                    },
                    selectNew: function (label, updates, field, choices) {
                        var lim = choices.length;
                        var opts = '';
                        for (var i = 0; i < lim; i++) {
                            opts = opts + '<option value="' + choices[i] + '">' + choices[i] + '</option>';
                        }

                        dashboard.ui.form.setData(updates, field, choices[0]);
                        //'<select onchange="dashboard.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).val());">' + opts + '</select>' +
                        var markup = '<div class="field-wrapper">' +
                            '<span>' + label + '</span>' +
                            '<div class="containerFull"><select style="max-width:200px;" class="dropdown" onchange="dashboard.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).val());">' + opts + '</select></div>'
                            '</div>';
                        return markup;
                    },
                    select: function (label, updates, field, choices) {
                        var lim = choices.length;
                        var opts = '';
                        for (var i = 0; i < lim; i++) {
                            opts = opts + '<option value="' + choices[i] + '">' + choices[i] + '</option>';
                        }

                        dashboard.ui.form.setData(updates, field, choices[0]);

                        var markup = '<div class="field-wrapper">' +
                            '<span>' + label + '</span>' +
                            '<select style="max-width:200px;" class="dropdown" onchange="dashboard.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).val());">' + opts + '</select>' +
                            '</div>';
                        return markup;
                    },
                    input: function (label, updates, field, value) {
                        value = value || '';
                        var markup = '<li class="ui-field-contain">' +
                            '<label for="' + field + '">' + label + '</label>' +
                            '<input data-clear-btn="true" type="text" name="' + field + '" id="field-' + field + '" onchange="dashboard.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).val());">' + value + '</input>' +
                            '</li>';
                        return markup;
                    },
                    number: function (label, updates, field, step, value, min) {
                        min = min || 0;
                        value = value || '';
                        step = step || '1';
                        var markup = '<div data-role="fieldcontain" class="field-wrapper ui-field-contain ui-body ui-br">' +
                            '<span style="display:block;">' + label + '</span>' +
                            '<input class="ui-input ui-input-text ui-body-c ui-corner-all ui-shadow-inset" type="number" min="' + min + '" id="field-' + field + '" step="' + step + '" value="' + value + '" onchange="dashboard.util.checkNumValue($(this),' + min + ',' + step + ');dashboard.ui.form.setData(\'' + updates + '\',\'' + field + '\',$(this).val());"></input>' +
                            '</div>';
                        return markup;
                    },
                    userInput: function (label, role, index, field) {
                        var markup = '<div class="field-wrapper">' +
                            '<span>' + label + '</span>' +
                            '<input onchange="dashboard.ui.form.setUserData(\'' + role + '\',\'' + index + '\',\'' + field + '\',$(this).val());"></input>' +
                            '</div>';
                        return markup;
                    },
                    userRepeater: function (label, updates, field) {
                        var rid = label.split(/[^A-Za-z0-9]/).join('');
                        var markup = '<div><div id="user-repeater-' + rid + '"></div><button class="button thin hlBG negTxt ckable" onclick="dashboard.ui.form.addUser(\'user-repeater-' + rid + '\',\'' + label + '\',\'' + updates + '\',\'' + field + '\')"><span>Add ' + label + '</span></button></div>';
                        return markup;
                    },
                    user: function (role, updates, fld) {
                        var nodes = $('.form-user-node-struct').length;
                        dashboard.ui.form.data.users[fld][nodes] = {};
                        var field = dashboard.ui.template.field;
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
                        var timeData = dashboard.util.time.propagateWorkhoursArray();
                        var hours = timeData.hours;
                        var minutes = timeData.minutes;
                        var period = timeData.period;
                        var hrs = hours.length;
                        var mins = minutes.length;    

                        var hmkup = '';
                        for (var h = 0; h < hrs; h++) {
                            hmkup = hmkup + '<option value="' + hours[h] + '">' + hours[h][0] + '</option>';
                        }
                        var id = 'selector-hours' + index + '-' + category;
                        dashboard.id = id;
                        markup = '<div id="selector-hours-' + index + '-' + category + '" class="container"><select onchange="dashboard.ui.form.setBlockHour(\'' + category + '\',\'' + index + '\',\'hour\',$(this).val()); dashboard.ui.form.setBlockHour(\'' + category + '\',\'' + index + '\',\'period\',$(this).val());" class="dropdown" name="radio-hours-' + index + '-' + category + '" id="radio-hours-' + index + '-' + category + '" >' + hmkup + '</select></div>';

                        var mmkup = '';
                        for (var m = 0; m < mins; m++) {
                            mkup = mkup + '<option value="' + minutes[m] + '">' + minutes[m] + '</option>';
                        }

                        markup = markup + '<div class="container"><select onchange="dashboard.ui.form.setBlockMinute(\'' + category + '\',\'' + index + '\',\'minutes\',\'' + minutes[0] + '\'); dashboard.ui.form.setBlockMinute(\'' + category + '\',\'' + index + '\',\'period\',\'' + minutes[1] + '\');" class="dropdown" name="radio-minutes-' + index + '-' + category + '" id="radio-minutes-' + index + '-' + category + '" >' + mkup + '</select></div>';

                        return markup;
                    },
                    timeNodesOld: function (category, index) {
                        var zone;
                        var markup = '';;
                        var timeData = dashboard.util.time.propagateWorkhoursArray();
                        var hours = timeData.hours;
                        var minutes = timeData.minutes;
                        var period = timeData.period;
                        var hrs = hours.length;
                        var mins = minutes.length;

                        var hmkup = '';
                        for (var h = 0; h < hrs; h++) {
                            hmkup = hmkup + dashboard.ui.template.field.workHourNode(category, index, 'radio-hours-' + index + '-' + category, hours[h]);
                        }

                        markup = '<div class="mobile-hscroll"><div id="radio-hours-' + index + '-' + category + '" class="timenodes"><div class="secHTxt">Hour</div><div>' + hmkup + '</div></div><div class="ampmGradient timenode-bar"></div></div>';

                        var mmkup = '';
                        for (var m = 0; m < mins; m++) {
                            mmkup = mmkup + dashboard.ui.template.field.timeNode(category, index, 'radio-minutes-' + index + '-' + category, minutes[m], minutes[m]);
                        }

                        markup = markup + '<div class="mobile-hscroll"><div id="radio-minutes-' + index + '-' + category + '" class="timenodes"><div class="secHTxt">Minute</div>' + mmkup + '</div></div>';

                        return markup;
                    },
                    workHourNodeOld: function (category, index, zone, value) {
                        var markup = '<div id="' + zone + '-' + index + '-' + value.join('') + '" class="field-toggler ckable radio" data-value="' + value[0] + '" onclick="dashboard.ui.form.setRadio(\'' + zone + '\',$(this)); dashboard.ui.form.setBlockTime(\'' + category + '\',\'' + index + '\',\'hour\',\'' + value[0] + '\'); dashboard.ui.form.setBlockTime(\'' + category + '\',\'' + index + '\',\'period\',\'' + value[1] + '\');"><div>' + value[0] + '</div></div>';
                        return markup;
                    },
                    workHourNode: function (category, index, zone, value) {
                        var markup = '<option value="' + value[0] + '" id="' + zone + '-' + index + '-' + value.join('') + '" class="option" data-value="' + value[0] + '" onclick="dashboard.ui.form.setBlockTime(\'' + category + '\',\'' + index + '\',\'hour\',\'' + value[0] + '\'); dashboard.ui.form.setBlockTime(\'' + category + '\',\'' + index + '\',\'period\',\'' + value[1] + '\');">' + value[0] + '</option>';                       
                        return markup;
                    },
                    timeNode: function (category, index, zone, value, icon) {
                        var markup = '<option value="' + value[0] + '" id="' + zone + '-' + index + '-' + value + '" onclick="dashboard.ui.form.setBlockTime(\'' + category + '\',\'' + index + '\',\'minutes\',\'' + value + '\');">' + icon + '</option>';
                        return markup;
                    },
                    timeNodeSmall: function (category, index, zone, value, args) {//Mark: added "small" function as the timeNode function is still needed for the editing form. 
                        var icon = args['hr'] + ':' + args['min'] + args['per'];
                        var markup = '<div class="time-section"><div class="field-viewer" id="' + zone + '-' + index + '-' + value + '" >' + icon +'</div></div>';
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
                        dashboard.ui.template.date(data['TIME_SLOT'].split('T')[0]) +
                        '<div>' + data['TIME_SLOT'].split('T')[1].split('Z')[0] + '</div>' +
                        '<div>' + data.users.join('\<br\/\>') + '</div>' +
                        '</div>';
                    return markup;

                },
                availabilityNodeSingle: function (data) {
                    var nodeID = data['TIME_SLOT'].split(/[^0-9]/).join('-');
                    var markup = '<div id="availability-node-' + nodeID + '" class="date-node-single">' +
                        dashboard.ui.template.date(data['TIME_SLOT'].split('T')[0]) +
                        '<div>' + data['TIME_SLOT'].split('T')[1].split('Z')[0] + '</div>' + //<i class="material-icons">&#xE5CD;</i>
                        '<div class="remove-widget" onclick="dashboard.timeslot.deleteSlot(\'' + data['TSID'] + '\');">&#xE5CD;</div>' +
                        '</div>';
                    return markup;
                },
                userNode: function (data) {
                    var fields = [
                        'INTERVIEW_REFERENCE_ID',
                        'fullname',
                        'personcode',
                        'last_name',
                        'user_role',
                        'mobilenumber',
                        'emailaddress',
                        'ROW_ID'
                    ];
                    var fullName = data['fname'] + ' ' + data['lname'];

                    var nodeID = data['personcode'];

                    if (data['mobilenumber'] === null) {
                        data['mobilenumber'] = '';
                    }

                    var uid = constants.interview.user; //<i class="material-icons">&#xE5CD;</i> onclick="dashboard.interview.deleteUser(\'' + data['ROW_ID'] + '\');"
                    var delUser = '<div title="Delete this user from this call." class="remove-widget">&#xE5CD;</div>';
                    if (uid === data.personcode || appconfig.page.interviewdetail.controls.deleteuser === false) {
                        delUser = '';
                    }

                    var role = data['user_role'] || '';
                    if (role === null) {
                        role = '';
                    }

                    role = role.split('Interviewer').join(appconfig.alias.interviewer);
                    role = role.split('Candidate').join(appconfig.alias.candidate);
                    role = role.split('Recruiter').join(appconfig.alias.recruiter);
                    var etxt = '<p>Email sent!</p>';
                    var mtxt = '<p>Text sent!</p>';
                    var calwidget = '<div class="control-wrap" onclick="dashboard.timeslot.addControls(\'modal-form\',\'' + data['personcode'] + '\',\'' + fullName + '\',\'' + data['user_role'] + '\');">&#xE878;</div>';
                    var emlwidget = '<div class="control-wrap" onclick="dashboard.util.emailUser(\'' + data + '\');dashboard.ui.modal.error.open(\'' + etxt + '\');"><div class="material-icons control-button darker">&#xE0BE;</div></div>';
                    var smswidget = '<div class="control-wrap" onclick="dashboard.util.smsUser(\'' + data + '\');dashboard.ui.modal.error.open(\'' + mtxt + '\');"><div class="material-icons control-button darker">&#xE0D8;</div></div>';

                    if (appconfig.page.interviewdetail.controls.calendar !== true) {
                        calwidget = '';
                    }

                    if (appconfig.page.interviewdetail.controls.email !== true) {
                        emlwidget = '';
                    }

                    if (appconfig.page.interviewdetail.controls.sms !== true) {
                        smswidget = '';
                    }
                    //ui-li-divider ui-bar-a ui-first-child
                    var markup = '<li data-role="list-divider" id="user-node-' + nodeID + '">' +
                                        //delUser +
                                        fullName + 
                                        '<li class="roboto">' +    
                                            '<p>' + role + '</p>' +
                                            '<p>' + data['mobilenumber'] + '</p>' +
                                            '<p>' + data['emailaddress'] + '</p>' +
                                            '<p id="user-availability-' + nodeID + '"></p>' +
                                             calwidget +
                                             emlwidget +
                                             smswidget +
                                        '</li>' +
                                  '</li>';
                    return markup;
                },
                addUserNode: function () {
                    return '<div onclick="dashboard.interview.addUserForm();" class="add-user-container"><div class="add-user-widget">&#xf234;</div></div>';
                },
                dateNode: function (nodeID, date) {
                    var field = dashboard.ui.template.field;
                    var index = $('.ti-schedule-node').length;
                    var startSelector = field.timeNodes('starttime', index);
                    var markup = '<div id="datetime-node-' + nodeID + '" class="ti-schedule-node pBG">' +
                        dashboard.ui.template.date(date) +
                        field.wrap('Start Time', startSelector) + '<br />' +
                        '</div>';
                    return markup;
                },
                timeSelect: function (id, opts, field) {
                    return '<select id="' + id + '" class="time-select" onchange="dashboard.ui.setData(\'' + id + '\',\'' + field + '\',$(this).val())">' + opts + '</select>';
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
                    positions: {},
                    users: {
                        candidates: {},
                        recruiters: {},
                        interviewers: {}
                    }
                },
                resetData: function () {
                    dashboard.ui.form.data = {
                        clientID: constants.interview.client,
                        userID: constants.interview.user,
                        uiID: constants.interview.ui,
                        interview: {},
                        positions: {},
                        users: {
                            candidates: {},
                            recruiters: {},
                            interviewers: {}
                        }
                    };
                },
                setData: function (updates, field, val) {
                    dashboard.ui.form.data[updates][field] = val;
                },
                setSubData: function (updates, field, subField, val) {
                    dashboard.ui.form.data[updates][field][subField] = val;
                },
                setBlockHour: function (category, index, field, value) {
                    var val = value.split(',');
                    var time = val[0];
                    var period = val[1];
                    var lim = dashboard.ui.form.data.availability[index].length;
                    for (var i = 0; i < lim; i++) {
                        dashboard.ui.form.data.availability[index][i].schedule[category]['period'] = period;
                    }

                    for (var i = 0; i < lim; i++) {
                        dashboard.ui.form.data.availability[index][i].schedule[category]['hour'] = time;
                    }
                },
                setBlockMinute: function (category, index, field, value) {
                    var lim = dashboard.ui.form.data.availability[index].length;
                    for (var i = 0; i < lim; i++) {
                        dashboard.ui.form.data.availability[index][i].schedule[category][field] = value;
                    }
                },
                instantiateDay: function (day, index) {

                    var $node = $('#day-toggle-' + index + '-' + day);
                    var state = $node.attr('data-state');

                    if (state === 'off') {
                        var lim = dashboard.ui.form.data.availability[index].length;
                        var ids = [];
                        for (var i = 0; i < lim; i++) {
                            if (dashboard.ui.form.data.availability[index][i].day === day) {
                                ids.push(i);
                            }
                        }

                        for (var n = ids.length - 1; n > -1; n--) {
                            dashboard.ui.form.data.availability[index].splice(ids[n], 1);
                        }
                    }
                    else {
                        var block = new BlockDay(day);
                        if (!dashboard.ui.form.data.availability[index]) {
                            dashboard.ui.form.data.availability.push([block]);
                        }
                        else {
                            block.schedule = dashboard.ui.form.data.availability[index][0].schedule;
                            dashboard.ui.form.data.availability[index].push(block);
                        }
                    }
                },
                setUserData: function (role, index, field, val) {
                    dashboard.ui.form.data.users[role][index][field] = val;
                },
                addUser: function (el, role, updates, field) {
                    var markup = dashboard.ui.template.field.user(role, updates, field);
                    $('#' + el).append(markup);
                },
                removeUser: function (id, updates) {

                },
                newEvent: function () {
                    var $content = $('#dashboard-ras-content');
                    var field = dashboard.ui.template.field;
                    var interview = dashboard.ui.form.data.interview;
                    var position = dashboard.ui.form.data.positions;
                    var users = dashboard.ui.form.data.users;
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
                        '<div style="width:100%;text-align:center;"><button type="button" onclick="dashboard.ui.form.submit()">Create Event!</button></div>';
                    $content.html(form);

                    var dNow = new Date();
                    var iid = dNow.getTime() + '-' + atob(constants.interview.user);
                    $('#field-id').val(iid);
                    $('#field-id').change();
                },
                submit: function (onComplete) {

                    console.log(JSON.stringify(dashboard.ui.form.data));

                    $.ajax({
                        type: "POST",
                        contentType: 'application/json',
                        dataType: "json",
                        url: constants.urls.addInterview,
                        data: JSON.stringify(dashboard.ui.form.data),
                        success: function (data) {
                            dashboard.ui.form.resetData();

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
            loader: function (isLoading, id, l) {
                var element = '<div class="spinnerContainer"><div class="loader"></div></div>';
                var theEl = $('#' + id);
                
                if (isLoading === true) {
                    $('')
                    theEl.css('display', '');
                    theEl.html(element);
                    var spinner = $(".loader");

                    setTimeout(function () {
                        spinner.css('transform', 'rotate(216000deg)');
                    }, 100);
                }

                else {                                                   
                    $('#content-body').css('display', 'block');
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
                        canName = data[e].fullname + ' ' + data[e].last_name;
                    }
                };
                var iFields = [
                    //['ID', 'INTERVIEW_REFERENCE_ID'], //hard-coded
                    ['Name', canName],
                    ['Prospect\'s Phone', mainNumber],
                ];

                var iCard = '<div id="interview-info-container" class="int-info-container">' +
                    '<div id="dtl-' + interview['INTERVIEW_REFERENCE_ID'] + '" class="interviewInfo">' +
                    '<div id="dtl-txt-' + interview['INTERVIEW_REFERENCE_ID'] + '" class="interviewCardContents ">' +
                    '<div id="interview-info-header" class="formHeader secHTxt roboto">' + appconfig.alias.interview + ' for ' + canName + '</div>' +  //hard-coded
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '<div class="interviewNodeArea ">' +                    
                    '<div id="dashboard-ras-timeNodes"></div>' +
                    '</div>' +
                    '<div id="modal-form" data-position-to="window" data-role="popup" data-theme="a" class="ui-content ui-corner-all"></div>' +
                    '<div id="smallModal" class="modal-small"></div>' +
                    '<div id="modal-bg-overlay" class="modal-overlay" onclick="dashboard.timeslot.removeControls();"></div>' +
                    '<div id="small-modal-bg-overlay" class="modal-overlay" onclick="dashboard.ui.modal.small.close();"></div>';

                $el.html(iCard);
                $("#contentRibbon").trigger("updatelayout");
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
                var socket = io.connect('http://ec2-54-244-71-87.us-west-2.compute.amazonaws.com/');
                var intInfo = [constants.interview.id];
                console.log(intInfo);
                socket.on('connect', function (data) {
                    socket.emit('getInterviewInfo', intInfo);
                });

                socket.on('recieveCallInfo', function (data) {
                    onComplete(data[0]);
                });
            },
            addUserNodes: function (data) {
                var lim = data.length;
                var $Content = $('#interviews-table');
                $Content.html('');
                var header = '<div style="margin-left:0; border:none;" id="db-weekly-view" data-role="header">' + 
                    '<div style="margin-left:2%;" class="formHeader darker">Users Associated with ' + appconfig.alias.interview + '</div >' +    //hard-coded' +
                    '</div>';
                $Content.html(header);

                var modal =  '<div id="error-modal" class="modal">' +
                                '<div id="availError" class="modal-content">' +
                                   '<button id="closeModal" class="close-modal" onclick="dashboard.ui.modal.error.close();">&times;</button>' +
                                '</div>' +
                             '</div>';
                $Content.append(modal);

                var map = {};

                for (var i = 0; i < lim; i++) {
                    if (!map[data[i]['personcode']]) {
                        map[data[i]['personcode']] = data[i];
                    }
                }
               
                for (var user in map) {
                    $Content.append(dashboard.ui.template.userNode(map[user]));
                }

                if (appconfig.page.interviewdetail.controls.adduser === true) {
                    $Content.append(dashboard.ui.template.addUserNode());
                }
                $('#interviews-table').listview().listview('refresh');
                dashboard.ui.loader(false, "dynamic-content-loader");
            },
            addUserForm: function () {
                dashboard.ui.form.resetData();
                var $modal = $('#modal-form');
                var field = dashboard.ui.template.field;
                var userFields = field.userRepeater(appconfig.alias.candidate, 'users', 'candidates') +
                    field.userRepeater(appconfig.alias.recruiter, 'users', 'recruiters') +
                    field.userRepeater(appconfig.alias.interviewer, 'users', 'interviewers') +    //hard-coded
                    '<hr \>' +
                    '<button class="bigButton mainBG negTxt ckable" onclick="dashboard.interview.submitUsers()">SUBMIT</button>';
                $modal.html(userFields);
                dashboard.ui.modal.open();
            },
            submitUsers: function () {
                dashboard.ui.form.data.interview.id = constants.interview.id;

                $.ajax({
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.addUsers,
                    data: JSON.stringify(dashboard.ui.form.data),
                    success: function (data) {
                        dashboard.ui.form.resetData();
                        dashboard.interview.getUsers(function (data) {
                            dashboard.interview.addUserNodes(data);
                            dashboard.ui.availability.get(function (data) {
                                dashboard.ui.availability.drawUserTimes(data);
                            });
                        });
                        dashboard.ui.modal.close();
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
                        dashboard.interview.getUsers(function (data) {
                            dashboard.interview.addUserNodes(data);
                            dashboard.ui.availability.get(function (data) {
                                dashboard.ui.availability.drawUserTimes(data);
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

                var lim = dashboard.ui.form.data.availability.length;

                for (var i = 0; i < lim; i++) {
                    timeslot = dashboard.ui.form.data.availability[i][0];
                    jsData.data[index] = new APITimeInstance(timeslot);
                    index++;
                }

                return jsData;
            },
            add: function (jsData) {
                console.log(JSON.stringify(jsData));
                $.ajax({
                    type: "POST",
                    contentType: 'application/json',
                    dataType: "json",
                    url: constants.urls.addTimeSlot,
                    data: JSON.stringify(jsData),
                    success: function (data) {
                        dashboard.data = {};
                        dashboard.timeslot.removeControls();
                        dashboard.ui.availability.get(function (data) {
                            dashboard.ui.availability.drawUserTimes(data);
                        });
                    },
                    error: function (xhr, ajaxOptions, error) {
                        console.log(xhr);
                    }
                });
            },
            addControls: function (elmt, userID, userName, userRole) {
                dashboard.interview.scheduling = {
                    userID: userID,
                    userName: userName,
                    userRole: userRole
                };
                dashboard.ui.time.load(elmt);
                dashboard.ui.modal.open();
            },
            removeControls: function () {
                dashboard.interview.scheduling = {
                    userID: '',
                    userName: '',
                    userRole: ''
                };
                dashboard.ui.modal.close();
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
                        dashboard.ui.availability.get(function (data) {
                            dashboard.ui.availability.drawUserTimes(data);
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
                    dashboard.user.info.edit(constants.interview.user);
                },
                edit: function (userID, check) {
                    var $vc = $('#availabilityView');
                    var $modal = $('#modal-form');
                    var form = dashboard.user.info.form(userID);
                    var view = dashboard.user.info.view(); 
                    $vc.html(view);
                    $modal.html(form);
                    dashboard.user.info.load(userID);          
                    
                },
                form: function (userID) {
                    var field = dashboard.ui.template.field;
                    var wdGroup = field.dayToggle('Su', 'sunday', 0) +
                        field.dayToggle('M', 'monday', 0) +
                        field.dayToggle('T', 'tuesday', 0) +
                        field.dayToggle('W', 'wednesday', 0) +
                        field.dayToggle('T', 'thursday', 0) +
                        field.dayToggle('F', 'friday', 0) +
                        field.dayToggle('S', 'saturday', 0);

                    var startSelector = field.timeNodes('starttime', 0);
                    var endSelector = field.timeNodes('endtime', 0);
                    var lunchSelector = field.timeNodes('lunchstart', 0);

                    var form =      '<div class="form-header centered ttlTxt" data-theme="c" data-role="header">Persistent Availability<button id="closeModal" class="close-modal" onclick="dashboard.ui.modal.close();">&times;</button></div>' +
                                    '<div class="ui-content" id="block-schedule-container">' +
                                        '<div id="block-schedule-area" class="block-container">' +
                                            '<div id="block-repeater-edit" class="block-repeater left">' +
                                                field.wrapDay('Days Available', wdGroup) + 
                                                '<div class="repeaterFieldSpanned">' +
                                                    field.wrap('Start', startSelector) + 
                                                    field.wrap('End', endSelector) + 
                                                    field.wrap('Lunch', lunchSelector) +
                                                '</div>' +
                                            '</div>' +
                                        '</div>' +
                                        '<div class="block-repeater-add">' + 
                                            '<div class="block-text fheader">&nbsp;Add Another Schedule</div><div class="stdWidget" onclick="dashboard.user.info.addBlockRepeater();">&#xE146;</div>' +
                                        '</div>' +
                                        field.number('Default ' + appconfig.alias.interview + ' Length (Minutes)', 'info', 'defaultInterviewMinutes', 5, 20, 10) +           //hard-coded
                                        field.number(appconfig.alias.interviewer + ' Rank', 'info', 'ranking', 1, 1, 0) +
                                        '<div class="centered spanned"><button class="bigButton mainBG negTxt ckable" onclick="dashboard.user.info.update(\'' + userID + '\',dashboard.user.info.updated)">Submit</button></div><div class="spacer"></div>' +
                                    '</div>';
                                
                    return form;
                },
                personalInfo: function (userID) {
                    var info = '<div class="form-header secHTxt centered">Identifying Information</div>' +
                        field.input('First Name', 'info', 'fName') +
                        field.input('Last Name', 'info', 'lName') +
                        field.input('Email Address', 'info', 'email') +
                        field.input('Phone Number', 'info', 'phone') +
                        field.input('Location', 'info', 'location') +
                        '<button class="bigButton mainBG negTxt ckable" onclick="dashboard.user.info.update(\'' + userID + '\',dashboard.user.info.updated)">Submit</button>';
                    return info;
                },
                view: function () {//Mark: view created for display under mini calendar. Most markup not needed as it is mostly drawn depending on the data pulled. 
                    var field = dashboard.ui.template.field;
                    var form = '<div class="formContent">' +
                        '<div class="dashHeader">Current Availability</div>' +
                        '<div id="block-schedule-view" class="block-container" onclick="dashboard.ui.modal.open();">' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                    return form;
                },
                addBlockRepeater: function () { // MARK: Might need to create view version of block repeater
                    var index = $('.block-repeater').length;
                    var field = dashboard.ui.template.field;
                    var wdGroup = field.dayToggle('Su', 'sunday', index) +
                        field.dayToggle('Mo', 'monday', index) +
                        field.dayToggle('Tu', 'tuesday', index) +
                        field.dayToggle('We', 'wednesday', index) +
                        field.dayToggle('Th', 'thursday', index) +
                        field.dayToggle('Fr', 'friday', index) +
                        field.dayToggle('Sa', 'saturday', index);

                    var startSelector = field.timeNodes('starttime', index);
                    var endSelector = field.timeNodes('endtime', index);
                    var lunchSelector = field.timeNodes('lunchstart', index);
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
                addBlockView: function () {
                    $('#block-schedule-view').html('');
                    var index = $('.block-repeater').length;
                    var field = dashboard.ui.template.field;
                    var fWrap;
                    var avail = dashboard.ui.form.data.availability;
                    var aLen = avail.length;
                    var rowColors = dashboard.colors;

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
                            'endtime',
                            'lunchstart',
                            'starttime'
                        ];

                        function setTimeNode(t, tInstance, field, id) {

                            var temp = dashboard.ui.template.field;
                            var h = tInstance.hour;
                            var m = tInstance.minutes;
                            var p = '';
                            var tm;
                            var args = {
                                'hr': h,
                                'min': m,
                                'per': p
                            };

                            if (field === 'lunchstart') {

                            }
                            else {
                                if (field === 'starttime') {
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
                            var block = '<div id="' + id + '" class="repeater-section">' +
                                '<div id="' + dayID + '" class="day-section"></div>' +
                                '<div id="' + timeID + '" class="time-section right"></div>' +
                                '</div>';
                            $('#block-schedule-view').append(block);
                            $('#' + id).css('border-left', '5px solid ' + getRandomColor);

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
                            var sched = avail[e][0].schedule;
                            setTimeNode(e, sched.starttime, 'starttime', timeID);
                            setTimeNode(e, sched.endtime, 'endtime', timeID);
                            setTimeNode(e, sched.lunchstart, 'lunchstart', timeID);

                        }
                    }
                    else {
                        var id = 'view';
                        var txt = '<p>Your availability needs to be set. Click "Edit Availability" to begin.</p>';
                        var block = '<div id="' + id + '" style="text-align:left; color:white; padding:4px; font-size:14pt;" class="repeater-section">Your availability is not set up.</div>';

                        $('#block-schedule-view').append(block);
                        dashboard.ui.modal.error.open(txt);
                    }
                },
                load: function (userID) {
                    dashboard.user.info.get(userID, function (data) {
                        dashboard.user.info.set(data);
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
                    var pa = data[0];
                    //var uInfo = data.userInfo[0][0];
                    dashboard.ui.form.data = {
                        userID: btoa(pa.personid),
                        interviewID: constants.interview.id,
                        clientID: constants.interview.client,
                        interview: {},
                        positions: {},
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
                        dashboard.ui.form.data.info[flds[i][0]] = uInfo[flds[i][1]];
                    }
                    */
                    var dlm = dashboard.ui.form.data.info.defaultInterviewMinutes;

                    if (dlm === '' || dlm === null) {
                        dashboard.ui.form.data.info.defaultInterviewMinutes = 20;
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

                        var theHour = tInstance.split(':');
                        var $hr = 'radio-hours-' + t + '-' + field;
                        var $min = 'radio-minutes-' + t + '-' + field;
                        var el = document.getElementById($hr);
                        var elhr = document.getElementById($min);
                        theHour = theHour[0];
                   
                        if (theHour > 11) {
                            tm = timeConvert(tInstance);
                            h = tm.hour;
                            m = tm.minute;
                            //MARK
                            $('[name=' + $hr + ']').val(h + ',PM');
                            $('[name=' + $min + ']').val(m);
                         
                            dashboard.ui.form.setBlockHour(field, t, 'hour', h + ',PM');
                            dashboard.ui.form.setBlockMinute(field, t, 'period', m);
                        }
                        else {
                            tm = timeConvert(tInstance);
                            h = tm.hour;
                            m = tm.minute;
                            //MARK
                            $('[name=' + $hr + ']').val(h + ',AM');
                            $('[name=' + $min + ']').val(m);
                            dashboard.ui.form.setBlockHour(field, t, 'hour', h + ',PM');
                            dashboard.ui.form.setBlockMinute(field, t, 'period', m);
                        }

                    }

                    var tLim = pa.length;
                    var tMap = {};
                    var dateKey = '';
                    var cIndex = 0;

                    for (var n = 0; n < tLim; n++) {
                        dateKey = pa[n].starttime + '-' + pa[n].endtime + '-' + pa[n].lunchstart;
                        if (typeof tMap[dateKey] === 'undefined') {
                            
                            if (n !== 0) {
                                dashboard.user.info.addBlockRepeater();
                            }
                            cIndex = dashboard.ui.form.data.availability.length;
                            console.log(dashboard.ui.form.data.availability);
                            tMap[dateKey] = cIndex;
                            $('#day-toggle-' + cIndex + '-' + pa[n].weekday.toLowerCase()).click();

                            setTimeNode(cIndex, pa[n].starttime, 'starttime');
                            setTimeNode(cIndex, pa[n].endtime, 'endtime');
                            setTimeNode(cIndex, pa[n].lunchstart, 'lunchstart');
                        }
                        else {
                            cIndex = tMap[dateKey];
                            $('#day-toggle-' + cIndex + '-' + pa[n].weekday.toLowerCase()).click();
                        }
                    }
                    
                    dashboard.user.info.addBlockView();
                },
                update: function (userID, onComplete) {
                    var socket = io.connect('http://ec2-54-244-71-87.us-west-2.compute.amazonaws.com/');
                    dashboard.ui.loader(true, "dynamic-content-loader");
                    //var jData = dashboard.user.info.setJson();      
                    var jData = dashboard.ui.form.data;
                    socket.on('connect', function (data) {
                        reconnection: false;
                        socket.emit('setAvail', jData, userID);
                        onComplete();
                    });

                },
                updated: function () { //Mark: added loadNew to refresh dash availability view along with loading animation close. 
                   
                    dashboard.ui.form.resetData();
                    dashboard.ui.time.loadNew('contentRibbon');
                    dashboard.ui.loader(false, "dynamic-content-loader");
                    dashboard.ui.modal.close();
                },
                setJson: function () {
                    var jData = dashboard.ui.form.data;
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
            },
            testFormat: function () {
                var frmt = $('#test-format').val();
                var args = { format: frmt }
                var rtv = dashboard.util.date.fmt(args);
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
                        cells = cells + dashboard.util.table.headerCell(data[i]);
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
                            cells = cells + dashboard.util.table.dataCell(data[fields[i][0]]);
                        }
                        else {
                            cells = cells + dashboard.util.table.indicatorCell(data[fields[i][0]]);
                        }
                    }
                    return '<div class="ui-row" onclick="dashboard.ui.dashboard.getInterview(\'' + id + '\')">' + cells + '</div>';
                },
                dataRows: function (data, fields) {
                    var rows = '';
                    for (var row in data) {
                        rows = rows + dashboard.util.table.dataRow(data[row], fields, data[row][fields[0][0]]);
                    }
                    return rows;
                },
                body: function (rows) {
                    return '<div class="spacer"></div><div data-role="listview" class="ui-table">' + rows + '</div><div class="spacer"></div>';
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
                    var util = dashboard.util;

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
                            var cellid = dashboard.util.date.fmt({ date: date, format: 'MM-dd-yyyy' });
                            var sDate = dashboard.util.date.fmt({ date: date, format: 'yyyy-MM-dd' });
                            return '<div id="cal-cell-' + cellid + '" class="cal-cell" onclick="dashboard.ui.time.dateNode.add(\'' + sDate + '\',\'ui-datenodes\')">' +
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
                            return '<div nohighlight class="cal-title">' + dashboard.util.date.fmt({ date: date, format: 'MMMM yyyy' }) + '</div>';
                        },
                        wkviewTitle: function (date) {
                            return '<div nohighlight class="title-weekly-calendar vCenter centered">Week of ' + dashboard.util.date.fmt({ date: date, format: 'MMMM dd, yyyy' }) + '</div>';
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
                            var mthYr = dashboard.util.date.fmt({ date: d, format: 'MMMM yyyy' });
                            var clk = 'dashboard.util.controls.calendar.draw(\'' + elmt + '\',\'' + d.getMonth() + '\',\'' + d.getFullYear() + '\')';

                            return '<div nohighlight class="cal-button" onclick="' + clk + ';">' + dir.icon + '</div>';
                        },
                        controls: function (date, elmt) {
                            var tmp = dashboard.util.controls.calendar.template;
                            return tmp.button(date, 'down', elmt) + tmp.title(date) + tmp.button(date, 'up', elmt);
                        },
                        wvCell: function (date) {
                            var cellid = dashboard.util.date.fmt({ date: date, format: 'MM-dd-yyyy' });
                            var sDate = dashboard.util.date.fmt({ date: date, format: 'yyyy-MM-dd' });
                            var cellDate = dashboard.util.date.fmt({ date: date, format: 'MMM d' });

                            return '<div id="cal-cell-' + cellid + '" class="wvCell pBG ckable" onclick="dashboard.ui.dashboard.getInterviewsForDate(\'' + sDate + '\')">' +
                                '<div nohighlight class="wv-cell-date">' + cellDate + '</div>' +
                                '<div id="cal-cell-nodes-' + cellid + '"></div>' +
                                '</div>';
                        }
                    },
                    frame: function (minDate, maxDate, elmt) {
                        var tmp = dashboard.util.controls.calendar.template;
                        var header = '';
                        for (var d = 0; d < 7; d++) {
                            header = header + tmp.header(dashboard.util.date.days[d].abbreviation);
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
                        body = body + '<div class="cal-footer-row"><button class="bigButton mainBG negTxt ckable" type="button" onclick="dashboard.ui.time.submit()">Add Times</button></div>';
                        return body;
                    },
                    draw: function (elmt, mth, yr) {
                        var cal = dashboard.util.controls.calendar;
                        var minDate = new Date(yr, mth, 1);
                        var maxDate = new Date(yr, (+mth + 1), 0);

                        var dates = dashboard.util.date.propagate(minDate, maxDate);
                        var times = dashboard.util.time.propagate();

                        var $el = $('#' + elmt);
                        $el.html(cal.frame(minDate, maxDate, elmt));
                    },
                    frameWeeklyView: function (wkDate) {
                        var fDate = dashboard.util.date.getFirstDayOfWeek(wkDate);
                        var tmp = dashboard.util.controls.calendar.template;
                        var header = '';
                        for (var d = 0; d < 7; d++) {
                            header = header + tmp.wvheader(dashboard.util.date.days[d].abbreviation);
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
                        body = '<div class="cycle-weekly-calendar"><div class="stdWidget vCenter right ckablef" onclick="dashboard.util.controls.calendar.cycleWeeklyView(-1,\'' + wkDate + '\');">&#xf137;</div></div>' +
                            '<div class="weekly-cal-title-cntr">' + tmp.wkviewTitle(wkDate) + '</div>' +
                            '<div class="cycle-weekly-calendar"><div class="stdWidget vCenter left ckablef" onclick="dashboard.util.controls.calendar.cycleWeeklyView(1,\'' + wkDate + '\');">&#xf138;</div></div>' +
                            '<hr class="titleHR" />' +
                            body;
                        return body;
                    },
                    drawWeeklyView: function (wkDate) {
                        var wkvw = dashboard.util.controls.calendar.frameWeeklyView(wkDate);
                        return wkvw;
                    },
                    cycleWeeklyView: function (m, wkDate) {
                        m = m * 7;
                        var db = dashboard.ui.dashboard;
                        var d = new Date(wkDate);
                        d.setDate(d.getDate() + m);

                        $('#db-weekly-view').html(dashboard.util.controls.calendar.drawWeeklyView(d));
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
                        cell: function (date) { //Mark: Removed onclick="dashboard.ui.time.dateNode.add(\'' + sDate + '\',\'ui-datenodes\')"
                            var cellid = dashboard.util.date.fmt({ date: date, format: 'MM-dd-yyyy' });
                            var sDate = dashboard.util.date.fmt({ date: date, format: 'yyyy-MM-dd' });
                            //dashboard.ui.time.dateNode.add(sDate, 'ui-datenodes');
                            return '<div id="cal-cell-' + cellid + '" class="cal-cell hover-underline" onclick="dashboard.ui.dashboard.getInterviewsForDate(\'' + sDate + '\', \'' + cellid + '\')">' +
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
                            return '<div nohighlight class="cal-title">' + dashboard.util.date.fmt({ date: date, format: 'MMMM yyyy' }) + '</div>';
                        },
                        wkviewTitle: function (date) { //Mark: Changing date format to be returned
                            return '<div nohighlight class="title-weekly-calendar right">' + dashboard.util.date.fmt({ date: date, format: 'MMM dd' }) + '</div>';
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
                            var mthYr = dashboard.util.date.fmt({ date: d, format: 'MMMM yyyy' });
                            var clk = 'dashboard.util.controls.calendarSmall.draw(\'' + elmt + '\',\'' + d.getMonth() + '\',\'' + d.getFullYear() + '\')';

                            return '<div nohighlight class="cal-button" onclick="' + clk + ';">' + dir.icon + '</div>';
                        },
                        controls: function (date, elmt) {
                            var tmp = dashboard.util.controls.calendarSmall.template;
                            return tmp.button(date, 'down', elmt) + tmp.title(date) + tmp.button(date, 'up', elmt);
                        },
                        wvCell: function (date) {
                            var cellid = dashboard.util.date.fmt({ date: date, format: 'MM-dd-yyyy' });
                            var sDate = dashboard.util.date.fmt({ date: date, format: 'yyyy-MM-dd' });
                            var cellDate = dashboard.util.date.fmt({ date: date, format: 'MMM d' });

                            return '<div id="cal-cell-' + cellid + '" class="wvCell pBG ckable" onclick="dashboard.ui.dashboard.getInterviewsForDate(\'' + sDate + '\', \'' + cellid + '\')">' +
                                '<div nohighlight class="wv-cell-date">' + cellDate + '</div>' +
                                '<div id="cal-cell-nodes-' + cellid + '"></div>' +
                                '</div>';
                        }
                    },
                    frame: function (minDate, maxDate, elmt) { //Mark: added modified frame function for opening dashboard. Changes include the removal of the Add Times button.
                        var tmp = dashboard.util.controls.calendarSmall.template;
                        var header = '';
                        for (var d = 0; d < 7; d++) {
                            header = header + tmp.header(dashboard.util.date.daysSmall[d].abbreviation);
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
                        var cal = dashboard.util.controls.calendarSmall;
                        var minDate = new Date(yr, mth, 1);
                        var maxDate = new Date(yr, (+mth + 1), 0);

                        var dates = dashboard.util.date.propagate(minDate, maxDate);
                        var times = dashboard.util.time.propagate();

                        var $el = $('#' + elmt);
                        $el.html(cal.frame(minDate, maxDate, elmt));
                        //$el.html(cal.frame(minDate, maxDate, elmt));
                    },
                    frameWeeklyView: function (wkDate) { //Mark: cycleWeekly View markup changed. template.row is no longer being used. 
                        var cDay = new Date; 
                 
                        if (cDay.getDay === wkDate.getDay) {
                            cDay = 'All Scheduled Calls';
                        }
                        
                        var tmp = dashboard.util.controls.calendarSmall.template;
                        var header = '';
                        for (var d = 0; d < 7; d++) {
                            header = header + tmp.wvheader(dashboard.util.date.days[d].abbreviation);
                        }
                        var row = '';
                        var cell = '';
                        var body = '';


                        row = '';
                        row = tmp.row(row);
                        
                        body =  '<h1 class="dashboard-header-text" id="sch-selected-date"></h1>' +
                                body;
                        return body;
                    },
                    drawWeeklyView: function (wkDate) {
                        var wkvw = dashboard.util.controls.calendarSmall.frameWeeklyView(wkDate);
                        return wkvw;
                    },
                    cycleWeeklyView: function (m, wkDate) {
                        m = m * 7;
                        var db = dashboard.ui.dashboard;
                        var d = new Date(wkDate);
                        d.setDate(d.getDate() + m);

                        $('#db-weekly-view').html(dashboard.util.controls.calendarSmall.drawWeeklyView(d));
                        db.getInterviews(function (data) {
                            db.drawInterviews(data);
                        });
                    }
                },
                switchCSS: function () {
                    $('#css-switch-trugreen').click(function () {
                        $('link[href="dashboard/dashboard.ras.generic.css"]').attr('href', 'dashboard/dashboard.ras.css');
                    });
                    $('#css-switch-dashboard').click(function () {
                        $('link[href="dashboard/dashboard.ras.css"]').attr('href', 'dashboard/dashboard.ras.generic.css');
                    });
                },
                reloadLocation: function () {
                    location.reload();
                }
            },
            uploader: {
                files: {},
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
                    dashboard.util.uploader.files = {};

                    var dz = '<div class="file-drop" id="dz-input"><div class="vCenter">Drop files here</div></div>' +
                        '<div id="progress-bars" class="file-progress"></div>' +
                        '<div id="upload-msg"></div>' +
                        '<div><button type="button" class="bigButton mainBG negTxt ckable" onclick="dashboard.util.uploader.upload();" id="upload-button">Upload!</button></div>';
                    $('#smallModal').html(dz);

                    function handleFileSelect(evt) {
                        evt.stopPropagation();
                        evt.preventDefault();
                        $('#progress-bars').html('');
                        var files = evt.dataTransfer.files;
                        var len = files.length;
                        for (var i = 0; i < len; i++) {
                            $('#progress-bars').append('<span>' + files[i].name + '</span><div id="progress-bar-' + i + '" class="file-progress"><div id="pct-' + i + '" class="percent">0%</div></div>');
                            $('#pct-' + i).css('max-width', '0%');
                            $('#pct-' + i).html('0%');
                            dashboard.util.uploader.read(files[i], i);
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

                    dashboard.ui.modal.small.open();
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
                        $('#pct-' + i).html('Ready to Upload');
                        setTimeout(function () {
                            $('#progress-bar-' + i).removeClass('loading');
                        }, 2000);
                        dashboard.util.uploader.files[file.name] = {
                            name: file.name,
                            data: btoa(e.target.result), //encoded to base 64 for transfer,
                            index: i
                        };
                    }
                    $('#dz-cancel').click(function () {
                        dashboard.util.uploader.abort(reader);
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
                    //iterate through each member of dashboard.util.uploader.files, call service to check file contents and upload or reject
                    $('#upload-msg').html('');
                    for (var f in dashboard.util.uploader.files) {
                        var file = dashboard.util.uploader.files[f];
                        dashboard.util.uploader.process(file, dashboard.util.uploader.complete, dashboard.util.uploader.reject);
                    }
                },
                process: function (file, complete, reject) {
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
                            complete(response, file);
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
                },
                complete: function (response, file) {
                    if (response.hasOwnProperty('errorMessage')) {
                        dashboard.util.uploader.reject(response, file);
                    }
                    else {
                        $('#pct-' + file.index).css('background-color', '#6dcc50');
                        $('#pct-' + file.index).html('Uploaded Successfully! Parties will be notified shortly.');
                    }
                }
            },
            uploaderNew: {
                files: {},
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
                    dashboard.util.uploaderNew.files = {};

                    var dz = '<div class="file-drop" id="dz-input"><div class="vCenter">Drop files here</div></div>' +
                        '<div id="progress-bars" class="file-progress"></div>' +
                        '<div id="upload-msg"></div>' +
                        '<div><button type="button" class="bigButton mainBG negTxt ckable" onclick="dashboard.util.uploaderNew.upload();" id="upload-button">Upload!</button></div>';
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
                            dashboard.util.uploaderNew.read(files[i], i);
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

                    //dashboard.ui.modal.small.open();
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
                        dashboard.util.uploaderNew.files[file.name] = {
                            name: file.name,
                            data: btoa(unescape(encodeURIComponent(e.target.result))), //btoa(e.target.result) MARK This was needed due to error "Failed to execute 'btoa' on 'Window': The string to be encoded contains characters outside of the Latin1 range."
                            index: i
                        };
                    }
                    $('#dz-cancel').click(function () {
                        dashboard.util.uploaderNew.abort(reader);
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
                    //iterate through each member of dashboard.util.uploader.files, call service to check file contents and upload or reject
                    $('#upload-msg').html('');
                    for (var f in dashboard.util.uploaderNew.files) {
                        var file = dashboard.util.uploaderNew.files[f];
                        dashboard.util.uploaderNew.process(file, dashboard.util.uploaderNew.complete, dashboard.util.uploaderNew.reject);
                    }
                },
                process: function (file, complete, reject) {
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
                            complete(response, file);
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
                },
                complete: function (response, file) {
                    if (response.hasOwnProperty('errorMessage')) {
                        dashboard.util.uploaderNew.reject(response, file);
                    }
                    else {
                        $('#pct-' + file.index).css('background-color', '#6dcc50');
                        $('#pct-' + file.index).html('Uploaded Successfully! Parties will be notified shortly.');
                        // ADD BOT EMAIL
                    }
                }
            }
        }
    };
    return dashboard;
})();

$(document).ready(function () {
    dashboard.init();
});

  