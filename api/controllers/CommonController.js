/**
 * ParentsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var serialize = require('node-serialize');
var rdi = sails.getDatastore('mysql');
var request = require("request");
module.exports = {

    getStops: function (req, res) {

        Mapversions.find().sort('id DESC').limit(1).exec((err2, model) => {
            var versionNo;
            if (model.length > 0)
                versionNo = model[0].versionNo

            rdi.sendNativeQuery('SELECT a.* , b.groupName, c.versionNo FROM stops a '
                + 'INNER JOIN groups b ON a.routeId = b.routeId '
                + 'INNER JOIN routes c ON a.routeId = c.routeId AND c.versionNo = $1', [versionNo], function (err, results) {
                    Utils.formatResponse("SUCCESS", "Unbinded Stops Data", results.rows, res);
                    return;
                })
        })
    },



    getGroups: function (req, res) {

        Mapversions.find().sort('id DESC').limit(1).exec((err2, model) => {
            var versionNo;
            if (model.length > 0)
                versionNo = model[0].versionNo

            rdi.sendNativeQuery('SELECT a.*, b.startLocation, b.endLocation FROM groups a'
                + ' INNER JOIN routes b ON a.routeId = b.routeId AND b.versionNo = $1', [versionNo], function (err, results) {
                    Utils.formatResponse("SUCCESS", "Unbinded Groups Data", results.rows, res);
                    return;
                })
        })

    },

    getRouteStops: function (req, res) {
        var routeId = req.param('routeId');
        console.log("ROUTE:ID:COMMON:GROUP:STOPS:" + routeId);

        Stops.find({ where: { routeId: routeId } }).exec(function (err, model) {
            Utils.formatResponse("SUCCESS", "Route Stops", model, res);
        })
    },


    uploadFile: function (req, res) {
        req.file('file').upload({
            adapter: require('skipper-s3'),
            key: process.env.S3_KEY,
            secret: process.env.S3_SECRET,
            bucket: process.env.S3_BUCKET
        }, function (err, filesUploaded) {
            if (err) return res.serverError(err);
            return Utils.formatResponse("SUCCESS", "Media Uploaded", filesUploaded[0], res);
        });
    },


    updatePickupStreamline: function (req, res) {
        var tripId = req.param('tripId');

        rdi.sendNativeQuery('SELECT a.id, a.tripId, a.studentId, a.stopId, b.location, d.stopId as supervisorStop, e.location as supervisorLocation '
            + 'FROM tripstudents a '
            + 'INNER JOIN stops b ON a.stopId = b.stopId '
            + 'INNER JOIN trips c ON a.tripId = c.tripId AND c.isSupervised = 1 '
            + 'INNER JOIN parents d ON c.supervisorId = d.parentId '
            + 'INNER JOIN stops e ON d.stopId = e.stopId '
            + 'WHERE a.tripId = $1', [tripId], function (err, results) {
                var temp = results.rows;
                if (temp.length > 0) {
                    var data = temp.map((d) => {
                        return {
                            id: d.id,
                            tripId: d.tripId,
                            studentId: d.studentId,
                            stopId: d.stopId,
                            location: serialize.unserialize(d.location),
                            supervisorStop: d.supervisorStop,
                            supervisorLocation: serialize.unserialize(d.supervisorLocation)
                        };
                    })
                    Utils.getNearestLocationToPoint(data, true);
                    res.ok({ type: "PickupStreamlined", message: "In process" });
                }
                else
                    res.ok({ type: "PickupStreamlined", message: "No Students Yet" });

            })
    },

    updatePickupStreamlineDirect: function (tripId) {
        console.log("DIRECT:" + tripId);
        rdi.sendNativeQuery('SELECT a.id, a.tripId, a.studentId, a.stopId, b.location, d.stopId as supervisorStop, e.location as supervisorLocation '
            + 'FROM tripstudents a '
            + 'INNER JOIN stops b ON a.stopId = b.stopId '
            + 'INNER JOIN trips c ON a.tripId = c.tripId AND c.isSupervised = 1 '
            + 'INNER JOIN parents d ON c.supervisorId = d.parentId '
            + 'INNER JOIN stops e ON d.stopId = e.stopId '
            + 'WHERE a.tripId = $1', [tripId], function (err, results) {
                var temp = results.rows;
                if (temp.length > 0) {
                    var data = temp.map((d) => {
                        return {
                            id: d.id,
                            tripId: d.tripId,
                            studentId: d.studentId,
                            stopId: d.stopId,
                            location: serialize.unserialize(d.location),
                            supervisorStop: d.supervisorStop,
                            supervisorLocation: serialize.unserialize(d.supervisorLocation)
                        };
                    })
                    Utils.getNearestLocationToPoint(data, true);
                    return;
                }
                else
                    return;
            })
    },

    sendTestPush: function (req, res) {
        var email = req.param('email');
        Parents.find({ select: ['deviceToken'], where: { email: email } }).exec((err, model) => {
            if (model.length > 0)
                PushNotifications.createPlatformEndpoint(model[0].deviceToken, "TEST", model[0]);
            res.ok({ type: "SUCCESS", message: "Test notification sent." })
        })
    },

    sendVerificationOtp: function (req, res) {
        var data = req.body, otp = Math.floor(100000 + Math.random() * 900000);
        var emailTemplate = '<table class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td><td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; margin: 0 auto; max-width: 580px; padding: 10px; width: 580px;"><div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;"><!-- START CENTERED WHITE CONTAINER --> <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;"></span><table class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #ffffff; border-radius: 3px;"><!-- START MAIN CONTENT AREA --><tbody><tr><td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;"><table style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;"><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Welcome to Waddle,</p><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Your verification OTP (One time password) is below. Please do not share your OTP over calls or text. We never ask you for your OTP.</p><table class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" align="left"><table style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top; background-color: #3498db; border-radius: 5px; text-align: center;"><a style="display: inline-block; color: #ffffff; background-color: #3498db; border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #3498db;" href="#" target="_blank" rel="noopener">' + otp + '</a></td></tr></tbody></table></td></tr></tbody></table><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">&nbsp;</p><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;"></p></td></tr></tbody></table></td></tr><!-- END MAIN CONTENT AREA --></tbody></table><!-- START FOOTER --><div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;"><table style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 12px; color: #999999; text-align: center;"><span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">Waddle, City of Milton</span> <br />Dont like these emails? <a style="text-decoration: underline; color: #999999; font-size: 12px; text-align: center;" href="http://i.imgur.com/CScmqnj.gif">Unsubscribe</a>.</td></tr><tr><td class="content-block powered-by" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 12px; color: #999999; text-align: center;">Powered by Waddle.</td></tr></tbody></table></div><!-- END FOOTER --> <!-- END CENTERED WHITE CONTAINER --></div></td><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td></tr></tbody></table><p>&nbsp;</p>';
        var params = { email: data.email, otp: otp };
        Otp.create(params).exec((err, model) => { });
        var options = {
            method: 'POST',
            url: 'http://34.209.64.150/sendmail.php',
            headers:
            {
                'cache-control': 'no-cache',
                'Content-Type': 'application/json'
            },
            body:
            {
                name: 'Waddle',
                subject: 'Confirm your identity | OTP verification',
                email: data.email,
                message: emailTemplate
            },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            console.log(body);
        });
        res.ok({ type: "SUCCESS", message: "OTP has been sent successfully." });
    },

    sendVerificationOtpFunction: function (email) {
        var otp = Math.floor(100000 + Math.random() * 900000);
        var emailTemplate = '<table class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td><td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; margin: 0 auto; max-width: 580px; padding: 10px; width: 580px;"><div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;"><!-- START CENTERED WHITE CONTAINER --> <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;"></span><table class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #ffffff; border-radius: 3px;"><!-- START MAIN CONTENT AREA --><tbody><tr><td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;"><table style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;"><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Welcome to Waddle,</p><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Your verification OTP (One time password) is below. Please do not share your OTP over calls or text. We never ask you for your OTP.</p><table class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" align="left"><table style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top; background-color: #3498db; border-radius: 5px; text-align: center;"><a style="display: inline-block; color: #ffffff; background-color: #3498db; border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #3498db;" href="#" target="_blank" rel="noopener">' + otp + '</a></td></tr></tbody></table></td></tr></tbody></table><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">&nbsp;</p><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;"></p></td></tr></tbody></table></td></tr><!-- END MAIN CONTENT AREA --></tbody></table><!-- START FOOTER --><div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;"><table style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 12px; color: #999999; text-align: center;"><span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">Waddle, City of Milton</span> <br />Dont like these emails? <a style="text-decoration: underline; color: #999999; font-size: 12px; text-align: center;" href="http://i.imgur.com/CScmqnj.gif">Unsubscribe</a>.</td></tr><tr><td class="content-block powered-by" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 12px; color: #999999; text-align: center;">Powered by Waddle.</td></tr></tbody></table></div><!-- END FOOTER --> <!-- END CENTERED WHITE CONTAINER --></div></td><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td></tr></tbody></table><p>&nbsp;</p>';
        var params = { email: email, otp: otp };
        Otp.create(params).exec((err, model) => { });
        var options = {
            method: 'POST',
            url: 'http://34.209.64.150/sendmail.php',
            headers:
            {
                'cache-control': 'no-cache',
                'Content-Type': 'application/json'
            },
            body:
            {
                name: 'Waddle',
                subject: 'Confirm your identity | OTP verification',
                email: email,
                message: emailTemplate
            },
            json: true
        };

        request(options, function (error, response, body) {
            if (error) throw new Error(error);

            return;
        });
    }

};
