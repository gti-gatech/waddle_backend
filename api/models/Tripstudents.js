/**
 * Tripstudents.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    id: {
      type: 'number',
      unique: "true",
      autoIncrement: true
    },
    studentId: { type: "number" },
    tripId: { type: "number"},
    stopId: {type: "number"},
    status: { type: "string"},
    isActive: { type: 'number' },
    createdOn: {type: 'ref', columnType: 'datetime'},
    modifiedOn: {type: 'ref', columnType: 'datetime'},
    pickupCount: {type: 'number', allowNull: true}
},

};

