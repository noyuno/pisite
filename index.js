var domain = "//noyuno.mydns.jp";
var disk = function () {
    var canvas = document.getElementById("myChart")
    canvas.width = 140;
    var ctx = canvas.getContext("2d");
    var r = new XMLHttpRequest();
    r.onload = function () {
        var d = JSON.parse(r.responseText);
        var myChart = new Chart(ctx, {
            type: 'pie', 
            data: {
                labels: ["used", "free"], 
                datasets: [{
                    data: [d.used, d.free],
                    backgroundColor: [
                        "#2ecc71",
                        "#3498db",
                        "#95a5a6",
                        "#9b59b6",
                        "#f1c40f",
                        "#e74c3c",
                        "#34495e"
                    ],
                }]
            }, 
            options: {
                title: {
                    display: true,
                    text: "disk usage [GiB]"
                }
            }
            });
    };
    r.onerror = function () {
        console.log("error");
    };

    r.open('GET', domain + "/disk.php", true);
    r.send(null);

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
        $.get(domain + "/chromecast.cgi?play=1", parse_chromecast);
    });
    $("#pause").click(function () {
        $.get(domain + "/chromecast.cgi?pause=1", parse_chromecast);
    });
    $("#stop").click(function () {
        $.get(domain + "/chromecast.cgi?stop=1", parse_chromecast);
    });
};

var chromecast = function () {
    $.get(domain + "/chromecast.cgi", parse_chromecast);
};

window.onload = function () {
    disk();
    init_chromecast();
    chromecast();
    window.setInterval(chromecast, 1000 * 60);
};

