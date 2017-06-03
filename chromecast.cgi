#!/usr/bin/env python3

import json
import os
import pychromecast
import cgi
import time
import cgitb
cgitb.enable()

print("Content-Type: application/json")    # HTML is following
print()                             # blank line, end of headers

c = pychromecast.Chromecast("ba8e4e24-ddff-a0d5-0b49-d5f06f7cec66.local")
c.wait()
args = cgi.FieldStorage()
    
#print(args)
sentd = { }

if "play" in args:
    time.sleep(0.08)
    c.media_controller.play()
    sentd["sent"] = "play"
if "pause" in args:
    time.sleep(0.08)
    c.media_controller.pause()
    sentd["sent"] = "pause"
if "stop" in args:
    time.sleep(0.08)
    c.media_controller.stop()
    sentd["sent"] = "stop"

if len(sentd) == 0:
    count = 10
    while (count > 0 and 
        c.media_controller.status.media_metadata.get("title") is None):
        time.sleep(0.01)
        count -= 1
d = c.media_controller.status.media_metadata
d["app"] = c.app_display_name
d["play"] = c.media_controller.is_playing
d["active"] = c.media_controller.is_active
if len(sentd) != 0:
    d.update(sentd)
j = json.dumps(d, indent=4,
    sort_keys=True, ensure_ascii=False, separators=(",", ": "))
print(j)
    
