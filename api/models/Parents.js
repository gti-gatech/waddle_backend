/**
 * Parents.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {
  attributes: {
    id: { 
      type: 'string',  
      columnName : 'parentId',
      required : true,
      unique:"true"
     },
  //  parentId: {type:"string", unique: true, required: true, },
   fullName: {type: "string", required : true},
   stopId: {type:"number", required: true},
   email: {type: "string", required : true},
   contact: {type: "string"},
   image: {type: "string"},
   createdOn: {type: 'ref', columnType: 'datetime'},
   modifiedOn: {type: 'ref', columnType: 'datetime'},
   totalStudents: {type: "number"},
   totalTrips: {type: "number"},
   password: {type:"string", required: true},
   address: {type:"string", required: true},
   deviceToken: {type:"string"},
   otpVerified: {type: "number"}
  },

};





