#!/bin/bash -e

log=/var/log/jmarm.log
err=/tmp/jmarm.err
data=/var/www/html/jma/data
now=$(/home/noyuno/dotfiles/bin/now)

before=$(du -h $data | cut -f 1)
count=$(find $data -ctime +3 -print -exec rm -f {} \; 2>$err | wc -l)
ret=$?
after=$(du -h $data | cut -f 1)

echo "$now: $before -> [$count]($ret) -> $after" >>$log
cat $err >>$log

