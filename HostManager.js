var config = require("./config.json")


var start = Date.now()
function runtime() {
	return (Date.now() - start) / 1000;
}

/**
 * 
 * @param {*} notificationHandler 
 * @returns {HostManager} Host Manager!
 */
function ModuelBuilder(notificationHandler) {
	class HostManager {
		//idk if this is needed, probaby should be some DB interface?
		constructor() {
			this.list = [];
		}
		/** 
		 * @returns {Array.<string>} List of hostnames
		*/
		listHosts() {
			var output = []
			for (var i in this.list) {
				output.push(this.list[i].data.host)
			}
			return output;
		}
		/**
		 * @param {string} host 
		 * @returns {(HostNode|false)}
		 */
		getHost(host) {
			return this.list[host];
		}
		createHost(payload) {
			return this.list[payload.host] = new HostNode(payload);
		}
	}

	class HostNode {
		constructor(firstPayload) {
			//maybe I should have it read/write to disk?
			this.update(firstPayload);

			if (runtime() > (60 * 5)) {
				notificationHandler({
					label: "NEW HOST!",
					host: this.data.host,
					body: firstPayload
				})
			}
			else{
				console.log("no new hosts while fresh")
			}

		}
		getData() {
			return JSON.parse(JSON.stringify(this.data));//there is DEFINATLY a better way to do this; I don't even know if I need this security.
		}
		update(payload) {
			//TODO: database! is needed for history tracking...maybe... idk
			var data = this.data = {}
			//TODO: probably need to verify data type here...
			//TODO: do I even need this???
			data.host = payload.host;
			data.global = payload.global;
			data.local = payload.local;
			data.uptime = payload.uptime;
			data.timeStamp = Date.now();
			data.CPU = payload.CPU;
		}
		message(payload) {
			//check IP changes
			if (this.data.global != payload.global) {
				notificationHandler({
					label: "GLOBAL IP ADDRESS CHANGED!",
					host: this.data.host,
					body: {
						old: this.data.global,
						new: payload.global
					}
				});
			}
			//check reboot
			payload.uptime = parseInt(payload.uptime)
			if ((this.data.uptime) > payload.uptime) {
				console.log("old", this.data, "new", payload)
				notificationHandler({
					label: "SYSTEM REBOOTED!",
					host: this.data.host,
					body: {
						old: this.data.uptime,
						new: payload.uptime
					}
				});
			}
			//todo threshold detection!
			this.update(payload);
		}
	}
	return new HostManager();
}

if (require.main === module) {
	//called on command line, run test commands!
	console.log("This Module was called from the command line, running test commands")

	//test API:
	function notes(data) {
		console.log(data);
	}
	var HostManager = new (ModuelBuilder(notes))();
	console.log(HostManager)


	var data = {
		host: "testHost",
		global: "1.1.1.1",
		local: "1.2.2.1",
		uptime: 0,
		timeStamp: 0,
		CPU: 0.1,
		RAM: 5,
	}

	var testHost = HostManager.createHost(data);
	console.log(testHost)

	data.uptime = 5
	testHost.message(data)

	data.uptime = 0
	testHost.message(data)


} else {
	//called from require, configure module
	module.exports = ModuelBuilder;
}
