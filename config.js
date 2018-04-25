window.appconfig = (function () {
    var appconfig = {
        api: {
            base: 'https://4jja3nb0yf.execute-api.us-west-2.amazonaws.com',
            stage: 'prod' 
        },
        clientname: '',
        alias: {
            interview: 'Call',
            interviewer: 'Hiring Manager',
            recruiter: 'Recruiter',
            candidate: 'Prospect'
        },
        system: {
            maxlookahead: 30,
            maxunscheduledinterviews: 20,
            timeacceptancepadding: 1,
            handoffinterview: true,
            blockschedule: true,
            explicitschedule: true
        },
        defaults: {
            interviewtype: 'One on One',
            interviewlength: 20,
            starttime: '10:00 AM',
            endtime: '4:00 PM',
            lunchtime: '1:01 AM',
            lunchlength: 60,
            rank: ''
        },
        userprofile: {
            name: true,
            phone: true,
            email: true,
            location: false,
            region: false,
            division: false,
            source: false,
            role: true,
            contactlog: true,
            availability: true,
            scheduledtime: true
        },
        page:{
            dashboard: {
                view: 'weekly',
                scheduledview: 'self',
                controls: {
                    deleteuser: true,
                    cancelinterview: true,
                    helpdesk: true
                },
                fields: {
                    name: true,
                    email: true,
                    phone: true,
                    userid: false,
                    positionid: true,
                    datetime: true,
                    positionname: true,
                    location: false,
                    region: false,
                    division: false,
                    source: false,
                    optoutemail: false,
                    optoutsms: false
                }
            },
            interviewdetail: {
                views: {
                    userdetails: true,
                    timeline: true,
                    associations: false
                },
                fields: {
                    title: true,
                    address: false,
                    location: true,
                    city: false,
                    state: false,
                    region: false,
                    division: false,
                    conferencenumber: true,
                    conferencecode: true,
                    conferenceid: true,
                    interviewid: true,
                    positionid: true,
                    positionname: true,
                    applicationlink: false
                },
                controls: {
                    email: true,
                    sms: true,
                    emailmenu: true,
                    smsmenu: true,
                    deletecandidate: true,
                    deleteinterviewer: false,
                    deletetime: true,
                    helpdesk: true
                }
            },
            candidate: {
                fields: {
                    title: true,
                    address: false,
                    location: true,
                    city: false,
                    state: false,
                    region: false,
                    division: false,
                    conferencenumber: true,
                    conferencecode: true,
                    conferenceid: true,
                    interviewid: false,
                    positionid: false,
                    positionname: true,
                    applicationlink: true
                },
                controls: {
                    cancelinterview: true,
                    optoutemail: true,
                    optoutsms: true,
                    nocontact: true,
                    helpdesk: false
                }
            }
        }
        
    };
    return appconfig;
})();