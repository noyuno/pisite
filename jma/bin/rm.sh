#!/bin/bash -e
(
    find /var/www/html/jma/data -ctime +3 -exec rm -f {} \;
) >/dev/null
