#!/usr/bin/env node

var express = require('express')

var app = express()
var config = require('./config.json')

var data = {} //data storage

app.use('/',express.static("static")) // "static/index.html"

app.get("/api/",function(req,res){
	var msg = "";
	if( req.query.format == "pre"){
		msg = "<pre>" + JSON.stringify(data,null,2) + "\/\/TODO! return all data, formatted or with padding by params</pre>";
	}else{ 
		msg = JSON.stringify(data);
	}
	res.send(msg+ "")
})
app.get("/api/:serverName",function(req,res){
	if(req.query.put == "true"){
		putData({name : req.params.serverName, data: req.query});
	}
	res.send(data[req.params.serverName]);
})

app.put("/test/:serverName",function(req,res){
	msg = "Body content depricated. Please update " + req.params.serverName + " at " + (req.headers['x-forwarded-for'] || req.connection.remoteAddress);
	console.log(msg);
	res.status(299);
	res.send("ERROR!\n" + msg);
})

function putData(myData){
	myData.data.name = myData.name
	data[myData.name] = myData.data;
}

app.listen(config.port, function () {
  console.log('Zombie Jerky Monitor listening http://localhost:'+config.port+' !')
})

