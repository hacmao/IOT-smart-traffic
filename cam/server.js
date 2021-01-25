"use strict";


const WebSocketServer = require('ws').Server;
const Splitter        = require('stream-split');
const merge           = require('mout/object/merge');
const NALseparator    = new Buffer.from([0,0,0,1]);//NAL break
const exec = require("child_process").execSync;

class _Server {

  constructor(server, options) {

    this.options = merge({
        width : 960,
        height: 540,
    }, options);

    this.wss = new WebSocketServer({ server });

    this.new_client = this.new_client.bind(this);
    this.start_feed = this.start_feed.bind(this);
    this.broadcast  = this.broadcast.bind(this);

    this.wss.on('connection', this.new_client);
  }
  

  start_feed() {	
	if (this.readStream)
	    this.readStream.kill("SIGKILL");
	var readStream = this.get_feed();
    	this.readStream = readStream;
    	readStream = readStream.stdout.pipe(new Splitter(NALseparator));
    	readStream.on("data", this.broadcast);
    
  }

  get_feed() {
    throw new Error("to be implemented");
  }

  take_snapshot() {
	if (this.readStream)   
		this.readStream.kill("SIGKILL");
	// stop video stream to take snapshot 
	exec('raspistill -o ./cam.jpg -w 450 -h 450');
	
	var readStream = this.get_feed();
    	this.readStream = readStream;
    	readStream = readStream.stdout.pipe(new Splitter(NALseparator));
    	readStream.on("data", this.broadcast);
  }

  broadcast(data) {
    this.wss.clients.forEach(function(socket) {

      if(socket.buzy)
        return;

      socket.buzy = true;
      socket.buzy = false;

      socket.send(Buffer.concat([NALseparator, data]), { binary: true}, function ack(error) {
        socket.buzy = false;
      });
    });
  }

  new_client(socket) {
  
    var self = this;
    console.log('New guy');

    socket.send(JSON.stringify({
      action : "init",
      width  : this.options.width,
      height : this.options.height,
    }));

    socket.on("message", function(data){
      var cmd = "" + data, action = data.split(' ')[0];
      console.log("Incomming action '%s'", action);

      if(action == "REQUESTSTREAM")
        self.start_feed();
      if(action == "STOPSTREAM")
        self.readStream.stdout.pause();
      if(action == "DISCONNECT")
	self.readStream.kill("SIGKILL");
      if(action == "SNAPSHOT")
	self.take_snapshot();
    });

    socket.on('close', function() {
      self.readStream.stdout.end();
      console.log('stopping client interval');
    });
  }


};


module.exports = _Server;

