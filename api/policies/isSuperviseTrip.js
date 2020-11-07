
module.exports = async function (req, res, proceed) {

    var authToken = req.headers.authtoken;
    var tripId = req.param('tripId');
    if (authToken == undefined)
        return Utils.formatResponse("ERR", "Invalid Params", 0, res);



    Utils.verifyJWT(authToken, res).then((data) => {
        if (data.hasOwnProperty("params")) {
            req.options.data = {};
            req.options.data.parentId = data.params.parentId
            req.options.data.tripId = tripId;
            return proceed();
        } else
            return Utils.formatResponse("ERR", "Invalid Params", 0, res);
    });



};