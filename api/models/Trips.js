/**
 * Trips.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    id: {
      type: 'number',
      columnName: 'tripId',
      unique: "true",
      autoIncrement: true
    },
    groupId: { type: "number" },
    routeId: { type: "number"},
    isSupervised: { type: "number"},
    supervisorId: { type: 'string' },
    createdOn: {type: 'ref', columnType: 'datetime'},
    dueOn: {type: 'string'},
    completedOn: {type: 'ref', columnType: 'datetime'},
    startedOn: {type: 'ref', columnType: 'datetime'},
    status: { type: "string"},
    tripTime: {type: "string"},
    tripDate: {type: "string"},
    displayTime: {type: "string"},
    pickupStop: {type: "number", allowNull: true},
    longitude: {type: "string"},
    latitude: {type: "string"}
},

};

