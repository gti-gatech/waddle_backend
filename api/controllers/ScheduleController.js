const CommonController = require("./CommonController");
const DB = require("../services/DB");

/**
 * ScheduleController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
var WeekDays = Array();
WeekDays["Monday"] = 1;
WeekDays["Tuesday"] = 2;
WeekDays["Wednesday"] = 3;
WeekDays["Thursday"] = 4;
WeekDays["Friday"] = 5;

var Months = Array();
Months["January"] = 0;
Months["February"] = 1;
Months["March"] = 2;
Months["April"] = 3;
Months["May"] = 4;
Months["June"] = 5;
Months["July"] = 6;
Months["August"] = 7;
Months["September"] = 8;
Months["October"] = 9;
Months["November"] = 10;
Months["December"] = 11;

var offset = -240; //EDT


var rdi = sails.getDatastore('mysql');

var studentsString = ""; var studentsTripDate = ""; var studentsTripSupervisor = "";
var counts = { supervising: 0, alreadySupervised: 0 };

var ScheduleController = {

    createSchedule: function (req, res) {
        var params = req.body;  studentsTripDate = params.selectedDate;
        var students = params.students, tripDate = Utils.formatDate(params.selectedDate), selectedDate = new Date(params.selectedDate);

        var studentsParam = students.join(", ");
        var query = `SELECT fullName FROM students WHERE studentId IN (${studentsParam})`;

        rdi.sendNativeQuery(query, [], (err, studentResult) => {
            studentLen = studentResult.rows.length;

            switch (studentLen) {
                case 1:
                    studentsString = studentResult.rows[0].fullName;
                    break;
                case 2:
                    studentsString = studentResult.rows[0].fullName + " and " + studentResult.rows[1].fullName;
                    break;
                default:
                    studentsString = "";

                    studentResult.rows.forEach((element, index) => {
                        if (index == 0)
                            studentsString = element.fullName;
                        else if (index == studentLen - 1)
                            studentsString = studentsString + " and " + element.fullName;
                        else
                            studentsString = studentsString + ", " + element.fullName;

                    });
                    break;
            }

        })

        DB.findTripId(tripDate, params.groupId).then((tripId) => {
            if (tripId != 0) {


                DB.insertGroupStudent(students, params.stopId, params.groupId);
                ScheduleController.addTripStudent(students, tripId, params.stopId, params.groupId, tripDate);
                if (params.isSupervisor) {
                    DB.updateTripSupervisor(params.parentId, tripId).then((data) => {
                        switch (data) {
                            case 1:
                                studentsTripSupervisor = "You are supervising the trip";
                                var scheduleMessage = `You have scheduled a trip for ${studentsString} on ${studentsTripDate}. ${studentsTripSupervisor}`;

                                // counts.supervising = counts.supervising + 1;
                                // if (params.repetition == false) {
                                Utils.formatResponse("SUCCESS", "Schedule Added", scheduleMessage, res);
                                counts.alreadySupervised = 0; counts.supervising = 0;
                                // }
                                break;
                            case 0:
                                // counts.alreadySupervised = counts.alreadySupervised + 1;
                                studentsTripSupervisor = "Trip already has a supervisor";
                                var scheduleMessage = `You have scheduled a trip for ${studentsString} on ${studentsTripDate}. ${studentsTripSupervisor}`;

                                // if (params.repetition == false) {
                                Utils.formatResponse("SUCCESS", "Schedule Added", scheduleMessage, res);
                                // counts.alreadySupervised = 0; counts.supervising = 0;
                                // }
                                break;
                        }
                    });
                } else {
                    var scheduleMessage = `You have scheduled a trip for ${studentsString} on ${studentsTripDate}.`;
                    Utils.formatResponse("SUCCESS", "Schedule Added", scheduleMessage, res);
                }


                setTimeout(() => {
                    CommonController.updatePickupStreamlineDirect(tripId);
                }, 10000);
            }
        });


        if (params.repetition) {
            var tempDate = new Date();

            for (i = 1; i <= params.repetitionCount; i++) {
                if (i == 1)
                    tempDate = Utils.getNextDate(selectedDate, WeekDays[params.repeatDay]);
                else
                    tempDate = Utils.getNextDate(tempDate, WeekDays[params.repeatDay]);

                tripDate = Utils.formatDate(tempDate);
                ScheduleController.findAndAddTripStudent(students, params.stopId, params.groupId, tripDate, params);

                if (i == params.repetitionCount) {
                    // setTimeout(() => {
                    //     Utils.formatResponse("SUCCESS", "Schedule Added", counts, res);
                    // }, 500);

                }
            }
        }
    },


    addTripStudent: async function (students, tripId, stopId, groupId, tripDate) {
        students.forEach((element, index) => {

            rdi.sendNativeQuery('SELECT a.* FROM tripstudents a '
                + 'INNER JOIN trips b ON a.tripId = b.tripId AND tripDate = $1 '
                + 'WHERE a.studentId = $2', [tripDate, element], (err, result) => {
                    result = result.rows;
                    if (result.length == 0)
                        DB.insertTripStudent(element, tripId, stopId);
                })
        });
    },

    findAndAddTripStudent: function (students, stopId, groupId, tripDate, params) {

        DB.findTripId(tripDate, groupId).then((tripId) => {
            if (tripId != 0) {
                ScheduleController.addTripStudent(students, tripId, stopId, groupId, tripDate);
                if (params.isSupervisor) {
                    DB.updateTripSupervisor(params.parentId, tripId).then((data) => {
                        switch (data) {
                            case 1:
                                counts.supervising = counts.supervising + 1;
                                break;
                            case 0:
                                counts.alreadySupervised = counts.alreadySupervised + 1;
                                break;
                        }
                    });
                }
            }

        });
    },


    getSchedule: function (req, res) {
        var params = req.options.data; date = Utils.formatDate(params.date);


        if (params.isSupervisor == "false" || params.isSupervisor == false) {
            rdi.sendNativeQuery('SELECT a.studentId , a.tripId, a.stopId, b.groupId, b.isSupervised, b.supervisorId, b.status, b.displayTime,'
                + 'b.dueOn, c.groupName, c.routeId, d.fullName as supervisorName, e.fullName as studentName, f.name as stopName '
                + 'FROM tripstudents a '
                + 'LEFT JOIN trips b ON a.tripId = b.tripId '
                + 'LEFT JOIN groups c ON b.groupId = c.groupId '
                + 'LEFT JOIN parents d ON b.supervisorId = d.parentId '
                + 'LEFT JOIN stops f ON a.stopId = f.stopId '
                + 'INNER JOIN students e ON a.studentId = e.studentId '
                + 'WHERE e.parentId = $1 AND b.tripDate = $2', [params.parentId, date], function (err, result) {
                    result = result.rows;
                    Utils.formatResponse("SUCCESS", "Schedule List Students", result, res);
                    return;
                })
        } else {

            rdi.sendNativeQuery('SELECT a.tripId, a.groupId, a.isSupervised, a.supervisorId, a.status, a.displayTime,'
                + 'a.dueOn, b.groupName, c.fullName as supervisorName '
                + 'FROM trips a '
                + 'LEFT JOIN groups b ON a.groupId = b.groupId '
                + 'LEFT JOIN parents c ON a.supervisorId = c.parentId '
                + 'WHERE a.supervisorId = $1 AND a.tripDate = $2', [params.parentId, date], function (err, result) {
                    result = result.rows;
                    Utils.formatResponse("SUCCESS", "Schedule List Supervisor", result, res);
                    return;
                })

        }
    },


    deleteSchedule: function (req, res) {
        var params = req.body;

        if (params.isSupervisor == "false" || params.isSupervisor == false) {
            Tripstudents.destroy({ tripId: params.tripId, studentId: params.studentId }).exec(function (err, model) {
                CommonController.updatePickupStreamlineDirect(params.tripId);
                Utils.formatResponse("SUCCESS", "Schedule Deleted", 0, res);
            })
        } else {
            DB.deleteTripSupervisor(params.parentId, params.tripId);
            Utils.formatResponse("SUCCESS", "Schedule Deleted", 0, res);
        }
    },

    editSchedule: function (req, res) {
        var params = req.body, tripDate = Utils.formatDate(params.newDate);

        if (params.isSupervisor == "false" || params.isSupervisor == false) {

            if (params.isDateChanged == false || params.isDateChanged == "false") {
                Tripstudents.update({ where: { tripId: params.tripId, studentId: params.studentId } }).set({ stopId: params.stopId }).exec(function (err, model) {
                    CommonController.updatePickupStreamlineDirect(params.tripId);
                });
                Utils.formatResponse("SUCCESS", "Schedule Edited", 0, res);
            } else {
                Tripstudents.destroy({ tripId: params.tripId, studentId: params.studentId }).exec(function (err, model) {
                    CommonController.updatePickupStreamlineDirect(params.tripId);
                });

                Trips.find({ where: { id: params.tripId } }).exec(function (err, model) {
                    if (model.length > 0) {

                        DB.findTripId(tripDate, model[0].groupId).then((tripId) => {
                            if (tripId != 0) {
                                DB.insertTripStudent(params.studentId, tripId, params.stopId);
                            }
                        });
                        Utils.formatResponse("SUCCESS", "Schedule Edited", 0, res);
                    }
                })
            }
        } else {

            if (params.isDateChanged == true || params.isDateChanged == "true") {
                DB.deleteTripSupervisor(params.parentId, params.tripId);
                Trips.find({ where: { id: params.tripId } }).exec(function (err, model) {
                    if (model.length > 0) {

                        DB.findTripId(tripDate, model[0].groupId).then((tripId) => {
                            if (tripId != 0) {
                                DB.updateTripSupervisor(params.parentId, tripId);
                            }
                        });
                        Utils.formatResponse("SUCCESS", "Schedule Edited", 0, res);
                    }
                })
            } else
                Utils.formatResponse("SUCCESS", "Schedule Edited", 0, res);

        }
    },


    getMonthScheduleDates: function (req, res) {
        var data = req.options.data, month = data.month, year = parseInt(data.year);
        month = month.charAt(0).toUpperCase() + month.slice(1);

        var FirstDay = new Date(year, Months[month], 1), LastDay = new Date(year, Months[month] + 1, 0);

        FirstDay = Utils.formatDate(FirstDay); LastDay = Utils.formatDate(LastDay);

        if (data.isSupervisor == "false" || data.isSupervisor == false) {
            rdi.sendNativeQuery('SELECT a.studentId , a.tripId, a.stopId, b.groupId, b.isSupervised, b.supervisorId, b.status, b.displayTime,'
                + 'b.dueOn, c.groupName, c.routeId, d.fullName as supervisorName, e.fullName as studentName, f.name as stopName '
                + 'FROM tripstudents a '
                + 'INNER JOIN trips b ON a.tripId = b.tripId '
                + 'INNER JOIN groups c ON b.groupId = c.groupId '
                + 'LEFT JOIN parents d ON b.supervisorId = d.parentId '
                + 'INNER JOIN stops f ON a.stopId = f.stopId '
                + 'INNER JOIN students e ON a.studentId = e.studentId '
                + 'WHERE e.parentId = $1 AND b.tripDate >= $2 AND b.tripDate <= $3 AND b.status != $4',
                [data.parentId, FirstDay, LastDay, "TRIP_COMPLETED"], function (err, result) {
                    result = result.rows;
                    Utils.formatResponse("SUCCESS", "Schedule List Students Month", result, res);
                    return;
                })
        } else {
            rdi.sendNativeQuery('SELECT  a.groupId, a.isSupervised, a.supervisorId, a.status, a.displayTime,'
                + 'a.dueOn, b.groupName, c.fullName as supervisorName '
                + 'FROM trips a '
                + 'INNER JOIN groups b ON a.groupId = b.groupId '
                + 'INNER JOIN parents c ON a.supervisorId = c.parentId '
                + 'WHERE a.supervisorId = $1 AND a.tripDate >= $2  AND a.tripDate <= $3 AND a.status != $4',
                [data.parentId, FirstDay, LastDay, "TRIP_COMPLETED"], function (err, result) {
                    console.log(err);
                    result = result.rows;
                    Utils.formatResponse("SUCCESS", "Schedule List Supervisor Month", result, res);
                    return;
                })
        }

    }

};

module.exports = ScheduleController;
