var serialize = require('node-serialize');
module.exports = {

    parentResponse: function (data, type) {

        switch (type) {
            case "Registered":
                var response = {};
                response.parentData = {};
                response.parentData.parentId = data.parentId;
                response.parentData.email = data.email;
                response.parentData.fullName = data.fullName;
                response.parentData.contact = data.contact;
                response.parentData.address = data.address;
                response.parentData.image = data.image;
                response.parentData.createdOn = data.createdOn;
                response.parentData.isFirstTime = 1;
                response.parentData.totalStudents = data.totalStudents;
                response.parentData.totalTrips = data.totalTrips;
                response.parentData.stopId = data.stopId;
                response.parentData.stopName = data.stopName;
                // TODO 
                //  STOP ID FETCH AND ADD
                response.auth = {};
                response.auth.type = "Header";
                response.auth.authToken = data.authToken;
                return response;
                break;

            case "Logged In":
                var response = {};
                response.parentData = {};
                response.parentData.parentId = data.parentId;
                response.parentData.email = data.email;
                response.parentData.fullName = data.fullName;
                response.parentData.contact = data.contact;
                response.parentData.address = data.address;
                response.parentData.image = data.image;
                response.parentData.createdOn = data.createdOn;
                response.parentData.isFirstTime = 1;
                response.parentData.totalStudents = data.totalStudents;
                response.parentData.totalTrips = data.totalTrips;
                response.parentData.stopId = data.stopId;
                response.parentData.stopName = data.stopName;
                // TODO 
                //  STOP ID FETCH AND ADD
                response.auth = {};
                response.auth.type = "Header";
                response.auth.authToken = data.authToken;
                return response;
                break;

            case "Profile Updated":
                var response = {};
                response.parentData = {};
                response.parentData.parentId = data.parentId;
                response.parentData.email = data.email;
                response.parentData.fullName = data.fullName;
                response.parentData.contact = data.contact;
                response.parentData.address = data.address;
                response.parentData.image = data.image;
                response.parentData.createdOn = data.createdOn;
                response.parentData.isFirstTime = 1;
                response.parentData.totalStudents = data.totalStudents;
                response.parentData.totalTrips = data.totalTrips;
                response.parentData.stopId = data.stopId;
                response.parentData.stopName = data.stopName;
                return response;
                break;

            case "Notifications":
                var response = {}; response.today = []; response.yesterday = []; response.previous = [];
                data.today.map((d) => {
                    response.today.push({
                        id: d.id,
                        parentId: d.parentId,
                        hasActions: d.hasActions,
                        message: d.message,
                        payload: serialize.unserialize(d.payload),
                        type: d.type,
                        actions: serialize.unserialize(d.actions),
                        status: d.status,
                        dueOn: d.dueOn
                    });
                });


                data.yesterday.map((d) => {
                    response.yesterday.push({
                        id: d.id,
                        parentId: d.parentId,
                        hasActions: d.hasActions,
                        message: d.message,
                        payload: serialize.unserialize(d.payload),
                        type: d.type,
                        actions: serialize.unserialize(d.actions),
                        status: d.status,
                        dueOn: d.dueOn
                    });
                });

                data.previous.map((d) => {
                    response.previous.push({
                        id: d.id,
                        parentId: d.parentId,
                        hasActions: d.hasActions,
                        message: d.message,
                        payload: serialize.unserialize(d.payload),
                        type: d.type,
                        actions: serialize.unserialize(d.actions),
                        status: d.status,
                        dueOn: d.dueOn
                    });
                });
                return response;
                break;
        }
    },



    commonResponse: function (data, type) {
        switch (type) {
            case "Unbinded Stops Data":
                var response = data.map((d) => {
                    return {
                        stopId: d.stopId != undefined ? d.stopId : d.id,
                        routeId: d.routeId,
                        name: d.name,
                        createdOn: d.createdOn,
                        location: serialize.unserialize(d.location),
                        groupName: d.groupName,
                        versionNo: d.versionNo
                    };
                });
                return response;
                break;
            case "Unbinded Groups Data":
                var response = data.map((d) => {
                    return {
                        groupId: d.groupId,
                        routeId: d.routeId,
                        groupName: d.groupName,
                        image: d.image,
                        createdOn: d.createdOn,
                        totalStudents: d.totalStudents,
                        totalTrips: d.totalTrips,
                        startLocation: serialize.unserialize(d.startLocation),
                        endLocation: serialize.unserialize(d.endLocation)
                    };
                });
                return response;
                break;
        }
    },

    tripsData: function (data, type) {
        switch (type) {
            case "Trip Map Data":
                var payload = {}; payload.tripStatus = data.tripStatus;
                var response = data.data.map((d) => {
                    return {
                        id: d.id,
                        studentId: d.studentId,
                        tripId: d.tripId,
                        status: d.status,
                        isActive: d.isActive,
                        createdOn: d.createdOn,
                        modifiedOn: d.modifiedOn,
                        stopId: d.stopId,
                        pickupCount: d.pickupCount,
                        studentName: d.studentName,
                        studentGrade: d.studentGrade,
                        contact: d.contact,
                        parentName: d.parentName,
                        stopName: d.stopName,
                        stopLocation: serialize.unserialize(d.stopLocation)
                    };
                });
                payload.data = response
                return payload;
                break;
        }
    }
}
