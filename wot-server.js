var http = require("./http");
var resources = require("./resources/model");

var server = http.listen(resources.pi.port, function () {
        console.log("WOT is up and running on port %s", resources.pi.port);
});

