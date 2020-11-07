/**
 * Notifications.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
      id: { 
        type: 'number',  
        columnName : 'notificationId',
        unique:"true",
        autoIncrement: true
       },
   parentId: {type: 'string'},
   hasActions: {type: "number"},
   message: {type: 'string'},
   payload: {type: 'string'},
   type: {type: 'string'},
   actions: {type: 'string'},
   status: {type: 'string'},
   dueOn: {type: 'ref', columnType: 'datetime'}
  },

};

