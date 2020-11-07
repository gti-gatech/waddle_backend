
module.exports = async function (req, res, proceed) {

    var data = req.body;
    var authToken = req.headers.authtoken, studentId = req.param('studentId');
    if (!data.hasOwnProperty("email") || !data.hasOwnProperty("fullName")
        || !data.hasOwnProperty("image") || !data.hasOwnProperty("schoolName")
        || !data.hasOwnProperty("grade") || authToken == undefined || studentId == undefined
    ) {
        return Utils.formatResponse("ERR", "Invalid Params", 0, res);
    }


    Utils.verifyJWT(authToken, res).then((data) => {
        if (data.hasOwnProperty("params")) {
            req.body.parentId = data.params.parentId;
            return proceed();
        } else
            return Utils.formatResponse("ERR", "Invalid Params", 0, res);
    });



};