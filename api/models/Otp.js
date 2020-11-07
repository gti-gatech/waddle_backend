/**
 * Otp.js
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
    email: { type: 'string' },
    otp: { type: "string" },
    verified : {type: "number"}
  },

};

