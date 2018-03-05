var config = require("./config.json")
var fs = require("fs");
var twit = require("twit")

function logDate() {
	function pad(number) {
		if (number < 10) {
			return '0' + number;
		}
		return number;
	}
	var d = new Date();
	return "" + d.getFullYear() + pad(d.getMonth()) + pad(d.getDate()) + "_" + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
}


//this is getting more complex than I expected....
class logger {
	constructor(name) {
		this.file = name == null ? "log.txt" : name;
	}
	error(e) {
		//eh, maybe I'll add this someday....
	}
	log(message) {
		if (typeof message == "string") {
			this.simple(message)
		}
		else {
			this.write(message);
		}
	}
	/**
	 * 
	 * @param {string} message 
	 */
	simple(message) {
		console.log(message)
		fs.appendFile(this.file, logDate() + " : " + message + "\n", this.error)
	}
	/**
	 * 
	 * @param {string} message.hostname
	 * 	 */
	write(message) {
		var line = logDate() + " : " +
			message.host + " , " + message.label + " : " + JSON.stringify(message) + "\n"
		console.log(line)
		fs.appendFile(this.file, line, this.error)
	}
}

class NotificationManager {
	constructor() {
		this.subscribers = []//array of subscriber callbacks
		this.archive = []

		var myLogger = new logger(config.log);
		this.log = function (m) {
			myLogger.log(m);
		}
		this.log("=====REBOOTED MONITOR=====");

		if (config.twitter) {
			this.log("starting twitter bot");
			this.Twitter = new twit(config.twitter.keys);
		} else { this.log("no twitter bot in config") }
		this.tweet(config.serverName +  " : Monitor Rebooted! at " + logDate())
	}

	//these twitter apis probably should be a seperate object...
	twitterDM(message){
		throw 'TWITTER DM NOT YET IMPLEMENTED'
		if(this.Twitter == null){
			return;
		}
	}
	tweet(message){
		if(this.Twitter == null){
			return;
		}
		this.Twitter.post('statuses/update', { status: message }, function(err, data, response) {
			console.log(data)
		  })
	}
	subscribe(callback) {
		this.subscribers.push(callback);
	}
	pushCallback() {
		return (e) => { this.push(e) }
	}
	push(Message) {
		//todo new servers before the app has been running for 5 minutes don't count
		Message.timestamp = Date.now();
		for (var i in this.subscribers) {
			this.subscribers[i](Message);
		}
		this.subscribers = [];
		this.archive.push(Message)
		
		this.log(Message);
		
		this.tweet(
			Message.host + " : " + Message.label + " at " + logDate()
		)
	}
	getOld(callback) {
		callback(this.archive);
	}
}

module.exports = NotificationManager;


