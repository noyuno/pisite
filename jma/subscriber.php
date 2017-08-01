<?php
define( 'VERIFY_TOKEN', 'abc' );

function writelog($buf) {
    $fp = fopen("/var/log/jma.log", "a+");
    fputs($fp, date('Ymd-His', time()) . " " . $buf . "\n");
    fclose($fp);
}

{
    $hubmode = @$_GET[ 'hub_mode' ];
    $hubchallenge = @$_GET[ 'hub_challenge' ];

    if( $hubmode == 'subscribe' || $hubmode == 'unsubscribe')
    {
        if( $_GET[ 'hub_verify_token' ] != VERIFY_TOKEN )
        {
            writelog("GET: failed to verify");
            header( 'HTTP/1.1 404 "Unknown Request"', false, 404 );
            exit();
        }

        writelog("GET: verify successful (" . $hubmode . ")");
        header( 'HTTP/1.1 200 "OK"', false, 200 );
        header( 'Content-Type: text/plain' );

        // チャレンジコードを返す
        echo $hubchallenge;
    }
    else
    {
        writelog("GET: unknown hub.mode");
        header( 'HTTP/1.1 404 "Not Found (unknown hub.mode)"', false, 404 );
        print("気象庁防災情報XMLフォーマット PubSubHubbub subscriber endpoint<br>
Not supported on web browser<br>
404 unknown hub.mode");
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
        writelog("POST: received empty");
        exit();
    }
    else
    {
        $filename = "/var/www/html/jma/data/" . date( 'Ymd-His' ).'.xml';
        $ret = file_put_contents( $filename, $contents );
        if ($ret == false) {
            writelog("POST: failed to write xml to " . $filename);
        } else {
            writelog("POST: stored xml to " . $filename  . " (" . $ret . "bytes)");
        }
    }
}
?>

