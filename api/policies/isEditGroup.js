module.exports = async function (req, res, proceed) {

    var data = req.body;
    var authToken = req.headers.authtoken;
    if (!data.hasOwnProperty("groupId") || !data.hasOwnProperty("groupName")
        || !data.hasOwnProperty("image") || authToken == undefined
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