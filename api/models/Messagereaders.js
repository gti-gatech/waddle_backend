/**
 * Messagereaders.js
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
    parentId: { type: "string" },
    messageId: { type: 'number' }
  },

};

