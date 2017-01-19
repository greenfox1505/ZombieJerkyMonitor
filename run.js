#!/usr/bin/env node

var express = require('express')
var app = express()
var config = require('./config.json')


app.use('/',express.static("static"))

app.listen(config.port, function () {
  console.log('Example app listening on port '+config.port+'!')
})

