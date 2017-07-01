#!/usr/bin/env python3

import json
import cgi
import time
import cgitb
import sqlite3
cgitb.enable()

def dict_factory(cursor, row):
    d = {}
    for idx, col in enumerate(cursor.description):
        d[col[0]] = row[idx]
    return d

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
    if 'insert' in args:
        if "user" in args and "door" in args and "status" in args:
            c.execute('''insert into events values(?, ?, ?, ?)''', 
                (int(time.time()), args["user"].value, args["door"].value, args["status"].value))
            success = True
        else:
            success = False
    else:
        success = True

    # select
    c.execute('select * from events where door=? order by datetime desc', (args['door'].value,))
    d["data"] = c.fetchall()

    conn.commit()
    conn.close()
    if success:
        d["status"] = 'success'
    else:
        d["status"] = 'failure'
j = json.dumps(d, indent=4,
    sort_keys=True, ensure_ascii=False, separators=(",", ": "))
print(j)

