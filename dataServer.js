const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8888 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        console.log(camera_active);
        client.send(data);
      }
    });
  });
});

module.export = wss;

