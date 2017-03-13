#!/bin/bash

Collect(){
	LOCAL=""
	SITE=$(wget http://ipinfo.io/ip -qO -)

	for i in $( ip addr show | awk '$1 == "inet" {gsub(/\/.*$/, "", $2); print $2}')
	do
		LOCAL="$LOCAL $i"
	done

	echo "site=${SITE}&local=${LOCAL}&localTime=$(date)&realLocalTime=$(date +%s)"
} #Collect()

url="https://monitor.zombiejerky.net/api/$(hostname)?put=true&$(Collect)"
wget -qO- "$url" &> /dev/null
#packet=$(RUN)
#echo $packet | curl -X PUT -d @- https://monitor.zombiejerky.net/test/$(hostname)
#echo $packet | curl -X PUT -d @- http://localhost:8000/$(hostname)
