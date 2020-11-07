
module.exports = {
    checkEmailList: function (params) {

        return new Promise(function (resolve, reject) {
            ApprovedParentList.findOne({ where: { email: params.email } }).exec(function (err, model) {
                var self = this;
                if (model) {
                    if (model.active == 0) {
                        resolve(0);
                    } else {
                        resolve(1);
                    }
                } else {
                    resolve(0);
                }
            });
        })
    },

    lastRouteId: function () {
        return new Promise(function (resolve, reject) {
            Routes.find({ limit: 1, sort: 'id DESC' }).exec(function (err, model) {
                console.log("ROUTE:ID:DB:" + JSON.stringify(model));

                if (model.length > 0) {
                    resolve(model[0]);
                } else {
                    resolve(undefined);
                }
            });
        })
    },

    lastStopId: function () {
        return new Promise(function (resolve, reject) {
            Stops.find({ limit: 1, sort: 'createdOn DESC' }).exec(function (err, model) {

                if (model.length > 0) {
                    resolve(model[0]);
                } else {
                    resolve(undefined);
                }
            });
        })
    },

    insertRoute: function (params, groupParams) {
        console.log("GROUP:PARAMS:" + JSON.stringify(groupParams));
        Groups.create(groupParams).exec(function (err, model) {
            console.log(err)
            console.log(model)
        })
        return new Promise(function (resolve, reject) {
            Routes.create(params).exec(function (err, model) {
                resolve(params);
                return;
            });
        })
    },

    insertStop: function (params) {
        return new Promise(function (resolve, reject) {
            Stops.create(params).exec(function (err, model) {
                console.log(err)
                console.log(model)
                resolve(params);
                return;
            });
        })
    },


    getStopData: function (params) {
        return new Promise(function (resolve, reject) {
            Stops.findOne({ where: { id: params.stopId } }).exec(function (err, model) {
                resolve(model);
                return;
            })
        })
    },

    insertTrips: function (params) {
        Trips.create(params).exec(function (err, created) { })
        return;
    },

    insertTripStudent: function (studentId, tripId, stopId) {
        var CommonController = require('../controllers/CommonController');
        var time = new Date();
        var searchParams = { studentId, tripId, stopId };
        var params = {
            studentId,
            tripId,
            stopId,
            status: process.env.NOT_PICKED,
            isActive: 1,
            createdOn: time,
            modifiedOn: time
        }
        Tripstudents.findOrCreate(searchParams, params).exec(function (err, created) {
            console.log(err);
            CommonController.updatePickupStreamlineDirect(tripId);
        })
    },

    insertGroupStudent: async function (students, stopId, groupId) {
        var time = new Date();

        students.forEach(element => {
            var searchParams = { studentId: element, groupId: parseInt(groupId) };
            console.log(searchParams);
            var params = {
                studentId: element,
                stopId: parseInt(stopId), groupId: parseInt(groupId),
                isActive: 1,
                createdOn: time,
            }

            Groupstudents.find(searchParams).exec(function (err, model) {
                console.log(model.length)
                if (model.length == 0) {
                    // rdi.sendNativeQuery('UPDATE groups SET totalStudents = totalStudents + 1 WHERE groupId = $1',
                    //     [groupId], (err, result) => {
                    //         console.log(err);
                    //         console.log(result);
                    //      });
                    Groupstudents.create(params).exec(function (err, created) {
                        console.log(created);
                    })
                }

            })
        });

    },

    findTripId: function (tripDate, groupId) {
        var rdi = sails.getDatastore('mysql');
        return new Promise(function (resolve, reject) {

            rdi.sendNativeQuery('SELECT * FROM trips WHERE tripDate = $1 AND groupId = $2 ORDER by tripId DESC LIMIT 1', [tripDate, groupId], function (err, result) {
                console.log(err);
                result = result.rows;
                if (result.length > 0)
                    resolve(result[0].tripId)
                else
                    resolve(0)
                return;
            })
        })
    },

    updateTripSupervisor: function (supervisorId, tripId) {
        var CommonController = require('../controllers/CommonController');
        var searchParams = { id: tripId, isSupervised: 1 };
        var params = { supervisorId, isSupervised: 1 };
        return new Promise(function (resolve, reject) {
            Trips.find(searchParams).exec(function (err, model) {
                console.log(model);
                if (model.length == 0) {
                    Trips.update({ where: { id: tripId } }).set(params).exec(function (err, model) {
                        CommonController.updatePickupStreamlineDirect(tripId);
                    });
                    resolve(1);
                } else {
                    resolve(0);
                }
            })
        });
    },

    deleteTripSupervisor: function (supervisorId, tripId) {
        var searchParams = { id: tripId, supervisorId: supervisorId };
        var params = { supervisorId: "", isSupervised: 0 };
        Trips.find(searchParams).exec(function (err, model) {
            if (model.length == 1) {
                Trips.update({ where: { id: tripId } }).set(params).exec(function (err, model) { });
            }
        })
    },

    leaveTripStudents: function (groupId, students) {
        var rdi = sails.getDatastore('mysql');

        students.forEach(element => {
            rdi.sendNativeQuery('SELECT a.id FROM tripstudents a INNER JOIN trips b ON a.tripId = b.tripId WHERE b.groupId = 1 AND a.studentId = 75;', [groupId, element.id], function (err, result) {
                var arr = result.rows.map(a => a.id);
                Tripstudents.destroy({ id: { in: arr } }).exec(function (err1, model1) { });
            });
        });
    },

    updatePickupLocationAndStreamline: function (data) {
        var pickupStop = data[0].stopId, tripId = data[0].tripId;

        Trips.update({ where: { id: tripId } }).set({ pickupStop: pickupStop }).exec(function (err, model) { });
        data.forEach((element, index) => {
            Tripstudents.update({ where: { id: element.id, tripId: element.tripId } }).set({ pickupCount: index + 1 }).exec(function (err, model) { });
        });
    }


}



