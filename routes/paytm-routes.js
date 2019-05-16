//const userService = require('../services/user-services');
var checksum = require("../defaultConfig/checksum");

function init(router) {
    router.route('/request')
        .get(getRequest)
    router.route('/request/post')
        .get(request)
    router.route('/response')
        .post(response)

}

function getRequest(req, res) {
    res.render("paytm/index");
}
function request(req, res) {
    var paramlist = req.query;
    var paramarray = new Array();
    for (name in paramlist) {
        if (name == "PAYTM_MERCHANT_KEY") {
            var PAYTM_MERCHANT_KEY = paramlist[name];
        } else {
            paramarray[name] = paramlist[name];
        }
    }
    paramarray["CALLBACK_URL"] = "http://localhost:3000/api/response";
    checksum.genchecksum(paramarray, PAYTM_MERCHANT_KEY, (err, result) => {
        if (err) throw err;
        res.render("paytm/request", { result });
    });
}

function response(req, res) {
    console.log(req.query);
    if (req.body.RESPCODE === "01") {
        res.render("paytm/response", {
            status: true,
            result: JSON.stringify(req.body)
        });
    } else {
        res.render("paytm/response", {
            status: false,
            result: JSON.stringify(req.body)
        });
    }

}

module.exports.init = init;