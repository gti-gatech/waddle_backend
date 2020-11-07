/**
 * Routes.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
      id: { 
        type: 'number',  
        columnName : 'routeId',
        unique:"true",
        autoIncrement: true
       },
   name: {type: "string", required : true},
   totalStops: {type: 'number'},
   startLocation: {type: 'string'},
   endLocation: {type: 'string'},
   createdOn: {type: 'ref', columnType: 'datetime'},
   isActive: {type: 'number'},
   versionNo: {type: 'number'}
  }

};

