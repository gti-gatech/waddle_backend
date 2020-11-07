/**
 * TripController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var rdi = sails.getDatastore('mysql');
const offset = -240;
var TripController = {

    markStudentStatus: function (req, res) {
        var params = req.body;
        params.status = "PICKED_UP";
        Tripstudents.update({ where: { studentId: params.studentId, tripId: params.tripId } }).set({ status: "PICKED_UP" }).exec(function (err, model) {
            console.log(err); console.log(model);
            rdi.sendNativeQuery('SELECT b.parentId, c.deviceToken, d.tripId, d.groupId, d.dueOn, d.tripDate, e.groupName '
            + 'FROM tripstudents a '
            + 'INNER JOIN students b ON a.studentId = b.studentId '
            + 'INNER JOIN parents c ON b.parentId = c.parentId '
            + 'INNER JOIN trips d ON a.tripId = d.tripId '
            + 'INNER JOIN groups e ON d.groupId = e.groupId '
            + 'WHERE a.tripId = $1 AND a.status = $2 LIMIT 1', [params.tripId, "NOT_PICKED_UP"], (err, results) => {
                console.log(err);
                if (results.rows.length > 0) {
                    results.rows.forEach(element => {
                        PushNotifications.createPlatformEndpoint(element.deviceToken, "ARRVING AT YOUR LOCATION", element);
                    });
                }
            });
        });
        res.ok({ type: "Status Updated", message: "Student has been marked present." })
    },

    getHistoryTrips: function (req, res) {
        
        var parentId = req.options.parentId, lastDate = new Date(), nextDate = new Date(), yesterday = new Date(), today = Utils.formatDate(new Date());
        
        nextDate.setDate(nextDate.getDate() + 1); nextDate = Utils.formatDate(nextDate);
        lastDate.setDate(lastDate.getDate() + 2); lastDate = Utils.formatDate(lastDate);
        yesterday.setDate(yesterday.getDate() - 1); yesterday = Utils.formatDate(yesterday);


        var payload = {};
        rdi.sendNativeQuery('SELECT a.studentId, a.tripId, a.stopId, b.groupId, b.supervisorId, b.dueOn, b.tripDate,'
            + 'c.groupName, IFNULL(f.name,"") as stopName, d.fullName, e.fullName as studentName, '
            + 'CASE WHEN b.supervisorId = $1 THEN 1 ELSE 0 END AS supervisorStar '
            + 'FROM tripstudents a '
            + 'INNER JOIN ( '
            + 'SELECT * FROM trips WHERE  tripDate < $3 AND status = $2 '
            + 'UNION '
            + 'SELECT * FROM trips WHERE tripDate = $3 '
            + ') as b ON a.tripId = b.tripId '
            + 'INNER JOIN groups c ON b.groupId = c.groupId '
            + 'LEFT JOIN stops f ON a.stopId = f.stopId '
            + 'LEFT JOIN parents d ON b.supervisorId = d.parentId '
            + 'INNER JOIN students e ON a.studentId = e.studentId WHERE e.parentId = $1 ORDER BY b.tripDate DESC', [parentId, "TRIP_COMPLETED", today], function (err, result) {
                payload.history = {};
                payload.history.studentsHistory = {}; payload.history.studentsHistory.today = [];
                payload.history.studentsHistory.yesterday = []; payload.history.studentsHistory.previous = [];
                
                var data = result.rows;
                
                data.forEach(element => {
                   if(element.tripDate == yesterday)
                   payload.history.studentsHistory.yesterday.push(element);
                   else if(element.tripDate == today)
                   payload.history.studentsHistory.today.push(element);
                   else
                   payload.history.studentsHistory.previous.push(element);
                });

                rdi.sendNativeQuery('SELECT a.groupId, a.supervisorId, a.dueOn, a.tripDate,'
                    + 'c.groupName, IFNULL(f.name,"") as stopName,d.fullName,'
                    + 'CASE WHEN a.supervisorId = $1 THEN 1 ELSE 0 END AS supervisorStar '
                    + 'FROM trips a '
                    + 'INNER JOIN groups c ON a.groupId = c.groupId '
                    + 'LEFT JOIN stops f ON a.pickupStop = f.stopId '
                    + 'INNER JOIN parents d ON a.supervisorId = d.parentId '
                    + 'WHERE a.supervisorId = $1 AND a.status = $2 ORDER BY a.tripDate DESC', [parentId, "TRIP_COMPLETED"], function (err, result2) {
                        payload.history.supervisorHistory = {}; payload.history.supervisorHistory.today = [];
                        payload.history.supervisorHistory.yesterday = []; payload.history.supervisorHistory.previous = [];

                        var data2 = result2.rows;

                        data2.forEach(element => {
                            if(element.tripDate == yesterday)
                            payload.history.supervisorHistory.yesterday.push(element);
                            else if(element.tripDate == today)
                            payload.history.supervisorHistory.today.push(element);
                            else
                            payload.history.supervisorHistory.previous.push(element);
                         });

                        rdi.sendNativeQuery('SELECT a.studentId, a.tripId, a.stopId, b.groupId, b.supervisorId, b.dueOn,'
                            + 'c.groupName, IFNULL(f.name,"") as stopName, d.fullName, e.fullName as studentName, '
                            + 'CASE WHEN b.supervisorId = $1 THEN 1 ELSE 0 END AS supervisorStar '
                            + 'FROM tripstudents a '
                            + 'INNER JOIN trips b ON a.tripId = b.tripId AND b.tripDate >= $2 '
                            + 'INNER JOIN groups c ON b.groupId = c.groupId '
                            + 'LEFT JOIN stops f ON a.stopId = f.stopId '
                            + 'LEFT JOIN parents d ON b.supervisorId = d.parentId '
                            + 'INNER JOIN students e ON a.studentId = e.studentId AND e.parentId = $1 ORDER BY b.tripDate', 
                            [parentId, nextDate, lastDate], function (err, result3) {
                                payload.upcoming = {};
                                payload.upcoming.studentsUpcoming = result3.rows;


                                rdi.sendNativeQuery('SELECT a.groupId, a.supervisorId, a.dueOn,'
                                    + 'c.groupName, IFNULL(f.name,"") as stopName,d.fullName,'
                                    + 'CASE WHEN a.supervisorId = $1 THEN 1 ELSE 0 END AS supervisorStar '
                                    + 'FROM trips a '
                                    + 'INNER JOIN groups c ON a.groupId = c.groupId '
                                    + 'LEFT JOIN stops f ON a.pickupStop = f.stopId '
                                    + 'INNER JOIN parents d ON a.supervisorId = d.parentId '
                                    + 'WHERE a.supervisorId = $1 AND a.tripDate >= $2 ORDER BY a.tripDate', [parentId, nextDate, lastDate], function (err, result4) {
                                        payload.upcoming.supervisorUpcoming = result4.rows;

                                        res.ok({ type: "Trips history", message: "Trips history & upcoming", data: payload })
                                    })

                            })
                    })
            });
    },

    startTrip: function (req, res) {
        var data = req.options.data, date = Utils.formatDate(new Date());
        Trips.find({ where: { id: data.tripId, supervisorId: data.parentId } }).exec((err, model) => {
            if (model.length > 0) {
                var startDate = new Date(); startDate = new Date(startDate.getTime() + offset * 60 * 1000);
                if (model[0].tripDate == date) {
                    Trips.update({ where: { id: model[0].id } }).set({ status: "TRIP_STARTED", startedOn: startDate }).exec((err, model) => {
                        TripController.sendTripNotification(data.tripId, "TRIP STARTED");
                        res.ok({ type: "SUCCESS", message: "Trips started successfully." });
                    })
                } else {
                    res.status(301).send({ type: "Unauthorized", message: "You are not authorized to start this Trip before the trip date" })
                }
            } else
                res.status(301).send({ type: "Unauthorized", message: "You are not authorized to start this Trip." })
        })
    },

    endTrip: function (req, res) {
        var data = req.options.data;
        Trips.find({ where: { id: data.tripId, supervisorId: data.parentId } }).exec((err, model) => {
            if (model.length > 0) {
                Trips.update({ where: { id: model[0].id } }).set({ status: "TRIP_COMPLETED" }).exec((err, model) => {
                    TripController.sendTripNotification(data.tripId, "TRIP ENDED");
                    res.ok({ type: "SUCCESS", message: "Trips Ended successfully." });
                })

            } else {
                res.status(301).send({ type: "Unauthorized", message: "You are not authorized to end this Trip." })
            }

        });
    },

    sendTripNotification: function (tripId, type) {
        rdi.sendNativeQuery('SELECT DISTINCT b.parentId, c.deviceToken, d.tripId, d.groupId, d.dueOn, d.tripDate, e.groupName '
            + 'FROM tripstudents a '
            + 'INNER JOIN students b ON a.studentId = b.studentId '
            + 'INNER JOIN parents c ON b.parentId = c.parentId '
            + 'INNER JOIN trips d ON a.tripId = d.tripId '
            + 'INNER JOIN groups e ON d.groupId = e.groupId '
            + 'WHERE a.tripId = $1', [tripId], (err, results2) => {
                console.log(err);
                if (results2.rows.length > 0) {
                    results2.rows.forEach(element => {
                        PushNotifications.createPlatformEndpoint(element.deviceToken, type, element);
                    });
                }
            })
    }

}

module.exports = TripController;

