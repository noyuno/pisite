#!/usr/bin/env python3

import json
import os
import pychromecast
import cgi
import time
import cgitb
import sqlite3
cgitb.enable()

print("Content-Type: text/html")
#print("Content-Type: application/json")
print()

args = cgi.FieldStorage()
    
conn = sqlite3.connect('/var/www/html/door/secret/data.sqlite3')
c = conn.cursor()
if "user" in args and "door" in args and "status" in args:
    c.execute('''create table if not exists events(
        datetime integer, user text, door text, status text)''')
    c.execute('''insert into events values(?, ?, ?, ?)''', 
        (int(time.time()), args["user"].value, args["door"].value, args["status"].value))
    conn.commit()
    conn.close()
    print("ok")
else:
    print("failure")

