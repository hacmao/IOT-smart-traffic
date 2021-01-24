const express = require("express");
const router = express.Router();
const resources = require("../resources/model");
const bodyParser = require('body-parser');
const mqtt = require('mqtt');
const sleep = require('sleep');
const fs = require('fs');
const db = require("../database/db.js");
const net = require("net");
const WebSocket = require('ws');
const config = require('config');

var camera_active = {};

db.all("select * from camera", [], (err, rows) => {
    rows.forEach((row) => {
        token = row.camera_token; 
        camera_active[token] = {
            "id": Object.keys(camera_active).length,
            "x" : row.x, 
            "y" : row.y, 
            "active" : false, 
            'color': "#bbb", 
            'count': 0,
            'ip' : row.ip, 
        };
    });
});

var s_traffic = {
    0 : "#bbb", 
    1 : "#2dc937", 
    2 : "#99c140", 
    3 : "#e7b416",
    4 : "#db7b2b",
    5 : "#cc3232"
};

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
    extended: true 
}));

var client = mqtt.connect(config.get("hiveMQ"));

client.on('connect', () => {
    var topic = config.get("topic");
    for (i=0; i<topic.length; i++) {
        client.subscribe(topic, (err) => {
            if (err) throw err;
        });
    }
});

// camera authentication
function cam_auth(cam_token) {
    var client = new net.Socket();
    client.connect(8888, camera_active[cam_token]['ip'], function() {
        console.log('Connected');
        client.write(cam_token);
    });
    
    client.on('data', function(data) {
        data = data.toString();
        console.log('Received: ' + data.charCodeAt(0));
        client.destroy(); // kill client after server's response
        if (data[0] == '\x01') {
            camera_active[cam_token]['auth'] = true;
        }
    });

}

client.on('message', (topic, message) => {
    var message = message.toString();
    switch (topic) {
        case "camera-KSTN/login" : 
            cam_token = message; 
            if (camera_active[cam_token]) {
                camera_active[cam_token]['active'] = true;
                camera_active[cam_token]['color'] = s_traffic[1];
                camera_active[cam_token]['count'] = 0; 
                console.log("Cam " + message + " is connected.");
                client.publish("camera-KSTN/" + message, "OK"); 

                wsBroadcast(JSON.stringify({"cmd" : "NEW_CONNECT", "token" : message}));

                // authenticate camera
                cam_auth(cam_token);
            }
            break;

        case "camera-KSTN/logout" : 
            if (camera_active[message]) {
                camera_active[message]['active'] = false;
                camera_active[message]['color'] = s_traffic[0]; 
                camera_active[message]['count'] = 0; 
                console.log("Cam " + message + " is disconnected.");
            }
            break; 

        case "camera-KSTN/image" :  
            try {
                var msg_json = JSON.parse(message);
                var cam_id = msg_json['token']; 
                if (camera_active[cam_id])
                    camera_active[cam_id]['image'] = msg_json['image'];
            }
            catch (error) {
                console.log(error); 
            }
            break; 

        case "camera-KSTN/data" : 
            try {
                var msg_json = JSON.parse(message); 
                var cam_id = msg_json['token']; 
                if (camera_active[cam_id]) {
                    camera_active[cam_id]['active'] = true; 
                    camera_active[cam_id]['color'] = s_traffic[msg_json['status']]; 
                    camera_active[cam_id]['count'] = msg_json['count']; 
                }
            }
            catch (err) {
                console.log(err); 
            }
    }
});

// [********] Create websocket data server
const wss = new WebSocket.Server({ port: 8888 });

function wsBroadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
} 

function health_check() {
    var msg = {"cmd": "HEALTH_INFO", "cam" : JSON.stringify(camera_active)};
    wsBroadcast(JSON.stringify(msg));
}

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(data) {
        if (data == "HEALTH_CHECK") {
            health_check();
        } else {
            try {
                data_json = JSON.parse(data);
                if(data_json['cmd'] == "IMAGE") {
                    wsBroadcast(data);
                }
            } catch (err) {
                console.log(err);
                return;
            }
        } 
    });
});

// Health check each 1 s  
setInterval(function() {
    health_check();    
}, 1000);

// [********] Express routing 
var is_admin = false; 
router.route("/admin").get(function(req, res) {
    res.render("admin", {
        is_admin : is_admin,
    });
});

router.route("/admin").post(function(req, res) {
    var username = req.body.uname;
    var password = req.body.psw; 
    var query = "select * from user where username=\"" + username + "\" and password=\"" + password + "\";"; 
    
    db.all(query, [], (errs, rows) => {
        if (rows.length > 0 ) is_admin = true; 
        res.render("admin", {
            is_admin : is_admin, 
        });
    });
});

router.route("/camera").get(function(req, res, next) {
    var cam_id = req.query.id; 
    var client = new net.Socket();
    var cam_token;

    for (var key in camera_active) {
        if (camera_active[key]['id'] == cam_id) 
            cam_token = key;
    }
    
    if (!camera_active[cam_token]['auth']) {
        client.connect(8888, camera_active[cam_token]['ip'], function() {
            console.log('Connected');
            client.write(cam_token);
        });

        client.on('data', function(data) {
            data = data.toString();
            console.log('Received: ' + data.charCodeAt(0));
            client.destroy(); // kill client after server's response
            if (data[0] == '\x01') {
                res.render("camera", {
                    uri : "ws://" + camera_active[cam_token]['ip'] + ":8080",
                });
                camera_active[cam_token]['auth'] = true; 
            }
        });
    } else {
        res.render("camera", {
            uri : "ws://" + camera_active[cam_token]['ip'] + ":8080",
        });
    }
    
});

router.route("/").get(function(req, res, next) {
    //res.sendFile(`${__dirname}/index.html`);
    while (camera_active == null) {};
    var cam_id; 
    for (var k in camera_active) {
        cam_id = camera_active[k]['id']; 
        break; 
    }
    res.render("index", {
        active_camera: camera_active,
        wsUrl: `ws://${config.get("ip")}:${config.get("port.data")}/`
    });
});

router.route("/data").get(function(req, res, next) {
    res.send(JSON.stringify(camera_active));
});

process.on('SIGINT', (err) => {
    client.end();
    process.exit();
});

module.exports = router;

