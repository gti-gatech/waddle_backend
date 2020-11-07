module.exports = async function (req, res, proceed) {
   
    var data = req.body;
    if(!data.hasOwnProperty("email") || !data.hasOwnProperty("fullName")
        || !data.hasOwnProperty("password") || !data.hasOwnProperty("contact")
        || !data.hasOwnProperty("stopId") || !data.hasOwnProperty("deviceToken")
       ){
        return Utils.formatResponse("ERR", "Invalid Params", 0, res);
    }
  
     return proceed();
  
  };