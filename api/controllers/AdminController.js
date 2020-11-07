/**
 * AdminController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
const parseKML = require('parse-kml');
const bcrypt = require('bcrypt');
const CronController = require('./CronController');
var rdi = sails.getDatastore('mysql');

var AdminController = {

    uploadKml: function (req, res) {
        req.file('file').upload({
            adapter: require('skipper-s3'),
            key: process.env.S3_KEY,
            secret: process.env.S3_SECRET,
            bucket: process.env.S3_BUCKET
        }, function (err, filesUploaded) {
            if (err) return res.serverError(err);
            var KMLFile = process.env.S3_BASE + filesUploaded[0].fd;
            parseKML
                .toJson(KMLFile)
                .then((data) => {
                    AdminUtils.parseStopsUpload(data);
                    setTimeout(() => {
                       CronController.periodicalTripsCreationDirect()
                    }, 3000);

                    setTimeout(() => {
                        CronController.periodicalTripsCreationDirect()
                     }, 18000);

                     setTimeout(() => {
                        CronController.periodicalTripsCreationDirect()
                     }, 28000);
                    AdminUtils.formatResponse("SUCCESS", "UploadKML", data, res)
                })
                .catch(console.error);
        });

    },

    login: function (req, res) {
        var email = req.param('email'), password = req.param('password');
        Adminlogin.find({ email: email }).exec((err, model) => {
            if (model.length > 0) {
                model = model[0];
                bcrypt.compare(password, model.password, function (err, result) {
                    if (result) {
                        req.session.loggedIn = true;
                        AdminController.fetchDashboardData(req, res);
                    } else
                        res.view('pages/login', { logged: false, type: "ERR", message: "Invalid email or password!" });
                });
            } else
                res.view('pages/login', { logged: false, type: "ERR", message: "Invalid email or password!" });

        });
    },

    logout: function (req, res) {
        req.session.loggedIn = false;
        res.view('pages/login', { logged: false, type: "SUCCESS" })
    },

    redirectOrLogin: function (req, res) {

        var loggedIn = req.session.loggedIn;
        if (loggedIn == undefined || loggedIn == false) {
            req.session.logged = false;
            res.view('pages/login', { logged: false, type: "SUCCESS" })
        } else {
            AdminController.fetchDashboardData(req, res);
        }
    },

    fetchDashboardData: function (req, res) {
        var payload = { logged: true, type: "SUCCESS", counts: {}, tripsOverview: [] };
        currentDate = Utils.formatDate(new Date()), nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 1); nextDate = Utils.formatDate(nextDate);

        rdi.sendNativeQuery('SELECT (SELECT count(*) FROM parents) as parentsCount,  (SELECT count(*) FROM students) '
            + 'as studentsCount, (SELECT count(*) FROM trips WHERE status = "TRIP_COMPLETED") as tripsCount', [], (err, model) => {
                payload.counts = model.rows[0];
            });

        rdi.sendNativeQuery('SELECT a.*, b.fullName, (SELECT count(*) FROM tripstudents WHERE tripId = a.tripId) as studentsCount '
            + 'FROM trips a LEFT JOIN parents b ON a.supervisorId = b.parentId '
            + 'WHERE tripDate = $1 OR tripDate = $2', [currentDate, nextDate],
            (err, model) => {
                console.log(err);
                payload.tripsOverview = model.rows;
                res.view('pages/homepage', payload);
            })
    },

    changePage: function (req, res) {
        var page = req.param('page');
        switch (page) {
            case "parents":
                AdminController.getParentsData(req, res);
                break;
            case "students":
                AdminController.getStudentsData(req, res);
                break;
            case "trips":
                AdminController.getTripsData(req, res);
                break;
            case "emails":
                AdminController.getEmailList(req, res);
                break;
            case "geomap":
                AdminController.getUploadedMap(req, res);
                break;
        }

    },


    getParentsData: function (req, res) {
        var payload = { logged: true, type: "SUCCESS", parentsData: [], records: 0, paging: 0 };
        var records = req.param('records'), paging = req.param('paging');

        payload.paging = paging;
        records = parseInt(records), paging = parseInt(paging);
        if (paging != 1) {
            paging = (paging - 1) * records;
            rdi.sendNativeQuery('SELECT a.parentId, a.email, a.image, a.contact, a.fullName, a.address, a.stopId, a.createdOn, '
                + '(SELECT count(*) FROM students WHERE parentId = a.parentId) as studentsCount,'
                + '(SELECT count(DISTINCT(b.tripId)) FROM tripstudents b INNER JOIN students c ON b.studentId = c.studentId WHERE c.parentId = a.parentId) '
                + 'as tripsCount, (SELECT count(*) FROM parents) as totalResults '
                + 'FROM parents a LIMIT $1 OFFSET $2', [records, paging], (err, results) => {
                    payload.parentsData = results.rows;
                    payload.records = records;
                    res.view('pages/parents', payload);
                })
        } else {
            rdi.sendNativeQuery('SELECT a.parentId, a.email, a.image, a.contact, a.fullName, a.address, a.stopId, a.createdOn, '
                + '(SELECT count(*) FROM students WHERE parentId = a.parentId) as studentsCount,'
                + '(SELECT count(DISTINCT(b.tripId)) FROM tripstudents b INNER JOIN students c ON b.studentId = c.studentId WHERE c.parentId = a.parentId) '
                + 'as tripsCount, (SELECT count(*) FROM parents) as totalResults '
                + 'FROM parents a LIMIT $1', [records], (err, results) => {
                    payload.parentsData = results.rows;
                    payload.records = records;
                    res.view('pages/parents', payload);
                })
        }

    },



    getStudentsData: function (req, res) {
        var payload = { logged: true, type: "SUCCESS", parentsData: [], records: 0, paging: 0 };
        var records = req.param('records'), paging = req.param('paging');

        payload.paging = paging;
        records = parseInt(records), paging = parseInt(paging);
        if (paging != 1) {
            paging = (paging - 1) * records;
            rdi.sendNativeQuery('SELECT a.studentId, a.grade, a.fullName, a.email, a.schoolName, a.createdOn, b.fullName as parentName, b.image,b.email as parentEmail, '
                + '(SELECT count(DISTINCT(b.tripId)) FROM tripstudents b INNER JOIN students c ON b.studentId = c.studentId WHERE c.studentId = a.studentId) as tripsCount, '
                + '(SELECT count(DISTINCT(b.tripId)) FROM tripstudents b INNER JOIN students c ON b.studentId = c.studentId WHERE c.parentId = a.parentId) ,'
                + '(SELECT count(*) FROM students) as totalResults FROM students a '
                + 'LEFT JOIN parents b ON a.parentId = b.parentId LIMIT $1 OFFSET $2', [records, paging], (err, results) => {
                    payload.parentsData = results.rows;
                    payload.records = records;
                    res.view('pages/student', payload);
                })
        } else {
            rdi.sendNativeQuery('SELECT a.studentId, a.grade, a.fullName, a.email, a.schoolName, a.createdOn, b.fullName as parentName, b.image,b.email as parentEmail, '
                + '(SELECT count(DISTINCT(b.tripId)) FROM tripstudents b INNER JOIN students c ON b.studentId = c.studentId WHERE c.studentId = a.studentId) as tripsCount, '
                + '(SELECT count(DISTINCT(b.tripId)) FROM tripstudents b INNER JOIN students c ON b.studentId = c.studentId WHERE c.parentId = a.parentId), '
                + '(SELECT count(*) FROM students) as totalResults FROM students a '
                + 'LEFT JOIN parents b ON a.parentId = b.parentId LIMIT $1', [records], (err, results) => {
                    payload.parentsData = results.rows;
                    payload.records = records;
                    res.view('pages/student', payload);
                })
        }

    },


    getTripsData: function (req, res) {
        var payload = { logged: true, type: "SUCCESS", parentsData: [], records: 0, paging: 0 };
        var records = req.param('records'), paging = req.param('paging');

        payload.paging = paging;
        records = parseInt(records), paging = parseInt(paging);
        if (paging != 1) {
            paging = (paging - 1) * records;
            rdi.sendNativeQuery('SELECT a.*, b.fullName, (SELECT count(*) FROM tripstudents WHERE tripId = a.tripId) as studentsCount, '
                + '(SELECT count(*) FROM trips WHERE status = $3) as totalResults '
                + 'FROM trips a LEFT JOIN parents b ON a.supervisorId = b.parentId '
                + 'WHERE status = $3 LIMIT $1 OFFSET $2', [records, paging, "TRIP_COMPLETED"], (err, results) => {
                    payload.parentsData = results.rows;
                    payload.records = records;
                    res.view('pages/trips', payload);
                })
        } else {
            rdi.sendNativeQuery('SELECT a.*, b.fullName, (SELECT count(*) FROM tripstudents WHERE tripId = a.tripId) as studentsCount, '
                + '(SELECT count(*) FROM trips WHERE status = $2) as totalResults '
                + 'FROM trips a LEFT JOIN parents b ON a.supervisorId = b.parentId '
                + 'WHERE status = $2 LIMIT $1', [records, "TRIP_COMPLETED"], (err, results) => {
                    payload.parentsData = results.rows;
                    payload.records = records;
                    res.view('pages/trips', payload);
                })
        }

    },


    getEmailList: function (req, res) {
        var payload = { logged: true, type: "SUCCESS", parentsData: [], records: 0, paging: 0 };
        var records = req.param('records'), paging = req.param('paging');

        payload.paging = paging;
        records = parseInt(records), paging = parseInt(paging);
        if (paging != 1) {
            paging = (paging - 1) * records;
            rdi.sendNativeQuery('SELECT a.*, b.fullName, b.parentId,  (SELECT count(*) FROM approvedparentlist) as totalResults '
                + 'FROM approvedparentlist a '
                + 'LEFT JOIN parents b on a.email = b.email LIMIT $1 OFFSET $2', [records, paging], (err, results) => {
                    payload.parentsData = results.rows;
                    payload.records = records;
                    res.view('pages/supervisoremail', payload);
                })
        } else {
            rdi.sendNativeQuery('SELECT a.*, b.fullName, b.parentId, (SELECT count(*) FROM approvedparentlist) as totalResults '
                + 'FROM approvedparentlist a '
                + 'LEFT JOIN parents b on a.email = b.email LIMIT $1', [records], (err, results) => {
                    payload.parentsData = results.rows;
                    payload.records = records;
                    res.view('pages/supervisoremail', payload);
                })
        }
    },


    uploadApprovedEmails: function (req, res) {
        var data = req.body; data = data.data;
        req.params.records = '10'; req.params.paging = '1';
        data.forEach(element => {
            ApprovedParentList.findOrCreate({ email: element.Email }, { email: element.Email, active: 0, modifiedOn: new Date() }).exec((err, model) => {
                console.log(err);
            });
        });
        res.ok({ type: "SUCCESS" });

    },


    getUploadedMap: function (req, res) {
        var payload = { logged: true, type: "SUCCESS", parentsData: [], records: 0, paging: 0 };
        var records = req.param('records'), paging = req.param('paging');

        payload.paging = paging;
        records = parseInt(records), paging = parseInt(paging);
        if (paging != 1) {
            paging = (paging - 1) * records;
            rdi.sendNativeQuery('SELECT a.routeId, a.name, a.startLocation, a.endLocation, a.isActive, a.createdOn, versionNo,'
                + '(SELECT count(*) FROM stops WHERE routeId = a.routeId) as totalStops, (SELECT count(*) FROM routes '
                + 'WHERE versionNo = (SELECT versionNo FROM mapversions ORDER by id DESC LIMIT 1)) as totalResults '
                + 'FROM routes a WHERE a.versionNo = (SELECT versionNo FROM mapversions ORDER by id DESC LIMIT 1) LIMIT $1 OFFSET $2', [records, paging], (err, results) => {
                    payload.parentsData = results.rows;
                    payload.records = records;
                    res.view('pages/uploadgis', payload);
                })
        } else {
            rdi.sendNativeQuery('SELECT a.routeId, a.name, a.startLocation, a.endLocation, a.isActive, a.createdOn, versionNo,'
                + '(SELECT count(*) FROM stops WHERE routeId = a.routeId) as totalStops, (SELECT count(*) FROM routes '
                + 'WHERE versionNo = (SELECT versionNo FROM mapversions ORDER by id DESC LIMIT 1)) as totalResults '
                + 'FROM routes a WHERE a.versionNo = (SELECT versionNo FROM mapversions ORDER by id DESC LIMIT 1) LIMIT $1', [records], (err, results) => {
                    payload.parentsData = results.rows;
                    payload.records = records;
                    res.view('pages/uploadgis', payload);
                })
        }
    },


    tripDetails: function (req, res) {
        var payload = { logged: true, type: "SUCCESS", parentsData: [], tripId: 0, tripStatus: [] };
        var tripId = req.param('tripId'); payload.tripId = tripId;

        Trips.find({ select: ['longitude', 'latitude', 'status', 'dueOn'], where: { id: tripId } }).exec(function (err2, model) {
            payload.tripStatus = model[0];
            rdi.sendNativeQuery('SELECT a.*, b.fullName as studentName, b.grade as studentGrade, c.contact, c.fullName as parentName,'
                + 'd.name as stopName, d.location as stopLocation '
                + 'FROM tripstudents a '
                + 'INNER JOIN students b ON a.studentId = b.studentId '
                + 'INNER JOIN parents c ON b.parentId = c.parentId '
                + 'INNER JOIN stops d ON a.stopId = d.stopId '
                + 'WHERE a.tripId = $1 ORDER by a.pickupCount', [tripId], (err, results) => {
                    payload.parentsData = results.rows;
                    res.view('pages/tripdetail', payload);
                })
        })
    }
};
module.exports = AdminController;

