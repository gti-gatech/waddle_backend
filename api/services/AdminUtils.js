var serialize = require('node-serialize');
var routeId = 0; var stopId = 0;

module.exports = {
    parseStopsUpload: function (params) {
        var versionNo = 1;
        Mapversions.find().sort('id DESC').limit(1).exec((err2, model) => {
            // console.log(model);
            if (model.length > 0)
                versionNo = model[0].versionNo + 1;

            Mapversions.create({ versionNo: model[0].versionNo + 1 }).exec((err4, model4) => {
                console.log(model4);
                console.log(err4);
             });

            var features = params.features;

            DB.lastRouteId().then((data) => {
                if (data != undefined)
                    routeId = data.id

                features.forEach((element, index) => {
                    // console.log(element, index);
                    // ROUTES
                    if (element.geometry.type == process.env.KML_LINESTRING) {
                        routeId = routeId + 1;
                        var coordinates = element.geometry.coordinates;
                        var params = {
                            name: element.properties.name,
                            startLocation: serialize.serialize(coordinates[0]),
                            endLocation: serialize.serialize(coordinates[coordinates.length - 1]),
                            isActive: 1,
                            createdOn: new Date(),
                            versionNo
                        }
                        // console.log(params);

                        var groupParams = {
                            groupName: "Group " + element.properties.name,
                            routeId: routeId,
                            totalStudents: 0,
                            totalTrips: 0,
                            createdOn: new Date()
                        };
                        // console.log(groupParams);
                        // Routes and Groups
                        DB.insertRoute(params, groupParams);
                    }

                    // STOPS
                    if (element.geometry.type == process.env.KML_POINT) {
                        var params = {
                            routeId: routeId,
                            name: element.properties.name,
                            location: serialize.serialize(element.geometry.coordinates),
                            createdOn: new Date()
                        }
                        // console.log("STOPS: "+ JSON.stringify(params));
                        DB.insertStop(params);
                    }
                })
            })

        })
    },

    formatResponse: async function (type, subtype, data, res) {
        if (type == "ERR") {
            switch (subtype) {
                case "Invalid Params":
                    return res.status(403).send({ type: subtype, message: "The request does not contains all the required parameters." })
                    break;
                case "Bad Credentials":
                    return res.status(400).send({ type: subtype, message: "The username or password does not match our records. Please try again!" })
                    break;
            }
        }

        if (type == "SUCCESS") {
            switch (subtype) {
                case "UploadKML":
                    return res.ok({ type: subtype, message: "The data is in processing. Routes and Stops would be populated in 20 seconds.", data: data })
                    break;
                case "Logged In":
                    return res.ok({ type: subtype, message: "User login successfull!", data: FormatResponse.parentResponse(data, subtype) })

            }
        }

    }







}