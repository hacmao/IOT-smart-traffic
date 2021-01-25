var net = require('net');

PORT = 8888 
var client = new net.Socket();
client.connect(PORT, '127.0.0.1', function() {
	console.log('Connected');
	client.write("\x00");
});

client.on('data', function(data) {
	console.log('Received: ' + data);
	client.destroy(); // kill client after server's response
});

client.on('close', function() {
	console.log('Connection closed');
});
