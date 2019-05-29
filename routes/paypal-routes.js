//const userService = require('../services/user-services');
const paypal = require("paypal-rest-sdk");

function init(router) {
    router.route('/index')
        .get(getIndex);
    router.route('/paypal')
        .get(createPaypalPayment);
    router.route('/cancel')
        .get(cancelPayment);
    router.route('/success')
        .get(successPayment);
}


// first config for paypal
let pratian_config = {
    mode: "sandbox", //sandbox or live
    client_id:
        "AQQxbjKbMaZv_0J4NLpFpAOMDSgMaEMolPe05AE9KEfEdNLoIGeYsttaqb4zmzzIAWu4CtZRj4RrKC9d",
    client_secret:
        "EO-OyPEV0idwNHEUtopXq-rzRXRDIZnLC16UlfDNIGgZHxixkqveP4Au_ZQQ9CYq0v5_nXy3mW3vp_kN"
};

let second_config = {
    'mode': 'sandbox',
    'client_id': 'AcXY99JKy-lM8uuRzCfr9NZaOAEqQxrFs-Xyyl0aa8zzqiFd8KT95BnYl3IDIalS_1EzFvfpEVDNuQ35',
    'client_secret': 'EHzRSxERHCg_U0p7dAUNGbu2nQLcIsv7W7t9adHWGiuGZ8Xeou-tl4sR0eN8rnLD5dR7osBTrQUEsFcT'
};


function getPaypalConfig(merchant_id) {
    switch (merchant_id) {
        case "P_01":
            paypal.configure(pratian_config);
            break;
        case "P_02":
            paypal.configure(second_config);
            break;
        default:
            paypal.configure(pratian_config);
    }
}

function getIndex(req, res) {
    let data = req.query;
    res.render("index", { data: JSON.stringify({ "state": "index" }) });
}

async function createPaypalPayment(req, res) {
    await getPaypalConfig(req.query.merchant_id);
    var create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal"
        },
        redirect_urls: {
            return_url: "https://pratiangateway.herokuapp.com/api/success",
            cancel_url: "https://pratiangateway.herokuapp.com/api/cancel"
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: req.query.item_name,
                            sku: req.query.item_name,
                            price: req.query.item_price,
                            currency: req.query.currency,
                            quantity: req.query.item_quantity
                        }
                    ]
                },
                amount: {
                    currency: req.query.currency,
                    total: req.query.item_price
                },
                description: req.query.item_description
            }
        ]
    };

   await paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            console.log("error-paypal", error);
            //throw error;
        } else {
            console.log("Create Payment Response");
            console.log(payment);
            res.redirect(payment.links[1].href);
        }
    });
}


function cancelPayment(req, res) {
    res.render("cancel", { data: JSON.stringify({ "state": "cancel" }) });
}

function successPayment(req, res) {
    // res.send("Success");
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        payer_id: PayerID,
        // transactions: [
        //     {
        //         amount: {
        //             currency: "USD",
        //             total: "1.00"
        //         }
        //     }
        //]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (
        error,
        payment
    ) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                console.log("Get Payment Response");
                console.log(JSON.stringify(payment));
                res.render("success", { data: JSON.stringify(payment) });
            }
    });
}

module.exports.init = init;