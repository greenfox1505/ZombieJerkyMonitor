#!/usr/bin/env node

var NotificationManager = new (require("./NotificationManager.js"))()
var hostManager = require("./HostManager.js")(NotificationManager.pushCallback());

//boilerplate express
var express = require('express')
var app = express()
var config = require('./config.json')
const path = require('path');
app.use('/', express.static(path.join(__dirname, 'WebClient'))) // "static/index.html"


app.get("/API/list", (req, res) => {
	res.send(hostManager.listHosts());
})

app.get("/API/get/:host", (req, res) => {
	var host = hostManager.getHost(req.params.host)
	if (host == null) {
		throw "HOST NOT FOUND"
	}
	else
		res.send(host.getData());
});

app.get("/API/post/:host", (req, res) => {
	var host = hostManager.getHost(req.params.host);
	req.query.host = req.params.host;

	if (host == null) {
		host = hostManager.createHost(req.query);
		res.send(host.getData());
	}
	else {
		host.message(req.query);
		res.send(host.getData());
	}

});

app.get("/API/notifications", (req, res) => {
	//todo add subscriber name!
	NotificationManager.subscribe((e) => { res.send(e) });
})
app.get("/API/notifications/old", (req, res) => {
	NotificationManager.getOld((e) => { res.send(e) });
})


if (config.debug) {
	var n = 0;
	app.get("/API/restart", (req, res) => {
		var a = {
			"Melinoe":
				{ "data": { "host": "Melinoe", "global": "47.185.164.157", "local": "192.168.1.179,192.168.122.1", "uptime": "4953293", "timeStamp": 1523597521440, "CPU": "1.24" } },
			"Hermes":
				{ "data": { "host": "Hermes", "global": "45.33.21.242", "local": "45.33.21.242,192.168.174.188", "uptime": "3966402", "timeStamp": 1523597521608, "CPU": "0.14" } },
			"Hades":
				{ "data": { "host": "Hades", "global": "47.185.164.157", "local": "192.168.1.192", "uptime": "989981", "timeStamp": 1523597521845, "CPU": "0.14" } },
			"Prometheus":
				{ "data": { "host": "Prometheus", "global": "47.185.164.157", "local": "192.168.1.151", "uptime": "2807247", "timeStamp": 1523597521962, "CPU": "0.00" } },
			"Nyx":
				{ "data": { "host": "Nyx", "global": "47.185.164.103", "local": "192.168.1.160", "uptime": "8508356", "timeStamp": 1523597522459, "CPU": "0.00" } }
		}
		for (i in a) {
			a[i].data.host = a[i].data.host + n
			hostManager.createHost(a[i].data)
		}
		n++
		res.send(hostManager.list)

	})
	console.log("if this is a test server, load http://localhost:" + config.port+ "/API/restart")
}

app.get("/API/fullStatus", (req, res) => {
	res.send(hostManager.list)
})

app.listen(config.port, function () {
	console.log('Zombie Jerky Monitor listening http://localhost:' + config.port + ' !')
})

