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
	}else if( req.query.callback){
		msg = req.query.callback + "(" + JSON.stringify(data) + ")";
	}else{ 
		msg = JSON.stringify(data);
	}
	res.send(msg+ "")
})
app.get("/api/:serverName",function(req,res){
	if(req.query.put == "true"){
		delete req.query.put;
		putData({name : req.params.serverName, data: req.query});
	}
	res.send(data[req.params.serverName]);
})

function putData(myData){
	myData.data.name = myData.name;
	data[myData.name] = myData.data;
}

app.listen(config.port, function () {
  console.log('Zombie Jerky Monitor listening http://localhost:'+config.port+' !')
})

