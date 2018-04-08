var React = require('react');
var ReactDOM = require("react-dom")
// import ReactDOM from 'react-dom';

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
        return <div className="Site">
            <h1>{ip}</h1>
            {inner}
        </div>
    }
}

var a = { "host": "Mercury", "global": "1.0.1.1", "local": "1.1.1.1", "uptime": 10, "timeStamp": 1523213150497, "CPU": "0.00" }
class Server extends React.Component {
    render() {
        let c = this.props.children
        let myLastReport = lastReport(c.timeStamp)
        let output =
            <div className={myLastReport.stale?"Server Stale":"Server"}>
                <h2>{c.host}</h2>
                <p>local IP: {c.local}</p>
                <p>CPU Use: {c.CPU}</p>
                <p title={c.uptime + " secs"}>Up for {duration(c.uptime)}.</p>
                {myLastReport.dom}
            </div>
        return output
    }
}

function lastReport(timeStamp) {
    let deltaT = ((Date.now() - timeStamp) / 1000) | 0
    let stale = deltaT > (3 * 60) //true if >3 minutes
    let dom = [
        <p>Last report: {deltaT} secs ago.</p>
    ]
    if(stale){
        dom.push(<p>Warning! This host has not reported status in over 3 minutes!</p>)
    }
    return {
        stale:stale,
        dom: dom
    }
}

function duration(secs) {
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
    ReactDOM.render(
        <ServerList>{List}</ServerList>,
        document.getElementById("box")
    );
})

