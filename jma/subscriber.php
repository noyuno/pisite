<?php
define( 'VERIFY_TOKEN', 'abc' );

function writelog($buf) {
    $fp = fopen("/var/log/jma.log", "a+");
    fputs($fp, date('Ymd-His', time()) . " " . $buf . "\n");
    fclose($fp);
}

function error($text) {
    writelog($text);
    header( 'HTTP/1.1 404 "Unprocessable Entity"', false, 404 );
    print($text . "\n");
}

if( $_SERVER[ 'REQUEST_METHOD' ] == 'GET' )
{
    $hubmode = @$_GET[ 'hub_mode' ];
    $hubchallenge = @$_GET[ 'hub_challenge' ];

    if( $hubmode == 'subscribe' || $hubmode == 'unsubscribe')
    {
        if( $_GET[ 'hub_verify_token' ] != VERIFY_TOKEN )
        {
            error("GET: failed to verify");
            exit();
        }

        writelog("GET: " . $hubmode . "successful");
        header( 'HTTP/1.1 200 "OK"', null, 200 );
        header( 'Content-Type: text/plain' );

        // チャレンジコードを返す
        echo $hubchallenge;
    }
    else
    {
        error("GET: unknown hub.mode");
        print("<br>気象庁防災情報XMLフォーマット PubSubHubbub subscriber endpoint<br>
Not supported on web browser");
    }
}

if( $_SERVER[ 'REQUEST_METHOD' ] == 'POST' )
{
    // フィードを受け取る
    $contents = file_get_contents( 'php://input' );

    //if( isset( $_SERVER[ 'HTTP_X_HUB_SIGNATURE' ] ) )
    //{
    //    $sign = explode( '=', $_SERVER[ 'HTTP_X_HUB_SIGNATURE' ] );
    //    writelog("sign = " . $sign[1] . ", VERIFY_TOKEN = " . hash_hmac('sha1', $contents, VERIFY_TOKEN));
    //    if( $sign[ 1 ] != hash_hmac( 'sha1', $contents, VERIFY_TOKEN ) )
    //    {
    //        writelog("POST: failed to verify");
    //        header( 'HTTP/1.1 404 "Invalid X-Hub-Signature"', false, 404 );
    //        exit();
    //    }
    //}

    if( FALSE === ( $feed = simplexml_load_string( $contents ) ) )
    {
        error("POST: received invalid xml");
        exit();
    }

    writelog("POST: retrieving entries");

    foreach ($feed->entry as $entry) {
        $url = $entry->link['href'];
        $filename = "/var/www/html/jma/data/";
        if (basename($url) == "") {
            $filename = $filename . date( 'Ymd-His' ).'.xml';
        } else {
            $filename = $filename . basename($url);
        }
        //writelog("opening " . $filename);
        $ch = curl_init($url);
        //writelog("execute " . $url);
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        $fp = fopen($filename, "w");
        curl_setopt($ch, CURLOPT_FILE, $fp);
        curl_exec($ch);
        $cerr = curl_errno($ch);
        if (0 == $cerr) {
            writelog("POST: stored xml to: " . $filename);
        } else {
            writelog("POST: xml curl error: " . curl_strerror($cerr) . ", to: " . $filename);
        }
        curl_close($ch);
        fclose($fp);
    }
    header( 'HTTP/1.1 204 "No Content"', null, 204 );
}
?>
