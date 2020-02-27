
$(() => {
  $('#leidaImg').click(() => {
    $('.leida .shebei_left').toggle();
    $('.leida .shebei_right').toggle();
  });
  $('#gdImg').click(() => {
    $('.gd .shebei_left').toggle();
    $('.gd .shebei_right').toggle();
  });
  $('#dzzcImg').click(() => {
    $('.dzzc .shebei_left').toggle();
    $('.dzzc .shebei_right').toggle();
  });
  $('#xypjImg').click(() => {
    $('.xypj .shebei_left').toggle();
    $('.xypj .shebei_right').toggle();
  });
  $('#ADS-BImg').click(() => {
    $('.ADS-B .shebei_left').toggle();
    $('.ADS-B .shebei_right').toggle();
  });

  $('#jiantou_zuo_one').click(() => {
    $('.leida .shebei_left .shebei_left_top').toggle();
    $('.leida .shebei_left .shebei_left_bottom').toggle();
    $('.leida .shebei_left .jiantou_you').toggle();
    $('.leida .shebei_left .jiantou_zuo').toggle();
    $('.leida .shebei_left').addClass('myHide');
    $('.leida .shebei_right').addClass('myLeft');
  });
  $('#jiantou_you_one').click(() => {
    $('.leida .shebei_left .shebei_left_top').toggle();
    $('.leida .shebei_left .shebei_left_bottom').toggle();
    $('.leida .shebei_left .jiantou_you').toggle();
    $('.leida .shebei_left .jiantou_zuo').toggle();
    $('.leida .shebei_left').removeClass('myHide');
    $('.leida .shebei_right').removeClass('myLeft');
  });

  $('#jiantou_zuo_two').click(() => {
    $('.gd .shebei_left .shebei_left_top').toggle();
    $('.gd .shebei_left .shebei_left_bottom').toggle();
    $('.gd .shebei_left .jiantou_you').toggle();
    $('.gd .shebei_left .jiantou_zuo').toggle();
    $('.gd .shebei_left').addClass('myHide');
    $('.gd .shebei_right').addClass('myLeft');
  });
  $('#jiantou_you_two').click(() => {
    $('.gd .shebei_left .shebei_left_top').toggle();
    $('.gd .shebei_left .shebei_left_bottom').toggle();
    $('.gd .shebei_left .jiantou_you').toggle();
    $('.gd .shebei_left .jiantou_zuo').toggle();
    $('.gd .shebei_left').removeClass('myHide');
    $('.gd .shebei_right').removeClass('myLeft');
  });
  $('#ereconArrowLeft').click(() => {
    $('.dzzc .shebei_left .shebei_left_top').toggle();
    $('.dzzc .shebei_left .shebei_left_bottom').toggle();
    $('.dzzc .shebei_left .jiantou_you').toggle();
    $('.dzzc .shebei_left .jiantou_zuo').toggle();
    $('.dzzc .shebei_left').addClass('myHide');
    $('.dzzc .shebei_right').addClass('myLeft');
  });
  $('#ereconArrowRight').click(() => {
    $('.dzzc .shebei_left .shebei_left_top').toggle();
    $('.dzzc .shebei_left .shebei_left_bottom').toggle();
    $('.dzzc .shebei_left .jiantou_you').toggle();
    $('.dzzc .shebei_left .jiantou_zuo').toggle();
    $('.dzzc .shebei_left').removeClass('myHide');
    $('.dzzc .shebei_right').removeClass('myLeft');
  });
  $('#protocolCrackingArrowLeft').click(() => {
    $('.xypj .shebei_left .shebei_left_top').toggle();
    $('.xypj .shebei_left .shebei_left_bottom').toggle();
    $('.xypj .shebei_left .jiantou_you').toggle();
    $('.xypj .shebei_left .jiantou_zuo').toggle();
    $('.xypj .shebei_left').addClass('myHide');
    $('.xypj .shebei_right').addClass('myLeft');
  });
  $('#protocolCrackingArrowRight').click(() => {
    $('.xypj .shebei_left .shebei_left_top').toggle();
    $('.xypj .shebei_left .shebei_left_bottom').toggle();
    $('.xypj .shebei_left .jiantou_you').toggle();
    $('.xypj .shebei_left .jiantou_zuo').toggle();
    $('.xypj .shebei_left').removeClass('myHide');
    $('.xypj .shebei_right').removeClass('myLeft');
  });

  $('#radarButton').click(() => {
    $('#radarChart').toggle();
  });
  $('#gdButton').click(() => {
    $('#gdtu').toggle();
  });

  $('.chuzhiBtn').click(() => {
    $('.chuzhiBtn').addClass('xz');
    $('.yuanBtn').removeClass('xz');
  });

  $('.yuanBtn').click(() => {
    $('.yuanBtn').addClass('xz');
    $('.chuzhiBtn').removeClass('xz');
  });

  $('.ytkzBtn').click(() => {
    $('.ytkzBtn').addClass('xz');
    $('.gpsBtn').removeClass('xz');
    $('.dxdjBtn').removeClass('xz');
  });

  $('.gpsBtn').click(() => {
    $('.gpsBtn').addClass('xz');
    $('.ytkzBtn').removeClass('xz');
    $('.dxdjBtn').removeClass('xz');
  });

  $('.dxdjBtn').click(() => {
    $('.dxdjBtn').addClass('xz');
    $('.gpsBtn').removeClass('xz');
    $('.ytkzBtn').removeClass('xz');
  });
  
  $('.jiantouImg').each(function (index) {
       $(this).mousedown(function(){
		   $(this).addClass('brighter');
	   });
	   $(this).mouseup(function(){
	   		$(this).removeClass('brighter');  
	   });
	   $(this).mouseout(function(){
	   		$(this).removeClass('brighter');  
	   });
    });
	
	$("#targetTable .target").click(function(){
		$(this).addClass("mySelected").siblings().removeClass("mySelected");
		
	});
	
	$("#controlButtons button").click(function(){
		$(this).addClass("xz").siblings().removeClass("xz");
		
	});
	
});
