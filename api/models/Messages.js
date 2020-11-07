/**
 * Messages.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    id: {
      type: 'number',
      columnName: 'messageId',
      unique: "true",
      autoIncrement: true
    },
    groupId: { type: 'number' },
    senderId: { type: "string" },
    message: { type: 'string' },
    status: { type: 'string' },
    createdOn: { type: 'ref', columnType: 'datetime' }

  },

};

