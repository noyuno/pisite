#!/usr/bin/env python3

import json
import os

print("Content-Type: text/html")    # HTML is following
print()                             # blank line, end of headers

repow = os.listdir("/var/git/repo/repositories/noyuno")
repos = []
for i in repow:
    if not i.endswith(".wiki.git") and i.endswith(".git"):
        repos.append(i[:-4])

print(json.dumps(repos))

