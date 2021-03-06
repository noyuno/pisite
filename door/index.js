{

const domain = "//noyuno.space";
const searchcgi = domain + "/door/door.cgi";
const updatecgi = domain + "/door/door.cgi";

var datetime = function (ux) {
    var d = new Date( ux * 1000 );
    var m = ("0"+(d.getMonth()+1)).slice(-2);
    var a = ("0"+d.getDate()).slice(-2);
    var h = ("0"+d.getHours()).slice(-2);
    var i = ("0"+d.getMinutes()).slice(-2);
    return m+"/"+a+" "+h+":"+i;
};

var clear_result = function () {
    $("#result tr").remove();
    $("#result").append("<tr>" +
            "<th>datetime" + 
            "<th>door" + 
            "<th>status" + 
            "<th>user");
};
var parse_result = function (d) {
    console.log(d);
    clear_result();
    for (var i in d.data) {
        $("#result").append("<tr>" +
            "<td>" + datetime(d.data[i].datetime) + 
            "<td>" + d.data[i].door + 
            "<td>" + d.data[i].status + 
            "<td>" + d.data[i].user + "</tr>");
    }
    var current = ""
    if (d.data && d.data[0]) {
        current = d.data[0].status;
        if (current == "open") {
            $("#open").css("background-color", "yellow");
            $("#close").css("background-color", "white");
        } else {
            $("#open").css("background-color", "white");
            $("#close").css("background-color", "lightgreen");
        }
    } else {
        $("#open").css("background-color", "white");
        $("#close").css("background-color", "white");
    }
    if (d.status == "success") {
        $("#status").text(current);
    } else {
        $("#status").text(d.status + ": " + d.error);
    }
};

var arg = new Object;
var init_door = function () {
    $("#door").val(arg.door);
    $("#user").val(arg.user);

    $("#open").click(function () {
        console.log(updatecgi + "?insert=1&door=" + $("#door").val() + "&user=" + $("#user").val() + "&status=open");
        $.get(updatecgi + "?insert=1&door=" + $("#door").val() + "&user=" + $("#user").val() + "&status=open", parse_result);
    });
    $("#close").click(function () {
        console.log(searchcgi + "?insert=1&door=" + $("#door").val() + "&user=" + $("#user").val() + "&status=closed");
        $.get(searchcgi + "?insert=1&door=" + $("#door").val() + "&user=" + $("#user").val() + "&status=closed", parse_result);
    });
    $("#search").click(function () {
        console.log(searchcgi + "?door=" + $("#door").val());
        $.get(searchcgi + "?door=" + $("#door").val(), parse_result);
    });
};

var door = function () {
    $.get(searchcgi + "?door=" + $("#door").val(), parse_result);
};

window.onload = function () {
    var pair=location.search.substring(1).split('&');
    for(var i=0;pair[i];i++) {
        var kv = pair[i].split('=');
        arg[kv[0]]=kv[1];
    }
    init_door();
    if (arg.door != undefined)
        door();
    //window.setInterval(door, 1000 * 60);
};

}

