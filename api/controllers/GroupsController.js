
/**
 * GroupsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var serialize = require('node-serialize');
var rdi = sails.getDatastore('mysql');
var offset = -240; //EDT
var CronController = require('../controllers/CronController');
module.exports = {

    joinGroup: function (req, res) {
        var params = req.body;
        var students = params.students;

        console.log(params);

        DB.insertGroupStudent(students, params.stopId, params.groupId);
        return Utils.formatResponse("SUCCESS", "Joined Group", params, res)
    },


    getGroups: function (req, res) {
        var parentId = req.options.parentId;

        var date = new Date();
        var tripDate = new Date(date.getTime() + offset * 60 * 1000), h = tripDate.getHours();

        if (h > 7)
            tripDate.setDate(tripDate.getDate() + 1);

        tripDate = Utils.formatDate(tripDate);

        rdi.sendNativeQuery('SELECT distinct a.groupId, a.groupName, a.routeId, a.image,( SELECT COUNT(*) FROM groupstudents WHERE groupId = a.groupId ) as totalStudents,'
            + '(SELECT count(*) FROM trips WHERE tripDate <= $2 AND groupId = a.groupId AND status = "TRIP_COMPLETED") as tripsWalked ,'
            + 'IFNULL(b.isSupervised, 0) as isSupervised, IFNULL(b.supervisorId,"") as supervisorId, IFNULL(b.tripDate,"") as tripDate, IFNULL(b.displayTime,"") as displayTime, IFNULL(b.dueOn, "") as dueOn, IFNULL(b.status, "") as status ,'
            + 'CASE WHEN b.supervisorId = $1 THEN 1 ELSE 0 END AS supervisorStar '
            + 'FROM groups a '
            + 'INNER JOIN groupstudents c ON a.groupId = c.groupId '
            + 'LEFT JOIN trips b ON a.groupId = b.groupId AND status = "TRIP_NOT_STARTED" AND tripDate = $2 '
            + 'INNER JOIN students d ON c.studentId = d.studentId '
            + 'WHERE d.parentId = $1 '
            + 'UNION '
            + 'SELECT distinct a.groupId, a.groupName, a.routeId, a.image,( SELECT COUNT(*) FROM groupstudents WHERE groupId = a.groupId ) as totalStudents,'
            + '(SELECT count(*) FROM trips WHERE tripDate <= $2 AND groupId = a.groupId AND status = "TRIP_COMPLETED") as tripsWalked ,'
            + 'IFNULL(b.isSupervised, 0) as isSupervised, IFNULL(b.supervisorId,"") as supervisorId, IFNULL(b.tripDate,"") as tripDate, IFNULL(b.displayTime,"") as displayTime, IFNULL(b.dueOn, "") as dueOn, IFNULL(b.status, "") as status ,'
            + 'CASE WHEN b.supervisorId = $1 THEN 1 ELSE 0 END AS supervisorStar '
            + 'FROM groups a '
            + 'LEFT JOIN trips b ON a.groupId = b.groupId AND status = "TRIP_NOT_STARTED" AND tripDate = $2 '
            + 'WHERE b.supervisorId = $1 ', [parentId, tripDate], function (err, result) {
                console.log(result);
                console.log(err);
                Utils.formatResponse("SUCCESS", "My Groups", result.rows, res);
            })
    },

    getGroupDetails: function (req, res) {
        var params = req.options.data;
        var payload = {}, date = new Date(), endDate = new Date();

        date = Utils.formatDate(new Date(date.getTime() + offset * 60 * 1000));
        endDate.setDate(endDate.getDate() + 20);
        endDate = Utils.formatDate(endDate);

        rdi.sendNativeQuery('SELECT groupId, groupName, routeId, image, createdOn, ( SELECT COUNT(*) FROM groupstudents WHERE groupId = $1 ) as totalStudents,'
            + '(SELECT COUNT(*) FROM trips WHERE groupId = $1 AND status = "TRIP_COMPLETED") as tripsWalked '
            + 'FROM groups WHERE groupId = $1', [params.groupId], function (err, result) {
                payload.groupDetails = result.rows[0];
            });

        rdi.sendNativeQuery('SELECT a.*, b.name as stopName, b.location, c.fullName, c.grade, c.schoolName '
            + 'FROM groupstudents a '
            + 'LEFT JOIN stops b ON a.stopId = b.stopId '
            + 'LEFT JOIN students c ON a.studentId = c.studentId WHERE a.groupId = $1',
            [params.groupId], function (err, result1) {

                payload.groupStudents = result1.rows.map((d) => {
                    return {
                        "id": d.id,
                        "studentId": d.studentId,
                        "createdOn": d.createdOn,
                        "isActive": d.isActive,
                        "stopId": d.stopId,
                        "groupId": d.groupId,
                        "stopName": d.stopName,
                        "location": serialize.unserialize(d.location),
                        "fullName": d.fullName,
                        "grade": d.grade,
                        "schoolName": d.schoolName
                    };
                });


                rdi.sendNativeQuery('SELECT a.tripId, a.groupId, a.isSupervised, a.supervisorId, a.dueOn, a.status, a.tripDate, a.displayTime, a.pickupStop,'
                    + 'b.groupName, c.fullName as supervisorName, d.name as pickupStopName, '
                    + 'CASE WHEN a.supervisorId = $1 THEN 1 ELSE 0 END AS supervisorStar, '
                    + 'CASE WHEN a.tripDate = $3 AND a.status = $6 AND a.supervisorId = $1 THEN 1 ELSE 0 END AS startTripFlag '
                    + 'FROM trips a '
                    + 'LEFT JOIN groups b ON a.groupId = b.groupId '
                    + 'LEFT JOIN stops d ON a.pickupStop = d.stopId '
                    + 'LEFT JOIN parents c ON a.supervisorId = c.parentId WHERE a.groupId = $2 AND tripDate >= $3 AND tripDate <= $4 AND a.status != $5 ORDER BY tripDate',
                    [params.parentId, params.groupId, date, endDate, "TRIP_COMPLETED", "TRIP_NOT_STARTED"], function (err, result2) {
                        payload.trips = result2.rows;
                        Utils.formatResponse("SUCCESS", "Group Details", payload, res)
                    });
            })

    },

    editGroup: function (req, res) {
        var params = req.body;

        Groups.update({ where: { id: params.groupId } }).set(params).exec(function (err, model) {
            Utils.formatResponse("SUCCESS", "Group Updated", params, res);
        })
    },


    superviseTrip: function (req, res) {
        var params = req.options.data;

        Trips.find({ where: { id: params.tripId } }).exec(function (err, model) {
            if (model.length > 0) {

                if (model[0].isSupervised == 0) {
                    DB.updateTripSupervisor(params.parentId, params.tripId);
                    Utils.formatResponse("SUCCESS", "Supervisor Appointed", 0, res);
                } else
                    Utils.formatResponse("ERR", "Supervisor Exists", 0, res);
            } else
                Utils.formatResponse("ERR", "Action not authorized", 0, res);
        })
    },

    withdrawSupervisor: function (req, res) {
        var params = req.options.data;

        Trips.find({ where: { id: params.tripId } }).exec(function (err, model) {
            if (model.length > 0) {
                if (model[0].isSupervised == 1 && model[0].supervisorId == params.parentId) {
                    DB.deleteTripSupervisor(params.parentId, params.tripId);
                    CronController.updateNoSupervisorTrip(params.tripId);
                    Utils.formatResponse("SUCCESS", "Supervisor Removed", 0, res);
                } else
                    Utils.formatResponse("ERR", "Action not authorized", 0, res);
            }
            else
                Utils.formatResponse("ERR", "Action not authorized", 0, res);
        })

    },

    leaveGroup: function (req, res) {
        var params = req.options.data;

        Students.find({ where: { parentId: params.parentId } }).exec(function (err, model) {
            if (model.length > 0) {
                DB.leaveTripStudents(params.groupId, model);
                model.forEach(element => {
                    Groupstudents.destroy({ studentId: element.id, groupId: params.groupId }).exec(function (err2, model2) { });
                });
                Utils.formatResponse("SUCCESS", "Group Updated", model, res);
            } else {
                Utils.formatResponse("SUCCESS", "Group Updated", [], res);
            }
        })
    },

    getTripMap: function (req, res) {
        var tripId = req.param('tripId');
        var payload = {};

        Trips.find({ select: ['longitude', 'latitude', 'status'], where: { id: tripId } }).exec(function (err2, model) {
            payload.tripStatus = model;
            rdi.sendNativeQuery('SELECT a.*, b.fullName as studentName, b.grade as studentGrade, c.contact, c.fullName as parentName,'
                + 'd.name as stopName, d.location as stopLocation '
                + 'FROM tripstudents a '
                + 'INNER JOIN students b ON a.studentId = b.studentId '
                + 'INNER JOIN parents c ON b.parentId = c.parentId '
                + 'INNER JOIN stops d ON a.stopId = d.stopId '
                + 'WHERE a.tripId = $1 ORDER by a.pickupCount', [tripId], function (err, results) {
                    payload.data = results.rows;
                    Utils.formatResponse("SUCCESS", "Trip Map Data", payload, res);
                })
        })

    }
};


