var config = require("./config.json")

class HostManager {
	//idk if this is needed, probaby should be some DB interface?
	constructor(){
		this.List = [];
	}
	getHost(name){
		if( this.List[name] != null){
			return this.List[name];
		}
		else return false;
	}
	createHost(payload){
		this.list[payload.host] = new HostNode(payload);
	}
}



class HostNode {
	constructor(firstPayload,notificationHandler){
		this.update(firstPayload);
		//I wish I knew a way to store this without making it global like this
		this._notificationHandler = notificationHandler;
	}
	update(payload){
		//TODO: database! is needed for history tracking...maybe... idk
		var data = this.data = {}
		//TODO: probably need to verify data type here...
		data.host = payload.host;
		data.global = payload.global;
		data.local = payload.local;
		data.uptime = payload.uptime;
		data.timeStamp = payload.timeStamp;
		data.CPU = payload.CPU;
		data.RAM = payload.RAM;
	}
	message(payload){
		//check IP changes
		if(this.data.global != payload.data.global)
		{
			this._notificationHandler({
				label:"GLOBAL IP ADDRESS CHANGED!",
				host:this.data.host,
				body:{
					old:this.data.global,
					new:payload.global
				}
			});
		}
		//check reboot
		if(this.data.uptime > payload.uptime){
			this._notificationHandler({
				label:"SYSTEM REBOOTED!",
				host:this.data.host,
				body:{
					old:this.data.uptime,
					new:payload.uptime
				}
			});
		}
		//todo threshold detection!
		this.update(payload);
	}
}


//test API:
function notes(data){
	console.log(data);
} 

var data = {
	host:"testHost",
	global:"1.1.1.1",
	local:"1.2.2.1",
	uptime:0,
	timeStamp:0,
	CPU:0.1,
	RAM:5,

}


var testHost = new HostNode(data,notes);

data.uptime = 5
testHost.message(data)

data.uptime = 0
testHost.message(data)