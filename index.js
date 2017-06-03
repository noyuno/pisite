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
var chromecast = function () {
    var t = $("#chromecast");
    var r = new XMLHttpRequest();
    r.onload = function () {
        var d = JSON.parse(r.responseText);
        if (d.title == undefined) {
            t.text("今はキャストしていません");
        } else {
            if (d.app == "d anime store2") {
                d.app = "dアニメストア";
            }
            t.text(d.app + "「" + d.title + "」");
            $("#chromecast_fig").attr("src", d.images[0].url);
        }
    };
    r.onerror = function () {
        console.log("error");
    };

    r.open('GET', domain + "/chromecast.cgi", true);
    r.send(null);
    
    $("#play").click(function () {
        $.get(domain + "/chromecast.cgi?play=1", function (d) {
            console.log(d);
        });
    });
    $("#pause").click(function () {
        $.get(domain + "/chromecast.cgi?pause=1", function (d) {
            console.log(d);
        });
    });
};

window.onload = function () {
    disk();
    chromecast();
};

