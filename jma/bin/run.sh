#!/bin/sh -e
(
    /usr/local/bin/python3 /var/www/html/jma/bin/websocket.py
) >/dev/null 2>&1
