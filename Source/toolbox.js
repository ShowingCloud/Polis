
$(function(){
  $("#leidaImg").click(function(){
    $(".leida .shebei_left").toggle();
    $(".leida .shebei_right").toggle();
  });
  $("#gdImg").click(function(){
    $(".gd .shebei_left").toggle();
    $(".gd .shebei_right").toggle();
  });
  $("#dzzcImg").click(function(){
    $(".dzzc .shebei_left").toggle();
    $(".dzzc .shebei_right").toggle();
  });
  $("#xypjImg").click(function(){
    $(".xypj .shebei_left").toggle();
    $(".xypj .shebei_right").toggle();
  });
  $("#ADS-BImg").click(function(){
    $(".ADS-B .shebei_left").toggle();
    $(".ADS-B .shebei_right").toggle();
  });

  $("#jiantou_zuo_one").click(function(){
    $(".leida .shebei_left .shebei_left_top").toggle();
    $(".leida .shebei_left .shebei_left_bottom").toggle();
    $(".leida .shebei_left .jiantou_you").toggle();
    $(".leida .shebei_left .jiantou_zuo").toggle();
    $(".leida .shebei_left").addClass("myHide");
    $(".leida .shebei_right").addClass("myLeft");
  });
  $("#jiantou_you_one").click(function(){
    $(".leida .shebei_left .shebei_left_top").toggle();
    $(".leida .shebei_left .shebei_left_bottom").toggle();
    $(".leida .shebei_left .jiantou_you").toggle();
    $(".leida .shebei_left .jiantou_zuo").toggle();
    $(".leida .shebei_left").removeClass("myHide");
    $(".leida .shebei_right").removeClass("myLeft");
  });

  $("#jiantou_zuo_two").click(function(){
    $(".gd .shebei_left .shebei_left_top").toggle();
    $(".gd .shebei_left .shebei_left_bottom").toggle();
    $(".gd .shebei_left .jiantou_you").toggle();
    $(".gd .shebei_left .jiantou_zuo").toggle();
    $(".gd .shebei_left").addClass("myHide");
    $(".gd .shebei_right").addClass("myLeft");
  });
  $("#jiantou_you_two").click(function(){
    $(".gd .shebei_left .shebei_left_top").toggle();
    $(".gd .shebei_left .shebei_left_bottom").toggle();
    $(".gd .shebei_left .jiantou_you").toggle();
    $(".gd .shebei_left .jiantou_zuo").toggle();
    $(".gd .shebei_left").removeClass("myHide");
    $(".gd .shebei_right").removeClass("myLeft");
  });

  $("#leidaButton").click(function(){
    $("#leidatu").toggle();
  });
  $("#gdButton").click(function(){
    $("#gdtu").toggle();
  });

  $(".chuzhiBtn").click(function(){
    $(".chuzhiBtn").addClass("xz");
    $(".yuanBtn").removeClass("xz");
  });

  $(".yuanBtn").click(function(){
    $(".yuanBtn").addClass("xz");
    $(".chuzhiBtn").removeClass("xz");
  });

  $(".ytkzBtn").click(function(){
    $(".ytkzBtn").addClass("xz");
    $(".gpsBtn").removeClass("xz");
    $(".dxdjBtn").removeClass("xz");
  });

  $(".gpsBtn").click(function(){
    $(".gpsBtn").addClass("xz");
    $(".ytkzBtn").removeClass("xz");
    $(".dxdjBtn").removeClass("xz");
  });

  $(".dxdjBtn").click(function(){
    $(".dxdjBtn").addClass("xz");
    $(".gpsBtn").removeClass("xz");
    $(".ytkzBtn").removeClass("xz");
  });
});
