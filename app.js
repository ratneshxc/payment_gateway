const express = require("express");
const bodyParser = require("body-parser");
const engines = require("consolidate");
const paypalRoute = require("./routes/paypal-routes");
const paytmRoute = require("./routes/paytm-routes");

const app = express();
var Router = express.Router();
app.use('/api', Router);

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

paypalRoute.init(Router);
paytmRoute.init(Router);

app.use(
    "/api",
    require("./route-groups")
);
app.listen(process.env.PORT || 3000, function () {
    console.log("Server is running");
});