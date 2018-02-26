
# data.host = payload.host;
Host() {
echo host=$(cat /etc/hostname)
}


# data.global = payload.global;
Global() {
    echo global=$(wget http://ipinfo.io/ip -qO -)
}

# data.local = payload.local;
Local() {
    local=""
    for i in $(ifconfig | sed -En 's/127.0.0.1//;s/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p')
    do
        local="$local,$i"
    done
    echo local=$(echo $local | cut -c2-)
}

# data.uptime = payload.uptime;
Uptime() {
    echo uptime=$(cat /proc/uptime | grep ^[0-9]* -o)
}

# data.CPU = payload.CPU;
CPU(){
    echo CPU=$(cat /proc/loadavg | grep ^[0-9\.]* -o)
}

# data.RAM = payload.RAM;
#

QuerryURL() {
    echo "?$(Global)&$(Local)&$(Uptime)&$(CPU)"
}

#MonitorHost="https://monitor.zombiejerky.net"
MonitorHost="http://localhost:8000"
Path="/API/post/$(cat /etc/hostname)"
URL="${MonitorHost}${Path}$(QuerryURL)"
echo $URL
wget -qO- "$URL" &> /dev/null 