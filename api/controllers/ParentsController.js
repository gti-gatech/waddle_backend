/**
 * ParentsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const bcrypt = require('bcrypt');
var rdi = sails.getDatastore('mysql');
var serialize = require('node-serialize');
var CommonController = require('./CommonController');
var request = require("request");
const offset = -240;

var ParentsController = {

    register: function (req, res) {
        var params = req.body;
        params.parentId = Utils.generateUniqueId();
        params.id = params.parentId;
        params.createdOn = new Date();
        var authToken; var stopName;
        Utils.generateJWT({ params }).then((token) => {
            authToken = token;
        });

        DB.getStopData(params).then((stopData) => {
            console.log("REGISTER:STOP:DATA:" + stopData);
            stopName = stopData.name;
        })

        try {
            var verification = 0;

            Otp.find({ email: params.email }).sort('id DESC').limit(1).exec((err2, model2) => {
                if (model2.length > 0) {
                    verification = model2[0].verified;
                }


                DB.checkEmailList(params).then((data) => {
                    console.log("DATA:" + data);
                    if (data == undefined) {
                        console.log("DATA:" + undefined)
                        return Utils.formatResponse("ERR", "Email List Not Found", 0, res);
                    } else {
                        switch (data) {
                            case 0:
                                if (verification == 0) {
                                    CommonController.sendVerificationOtpFunction(params.email);
                                    return Utils.formatResponse("ERR", "OTP Error", 0, res);
                                }

                                bcrypt.hash(params.password, 10).then((hash) => {
                                    params.password = hash;

                                    ApprovedParentList.update({ where: { email: params.email } }).set({ active: 1 }).exec(function (err, model) {
                                        console.log(err);
                                        console.log(model);
                                    });

                                    Parents.create(params).exec(function (err, created) {
                                        params.authToken = authToken;
                                        params.stopName = stopName;
                                        return Utils.formatResponse("SUCCESS", "Registered", params, res);
                                    });
                                });
                                break;

                            case 1:
                                return Utils.formatResponse("ERR", "Email List Active", 0, res);
                                break;
                        }
                    }
                });

            });


        } catch (error) {
            console.log(error)
        }

    },



    login: function (req, res) {
        var params = req.body;
        var fields = [params.email];


        rdi.sendNativeQuery('SELECT a.*, b.name as stopName FROM parents a '
            + 'LEFT JOIN stops b ON a.stopId = b.stopId '
            + 'WHERE a.email = $1 ', [params.email], function (err, model) {
                model = model.rows;

                // Parents.find({ email: params.email }).exec(function (err, model) {
                console.log("LOGIN:DATA:MODEL:" + model);

                if (model.length > 0) {
                    console.log(model);
                    model = model[0];




                    bcrypt.compare(params.password, model.password, function (err, result) {
                        if (result) {
                            params.parentId = model.parentId;
                            Utils.generateJWT({ params }).then((token) => {
                                model.authToken = token;

                                Parents.update({ where: { email: params.email } }).set({ deviceToken: params.deviceToken }).exec(function (err, model) { })
                                return Utils.formatResponse("SUCCESS", "Logged In", model, res);
                            });

                        } else
                            return Utils.formatResponse("ERR", "Bad Credentials", 0, res);
                    });

                } else {
                    return Utils.formatResponse("ERR", "Bad Credentials", 0, res);
                }

            })
    },



    passwordReset: function (req, res) {
        var params = req.body, uniqueKey = Math.floor(100000 + Math.random() * 900000);


        Parents.find({ email: params.email }).exec(function (err, model) {
            if (model.length > 0) {
                Passwordrequest.create({ parentId: model[0].id, uniqueKey }).exec((er, mod) => { });
                var link = "http://34.209.64.150:1337/resetpassword/" + model[0].id + "/" + uniqueKey;

                var emailTemplate = '<table class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td><td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; margin: 0 auto; max-width: 580px; padding: 10px; width: 580px;"><div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;"><!-- START CENTERED WHITE CONTAINER --><table class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #ffffff; border-radius: 3px;"><!-- START MAIN CONTENT AREA --><tbody><tr><td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;"><table style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;"><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Dear User,</p><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">Your Password Reset link is below. Please do not share your Reset Link over calls or text. We never ask you for your Reset Link.</p><table class="btn btn-primary" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; box-sizing: border-box;" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top; padding-bottom: 15px;" align="left"><table style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: auto;" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top; background-color: #3498db; border-radius: 5px; text-align: center;"><a style="display: inline-block; color: #ffffff; background-color: #3498db; border: solid 1px #3498db; border-radius: 5px; box-sizing: border-box; cursor: pointer; text-decoration: none; font-size: 14px; font-weight: bold; margin: 0; padding: 12px 25px; text-transform: capitalize; border-color: #3498db;" href=' + link + ' target="_blank" rel="noopener">Reset Password</a></td></tr></tbody></table></td></tr></tbody></table><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">&nbsp;</p><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-bottom: 15px;">&nbsp;</p></td></tr></tbody></table></td></tr><!-- END MAIN CONTENT AREA --></tbody></table><!-- START FOOTER --><div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;"><table style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;" border="0" cellspacing="0" cellpadding="0"><tbody><tr><td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 12px; color: #999999; text-align: center;"><span class="apple-link" style="color: #999999; font-size: 12px; text-align: center;">Waddle, City of Milton</span> <br />Dont like these emails? <a style="text-decoration: underline; color: #999999; font-size: 12px; text-align: center;" href="http://i.imgur.com/CScmqnj.gif">Unsubscribe</a>.</td></tr><tr><td class="content-block powered-by" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 12px; color: #999999; text-align: center;">Powered by Waddle.</td></tr></tbody></table></div><!-- END FOOTER --> <!-- END CENTERED WHITE CONTAINER --></div></td><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td></tr></tbody></table><p>&nbsp;</p>';
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
                        subject: 'Password Reset Link | Do not share',
                        email: params.email,
                        message: emailTemplate
                    },
                    json: true
                };

                request(options, function (error, response, body) {
                    // if (error) throw new Error(error);


                    console.log(body);
                    return Utils.formatResponse("SUCCESS", "Password Reset", params.email, res);
                });
            } else
                return Utils.formatResponse("ERR", "Bad Credentials", 0, res);
        })
    },

    updateProfile: function (req, res) {
        var params = req.body;
        var parentId = params.parentId;
        Parents.update({ where: { id: parentId } }).set(params).exec(function (err, model) {
            rdi.sendNativeQuery('SELECT a.*, b.name as stopName FROM parents a '
                + 'LEFT JOIN stops b ON a.stopId = b.stopId '
                + 'WHERE a.parentId = $1 ', [parentId], function (err, model) {
                    model = model.rows;

                    // console.log("PROFILE:UPDATED:"+JSON.stringify(model[0]));
                    return Utils.formatResponse("SUCCESS", "Profile Updated", model[0], res);
                });
        })
    },


    homePage: function (req, res) {
        var parentId = req.options.parentId, currentDate = Utils.formatDate(new Date()), nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 1); nextDate = Utils.formatDate(nextDate);



        var payload = {};

        rdi.sendNativeQuery('SELECT count(*) as count FROM trips WHERE supervisorId = $1', [parentId], function (errcount, modelcount) {
            payload.tripsWalked = modelcount.rows[0].count;
        });
        rdi.sendNativeQuery('SELECT a.*, b.name as stopName FROM parents a '
            + 'LEFT JOIN stops b ON a.stopId = b.stopId '
            + 'WHERE a.parentId = $1 ', [parentId], function (errparent, modelparent) {
                modelparent = modelparent.rows[0];

                payload.parentData = {};
                payload.parentData.parentId = modelparent.parentId;
                payload.parentData.email = modelparent.email;
                payload.parentData.fullName = modelparent.fullName;
                payload.parentData.contact = modelparent.contact;
                payload.parentData.address = modelparent.address;
                payload.parentData.image = modelparent.image;
                payload.parentData.createdOn = modelparent.createdOn;
                payload.parentData.isFirstTime = 0;
                payload.parentData.totalStudents = modelparent.totalStudents;
                payload.parentData.totalTrips = modelparent.totalTrips;
                payload.parentData.stopId = modelparent.stopId;
                payload.parentData.stopName = modelparent.stopName;
            });



        rdi.sendNativeQuery('SELECT a.studentId , a.tripId, a.stopId, b.groupId, b.isSupervised, b.supervisorId, b.status, b.displayTime,'
            + 'b.dueOn, c.groupName, IFNULL(d.fullName,"") as supervisorName, e.fullName as studentName '
            + 'FROM tripstudents a '
            + 'LEFT JOIN trips b ON a.tripId = b.tripId '
            + 'LEFT JOIN groups c ON b.groupId = c.groupId '
            + 'LEFT JOIN parents d ON b.supervisorId = d.parentId '
            + 'INNER JOIN students e ON a.studentId = e.studentId '
            + 'WHERE e.parentId = $1 AND b.tripDate = $2 OR e.parentId = $3 AND tripDate = $4 ORDER BY b.tripDate ASC;',
            [parentId, currentDate, parentId, nextDate], function (err, result) {
                result = result.rows;

                payload.studentTrips = result;
                rdi.sendNativeQuery('SELECT  a.groupId, a.isSupervised, a.supervisorId, a.status, a.displayTime,'
                    + 'a.dueOn, b.groupName, c.fullName as supervisorName '
                    + 'FROM trips a '
                    + 'LEFT JOIN groups b ON a.groupId = b.groupId '
                    + 'LEFT JOIN parents c ON a.supervisorId = c.parentId '
                    + 'WHERE a.supervisorId = $1 AND a.tripDate = $2 OR a.supervisorId = $3 AND a.tripDate = $4 ORDER BY a.tripDate',
                    [parentId, currentDate, parentId, nextDate], function (err, resultSupervisor) {
                        resultSupervisor = resultSupervisor.rows;
                        payload.supervisorTrips = resultSupervisor;

                        return Utils.formatResponse("SUCCESS", "Homepage Data", payload, res);
                    })
            });
    },

    updateLocation: async function (req, res) {
        var params = req.body;
        Parents.update({ where: { id: params.parentId } }).set({
            longitude: params.longitude,
            latitude: params.latitude
        }).exec(function (err, model) {
            console.log(err);
            console.log(model);
        });

        Trips.update({ where: { supervisorId: params.parentId, id: params.tripId } }).set({
            longitude: params.longitude,
            latitude: params.latitude
        }).exec(function (err, model) {
            res.ok({ type: "Location Updated", message: "Your location has been updated." })
            return;
        });
    },


    getNotifications: function (req, res) {
        var parentId = req.options.parentId, date = new Date(), yesterday = new Date(), today = Utils.formatDate(new Date());
        yesterday.setDate(yesterday.getDate() - 1); yesterday = Utils.formatDate(yesterday);
        date.setHours(date.getHours() - 10);
        date = new Date(date.getTime() + offset * 60 * 1000);
        var payload = {};

        rdi.sendNativeQuery('SELECT notificationId as id , parentId, hasActions, message, payload, type, actions, status, dueOn FROM notifications WHERE parentId = $1 AND dueOn >= $2 AND status = $3 '
            + 'AND type = $4 OR parentId = $1 AND status = $3 AND type != $4 ORDER BY notificationId DESC', [parentId, date, "delivered", "SUPERVISOR REQUEST"],
            function (err, result) {
                var data = result.rows;
                payload.today = [];
                payload.yesterday = []; payload.previous = [];

                data.forEach((element, index) => {
                    var payloadData = serialize.unserialize(element.payload); var dueOn = undefined;

                    dueOn = payloadData.dueOn; dueOn = Utils.formatDate(dueOn);


                    if (dueOn == yesterday)
                        payload.yesterday.push(element);
                    else if (dueOn == today)
                        payload.today.push(element);
                    else
                        payload.previous.push(element);

                    if ((index + 1) == data.length)
                        return Utils.formatResponse("SUCCESS", "Notifications", payload, res);

                });

                if (data.length < 1)
                    return Utils.formatResponse("SUCCESS", "Notifications", payload, res);
            })
    },

    markNotifications: function (req, res) {
        var params = req.body;
        Notifications.update({ where: { parentId: params.parentId, id: params.id } }).set({ status: "read" }).exec((err, model) => {
            req.options.parentId = params.parentId;
            ParentsController.getNotifications(req, res);
        })
    },

    verifyOtp: function (req, res) {
        var params = req.body;
        Otp.find({ where: { email: params.email }, limit: 1, sort: 'id DESC' }).exec((err, model) => {
            if (model.length > 0) {
                if (model[0].otp == params.otp) {
                    Otp.update({ where: { email: params.email } }).set({ verified: 1 }).exec((err, model) => {
                        console.log(err)
                    });
                    Parents.update({ where: { email: params.email } }).set({ otpVerified: 1 }).exec(function (err, model) { });
                    res.ok({ type: "SUCESS", message: "OTP verification has been successfully processed." });
                } else
                    res.status(403).send({ type: "ERR", message: "The otp cannot be verified. Please try again or check your email." })
            } else {
                res.status(403).send({ type: "ERR", message: "The otp cannot be verified. Please try again or check your email." })
            }
        })
    },

    changePassword: function (req, res) {
        var data = req.body;
        Passwordrequest.update({ where: { parentId: data.id } }).set({ active: 1 }).exec(() => { });
        bcrypt.hash(data.password, 10).then((hash) => {
            Parents.update({ id: data.id }).set({ password: hash }).exec((err, model) => { });
            return res.ok({ type: "SUCCESS" });
        });
    },

    checkResetLink: function (req, res) {
        var key = req.param('key'), parentId = req.param('uuid');
        Passwordrequest.find({ parentId: parentId }).sort('id DESC').limit(1).exec((err, model) => {
            if (model.length > 0) {
                model = model[0];
                if (model.uniqueKey == key && model.active == 0)
                    res.view('pages/resetpassword', { state: true });
                else
                    res.view('pages/resetpassword', { state: false });
            } else
                res.view('pages/resetpassword', { state: false });
        })
    },

    logout: function (req, res) {
        Parents.update({ where: { id: req.options.parentId } }).set({ deviceToken: "" }).exec(function (err, model) { });
        res.ok({ type: "Logout", message: "Successfully Logged Out!" });
    }
};

module.exports = ParentsController;

