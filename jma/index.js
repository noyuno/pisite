"use strict";

Number.prototype.padLeft = function(base, chr){
     var  len = (String(base || 10).length - String(this).length)+1;
     return len > 0? new Array(len).join(chr || '0')+this : this;
 }

var zerofill = function (i) {
    var s = String(i);
    if (s.length == 1) {
        return "0" + s;
    } else {
        return s;
    }
};

var slim = function (s, n) {
    var t = 0;
    var i = 0;
    for ( ; i < s.length && t < n; i++) {
        var c = s.charCodeAt(i);
        if ( (c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
            t += 1;
        } else {
            t += 2;
        }
    }
    return s.substr(0, i);
};

var keyword = [];
var data;
var notifyarray = [];

var print = function (data) {

    var o = JSON.parse(data);
    var d = o["data"];
    if (o["status"]) {
        for (var i = 0; i < o["count"]; i++) {
            var a = new Date(d[i]["target-datetime"]), dformat = [
                (a.getMonth()+1).padLeft(),
                a.getDate().padLeft()].join('/') +' ' +
                [a.getHours().padLeft(),
                a.getMinutes().padLeft()].join(':');
            $('<tr/>')
                .append($("<td />").addClass('jmadatetime').append($("<a />").attr("href", d[i]['link']).text(dformat)))
                //.append($("<td />").text(d[i]["infokind"]))
                .append($("<td />").addClass('jmatitle').text(d[i]["title"]))
                .append($("<td />").addClass('jmatext').text(d[i]["text"]))
                .appendTo("#anime-list");
        }
        $('body').animate({
            scrollTop: $(document).height()
        }, 1000);
    } else {
        console.log("status==false");
    }

    //$("#anime").empty();
};

function search() {
    var input = $("#search");
    var filter = input.val().toLowerCase();
    var table = $("#anime-list");
    var tr = $("#anime-list tr");
    var c = 0;

    for (var i = 1; i < tr.length; i++) {
        var matched = false;
        for (var col = 1; col < 4; col++) {
            var td = tr[i].getElementsByTagName("td")[col];
            if (td) {
                if (td.textContent.toLowerCase().indexOf(filter) > -1) {
                    matched = true;
                    break;
                }
            } 
        }
        if (matched) {
            tr[i].style.display = "";
            c++;
        } else {
            tr[i].style.display = "none";
        }
    }
    if (c == 0) {
        $("#search-not-found").css("display", "");
    } else {
        $("#search-not-found").css("display", "none");
    }
}

var notify;

window.onload = function () {
    var table = $('<table id="anime-list" />');
    $("<tr style='font-weight: bold; text-align: center' />")
        .append($("<td/>").addClass('jmadatetime').text("対象時刻"))
        //.append($("<td/>").text("種類"))
        .append($('<td />').addClass('jmatitle').text("題"))
        .append($('<td />').addClass('jmatext').text("内容")).appendTo(table);
    $(table).appendTo("#anime");

    var ws = new WebSocket('ws://noyuno.mydns.jp:8000');
    ws.onopen = function () { ws.send('cache'); };
    ws.onerror = function (e) { console.log(e); };
    ws.onmessage = function (e) {
        print(e.data);
    };

    window.Notification.requestPermission();
    $("#search").focus();
};

