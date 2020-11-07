/**
 * Stops.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    id: { 
      type: 'number',  
      columnName : 'stopId',
      unique:"true",
      autoIncrement: true
     },
 routeId: {type: 'number'},
 name: {type: "string", required : true},
 location: {type: 'string'},
 createdOn: {type: 'ref', columnType: 'datetime'},
}

};

