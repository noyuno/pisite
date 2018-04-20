"use strict"
const domain = "//noyuno.space";
const cgi = "/cgi/chromecast";
const diskcgi = "/cgi/disk";
Number.prototype.padLeft = function(base, chr){
     var  len = (String(base || 10).length - String(this).length)+1;
     return len > 0? new Array(len).join(chr || '0')+this : this;
}

var disk = function () {
    var unit = 1024*1024*1024;
    google.charts.load('current', {packages: ['corechart']});
    google.charts.setOnLoadCallback(drawDisk);

    function drawDisk () {
        var data = new google.visualization.DataTable();
        data.addColumn("string", "Path");
        data.addColumn("number", "Used");
        data.addColumn("number", "Free");
        var r = new XMLHttpRequest();
        r.onload = function () {
            var d = JSON.parse(r.responseText);
            for (var p in d) {
                data.addRow([
                    String(p),
                    Number(d[p].used / unit), 
                    Number(d[p].free / unit)
                ]);
            }
            var option={
                "isStacked":true, 
                "legend":"none", 
                "colors":["orange", "green"], 
                //"hAxis": {
                //    "scaleType":"log"
                //}
            };
            var chart = new google.visualization.BarChart(document.getElementById('diskchart'));
            chart.draw(data, option);
        };
        r.onerror = function () {
            console.log("unable to get disk usage");
        };
        r.open('GET', domain + diskcgi, true);
        r.send(null);
    }
};

function csv(d, f) {
    var row = d.split("\n");
    var arr = new Array();
    for(var i = 0; i<row.length;i++){
        if (row[i]=="") {
            continue
        }
        var t = row[i].split(",");
        arr[i]=[];
        for (var j = 0; j <t.length; j++) {
            if (f[j]) {
                arr[i][j]=Number(t[j]);
            } else {
                arr[i][j]=t[j];
            }
        }
    }
    return arr
}

var humidity = function () {
    google.charts.load('current', {packages: ['corechart', "line"]});
    google.charts.setOnLoadCallback(drawHumidity);

    function drawHumidity () {
        var data = new google.visualization.DataTable();
        data.addColumn("string", "Datetime");
        data.addColumn("number", "Temperature");
        data.addColumn("number", "Humidity");
        var r = new XMLHttpRequest();
        r.onload = function () {
            data.addRows(csv(r.responseText, [0, 1, 1]));
            var option={
                "legend":"none"
            };
            var chart = new google.visualization.LineChart(document.getElementById('humidchart'));
            chart.draw(data, option);
        };
        r.onerror = function () {
            console.log("unable to get disk usage");
        };
        var date=new Date();
        var ym=String(date.getFullYear()) + (date.getMonth()+1).padLeft()
        r.open('GET', domain + "/humidity/data/" + ym, true);
        r.send(null);
    }
};

var parse_chromecast = function (d) {
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
    $("#play").click(function () {
        $.get(domain + cgi + "?play=1", parse_chromecast);
    });
    $("#pause").click(function () {
        $.get(domain + cgi + "?pause=1", parse_chromecast);
    });
    $("#stop").click(function () {
        $.get(domain + cgi + "?stop=1", parse_chromecast);
    });
};

var chromecast = function () {
    $.get(domain + cgi, parse_chromecast);
};

(function(){
    disk();
    humidity();
    init_chromecast();
    chromecast();
    window.setInterval(chromecast, 1000 * 60);
})();

