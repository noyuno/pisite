"use strict";

Number.prototype.padLeft = function(base, chr){
     var  len = (String(base || 10).length - String(this).length)+1;
     return len > 0? new Array(len).join(chr || '0')+this : this;
 }

var keyword = [];
var data;
var notifyarray = [];

var setattr = function () {
    document.title=args["id"] + " - jma";
    $("#id").text(args["id"]);
    var l = "/jma/data/"+args["id"]+".xml";
    var a = $("<a />").attr("href", l).text("noyuno.mydns.jp"+l);
    $(a).appendTo("#link");
};

var appendtext = function (xml, name, text, sep) {
    $(xml).find(name).each(function () {
        if (text=="") {
            text = this.textContent;
        } else {
            if (sep==undefined) {
                text+=this.textContent;
            }else {
                text += sep+this.textContent;
            }
        }
    });
    return text;
};

var area = function (xml, id, attrd) {
    var table = $('<table />');
    $("<tr style='font-weight: bold; text-align: center' />")
        .append($("<td/>").addClass("table-area").text("Area"))
        .append($("<td/>").addClass("table-kind").text("Kind"))
        .append($("<td/>").addClass("table-change").text("ChangeStatus"))
        .append($('<td />').addClass("table-full").text("FullStatus"))
        .appendTo(table);

    $(xml).children().each(function () {
        var areas="";
        var kinds="";
        var change="";
        var full="";
        $(this).children().each(function () {
            if (this.nodeName=="Kind") {
                kinds = appendtext(this, "Name", kinds, ", ");
                var sa="";
                sa = appendtext(this, "Status", sa);
                sa = appendtext(this, "Addition", sa, ", ");
                if (sa!="") {
                    kinds+="("+sa+")";
                }
            } else if (this.nodeName=="Areas" || this.nodeName=="Area") {
                areas = appendtext(this, "Name", areas, ", ");
            } else if (this.nodeName=="ChangeStatus") {
                change=this.textContent;
            } else if (this.nodeName=="FullStatus") {
                full=this.textContent;
            }
        });
        $("<tr />")
            .append($("<td />").text(areas))
            .append($("<td />").text(kinds))
            .append($("<td />").text(change))
            .append($("<td />").text(full))
            .appendTo(table);
    });
    //$("#"+id).text(xml.nodeName + " " + attrd);
    //$(table).appendTo("#"+id);
    var div=$("<div />").addClass("table-parent").append(table);
    var li=$("<li />").text(xml.nodeName + attrd);
    $(li).append(div);
    $(li).appendTo("#"+id);
};

var cid = 0;
var read = function (xml, id) {
    $(xml).children().each(function () {
        var attr = this.attributes["type"] || "";
        var attrd ="";
        if (attr != "") {
            attr = attr.value;
            attrd= "(" + attr+")";
        }
        if (this.nodeName=="Information" || this.nodeName=="Warning") {
            area(this, cid, attrd);
        } else if ($(this).children().length!=0) {
            cid++;
            var liul=$("<li />").text(this.nodeName + attrd)
                .append($("<ul />").attr("id", cid));
            $(liul).appendTo("#"+id);
            read(this, cid);
        } else {
            var li=$("<li />").text(this.nodeName + attrd +": "+ this.textContent);
            $(li).appendTo("#"+id);
        }
    });
};

var print = function (n) {
    $.ajax({
        dataType: 'xml', 
        url:"/jma/data/"+n+".xml", 
        success: function (xml) {
            read($(xml).find("Report"), "itemroot");
        }
    });
};

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
    setattr();
    print(args["id"]);
    $("#search").focus();
};

