"use strict";

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

    var d = JSON.parse(data);
    if (d["status"]) {
        $.ajax({
            url: d['link'],
            type: 'GET', 
            dataType: 'xml', 
            timeout: 1000, 
            error: function () { console.log('xml retrieve error'); }, 
            success: function (xml) {
                var type = $(xml).find("InfoKind")[0]["textContent"];
                var dt = new Date($(xml).find("TargetDateTime")[0]["textContent"]);
                var time = dt.toTimeString().split(' ')[0];
                var description = $(xml).find("Text")[0]["textContent"];
                $('<tr/>')
                    .append($("<td />").append($("<a />").attr("href", d['link']).text(time)))
                    .append($("<td />").text(type))
                    .append($("<td />").text(description))
                    .appendTo("#anime-list");
            }
        });
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
        .append($("<td/>").text("時刻"))
        .append($("<td/>").text("現象"))
        .append($("<td/>").text("内容")).appendTo(table);
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

