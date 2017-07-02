#!/usr/bin/env python3

import json
import cgi
import time
from datetime import datetime, timedelta
import cgitb
import sqlite3
cgitb.enable()

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

#print("Content-Type: text/html")
print("Content-Type: application/json")
print()

args = cgi.FieldStorage()
    
#print(args)
d = {}
success = False

if args is None:
    d['status'] = 'failure'
    d['error'] = 'args'
elif not 'door' in args:
    d['status'] = 'failure'
    d['error'] = 'args.door'
else:
    # init
    conn = sqlite3.connect('/var/www/html/door/secret/data.sqlite3')
    conn.row_factory = dict_factory
    c = conn.cursor()

    # create
    c.execute('''create table if not exists events(
        datetime integer, user text, door text, status text)''')

    # insert
    now = int(time.time())
    if 'insert' in args:
        if not "status" in args:
            d["status"] = 'failure'
            d["error"] = "args.status"
        elif not "user" in args:
            d["status"] = "failure"
            d["error"] = "args.user"
        else:
            c.execute('''insert into events values(?, ?, ?, ?)''', 
                (now, args["user"].value, args["door"].value, args["status"].value))
            d["status"] = 'success'
    else:
        d["status"] = 'success'

    # select
    since = int((datetime.fromtimestamp(now) - timedelta(days=30)).timestamp())

    c.execute('select * from events where door=? and datetime>? order by datetime desc', (args['door'].value, since))
    d["data"] = c.fetchall()

    conn.commit()
    conn.close()
j = json.dumps(d, indent=4,
    sort_keys=True, ensure_ascii=False, separators=(",", ": "))
print(j)

