var config = require("./config.json")

var fs = require("fs");

//this is getting more complex than I expected....
class logger {
	constructor(name) {
		this.file = name == null ? "log.txt" : name;
	}
	date() {
		function pad(number) {
			if (number < 10) {
				return '0' + number;
			}
			return number;
		}
		var d = new Date();
		return "" + d.getFullYear() + pad(d.getMonth()) + pad(d.getDate()) + "_" + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
	}
	error(e) {
		//eh, maybe I'll add this someday....
	}
	/**
	 * 
	 * @param {string} message 
	 */
	simple(message) {
		fs.appendFile(this.file, this.date() + " : " + message + "\n", this.error)
	}
	/**
	 * 
	 * @param {string} message.hostname
	 * 	 */
	write(message) {
		var line = this.date() + " : " +
			message.host + " , " + message.label + " : " + JSON.stringify(message) + "\n"

		fs.appendFile(this.file, line, this.error)
	}
}

class NotificationManager {
	constructor() {
		this.subscribers = []//array of subscriber callbacks
		this.archive = []
		this.log = new logger(config.log);
		this.log.simple("=====REBOOTED MONITOR=====");
	}
	subscribe(callback) {
		this.subscribers.push(callback);
	}
	pushCallback() {
		return (e) => { this.push(e) }
	}
	push(Message) {
		Message.timestamp = Date.now();
		for (var i in this.subscribers) {
			this.subscribers[i](Message);
		}
		this.subscribers = [];
		this.archive.push(Message)
		this.log.write(Message);
	}
	getOld(callback) {
		callback(this.archive);
	}
}

module.exports = NotificationManager;


