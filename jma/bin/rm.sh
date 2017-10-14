#!/bin/bash -e

log=/var/log/jmarm.log
data=/var/www/html/jma/data
(
    /home/noyuno/dotfiles/bin/now
    du -h $data
    find $data -ctime +3 -print -exec rm -f {} \; | wc -l
    du -h $data
) 1>>$log 2>&1

