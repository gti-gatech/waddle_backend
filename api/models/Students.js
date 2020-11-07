/**
 * Students.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
    id: { 
      type: 'number',  
      columnName : 'studentId',
      unique:"true",
      autoIncrement: true
     },
   parentId: {type:"string"},
   fullName: {type: "string", required : true},
   email: {type: "string", required : true},
   createdOn: {type: 'ref', columnType: 'datetime'},
   grade: {type:'string'},
   image: {type: 'string'},
   schoolName: {type: 'string'}
  },

};

