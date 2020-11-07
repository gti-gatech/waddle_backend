/**
 * MessagesController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

var rdi = sails.getDatastore('mysql');
var MessagesController = {

    getMessageGroups: function (req, res) {
        var parentId = req.options.parentId;

        rdi.sendNativeQuery('SELECT distinct a.groupId, b.groupName, b.routeId, b.image , (SELECT count(*) FROM messages WHERE groupId = a.groupId AND senderId != $1 AND messageId > (SELECT messageId FROM messagereaders WHERE groupId = a.groupId '
            + 'AND parentId = $1 ORDER BY id DESC LIMIT 1)) as totalUnRead,'
            + 'IFNULL(e.messageId,0) as messageId, IFNULL(e.message, "") as message, IFNULL(e.senderId, "") as senderId, IFNULL(e.createdOn, "") as createdOn, IFNULL(f.fullName, "") as senderName '
            + 'FROM groupstudents a '
            + 'INNER JOIN groups b ON a.groupId = b.groupId '
            + 'INNER JOIN students c ON a.studentId = c.studentId '
            + 'LEFT JOIN messages e ON a.groupId = e.groupId AND messageId = (SELECT messageId FROM messages WHERE groupId = a.groupId ORDER BY messageId DESC LIMIT 1) '
            + 'LEFT JOIN parents f ON e.senderId = f.parentId '
            + 'WHERE c.parentId = $1 ORDER BY e.createdOn DESC', [parentId], function (err, result) {
                res.ok({ type: "My Messages", message: "My Messages List with latest message.", data: result.rows });
            })
    },


    getGroupMessages: function (req, res) {
        var data = req.options.data;
        rdi.sendNativeQuery('SELECT a.*, b.fullName as senderName '
            + 'FROM messages a '
            + 'LEFT JOIN parents b ON a.senderId = b.parentId WHERE a.groupId = $1', [data.groupId], function (err, result) {
                res.ok({ type: "Group Messages", message: "Group Messages", data: result.rows });
            })
    },

    addMessage: function (req, res) {
        var data = req.body, date = new Date(), offset = -240;
        date = new Date(date.getTime() + offset * 60 * 1000);
        console.log("RECEIVED: " + JSON.stringify(data));
        Messages.create({ groupId: data.groupId, senderId: data.parentId, status: "DELIVERED", message: data.message, createdOn: date }).exec((err, created) => {
            console.log(err);
            rdi.sendNativeQuery('SELECT a.*, b.fullName FROM messages a LEFT JOIN parents b ON a.senderId = b.parentId WHERE a.groupId = $1 AND a.senderId = $2 ORDER BY a.messageId DESC LIMIT 1',
                [data.groupId, data.parentId], (err, results) => {
                    console.log(err);
                    MessagesController.sendMessageNotification(results.rows[0]);
                    res.ok({ type: "New message", data: results.rows[0] })
                })
        })
    },

    readMessage: function (req, res) {
        var data = req.body;
        Messagereaders.findOrCreate(data, data).exec(function (err, created) {
            res.ok({ type: "Read Message", data });
        });
    },

    sendMessageNotification: function (data) {
        rdi.sendNativeQuery('SELECT DISTINCT b.parentId, c.deviceToken , d.groupName '
            + 'FROM groupstudents a '
            + 'INNER JOIN students b ON a.studentId = b.studentId AND b.parentId != $2 '
            + 'INNER JOIN parents c ON b.parentId = c.parentId '
            + 'LEFT JOIN groups d ON a.groupId = d.groupId '
            + 'WHERE a.groupId = $1', [data.groupId, data.senderId], (err, results2) => {
                // console.log(results2.rows);
                if (results2.rows.length > 0) {
                    results2.rows.forEach(element => {
                        data.groupName = element.groupName;
                        data.parentId = element.parentId;
                        // console.log(element.parentId, data.senderId);
                        PushNotifications.createPlatformEndpoint(element.deviceToken, "NEW MESSAGE", data);
                    });
                }
            })

    }

};
module.exports = MessagesController;


 // 'SELECT distinct a.groupId, a.groupName, a.routeId, a.image,'
            // + 'IFNULL(e.messageId,0) as messageId, IFNULL(e.message, "") as message, IFNULL(e.senderId, "") as senderId, IFNULL(e.createdOn, "") as createdOn, IFNULL(f.fullName, "") as senderName '
            // + 'FROM groups a '
            // + 'INNER JOIN groupstudents c ON a.groupId = c.groupId '
            // + 'LEFT JOIN trips b ON a.groupId = b.groupId '
            // + 'INNER JOIN students d ON c.studentId = d.studentId '
            // + 'LEFT JOIN messages e ON a.groupId = (SELECT groupId FROM messages WHERE groupId = a.groupId ORDER BY messageId DESC LIMIT 1) '
            // + 'LEFT JOIN parents f ON e.senderId = f.parentId '
            // + 'WHERE d.parentId = $1 '
            // + 'UNION '
            // + 'SELECT distinct a.groupId, a.groupName, a.routeId, a.image, '
            // + 'IFNULL(e.messageId,0) as messageId, IFNULL(e.message, "") as message, IFNULL(e.senderId, "") as senderId, IFNULL(e.createdOn, "") as createdOn, IFNULL(f.fullName, "") as senderName '
            // + 'FROM groups a '
            // + 'LEFT JOIN trips b ON a.groupId = b.groupId '
            // + 'LEFT JOIN messages e ON a.groupId = (SELECT groupId FROM messages WHERE groupId = a.groupId ORDER BY messageId DESC LIMIT 1) '
            // + 'LEFT JOIN parents f ON e.senderId = f.parentId '
            // + 'WHERE b.supervisorId = $1 ', 