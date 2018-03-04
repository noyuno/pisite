"use strict";

Number.prototype.padLeft = function(base, chr){
     var  len = (String(base || 10).length - String(this).length)+1;
     return len > 0? new Array(len).join(chr || '0')+this : this;
 }

var keyword = [];
var data;
var notifyarray = [];

var print = function (n) {
    $.ajax({
        dataType: 'xml', 
        url:"/jma/data/"+n, 
        success: function (xml) {

        }
    });
};

function search() {
    var input = $("#search");
    var filter = input.val().toLowerCase();
    var table = $("#itemroot-list");
    var tr = $("#itemroot-list tr");
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
var args;

var getparams = function () {
    args = new Object;
    var pair=location.search.substring(1).split('&');
    for(var i=0;pair[i];i++) {
        var kv = pair[i].split('=');
        args[kv[0]]=kv[1];
    }
};

window.onload = function () {
    getparams();

    var table = $('<table id="itemroot-list" />');
    $("<tr style='font-weight: bold; text-align: center' />")
        .append($('<td />').addClass('jmatitle').text("題"))
        .append($('<td />').addClass('jmatext').text("内容")).appendTo(table);
    $(table).appendTo("#itemroot");

    print(args["n"]);

    $("#search").focus();
};

