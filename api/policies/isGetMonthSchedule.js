module.exports = async function (req, res, proceed) {

    var month = req.param('month'), year = req.param('year'), isSupervisor = req.param('isSupervisor');
    var authToken = req.headers.authtoken;
    if (month == undefined || isSupervisor == undefined
        || year == undefined || authToken == undefined
    ) {
        return Utils.formatResponse("ERR", "Invalid Params", 0, res);
    }


    Utils.verifyJWT(authToken, res).then((data) => {
        if (data.hasOwnProperty("params")) {      
            req.options.data = {};
            req.options.data.parentId = data.params.parentId;
            req.options.data.month = month;
            req.options.data.year = year;
            req.options.data.isSupervisor = isSupervisor;
            return proceed();
        } else
            return Utils.formatResponse("ERR", "Invalid Params", 0, res);
    });

};