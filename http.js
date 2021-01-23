var express = require("express");
var sensorRoutes = require("./routes/sensors");
var cors = require('cors');

var webapp = express();

webapp.set("view engine", "ejs");

webapp.use(cors());
webapp.use('/', sensorRoutes);
webapp.use(express.static(__dirname+'/public'));

module.exports = webapp;

