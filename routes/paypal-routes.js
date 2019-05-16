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

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
        "AQQxbjKbMaZv_0J4NLpFpAOMDSgMaEMolPe05AE9KEfEdNLoIGeYsttaqb4zmzzIAWu4CtZRj4RrKC9d",
    client_secret:
        "EO-OyPEV0idwNHEUtopXq-rzRXRDIZnLC16UlfDNIGgZHxixkqveP4Au_ZQQ9CYq0v5_nXy3mW3vp_kN"
});

function getIndex(req, res) {
    let data = req.query;
    res.render("index", { data: JSON.stringify({ "state": "index" }) });
}

function createPaypalPayment(req, res) {
    let data = req.query;
    var create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal"
        },
        redirect_urls: {
            return_url: "http://172.30.13.126:3000/api/success",
            cancel_url: "http://172.30.13.126:3000/api/cancel"
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: "item",
                            sku: "item",
                            price: "1.00",
                            currency: "USD",
                            quantity: 1
                        }
                    ]
                },
                amount: {
                    currency: "USD",
                    total: "1.00"
                },
                description: "This is the payment description."
            }
        ]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
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
        transactions: [
            {
                amount: {
                    currency: "USD",
                    total: "1.00"
                }
            }
        ]
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