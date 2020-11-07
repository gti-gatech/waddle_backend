/**
 * Policy Mappings
 * (sails.config.policies)
 *
 * Policies are simple functions which run **before** your actions.
 *
 * For more information on configuring policies, check out:
 * https://sailsjs.com/docs/concepts/policies
 */

module.exports.policies = {

  /***************************************************************************
  *                                                                          *
  * Default policy for all controllers and actions, unless overridden.       *
  * (`true` allows public access)                                            *
  *                                                                          *
  ***************************************************************************/
  ParentsController: {
    register: 'isRegisterParams',
    login: 'isLoginParams',
    updateProfile: 'isUpdateProfile',
    homePage: 'isGetStudents',
    getNotifications: 'isGetStudents',
    markNotifications: 'isMarkNotifications',
    verifyOtp: 'isVerifyOtp',
    logout: 'isGetStudents'
  },

  StudentsController: {
    create: 'isStudentParams',
    getStudents: 'isGetStudents',
    deleteStudent: 'isDeleteStudent'
  },

  GroupsController: {
    joinGroup: 'isJoinGroupParams',
    getGroups: 'isGetStudents',
    getGroupDetails: 'isGroupDetails',
    editGroup: 'isEditGroup',
    superviseTrip: 'isSuperviseTrip',
    withdrawSupervisor: 'isSuperviseTrip',
    leaveGroup: 'isGroupDetails',
    // getTripMap: 'isSuperviseTrip'
  },

  ScheduleController: {
    createSchedule: 'isCreateSchedule',
    getSchedule: 'isGetSchedule',
    deleteSchedule: 'isDeleteSchedule',
    editSchedule: 'isEditSchedule',
    getMonthScheduleDates: 'isGetMonthSchedule'
  },

  TripController: {
    getHistoryTrips: 'isGetStudents',
    startTrip: 'isSuperviseTrip',
    endTrip: 'isSuperviseTrip'
  },

  MessagesController: {
    getMessageGroups: 'isGetStudents',
    getGroupMessages: 'isGroupDetails',
  }

};
