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

print("Content-Type: text/html")
#print("Content-Type: application/json")
print()

args = cgi.FieldStorage()
    
#print(args)
d = {}
if args is None:
    d['error'] = 'args'
elif not 'door' in args:
    d['error'] = 'args.door'
else:
    conn = sqlite3.connect('/var/www/html/door/secret/data.sqlite3')
    conn.row_factory = dict_factory
    c = conn.cursor()
    c.execute('''create table if not exists events(
        datetime integer, user text, door text, status text)''')
    c.execute('select * from events where door=?', (args['door'].value,))
    d["data"] = c.fetchall()

j = json.dumps(d, indent=4,
    sort_keys=True, ensure_ascii=False, separators=(",", ": "))
print(j)

