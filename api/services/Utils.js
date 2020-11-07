const { v4: uuidv4 } = require('uuid');
var jwt = require('jsonwebtoken');
const fs = require('fs');
const PRIV_KEY = fs.readFileSync(__dirname + '/../../assets/privateKey/privateKey.key');


module.exports = {
    formatResponse: async function (type, subtype, data, res) {
        // console.log(data);
        if (type == "ERR") {
            switch (subtype) {
                case "Invalid Params":
                    return res.status(403).send({ type: subtype, message: "The request does not contains all the required parameters." })
                    break;
                case "Email List Not Found":
                    return res.status(302).send({ type: subtype, message: "Sorry! the user is not pre-approved. Please contact Admin." })
                    break;
                case "Email List Active":
                    return res.status(401).send({ type: subtype, message: "The user is already active. Please login to continue!" })
                    break;
                case "Bad Credentials":
                    return res.status(400).send({ type: subtype, message: "The username or password does not match our records. Please try again!" })
                    break;
                case "Supervisor Exists":
                    return res.status(401).send({ type: subtype, message: "The trip already has a supervisor." })
                    break;
                case "Action not authorized":
                    return res.status(302).send({ type: subtype, message: "You do not have approriate permission levels to the action" })
                    break;
                case "OTP Error":
                    return res.status(401).send({ type : subtype, message: "Your OTP has not been verified yet."})
                    break;
            }
        }

        if (type == "SUCCESS") {
            switch (subtype) {
                case "Registered":
                    return res.status(200).send({ type: subtype, message: "User has been registered successfully!", data: FormatResponse.parentResponse(data, subtype) })
                    break;
                case "Logged In":
                    return res.status(200).send({ type: subtype, message: "User login successfull!", data: FormatResponse.parentResponse(data, subtype) })
                    break;
                case "Unbinded Stops Data":
                    return res.send({ type: subtype, message: "All stops data for user preview.", data: FormatResponse.commonResponse(data, subtype) })
                    break;
                case "Password Reset":
                    return res.send({ type: subtype, message: "Dear user, password reset link has been sent to your registered email address.", data })
                    break;
                case "Student Registered":
                    return res.send({ type: subtype, message: "Student has been registered successfully!", data })
                    break;
                case "Unbinded Groups Data":
                    return res.send({ type: subtype, message: "All groups data for selection", data: FormatResponse.commonResponse(data, subtype) })
                    break;
                case "Route Stops":
                    return res.send({ type: subtype, message: "Route stops attached to groups", data: FormatResponse.commonResponse(data, "Unbinded Stops Data") })
                    break;
                case "Joined Group":
                    return res.send({ type: subtype, message: "You are all set!", data })
                    break;
                case "Media Uploaded":
                    return res.ok({ type: subtype, message: "Media has been uploaded successfully!", data })
                    break;
                case "Profile Updated":
                    return res.send({ type: subtype, message: "Profile has been updated successfully!", data: FormatResponse.parentResponse(data, subtype) })
                    break;
                case "Schedule Added":
                    return res.ok({ type: subtype, message: data, data: data })
                    break;
                case "Schedule List Students":
                    return res.ok({ type: subtype, message: "Date specific schedule list for students.", data });
                    break;
                case "Schedule List Supervisor":
                    return res.ok({ type: subtype, message: "Date specific schedule list for supervisor.", data });
                    break;
                case "Homepage Data":
                    return res.ok({ type: subtype, message: "Recent data for two days to current date", data });
                    break;
                case "Schedule Deleted":
                    return res.ok({ type: subtype, message: "Schedule has been deleted successfully!" });
                    break;
                case "Schedule Edited":
                    return res.ok({ type: subtype, message: "Schedule has been edited successfully!" });
                    break;
                case "Schedule List Students Month":
                    return res.ok({ type: subtype, message: "Month specific schedule list for students.", data });
                    break;
                case "Schedule List Supervisor Month":
                    return res.ok({ type: subtype, message: "Month specific schedule list for supervisor.", data });
                    break;
                case "My Groups":
                    return res.ok({ type: subtype, message: "List of your groups", data });
                    break;
                case "Group Details":
                    return res.ok({ type: subtype, message: "Group details with students and trips", data });
                    break;
                case "Group Updated":
                    return res.send({ type: subtype, message: "Group has been updated successfully!", data })
                    break;
                case "Supervisor Appointed":
                    return res.ok({ type: subtype, message: "You are now appointed as a supervisor." })
                    break;
                case "Supervisor Removed":
                    return res.ok({ type: subtype, message: "You are now removed as supervisor." })
                    break;
                case "Student deleted":
                    return res.ok({ type: subtype, message: "Student has been  deleted successfully!" })
                    break;
                case "Trip Map Data":
                    return res.ok({ type: subtype, message: "Trips Map & Students data to date.", data: FormatResponse.tripsData(data, "Trip Map Data") })
                    break;
                case "Notifications":
                    return res.ok({ type: subtype, message: "Notifications list latest.", data: FormatResponse.parentResponse(data, subtype)})
                    break;
            }
        }

    },

    generateUniqueId: function () {
        return uuidv4();
    },

    generateJWT: async function (params) {
        var token = jwt.sign(params, PRIV_KEY, { algorithm: 'RS256' });
        return token;
    },

    verifyJWT: async function (params, res) {
        var data;
        jwt.verify(params, PRIV_KEY, { algorithms: ['RS256'] }, function (err, decoded) {
            if (err) {
                return res.status(403).send({ type: "JWT Malformed", message: "The JWT is malformed. Request Denied." })
            }
            data = decoded;
        });
        return data;
    },

    formatDate: function (date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return [year, month, day].join('');
    },

    getNextDate: function (date, days) {
        var resultDate = new Date(date.getTime());
        resultDate.setDate(date.getDate() + (7 + days - date.getDay() - 1) % 7 + 1);
        return resultDate;
    },


    getNearestLocationToPoint: function (locationsArray, streamlinedBool) {
        // Haversine
        // a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
        // c = 2 ⋅ atan2( √a, √(1−a) )
        // d = R ⋅ c
        // where φ is latitude, λ is longitude, R is earth’s radius (mean radius = 6,371km);
        // note that angles need to be in radians to pass to trig functions!

        // 0 longitude 1 latitude
        const R = 6371e3; // metres

        var data = locationsArray.map(function (el) {
            var o = Object.assign({}, el), keys = Object.keys(el.supervisorLocation), locationKeys = Object.keys(el.location);
            var lat1 = el.supervisorLocation[keys[1]], lon1 = el.supervisorLocation[keys[0]];
            var lat2 = el.location[locationKeys[1]], lon2 = el.location[locationKeys[0]];

            var φ1 = lat1 * Math.PI / 180; // φ, λ in radians
            var φ2 = lat2 * Math.PI / 180;
            var Δφ = (lat2 - lat1) * Math.PI / 180;
            var Δλ = (lon2 - lon1) * Math.PI / 180;

            var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            o.mts = R * c; // in metres
            return o;
        });

        data.sort((a, b) => parseFloat(a.mts) - parseFloat(b.mts));

        if (streamlinedBool) {
            DB.updatePickupLocationAndStreamline(data);
            return;
        } else
            return data;

    }
}