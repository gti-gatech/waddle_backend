
module.exports = async function (req, res, proceed) {

    var data = req.body;
    if (!data.hasOwnProperty("email") || !data.hasOwnProperty("otp")) {
        return Utils.formatResponse("ERR", "Invalid Params", 0, res);
    }
    return proceed();

};