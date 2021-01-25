const mqtt = require("mqtt");
const net = require("net");
const WebSocket = require("ws");
const config = require("config");
const fs = require('fs');

var cam = require("./cam");
var client = mqtt.connect("mqtt://broker.hivemq.com:1883")

const token = "ef19530563f3c7ded2047b3dbd23547b";
var picture;
var is_login = false;

// function to read then encode a file 
function base64_encode(file) {
    // read binary data
    var bitmap = fs.readFileSync(file, { encoding: 'base64' });
    // convert binary data to base64 encoded string
    return bitmap;
}

client.subscribe("camera-KSTN/" + token, (err) => {
        if (err) throw err;
});

client.publish("camera-KSTN/login", token);

client.on('message', (topic, msg) => {
        var msg = msg.toString();
        if (topic == "camera-KSTN/" + token)
                is_login = true;
});

// check login success, if after 10s not receive any message from server, stop
var count = 0;
var checkLogin = setInterval(function() {
        if (count == 10) process.exit();
        count += 1;
        if (is_login) {
                clearInterval(checkLogin);
                console.log("Connected!");
        } else {
                console.log("Waiting connect to server in " + count + " s");
        }
}, 1000);

// create tcp authen 
PORT = 9999
const server = net.createServer();
server.listen(PORT, function() {
	console.log("Listenning ..."); 
});

server.on('connection', (socket) => {
	socket.on('data', (chunk) => {
		new_data = chunk.toString();
		if (new_data[0] == '\x01') {
			console.log("Authen success");
			console.log("Start camera server ...");
			cam.listen(8080);
		}
	});
});

// set interval to send image over websocket ws://<server-ip>:8888
var uri = `ws://${config.serverIp}:${config.serverPort}`;
const ws = new WebSocket(uri);

var publish_img = setInterval(function() {
	try {
		picture = base64_encode("./cam.jpg");
        	var res = {"cmd" : "IMAGE", "token" : token, "image" : "data:image/jpg;base64, " + picture};
        	ws.send(JSON.stringify(res));
	} catch (err) {
		return;
	}
}, 5000);


// Ai process each 5s  
function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function ai(picture) {
        var res = {'token' : token, 'status' : 3, "count": getRndInteger(20, 40)};
        client.publish("camera-KSTN/data", JSON.stringify(res));
}

var process_data = setInterval(ai, 5000, picture);

// Logout when exit 
var num_exit = 0;
process.on("SIGINT", (err) => {
        num_exit +=1 ;
        if (num_exit > 1) {
                process.exit();
                clearInterval(publish_img);
                clearInterval(process_data);
        }
        client.publish("camera-KSTN/logout", token, (err) => {
                console.log("Logout!");
        });

});


