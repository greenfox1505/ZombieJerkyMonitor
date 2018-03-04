var config = require("./config.json")

class NotificationManager {
	constructor(){
		this.subscribers = []//array of subscriber callbacks
	}
	subscribe(callback){
		this.subscribers.push(callback);
	}
	pushCallback(){
		return (e)=>{this.push(e)}
	}
	push(Message){
		Message.timestamp = Date.now();
		for( var i in this.subscribers){
			this.subscribers[i](Message);
		}
	this.subscribers = [];
	}
}

module.exports = NotificationManager;