
/**
 * CronController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var CronJob = require('cron').CronJob;
var rdi = sails.getDatastore('mysql');
var offset = -240; //EDT
//console.log(new Date(lastDate.getTime() + offset*60*1000));


var CronController = {
    periodicalTripsCreation: function (req, res) {

        var date = new Date(), date = new Date(date.getTime() + offset * 60 * 1000); y = date.getFullYear(), m = date.getMonth();
        Groups.find().exec(function (err, model) {
            if (model.length > 0) {

                model.forEach(element => {
                    Trips.find({ where: { groupId: element.id }, limit: 1, sort: 'id DESC' }).exec(function (err, tripData) {
                        if (tripData.length > 0) {


                            var fromDate = new Date(tripData[0].dueOn);
                            var toDate = new Date(tripData[0].dueOn);

                            fromDate.setDate(fromDate.getDate());
                            fromDate = new Date(fromDate.getTime() + offset * 60 * 1000);
                            toDate.setDate(toDate.getDate() + 30);
                            toDate = new Date(toDate.getTime() + offset * 60 * 1000);

                            CronController.insertTrips(fromDate, toDate, element.id, element.routeId);

                        } else {
                            var firstDay = new Date(y, m, 1);
                            firstDay = new Date(firstDay.getTime() + offset * 60 * 1000);
                            var lastDay = new Date(y, m + 1, 0);
                            lastDay = new Date(lastDay.getTime() + offset * 60 * 1000);

                            CronController.insertTrips(firstDay, lastDay, element.id, element.routeId);
                        }
                    });
                });
            }
        })

        var job = new CronJob('* * 23 * * *', function () {
            CronController.checkTripsForSupervisor();
            CronController.checkUpcomingSupervisedTrip();
        }, null, true, 'US/Eastern');
        job.start();

        // var job2 = new CronJob('* * * 1 * *', function () {
        //     CronController.periodicalTripsCreationDirect();
        // }, null, true, 'US/Eastern');
        // job2.start();
        res.ok({ "STATUS": "PROCESSED" });
    },

    periodicalTripsCreationDirect: function () {
        var date = new Date(), date = new Date(date.getTime() + offset * 60 * 1000); y = date.getFullYear(), m = date.getMonth();
        Groups.find().exec(function (err, model) {
            if (model.length > 0) {

                model.forEach(element => {
                    Trips.find({ where: { groupId: element.id }, limit: 1, sort: 'id DESC' }).exec(function (err, tripData) {
                        if (tripData.length > 0) {


                            var fromDate = new Date(tripData[0].dueOn);
                            var toDate = new Date(tripData[0].dueOn);

                            fromDate.setDate(fromDate.getDate());
                            fromDate = new Date(fromDate.getTime() + offset * 60 * 1000);
                            toDate.setDate(toDate.getDate() + 30);
                            toDate = new Date(toDate.getTime() + offset * 60 * 1000);

                            CronController.insertTrips(fromDate, toDate, element.id, element.routeId);

                        } else {
                            var firstDay = new Date(y, m, 1);
                            firstDay = new Date(firstDay.getTime() + offset * 60 * 1000);
                            var lastDay = new Date(y, m + 1, 0);
                            lastDay = new Date(lastDay.getTime() + offset * 60 * 1000);

                            CronController.insertTrips(firstDay, lastDay, element.id, element.routeId);
                        }
                    });
                });
            }
        })
    },


    insertTrips: async function (fromDate, toDate, groupId, routeId) {
        var tempDate = new Date(fromDate);

        tempDate = new Date(tempDate.getTime() + offset * 60 * 1000);
        tempDate.setHours(13, 30);


        while (fromDate <= toDate) {

            var day = tempDate.getDay();

            var params = {
                groupId: groupId,
                routeId: routeId,
                isSupervised: 0,
                createdOn: new Date(),
                dueOn: tempDate,
                status: process.env.TRIP_NOT_STARTED,
                tripTime: tempDate,
                tripDate: Utils.formatDate(fromDate),
                displayTime: "8:00 am"
            }
            if (day != 6 && day != 0)
                DB.insertTrips(params);

            tempDate.setDate(tempDate.getDate() + 1);
            fromDate.setDate(fromDate.getDate() + 1);
        }

    },

    checkTripsForSupervisor: function () {
        var nextDate = new Date();
        // currentDate = new Date(), 
        nextDate.setDate(nextDate.getDate() + 1); nextDate = Utils.formatDate(nextDate);
        // currentDate = Utils.formatDate(currentDate);
        // OR isSupervised = 0 AND tripDate = $2

        rdi.sendNativeQuery('SELECT * FROM trips WHERE isSupervised = 0 AND tripDate = $1;',
            [nextDate], (err, results) => {
                if (results.rows.length > 0) {
                    results.rows.forEach(element => {
                        rdi.sendNativeQuery('SELECT DISTINCT b.parentId, c.deviceToken, d.tripId, d.groupId, d.dueOn, d.tripDate, e.groupName '
                            + 'FROM tripstudents a '
                            + 'INNER JOIN students b ON a.studentId = b.studentId '
                            + 'INNER JOIN parents c ON b.parentId = c.parentId '
                            + 'INNER JOIN trips d ON a.tripId = d.tripId '
                            + 'INNER JOIN groups e ON d.groupId = e.groupId '
                            + 'WHERE a.tripId = $1', [element.tripId], (err, results2) => {
                                var tempDevices = Array();
                                if (results2.rows.length > 0) {
                                    results2.rows.forEach(element => {
                                        if (!tempDevices.includes(element.deviceToken)) {
                                            PushNotifications.createPlatformEndpoint(element.deviceToken, "SUPERVISOR REQUEST", element);
                                        }
                                        tempDevices.push(element.deviceToken);

                                    });
                                }
                            })
                    });

                }
            })
    },

    checkUpcomingSupervisedTrip: function () {
        var nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 1); nextDate = Utils.formatDate(nextDate);

        rdi.sendNativeQuery('SELECT * FROM trips WHERE isSupervised = 1 AND tripDate = $1;',
            [nextDate], (err, results) => {
                if (results.rows.length > 0) {
                    results.rows.forEach(element => {
                        rdi.sendNativeQuery('SELECT deviceToken FROM parents WHERE parentId = $1', [element.supervisorId],
                            (err, results2) => {
                                if (results2.rows.length > 0) {
                                    rdi.sendNativeQuery('SELECT notificationId, parentId,type, JSON_EXTRACT(payload, "$.groupId") AS groupId FROM  notifications '
                                        + 'WHERE parentId = $1 AND type = "UPCOMING SUPERVISOR" ORDER BY notificationId DESC LIMIT 1', [element.supervisorId], (err, model) => {
                                            if (model.rows.length > 0) {
                                                if (model.rows[0].groupId != element.groupId)
                                                    PushNotifications.createPlatformEndpoint(results2.rows[0].deviceToken, "UPCOMING SUPERVISOR", element);
                                            } else {
                                                PushNotifications.createPlatformEndpoint(results2.rows[0].deviceToken, "UPCOMING SUPERVISOR", element);
                                            }


                                        })
                                }
                            })
                    });

                }
            })
    },


    sendTestSupervisorTripNotification: function (req, res) {
        rdi.sendNativeQuery('SELECT DISTINCT b.parentId, c.deviceToken, d.tripId, d.groupId, d.dueOn, d.tripDate, e.groupName '
            + 'FROM tripstudents a '
            + 'INNER JOIN students b ON a.studentId = b.studentId '
            + 'INNER JOIN parents c ON b.parentId = c.parentId '
            + 'INNER JOIN trips d ON a.tripId = d.tripId '
            + 'INNER JOIN groups e ON d.groupId = e.groupId '
            + 'WHERE a.tripId = $1', [req.body.tripId], (err, results2) => {
                console.log(err);
                if (results2.rows.length > 0) {
                    results2.rows.forEach(element => {
                        console.log(element.parentId);
                        if (element.parentId == req.body.parentId) {
                            PushNotifications.createPlatformEndpoint(element.deviceToken, "SUPERVISOR REQUEST", element);
                            res.ok({ type: "SUCCESS", message: "Test Sent successfully!" });
                        }
                    });
                }
            })
    },

    updateNoSupervisorTrip: function (tripId) {

        rdi.sendNativeQuery('SELECT DISTINCT b.parentId, c.deviceToken, d.tripId, d.groupId, d.dueOn, d.tripDate, e.groupName '
            + 'FROM tripstudents a '
            + 'INNER JOIN students b ON a.studentId = b.studentId '
            + 'INNER JOIN parents c ON b.parentId = c.parentId '
            + 'INNER JOIN trips d ON a.tripId = d.tripId '
            + 'INNER JOIN groups e ON d.groupId = e.groupId '
            + 'WHERE a.tripId = $1', [tripId], (err, results2) => {
                var tempDevices = Array();
                if (results2.rows.length > 0) {
                    results2.rows.forEach(element => {
                        if (!tempDevices.includes(element.deviceToken)) {
                            PushNotifications.createPlatformEndpoint(element.deviceToken, "SUPERVISOR REQUEST", element);
                        }
                        tempDevices.push(element.deviceToken);

                    });
                }
            })
    }



}
module.exports = CronController;

