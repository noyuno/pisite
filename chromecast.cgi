#!/usr/bin/env python3

import json
import os
import pychromecast
import cgi
import cgitb
import time
cgitb.enable()

print("Content-Type: application/json")    # HTML is following
print()                             # blank line, end of headers

c = pychromecast.Chromecast("ba8e4e24-ddff-a0d5-0b49-d5f06f7cec66.local")
c.wait()
args = cgi.FieldStorage()
    
sent = False

#print(args)

if "play" in args:
    time.sleep(0.08)
    c.media_controller.play()
    print("sent play")
    sent = True
if "pause" in args:
    time.sleep(0.08)
    c.media_controller.pause()
    print("sent pause")
    sent = True
if "is_active" in args:
    print(c.media_controller.is_active)
    sent = True

if sent == False:
    count = 10
    while (count > 0 and 
        c.media_controller.status.media_metadata.get("title") is None):
        time.sleep(0.01)
        count -= 1

    d = c.media_controller.status.media_metadata
    d["app"] = c.app_display_name
    j = json.dumps(d, indent=4,
        sort_keys=True, ensure_ascii=False, separators=(",", ": "))
    print(j)
    
