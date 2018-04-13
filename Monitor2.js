#!/usr/bin/env node

var NotificationManager = new (require( "./NotificationManager.js"))()
var hostManager = require("./HostManager.js")(NotificationManager.pushCallback()); 

//boilerplate express
var express = require('express')
var app = express()
var config = require('./config.json')
const path = require('path');
app.use('/',express.static(path.join(__dirname, 'WebClient'))) // "static/index.html"


app.get("/API/list",(req,res)=>{
	res.send(hostManager.listHosts());
})

app.get("/API/get/:host",(req,res)=>{
	var host = hostManager.getHost(req.params.host)
	if(host == null){
		throw "HOST NOT FOUND"
	}
	else
		res.send(host.getData());
});

app.get("/API/post/:host",(req,res)=>{
	var host = hostManager.getHost(req.params.host);
	req.query.host = req.params.host;

	if(host == null){
		host = hostManager.createHost(req.query);
		res.send(host.getData());
	}
	else{
		host.message(req.query);
		res.send(host.getData());
	}

});

app.get("/API/notifications",(req,res)=>{
	//todo add subscriber name!
	NotificationManager.subscribe((e)=>{res.send(e)});
})
app.get("/API/notifications/old",(req,res)=>{
	NotificationManager.getOld((e)=>{res.send(e)});
})


app.get("/API/fullStatus",(req,res)=>{
	res.send(hostManager.list)
})

app.listen(config.port, function () {
	console.log('Zombie Jerky Monitor listening http://localhost:'+config.port+' !')
  })
  
  