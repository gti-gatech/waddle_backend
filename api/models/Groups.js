/**
 * Groups.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    id: {
      type: 'number',
      columnName: 'groupId',
      unique: "true",
      autoIncrement: true
    },
    groupName: { type: "string", required: true },
    routeId: { type: 'number' },
    image: { type: 'string' },
    totalStudents: { type: 'number' },
    totalTrips: { type: 'number' },
    createdOn: { type: 'ref', columnType: 'datetime' },
    createdBy: { type: 'string' },
  }

};

