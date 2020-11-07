/**
 * StudentsController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

module.exports = {

    create: function (req, res) {
        var params = req.body;
        params.createdOn = new Date();

        Students.create(params).exec(function (err, created) {
            console.log(created, err);

            Students.find({ where: { parentId: params.parentId } }).exec(function (err, model) {
                return Utils.formatResponse("SUCCESS", "Student Registered", model, res);
            });
        });
    },

    getStudents: function (req, res) {
        Students.find({ where: { parentId: req.options.parentId } }).exec(function (err, model) {
            return Utils.formatResponse("SUCCESS", "Student Registered", model, res);
        });
    },

    deleteStudent: function (req, res) {
        var params = req.options.data;

        Tripstudents.destroy({ studentId: params.studentId }).exec(function (err, model) { });
        Groupstudents.destroy({ studentId: params.studentId }).exec(function (err, model) {
            Students.destroy({ id: params.studentId }).exec(function (err, model) {
                console.log(err);
                console.log(model);
             });
            Utils.formatResponse("SUCCESS", "Student deleted", 0, res)
        });
    },


    editStudent: function (req, res) {
        var params = req.body, studentId = req.param('studentId');

        Students.update({ where: { id: studentId } }).set(params).exec(function (err, model) { 
            Utils.formatResponse("SUCCESS", "Student Registered", params, res);
        });
    }

};

