# Monitor 2: Electric Boogaloo

My old Monitor server is old. I'd like to enhance it.

## Current Monitor Features:
* Minimal Install
* Simple URL driven API (Lets clients use pure bash with wget to push to servers)
* Shows current IP address 

## Feature Wishless for Monitor 2:
* Monitor system stats:
    * CPU (2.0)
    * RAM (2.0.5)
    * Net/DiskIO? (2.0.5)
* Push notifications ("This thing happend/You Have Uncleared Notifications")
    * IP Changes (2.0)
    * Failing to report (2.0)
    * Reboot detection (2.0)
    * Thresholds (2.2)
    * Warning Message assigned domains do not match host IPs (2.3)
* Database?! (2.1)

The web client would double as a native client. Not sure how I should handle notifications. Some sort of notice feed should work well; but I don't want to flood the user with notifications. If a server goes down at night, you shouldn't be given too many notices. If a server is perminally shut off, there should be a way to delete it from monitoring. 

## TWITTER BOT!
Twitter Bot! Forget this notification system, I'm going to build a twitter bot!

## API

### /API/post/:host

Main update function. All properties are encoded through query strings.

### /API/list

Returns server list

### /API/get/:host

Gets single server

### /API/notifications/

Not totally sure how this works yet. Could be a websocket/longpoll that just pushes notifications as they come. This has a lot of limitations; most importantly if my computer is off, I lose all notices (that might not be too bad though...)


### /Update.sh

The script used for Monitor.

This script opens ${MonitorHost}/API/post/${hostname}?${QUERY_PARAM}
