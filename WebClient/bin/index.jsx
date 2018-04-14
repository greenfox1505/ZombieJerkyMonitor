var React = require('react');
var ReactDOM = require("react-dom")
// import ReactDOM from 'react-dom';

let colorCount = 3
let nextColor =0;

var siteStyles = {}
function getSiteClass(ip){
    if(siteStyles[ip] == null){
        siteStyles[ip] = nextColor;
        nextColor =( nextColor+1 )% colorCount
    }
    return "Site " + "siteColor" + siteStyles[ip]
}


function getStyle(a){
    if(typeof a == "string"){
        if(siteStyles[a] == null){
            siteStyles[a]= nextColor;
            nextColor =( nextColor+1)%colorCount
        }
        return 
    }
    
}

class ServerList extends React.Component {
    render() {
        let sites = [];
        for (let i of this.props.children) {
            if (sites[i.global] == null) { sites[i.global] = [] }
            sites[i.global].push(i);
        }
        let inner = []
        for (let i in sites) {
            inner.push(<Site key={i}>{{ ip: i, hosts: sites[i] }}</Site>)
        }
        return <div className="ServerList">{inner}</div>

    }
}

class Site extends React.Component {
    render() {
        let ip = this.props.children.ip
        let hosts = this.props.children.hosts
        let inner = []
        for (let i in hosts) {
            inner[i] = <Server key={i}>{hosts[i]}</Server>
        }
        //todo reverse look up IPs, not sure how I should do that... 
        //maybe have a domain list on host and check matching IPs that way? w/e problem for later
        return <div className={getSiteClass(ip)}>
            <h1>Site: {ip}</h1>
            {inner}
        </div>
    }
}
class Server extends React.Component {
    addNotification(data) {
        if (this.props.children.notifications == null) { this.props.children.notifications = [] }
        this.props.children.notifications.push(data)
        this.setState({
            notifications: this.props.children.notifications
        })
    }
    render() {
        let that = this
        let myServerData = this.props.children
        myServerData.addNotification = (e) => { that.addNotification(e) }
        let myLastReport = lastReport(myServerData.timeStamp)
        let output =
            <div className={myLastReport.stale ? "Server Stale" : "Server"} style={getStyle(this.props.children)}>
                <h2>{myServerData.host}</h2>
                <p>local IP: {myServerData.local.replace(/,/g, ', ')}</p>
                <p>CPU Use: {myServerData.CPU}</p>
                <p title={myServerData.uptime + " secs"}>Up for {deltaTime(myServerData.uptime)}.</p>
                {myLastReport.dom}
                <Notifications>{myServerData.notifications}</Notifications>
            </div>
        return output
    }
}

class Notifications extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false
        }
    }
    toggleShow() {
        let newState = {
            show: !this.state.show
        }
        this.setState(newState)
    }
    render() {
        let notes = this.props.children
        if (this.props.children == null) { return null }
        return <div>
            <h3>Notifiactions ({notes.length}) <a onClick={this.toggleShow.bind(this)}>[{this.state.show ? "-" : "+"}]</a></h3>
            {this.state.show ? this.listOfNotes() : null}
        </div>
    }
    listOfNotes() {
        let output = []
        let notes = this.props.children
        console.log(notes)
        notes.sort((a, b) => {
            return a.timeStamp < b.timeStamp
        })
        console.log(notes)
        for (let i in notes) {
            output.push(<Note key={i}>{notes[i]}</Note>)
            notes[i]
        }
        return output
    }
}
class Note extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            new: props.children.new
        }
    }
    mouseOver() {
        if (this.props.children.new == true) {
            this.setState({
                new: false
            })
        }
    }
    render() {
        let thisNote = this.props.children
        return <p style={{
            background: this.state.new?"yellow":""

        }} onClick={this.mouseOver.bind(this)} title={JSON.stringify(thisNote, null, 2)}>{thisNote.label} ({deltaTime((Date.now() - thisNote.timeStamp) / 1000)} ago)</p>
    }

}
function lastReport(timeStamp) {
    let deltaT = ((Date.now() - timeStamp) / 1000) | 0
    let stale = deltaT > (3 * 60) //true if >3 minutes
    let dom = [
        <p>Last report: {deltaT} secs ago.</p>
    ]
    if (stale) {
        dom.push(<p>Warning! This host has not reported status in over 3 minutes!</p>)
    }
    return {
        stale: stale,
        dom: dom
    }
}

function deltaTime(secs) {
    secs = secs | 0
    mins = (secs / 60) | 0
    hours = (mins / 60) | 0
    days = (hours / 24) | 0
    if (days > 0) {
        return days + " days and " + (hours % 24) + " hours"
    }
    if (hours > 0) {
        return hours + " hours and " + (mins % 60) + " minutes"
    }
    if (mins > 0) {
        return mins + " minutes and " + (secs % 60) + " secounds"
    }
    return secs + " secounds"
}


function getJson(url) {
    return fetch(url).then((e) => {
        return e.json();
    })
}



getJson("/API/list").then((e) => {
    let output = []
    for (let i in e) {
        output.push(getJson("/API/get/" + e[i]))
    }
    return Promise.all(output)
}).then((List) => {
    WatchNotifications(List)

    ReactDOM.render(
        <ServerList>{List}</ServerList>,
        document.getElementById("mainBox")
    );
})


//this thing is insane. i'm not really even sure how it works, but it does....
function WatchNotifications(list) {
    let hosts = {}
    for (let i in list) {
        hosts[list[i].host] = list[i]
    }
    getJson("/API/notifications/old").then((e) => {
        for (let i in e) {
            let note = e[i]
            note.new = false
            hosts[note.host].addNotification(note);
        }
    })

    function watchLoop() {
        getJson("/API/notifications").then((note) => {
            note.new = true
            hosts[note.host].addNotification(note);
            watchLoop()
        }).catch(() => {
            watchLoop()
        })

    }
    watchLoop()
    // function watchLoop(){
    //     return getJson("/API/notifications").then((e)=>{
    //         console.log(e)
    //         debugger
    //     }).then(watchLoop)
    // }

}


console.log("loaded window width: "+ window.innerWidth)