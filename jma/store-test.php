<?php

function writelog($buf) {
    $fp = fopen("/var/log/jma.log", "a+");
    fputs($fp, date('Ymd-His', time()) . " " . $buf . "\n");
    fclose($fp);
}

$filename = "/var/www/html/jma/data/" . date( 'Ymd-His' ).'.xml';
$ret = file_put_contents($filename, "test");
if ($ret == false) {
    writelog("failed to write data " . $filename);
} else {
    writelog("stored data to " . $filename);
}

?>

