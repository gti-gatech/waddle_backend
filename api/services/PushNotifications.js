const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET,
    region: process.env.AWS_REGION
});
const snsClient = new AWS.SNS({ apiVersion: process.env.API_VERSION, region: process.env.AWS_REGION });
var serialize = require('node-serialize');

var WeekDays = Array();
WeekDays[1] = "Monday";
WeekDays[2] = "Tuesday";
WeekDays[3] = "Wednesday";
WeekDays[4] = "Thursday";
WeekDays[5] = "Friday";

var PushNotifications = {


    sendPush: async function (EndpointArn, Message, platform, type, payload) {
        // console.log(EndpointArn);
        var params = {
            Message: PushNotifications.buildPushData(Message, platform, type, payload),
            MessageStructure: 'json',
            TargetArn: EndpointArn
        };
        snsClient.publish(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log(data);           // successful response
        });

    },

    createPlatformEndpoint: async function (token, type, payload) {


        var platform = PushNotifications.returnPlatformType(token);
        var message = PushNotifications.getNotificationTypeMessage(type, payload);
        let applicationArn = platform === 'ios' ? process.env.ARN_IOS : process.env.ARN_ANDROID;


        // INSERT INTO DB
        if (type != "NEW MESSAGE")
            PushNotifications.insertNotification(payload, message, type);

        let snsParams = {
            Token: token,
            PlatformApplicationArn: applicationArn,
            CustomUserData: process.env.SECRET
        };
        snsClient.createPlatformEndpoint(snsParams, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                // console.log("ENDPOINT:ARN:"+data);
                PushNotifications.sendPush(data.EndpointArn, message, platform, type, payload);
            }
        }, () => {

        });
    },


    returnPlatformType: function (deviceToken) {
        return deviceToken.length > 100 ? "android" : "ios";
    },

    buildPushData: function (message, platform, type, payload) {
        if (platform == "android") {
            var GCMdata = {
                default: message,
                GCM: JSON.stringify({
                    data: {
                        message: message,
                        type: type,
                        payload: payload
                    }
                })
            }
            return JSON.stringify(GCMdata);
        }

        if (platform == "ios") {
            var APSdata = {
                APNS_SANDBOX: JSON.stringify({
                    aps: {
                        alert: message,
                        type: type,
                        "content-available": "1",
                        payload: payload
                    }
                })
            }
            return JSON.stringify(APSdata);
        }
    },

    getNotificationTypeMessage: function (type, payload) {
        switch (type) {
            case "TEST":
                return "Test message";
                break;
            case "SUPERVISOR REQUEST":
                var date = new Date(payload.dueOn);
                return payload.groupName + " has no supervisor for 8 am on " + date.getMonth() + "/" + date.getDate() + "/" + date.getFullYear() + ". Would you like to supervise?";
                break;
            case "TRIP STARTED":
                return "The trip has been started for " + payload.groupName;
                break;
            case "TRIP ENDED":
                return "The supervisor has reached the trip destination for " + payload.groupName;
                break;
            case "ARRVING AT YOUR LOCATION":
                return "The supervisor has left the last stop and would be arriving at you location for " + payload.groupName;
                break;
            case "NEW MESSAGE":
                return "You have a new message in " + payload.groupName;
                break;
            case "UPCOMING SUPERVISOR":
                var date = new Date(payload.dueOn);
                console.log(date);
                return "You have a upcoming schedule as supervisor on " + WeekDays[date.getDay()];
                break;
        }
    },

    insertNotification: function (payload, message, type) {
        var offset = -240;
        var hasActions, actions = serialize.serialize([]);
        if (type == "SUPERVISOR REQUEST") {
            hasActions = 1;
            actions = serialize.serialize(["Yes", "Skip"]);
        }

        if (type == "UPCOMING SUPERVISOR") {
            hasActions = 1;
            actions = serialize.serialize(["Going", "Not Going"]);
        }


        if (type == "NEW MESSAGE") {
            payload.dueOn = payload.createdOn;
            var temp = payload;
            temp.dueOn = new Date(temp.dueOn).toISOString(); temp.createdOn = new Date(temp.createdOn).toISOString();
        }else{
            var date = new Date();
            payload.dueOn = new Date(date.getTime() + offset * 60 * 1000).toISOString();
        }

       



        // console.log("NOTIFICATION DUE ON: " + payload.dueOn);
        // console.log("NOTIFICATION PAYLOAD: " + JSON.stringify(payload));

        var params = {
            parentId: type == "UPCOMING SUPERVISOR" ? payload.supervisorId : payload.parentId,
            hasActions: hasActions,
            message: message,
            payload: type == "NEW MESSAGE" ? serialize.serialize(temp) : serialize.serialize(payload),
            type: type,
            actions: actions,
            status: "delivered",
            dueOn: payload.dueOn
        };


        Notifications.create(params).exec(function (err, created) {
            console.log(err);
            console.log(created);
        });
    }

}

module.exports = PushNotifications;