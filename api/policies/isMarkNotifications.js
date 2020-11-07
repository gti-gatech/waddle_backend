
module.exports = async function (req, res, proceed) {

    var authToken = req.headers.authtoken;
    var data = req.body;
    if (authToken == undefined || !data.hasOwnProperty("id"))
        return Utils.formatResponse("ERR", "Invalid Params", 0, res);



    Utils.verifyJWT(authToken, res).then((data) => {
        if (data.hasOwnProperty("params")) {
            req.body.parentId = data.params.parentId
            return proceed();
        } else
            return Utils.formatResponse("ERR", "Invalid Params", 0, res);
    });



};