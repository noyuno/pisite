{
"use strict";

const domain = "//noyuno.mydns.jp";
const searchcgi = domain + "/search.cgi";
const updatecgi = domain + "/update.cgi";

var parse_result = function (d) {
    if (d.title == undefined || d.sent == "stop" || (d.sent == undefined && !d.active)) {
        $("#chromecast").text("今はキャストしていません");
        $("#play").removeClass("mdl-button--raised");
        $("#pause").removeClass("mdl-button--raised");
        $("#stop").addClass("mdl-button--raised");
        $("#chromecast_fig").removeAttr("src");
        $("#chromecast_figbase").hide();
    } else {
        if (d.app == "d anime store2") {
            d.app = "dアニメストア";
        }
        $("#chromecast").html(d.app + "<br>" + d.title + "");
        if (d.sent == "play" || (d.sent == undefined && d.play)) {
            $("#play").addClass("mdl-button--raised");
            $("#pause").removeClass("mdl-button--raised");
            $("#stop").removeClass("mdl-button--raised");
        } else if (d.sent == "pause" || (d.sent == undefined && d.active)) {
            $("#play").removeClass("mdl-button--raised");
            $("#pause").addClass("mdl-button--raised");
            $("#stop").removeClass("mdl-button--raised");
        } else {
            console.log("unknown sequence");
        }
        $("#chromecast_figbase").show();
        $("#chromecast_fig").attr("src", d.images[0].url);
    }
};

var init_chromecast = function () {
    $("#open").click(function () {
        $.get(updatecgi + "?door=" + $("#door") + "&user=" + $("#user") + "&status=open", parse_result);
    });
    $("#close").click(function () {
        $.get(searchcgi + "?door=" + $("#door") + "&user=" + $("#user") + "&status=close", parse_result);
    });
    $("#search").click(function () {
        $.get(searchcgi + "?door=" + $("#door"), parse_result);
    });
};

var chromecast = function () {
    $.get(domain + cgi, parse_chromecast);
};

window.onload = function () {
    disk();
    init_chromecast();
    chromecast();
    window.setInterval(chromecast, 1000 * 60);
};

}

