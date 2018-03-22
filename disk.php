<?php
$si_prefix = array( 'B', 'KB', 'MB', 'GB', 'TB', 'EB', 'ZB', 'YB' );
$base = 1024;
$path = array('/', '/mnt/karen');

$total_bytes = 0;
foreach ($path as $p) {
    $total_bytes  += disk_total_space($path);
}
$class = min((int)log($total_bytes , $base) , count($si_prefix) - 1);
echo "{ \"total\":\"" . sprintf('%1.2f' , $total_bytes / pow($base,$class)) . "\", ";

$free_bytes = 0;
foreach ($path as $p) {
    $free_bytes += disk_free_space($path);
}
$class = min((int)log($free_bytes , $base) , count($si_prefix) - 1);
echo "\"free\":\"" . sprintf('%1.2f' , $free_bytes / pow($base,$class)) . "\", ";

$used_bytes = $total_bytes - $free_bytes;
$class = min((int)log($used_bytes , $base) , count($si_prefix) - 1);
echo "\"used\":\"" . sprintf('%1.2f' , $used_bytes / pow($base,$class)) . "\", ";

//使用率
echo "\"rate\":\"" . round($used_bytes / $total_bytes * 100, 2) . "\", ";
echo "\"unit\": \"" . $si_prefix[$class] . "\" }";
?>

