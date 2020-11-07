
module.exports = async function (req, res, proceed) {

    var authToken = req.headers.authtoken;
    if (authToken == undefined)
        return Utils.formatResponse("ERR", "Invalid Params", 0, res);



    Utils.verifyJWT(authToken, res).then((data) => {
        if (data.hasOwnProperty("params")) {
            req.options.parentId = data.params.parentId;
            return proceed();
        } else
            return Utils.formatResponse("ERR", "Invalid Params", 0, res);
    });



};