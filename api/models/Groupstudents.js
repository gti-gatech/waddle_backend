/**
 * Groupstudents.js
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
      groupId: { type: 'number' },
      stopId: { type: 'number' },
      studentId: { type: 'number' },
      isActive: { type: 'number' },
      createdOn: { type: 'ref', columnType: 'datetime' }
    
  },

};

