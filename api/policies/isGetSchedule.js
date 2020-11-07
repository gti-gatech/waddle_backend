module.exports = async function (req, res, proceed) {

    var date = req.param('date');
    var isSupervisor = req.param('isSupervisor');
    var authToken = req.headers.authtoken;
    if (date == undefined || isSupervisor == undefined
        || authToken == undefined
    ) {
        return Utils.formatResponse("ERR", "Invalid Params", 0, res);
    }


    Utils.verifyJWT(authToken, res).then((data) => {
        if (data.hasOwnProperty("params")) {      
            req.options.data = {};
            req.options.data.parentId = data.params.parentId;
            req.options.data.date = date;
            req.options.data.isSupervisor = isSupervisor;
            return proceed();
        } else
            return Utils.formatResponse("ERR", "Invalid Params", 0, res);
    });

};