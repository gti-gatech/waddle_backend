/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes tell Sails what to do each time it receives a request.
 *
 * For more information on configuring custom routes, check out:
 * https://sailsjs.com/anatomy/config/routes-js
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` your home page.            *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/


  // Admin Web Routes
  'GET /': 'AdminController.redirectOrLogin',
  '/admin/dashboard': { view: 'pages/homepage' },

  // '/resetpassword/:uuid/:key': {view: 'pages/resetpassword'},
  '/admin/view/privacy': { view: 'pages/privacypolicy' },
  '/admin/view/terms': { view: 'pages/terms' },
  '/logout': 'AdminController.logout',
  '/admin/packet/:page/:records/:paging': 'AdminController.changePage',
  '/admin/tripdetail/:tripId': 'AdminController.tripDetails',
  '/resetpassword/:uuid/:key': 'ParentsController.checkResetLink',
  // '/admin/view/login': { view: 'pages/login' },


  // ADMIN APIS  '/logout': {}
  'POST /api/admin/login': 'AdminController.login',
  'POST /api/admin/uploadEmails': 'AdminController.uploadApprovedEmails',
  'POST /api/admin/uploadKML': 'AdminController.uploadKml',
  'POST /api/changePassword': 'ParentsController.changePassword',

  // APIs USER
  'post /api/parents/register': 'ParentsController.register',
  'post /api/parents/sendOTP': 'CommonController.sendVerificationOtp',
  'post /api/parents/verifyOTP': 'ParentsController.verifyOtp',
  'post /api/parents/login': 'ParentsController.login',
  'post /api/parents/passwordReset': 'ParentsController.passwordReset',
  'post /api/parents/updateProfile': 'ParentsController.updateProfile',
  'get /api/parents/homePage': 'ParentsController.homePage',
  'get /api/groups': 'GroupsController.getGroups',
  'get /api/groups/details/:groupId': 'GroupsController.getGroupDetails',
  'post /api/group/edit': 'GroupsController.editGroup',
  'get /api/parents/notifications': 'ParentsController.getNotifications',
  'post /api/parents/markNotificationRead': 'ParentsController.markNotifications',
  'get /api/parents/logout': 'ParentsController.logout',

  // STUDENTS
  'post /api/students/add': 'StudentsController.create',
  'get /api/students/': 'StudentsController.getStudents',
  'delete /api/students/:studentId': 'StudentsController.deleteStudent',
  'post /api/student/edit/:studentId': 'StudentsController.editStudent',

  // Groups
  'post /api/group/joinGroup': 'GroupsController.joinGroup',
  'put /api/group/superviseTrip/:tripId': 'GroupsController.superviseTrip',
  'delete /api/group/withdrawSupervisor/:tripId': 'GroupsController.withdrawSupervisor',
  'post /api/group/leave/:groupId': 'GroupsController.leaveGroup',
  'get /api/group/tripMap/:tripId': 'GroupsController.getTripMap',


  // SCHEDULE
  'post /api/schedule/create': 'ScheduleController.createSchedule',
  'get /api/schedule/:date/:isSupervisor': 'Schedule.getSchedule',
  'delete /api/schedule/': 'Schedule.deleteSchedule',
  'post /api/schedule/edit': 'Schedule.editSchedule',
  'get /api/schedule/byMonth/:month/:year/:isSupervisor': 'Schedule.getMonthScheduleDates',

  // COMMON
  'get /api/common/stops': 'CommonController.getStops',
  'get /api/common/groups': 'CommonController.getGroups',
  'get /api/common/routeStops/:routeId': 'CommonController.getRouteStops',
  'post /api/common/uploadMedia': 'CommonController.uploadFile',
  'patch /api/common/updatePickupStreamline/:tripId': 'CommonController.updatePickupStreamline',
  'patch /api/common/pushNotification/:email': 'CommonController.sendTestPush',
  'post /api/cron/supervisorNotification': 'CronController.sendTestSupervisorTripNotification',
  'post /api/cron/upcomingSupervisorNotification': 'CronController.checkUpcomingSupervisedTrip',

  // Trips
  'get /api/trips/history': 'TripController.getHistoryTrips',
  'put /api/trips/start/:tripId': 'TripController.startTrip',
  'put /api/trips/end/:tripId': 'TripController.endTrip',

  // Messages
  'get /api/messages/list': 'MessagesController.getMessageGroups',
  'get /api/messages/:groupId': 'MessagesController.getGroupMessages',
  'post /api/messages/add': 'MessagesController.addMessage',
  'post /api/messages/read': 'MessagesController.readMessage',

  // CRONS
  'get /api/cron/uploadTrips': 'CronController.periodicalTripsCreation',

  // SOCKET VIEW
  '/socketConnections': { view: 'pages/socket/connections' },
  'post /socket/parents/updateLocation': 'ParentsController.updateLocation',
  'post /socket/trip/markPresent': 'TripController.markStudentStatus'

  /***************************************************************************
  *                                                                          *
  * More custom routes here...                                               *
  * (See https://sailsjs.com/config/routes for examples.)                    *
  *                                                                          *
  * If a request to a URL doesn't match any of the routes in this file, it   *
  * is matched against "shadow routes" (e.g. blueprint routes).  If it does  *
  * not match any of those, it is matched against static assets.             *
  *                                                                          *
  ***************************************************************************/


};
