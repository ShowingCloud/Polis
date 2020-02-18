
//vue对象
var vm = new Vue({
  el: "#main",
  data: {
    //雷达信息
    leidaArr: [],
    //雷达下标
    leidaIndex: 0,
    //光电信息
    gdInfo: "",
    //电子侦查信息
    dzArr: [],
    //电子侦查下标
    dzIndex: 0,
    //协议破解信息
    xypjArr: [],
    //协议破解下标
    xypjIndex: 0,
    //ADS-B信息
    adsbArr: [],
    //ADS-B下标
    adsbIndex: 0,
    //目标集合
    targetArr:[]
  },
  methods: {
    leidaIndexJian: function() {
      if (vm.leidaIndex > 0) {
        vm.leidaIndex--;
      }
    },
    leidaIndexJia: function() {
      if (vm.leidaIndex < vm.leidaArr.length - 1) {
        vm.leidaIndex++;
      }
    },
    dzIndexJian: function() {
      if (vm.dzIndex > 0) {
        vm.dzIndex--;
      }
    },
    dzIndexJia: function() {
      if (vm.dzIndex < vm.dzArr.length - 1) {
        vm.dzIndex++;
      }
    },
    xypjIndexJian: function() {
      if (vm.xypjIndex > 0) {
        vm.xypjIndex--;
      }
    },
    xypjIndexJia: function() {
      if (vm.xypjIndex < vm.xypjArr.length - 1) {
        vm.xypjIndex++;
      }
    },
    adsbIndexJian: function() {
      if (vm.adsbIndex > 0) {
        vm.adsbIndex--;
      }
    },
    adsbIndexJia: function() {
      if (vm.adsbIndex < vm.adsbArr.length - 1) {
        vm.adsbIndex++;
      }
    },
  },
  watch: {
    
  }
});
//地图相关
var host = "http://www.51kongkong.com:9070";
var viewer;
var scene;
//图层中心坐标
var lon = 108.89854530935382;
var lat = 19.460560907382778;
var hei = 60;
//站1坐标
var lon1 = 108.90047618;
var lat1 = 19.46586216;
var hei1 = 60;
//站2坐标
var lon2 = 108.90298825;
var lat2 = 19.45889390;
var hei2 = 60;
//飞机坐标自定义延时
var delay = 0;

//初始值
var fw = 0;    			 //方位角
var fy = 0;    			 //俯仰角
var s = 4000;  			 //距离
var fwc = Math.PI/180*1; //方位差
var fyc = Math.PI/180*1; //俯仰差
var sc = 100;            //距离差

function fuwei(){
  fw = 0;
  fy = 0;
  s = 4000;
}

function fwjia(){
  fw += fwc;
}

function fwjian(){
  fw -= fwc;
}

function fyjia(){
  fy += fyc;
}

function fyjian(){
  fy -= fyc;
}

function jljia(){
  s += sc;
}

function jljian(){
  s -= sc;
}

function onload(Cesium) {
  var partOfUrl = "/iserver/services/3D-hn1108/rest/realspace";
  //加载三维地球场景
  viewer = new Cesium.Viewer('cesiumContainer', {
    infobox: false,
    selectionIndicator: false
  });
  scene = viewer.scene;
  var widget = viewer.cesiumWidget;
  
  try {
    //加载在线天地图
    var imageryLayers = viewer.imageryLayers;
    imageryLayers.addImageryProvider(new Cesium.TiandituImageryProvider({
      credit: new Cesium.Credit('天地图全球影像服务     数据来源：国家地理信息公共服务平台 & 四川省测绘地理信息局'),
      token: '4a00a1dc5387b8ed8adba3374bd87e5e'
    }));
    
    var labelImagery = new Cesium.TiandituImageryProvider({
      mapStyle: Cesium.TiandituMapsStyle.CIA_C, //天地图全球中文注记服务（经纬度投影）
      token: '4a00a1dc5387b8ed8adba3374bd87e5e'
    });
    imageryLayers.addImageryProvider(labelImagery);
    
    //添加S3M图层服务
    //var promise = scene.open(host + partOfUrl);
    var promise = scene.addS3MTilesLayerByScp(
      'http://www.51kongkong.com:9070/iserver/services/3D-hn1108/rest/realspace/datas/Config1/config', {
        name: 'Config1'
      });
    //加载二维图层
    var layer = viewer.imageryLayers.addImageryProvider(new Cesium.SuperMapImageryProvider({
      url: "http://www.51kongkong.com:9070/iserver/services/3D-hn1108/rest/realspace/datas/basemap@HNNew"
    }));
    
    //相机定位
    Cesium.when(promise, function(layer) {
      layer.style3D.bottomAltitude = 55;
      layer.refresh();
      //设置相机位置、视角，便于观察场景
      scene.camera.flyTo({
        destination: new Cesium.Cartesian3.fromDegrees(lon, lat, 5000),
      });
      if (!scene.pickPositionSupported) {
        alert('不支持深度纹理,无法拾取位置！');
      }
      //可视域分析,创建雷达扫描
      viewshed3D = new Cesium.ViewShed3D(scene);
      //隐藏域与可视域颜色
      viewshed3D.hiddenAreaColor = Cesium.Color.GRAY.withAlpha(0.5);
      viewshed3D.visibleAreaColor = Cesium.Color.LAWNGREEN.withAlpha(0.5);
      //水平视角范围[0,π)
      viewshed3D.horizontalFov = 179;
      //相机俯仰角
      viewshed3D.pitch = 90;
      //垂直视角
      viewshed3D.verticalFov = 180;
      //中心点坐标
      viewshed3D.viewPosition = [layer.lon, layer.lat, layer.height];
      //相机的方向与正北方向的夹角
      viewshed3D.direction = 0;
      //可视距离
      viewshed3D.distance = 1000;
      //设置延时,图层加载完毕,创建可视域
      setTimeout(function() {
        //viewshed3D.build();
      }, 10000)
      
      
    }, function(e) {
      if (widget._showRenderLoopErrors) {
        var title = '加载SCP失败，请检查网络连接状态或者url地址是否正确？';
        widget.showErrorPanel(title, undefined, e);
      }
    });
    
    //圆形探测波
    /* viewer.scene.scanEffect.show = true;
    viewer.scene.scanEffect.color  = Cesium.Color.RED;
    viewer.scene.scanEffect.speed  =1000 ;//单位：米/秒
    viewer.scene.scanEffect.period = 1;
    viewer.scene.scanEffect.centerPostion = new Cesium.Cartesian3.fromDegrees(108.90, 19.46, 100.0);//需要使用世界坐标
    viewer.scene.scanEffect.mode =Cesium.ScanEffectMode.CIRCLE;//Cesium.ScanEffectMode.LINE 为线型扫描模式
    console.log(viewer.scene.scanEffect) */
  } catch (e) {
    if (widget._showRenderLoopErrors) {
      var title = '渲染时发生错误，已停止渲染。';
      widget.showErrorPanel(title, undefined, e);
    }
  }
  
  //站1
  var water1 = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon1, lat1, hei1),
    billboard: { //图标
      image: 'Source/Images/水滴.png',
      width: 16,
      height: 16
    },
  });
  //站2
  var water2 = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon2, lat2, hei2),
    billboard: { //图标
      image: 'Source/Images/水滴.png',
      width: 16,
      height: 16
    },
  });
  
  
  //获取鼠标经纬度坐标
  /* var log_show = document.getElementById("log_show");
        var lat_show = document.getElementById("lat_show");
        var alt_show = document.getElementById("alt_show");
        
        var elevation_show = document.getElementById("elevation_show");
    
        var ellipsoid = viewer.scene.globe.ellipsoid;
        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction(function(move){
          //苗卡尔 二维平面坐标 转 苗卡尔椭球体的三维坐标 返回球体表面的点 
          var cartesian = viewer.camera.pickEllipsoid(move.endPosition,ellipsoid);
          if(cartesian){
            // 苗卡尔椭球体的三维坐标 转 地图坐标（弧度）
            var cartographic = viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
            // 地图坐标（弧度） 转 十进制度数 toFixed保留小数点后几位
            var log_String = Cesium.Math.toDegrees(cartographic.longitude).toFixed(8);//经度
            var lat_String = Cesium.Math.toDegrees(cartographic.latitude).toFixed(8);//纬度
            var alt_String = (viewer.camera.positionCartographic.height/1000).toFixed(2);//视角高
            var elec_String = viewer.scene.globe.getHeight(cartographic).toFixed(4);//海拔
    
            log_show.innerHTML = log_String;
            lat_show.innerHTML = lat_String;
            alt_show.innerHTML = alt_String;
            elevation_show.innerHTML = elec_String;
          }
        },Cesium.ScreenSpaceEventType.MOUSE_MOVE) */
  
  
  
  
  //画圆
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    name: 'Red ellipse on surface with outline',
    ellipse: {
      semiMinorAxis: 2000.0,
      semiMajorAxis: 2000.0,
      height: 30,
      fill: false,
      material: Cesium.Color.RED.withAlpha(0.1),
      outline: true,
      outlineColor: Cesium.Color.RED.withAlpha(1),
      outlineWidth: 10
    },
  });
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    name: 'YELLOW ellipse on surface with outline',
    ellipse: {
      semiMinorAxis: 4000.0,
      semiMajorAxis: 4000.0,
      height: 30,
      fill: false,
      material: Cesium.Color.YELLOW.withAlpha(0.05),
      outline: true,
      outlineColor: Cesium.Color.YELLOW.withAlpha(1),
      outlineWidth: 10
    }
  });
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(lon, lat),
    name: 'GREEN ellipse on surface with outline',
    ellipse: {
      semiMinorAxis: 6000.0,
      semiMajorAxis: 6000.0,
      height: 30,
      fill: false,
      material: Cesium.Color.GREEN.withAlpha(0.02),
      outline: true,
      outlineColor: Cesium.Color.GREEN.withAlpha(1),
      outlineWidth: 10
    }
  });
  //当前时间为起始时间,终止时间为1小时
  const start = Cesium.JulianDate.now();
  const stop = Cesium.JulianDate.addSeconds(start, 3600, new Cesium.JulianDate());
  //校准时钟
  viewer.clock.startTime = start.clone();
  viewer.clock.stopTime = stop.clone();
  viewer.clock.currentTime = start.clone();
  //映射时间轴(没开)
  // viewer.clock.clockRange = Cesium.ClockRange.CLAMPED
  viewer.clock.shouldAnimate = true; // default
  viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER; // tick computation mode
  //到达终止时间时循环
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // loop at the end
  
  //mqtt消息单次接收到的坐标点
  var position2;
  //所有map的key为无人机编号
  //无人机坐标点集合,用来判断是否有新无人机进入
  var airPositionArr = new Map();
  //无人机带时间坐标集合
  var positionsArr = new Map();
  //无人机实体类集合
  var airArr = new Map();
  //指向2km内无人机红线集合
  var gzxArr = new Map();
  //指向3km内无人机黄线集合
  var gzxArr2 = new Map();
  //指向4km内无人机绿线集合
  var gzxArr3 = new Map();
  
  
  
  //光电线测试
  viewer.entities.add({
    polyline: {
      //时间回调获取位置
      positions: new Cesium.CallbackProperty(function(time, result) {
        var ellipsoid=viewer.scene.globe.ellipsoid;
        var center = Cesium.Cartesian3.fromDegrees(108.90047618, 19.46586216, 60);
        var transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
        //目标坐标位置
        var x = Math.cos(fy)*s*Math.sin(fw);
        var y = Math.cos(fy)*s*Math.cos(fw);
        var z = Math.sin(fy)*s;
        var p = new Cesium.Cartesian3(x, y, z);
        var sourpos = Cesium.Matrix4.multiplyByPoint(transform, p, new Cesium.Cartesian3());
        /* console.log(Math.cos(fy)*s*Math.cos(fw))
        console.log(Math.cos(fy)*s*Math.sin(fw))
        console.log(Math.sin(fy)*s) */
        //console.log(ellipsoid.cartesianToCartographic(sourpos))
        var cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos);
        var lon1 = Cesium.Math.toDegrees(cartographic1.longitude);
        var lat1 = Cesium.Math.toDegrees(cartographic1.latitude);
        var height1 = cartographic1.height;
        //源坐标位置
        var tarpos =center;
        var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tarpos);
        var lon2 = Cesium.Math.toDegrees(cartographic.longitude);
        var lat2 = Cesium.Math.toDegrees(cartographic.latitude);
        var height2 = cartographic.height;
        
        return Cesium.Cartesian3.fromDegreesArrayHeights([lon1, lat1, height1, lon2, lat2, height2], Cesium.Ellipsoid
          .WGS84, result);
      }, false), //此处false表示isConstant为false,表示场景更新的每一帧中都获取该属性的数值，从而来更新三维场景中的物体
      width: 5,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.3,
        color: Cesium.Color.BLUE.withAlpha(0.9)
      })
    }
  });
  
  
  connect('www.51kongkong.com', 61623, "admin", "password", "clientTest" + Math.random(100), function(isConnected) {
    if (isConnected) {
      //无人机坐标点消息
      subscribe("/CC/MsgForAntiUAV/Drone/#", 0);
      //雷达信息消息
      subscribe("/CC/MsgForAntiUAV/Radar/#", 0);
      //光电信息
      subscribe("/CC/MsgForAntiUAV/GuangDian/#", 0);
      //电子侦查信息
      subscribe("/CC/MsgForAntiUAV/DianZhen/#", 0);
      //电子侦查信息目标离开
      subscribe("/CC/MsgForAntiUAV/DianZhenOut/#", 0);
      //协议破解信息
      subscribe("/CC/MsgForAntiUAV/Crack/#", 0);
      //ADS-B信息
      subscribe("/CC/MsgForAntiUAV/ADSB/#", 0);
      //雷达通知无人机离开
      subscribe("/CC/MsgForAntiUAV/DroneOut/#", 0);
    }
    
  }, function(msg) {
    console.log(msg);
    //接收到飞机位置信息
    if (msg.topic.indexOf("Drone") != -1) {
      //无人机离开,集合中去掉,地图上去掉
      if (msg.topic.indexOf("DroneOut") != -1) {
        let airId = JSON.parse(msg.payloadString);
        if(airArr.get(airId.id)!=undefined){
          viewer.entities.remove(airArr.get(airId.id));
          delete airArr[airId.id];
          
          for(let i=0;i<vm.targetArr.length;i++){
            if(vm.targetArr[i].id==airId.id){
              vm.targetArr.splice(i,1);
            }
          }
        }
        return;
      }
      
      //目标信息
      let airPosition = JSON.parse(msg.payloadString);
      let targetFlag = true;
      for(let i=0;i<vm.targetArr.length;i++){
        if(vm.targetArr[i].id==airPosition.id){
          vm.$set(vm.targetArr, i, airPosition);
          targetFlag = !targetFlag;
        }
      }
      if(targetFlag){
        vm.targetArr.push(airPosition);
      }
      
      
      position2 = Cesium.Cartesian3.fromDegrees(+airPosition.lon, +airPosition.lat, +airPosition.hei);
      
      //新目标则创建新的实体类
      if (!airPositionArr.get(airPosition.id)) {
        
        positionsArr.set(airPosition.id, new Cesium.SampledPositionProperty());
        //设置插值算法为线性插值
        positionsArr.get(airPosition.id).setInterpolationOptions({
          //获取检索值时要执行的内插度
          interpolationDegree: 5,
          interpolationAlgorithm: Cesium.LinearApproximation, // Cesium.LagrangePolynomialApproximation,
        });
        //插值超出样本数据范围时，将使用第一个或最后一个值。
        positionsArr.get(airPosition.id).backwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
        positionsArr.get(airPosition.id).forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
        
        //无人机初始位置为第一个坐标点
        positionsArr.get(airPosition.id).addSample(Cesium.JulianDate.addSeconds(Cesium.JulianDate.now(), delay, new Cesium
          .JulianDate()), position2);
        //添加无人机
        var sourEntity = viewer.entities.add({
          name: 'Drone',
          viewFrom: new Cesium.Cartesian3(0, 0, 100.0),//跟踪飞机的时候视角偏移量
          availability: new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({
              start,
              stop,
            }),
          ]),
          model: {
            uri: 'model/CesiumDrone.gltf',
            minimumPixelSize: 16,
          },
          //飞机上标签
          label: {
            text: '编号：' + airPosition.id,
            font: '15px Helvetica',
            showBackground: true,
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.RED,
            pixelOffset: new Cesium.Cartesian2(0.0, -20),
            
          },
          //飞行路径
          path: {
            resolution: 1,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.1,
              color: Cesium.Color.PINK
            }),
            width: 1
          },
          position: positionsArr.get(airPosition.id),
          orientation: new Cesium.VelocityOrientationProperty(positionsArr.get(airPosition.id)),
        });
        airArr.set(airPosition.id, sourEntity)
        
        
        //闪烁
        /* viewer.entities.add({
          name: "圆形区域闪烁",
          position: Cesium.Cartesian3.fromDegrees(lon, lat, 100),
          ellipse: {
            semiMinorAxis: 2000.0,
            semiMajorAxis: 2000.0,
            height: 100,
            material: new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(function() {
              if (flog) {
                x = x - 0.05;
                if (x <= 0) {
                  flog = false;
                }
              } else {
                x = x + 0.05;
                if (x >= 1) {
                  flog = true;
                }
              }
              return Cesium.Color.RED.withAlpha(x);
            }, false))
          }
        }); */
        
        //中心点
        var tarPosition = Cesium.Cartesian3.fromDegrees(lon, lat, hei);
        //站1
        var tarPosition2 = Cesium.Cartesian3.fromDegrees(lon1, lat1, hei1);
        //站2
        var tarPosition3 = Cesium.Cartesian3.fromDegrees(lon2, lat2, hei2);
        
        //添加2km红色射线
        gzxArr.set(airPosition.id, viewer.entities.add({
          polyline: {
            //时间回调获取位置
            positions: new Cesium.CallbackProperty(function(time, result) {
              //目标坐标位置
              var sourpos = sourEntity.position.getValue(time);
              var cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos);
              var lon1 = Cesium.Math.toDegrees(cartographic1.longitude);
              var lat1 = Cesium.Math.toDegrees(cartographic1.latitude);
              var height1 = cartographic1.height;
              //源坐标位置
              var tarpos = tarPosition3;
              var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tarpos);
              var lon2 = Cesium.Math.toDegrees(cartographic.longitude);
              var lat2 = Cesium.Math.toDegrees(cartographic.latitude);
              var height2 = cartographic.height;
              
              //console.log(sourpos);
              //console.log(tarPosition);
              //console.log(Math.sqrt(Math.pow((sourpos.x-tarPosition.x),2)+Math.pow((sourpos.y-tarPosition.y),2)+Math.pow((sourpos.z-tarPosition.z),2)))
              
              return Cesium.Cartesian3.fromDegreesArrayHeights([lon1, lat1, height1, lon2, lat2, height2], Cesium.Ellipsoid
                .WGS84, result);
            }, false), //此处false表示isConstant为false,表示场景更新的每一帧中都获取该属性的数值，从而来更新三维场景中的物体
            width: 5,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.3,
              color: Cesium.Color.RED.withAlpha(0.9)
            })
          }
        }));
        //添加4km黄色射线
        gzxArr2.set(airPosition.id, viewer.entities.add({
          polyline: {
            //时间回调获取位置
            positions: new Cesium.CallbackProperty(function(time, result) {
              //目标坐标位置
              var sourpos = sourEntity.position.getValue(time);
              var cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos);
              var lon1 = Cesium.Math.toDegrees(cartographic1.longitude);
              var lat1 = Cesium.Math.toDegrees(cartographic1.latitude);
              var height1 = cartographic1.height;
              //源坐标位置
              var tarpos = tarPosition2;
              var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tarpos);
              var lon2 = Cesium.Math.toDegrees(cartographic.longitude);
              var lat2 = Cesium.Math.toDegrees(cartographic.latitude);
              var height2 = cartographic.height;
              
              return Cesium.Cartesian3.fromDegreesArrayHeights([lon1, lat1, height1, lon2, lat2, height2], Cesium.Ellipsoid
                .WGS84, result);
            }, false), //此处false表示isConstant为false,表示场景更新的每一帧中都获取该属性的数值，从而来更新三维场景中的物体
            width: 5,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.3,
              color: Cesium.Color.YELLOW.withAlpha(0.9)
            })
          }
        }));
        //添加6km绿色射线
        gzxArr3.set(airPosition.id, viewer.entities.add({
          polyline: {
            //时间回调获取位置
            positions: new Cesium.CallbackProperty(function(time, result) {
              //目标坐标位置
              var sourpos = sourEntity.position.getValue(time);
              var cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos);
              var lon1 = Cesium.Math.toDegrees(cartographic1.longitude);
              var lat1 = Cesium.Math.toDegrees(cartographic1.latitude);
              var height1 = cartographic1.height;
              //源坐标位置
              var tarpos = tarPosition2;
              var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tarpos);
              var lon2 = Cesium.Math.toDegrees(cartographic.longitude);
              var lat2 = Cesium.Math.toDegrees(cartographic.latitude);
              var height2 = cartographic.height;
              
              return Cesium.Cartesian3.fromDegreesArrayHeights([lon1, lat1, height1, lon2, lat2, height2], Cesium.Ellipsoid
                .WGS84, result);
            }, false), //此处false表示isConstant为false,表示场景更新的每一帧中都获取该属性的数值，从而来更新三维场景中的物体
            width: 5,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.3,
              color: Cesium.Color.GREEN.withAlpha(0.9)
            })
          }
        }));
        
        //射线初始隐藏
        gzxArr.get(airPosition.id)._show = false;
        gzxArr2.get(airPosition.id)._show = false;
        gzxArr3.get(airPosition.id)._show = false;
        
        
      } else {
        //已有目标则更新坐标
        let now = Cesium.JulianDate.now();
        positionsArr.get(airPosition.id).addSample(Cesium.JulianDate.addSeconds(now, delay, new Cesium.JulianDate()),
          position2);
      }
      airPositionArr.set(airPosition.id, {
        x: airPosition.X,
        y: airPosition.Y,
        z: airPosition.Z,
      });
      
      
      //打印距离信息
      //中心点坐标
      var sourpos = Cesium.Cartesian3.fromDegrees(lon, lat, hei);
      //飞机坐标
      var tarPosition = position2;
      //msg.label.text = clock.currentTime.toString();
      var height = viewer.scene.globe.ellipsoid.cartesianToCartographic(tarPosition).height
      //中心点距离飞机距离
      var xb = Math.sqrt(Math.pow((sourpos.x - tarPosition.x), 2) + Math.pow((sourpos.y - tarPosition.y), 2) + Math.pow(
        (sourpos.z - tarPosition.z), 2));
      //console.log(xb);
      var jl = Math.sqrt(Math.pow((xb - height), 2));
      
      //时间变化监听函数,动态显示信息
      viewer.clock.onTick.addEventListener(function(clock) {
        //中心点坐标
        var sourpos = Cesium.Cartesian3.fromDegrees(lon, lat, hei);
        //飞机坐标
        var tarPosition = airArr.get(airPosition.id).position.getValue(clock.currentTime);
        //msg.label.text = clock.currentTime.toString();
        var height = viewer.scene.globe.ellipsoid.cartesianToCartographic(tarPosition).height
        //中心点距离飞机距离
        var xb = Math.sqrt(Math.pow((sourpos.x - tarPosition.x), 2) + Math.pow((sourpos.y - tarPosition.y), 2) + Math.pow(
          (sourpos.z - tarPosition.z), 2));
        //console.log(xb);
        var jl = Math.sqrt(Math.pow((xb - height), 2));
        
        //根据无人机距离中心点距离判断是否显示射线
        if (jl <= 2000) {
          gzxArr.get(airPosition.id)._show = true;
          gzxArr2.get(airPosition.id)._show = false;
          gzxArr3.get(airPosition.id)._show = false;
        } else if (jl <= 4000) {
          gzxArr.get(airPosition.id)._show = false;
          gzxArr2.get(airPosition.id)._show = true;
          gzxArr3.get(airPosition.id)._show = false;
        } else if (jl <= 6000) {
          gzxArr.get(airPosition.id)._show = false;
          gzxArr2.get(airPosition.id)._show = false;
          gzxArr3.get(airPosition.id)._show = true;
        } else {
          gzxArr.get(airPosition.id)._show = false;
          gzxArr2.get(airPosition.id)._show = false;
          gzxArr3.get(airPosition.id)._show = false;
        }
        
        if (jl <= 5000) {
          $("#mubiao" + airPosition.id).show();
        } else {
          $("#mubiao" + airPosition.id).hide();
        }
        
      });
    } else if (msg.topic.indexOf("Radar") != -1) {
      var radarInfo = JSON.parse(msg.payloadString);
      //console.log(radarInfo)
      var flag = true;
      for (var i = 0; i < vm.leidaArr.length; i++) {
        if (vm.leidaArr[i].id == radarInfo.id) {
          //vm.leidaArr[i] = radarInfo;
          //深度监听对象数组
          vm.$set(vm.leidaArr, i, radarInfo);
          flag = false;
        }
      }
      if (flag) {
        vm.leidaArr.push(radarInfo);
      }
      console.log(vm.leidaArr)
    } else if (msg.topic.indexOf("GuangDian") != -1) {
      var info = JSON.parse(msg.payloadString);
      //console.log(info)
      vm.gdInfo = info;
    } else if (msg.topic.indexOf("DianZhen") != -1) {
      if(msg.topic.indexOf("DianZhenOut") != -1){
        let info = JSON.parse(msg.payloadString);
        for (var i = 0; i < vm.dzArr.length; i++) {
          if (vm.dzArr[i].id == info.id) {
            vm.dzArr.splice(i,1);
          }
        }
        return;
      }
      var info = JSON.parse(msg.payloadString);
      var flag = true;
      for (var i = 0; i < vm.dzArr.length; i++) {
        if (vm.dzArr[i].id == info.id) {
          vm.$set(vm.dzArr, i, info);
          flag = false;
        }
      }
      if (flag) {
        vm.dzArr.push(info);
      }
    } else if (msg.topic.indexOf("Crack") != -1) {
      if(msg.topic.indexOf("CrackOut") != -1){
        let info = JSON.parse(msg.payloadString);
        for (var i = 0; i < vm.xypjArr.length; i++) {
          if (vm.xypjArr[i].id == info.id) {
            vm.xypjArr.splice(i,1);
          }
        }
        return;
      }
      var info = JSON.parse(msg.payloadString);
      var flag = true;
      for (var i = 0; i < vm.xypjArr.length; i++) {
        if (vm.xypjArr[i].id == info.id) {
          vm.$set(vm.xypjArr, i, info);
          flag = false;
        }
      }
      if (flag) {
        vm.xypjArr.push(info);
      }
    } else if (msg.topic.indexOf("ADSB") != -1) {
      if(msg.topic.indexOf("ADSBOut") != -1){
        let info = JSON.parse(msg.payloadString);
        for (var i = 0; i < vm.adsbArr.length; i++) {
          if (vm.adsbArr[i].id == info.id) {
            vm.adsbArr.splice(i,1);
          }
        }
        return;
      }
      var info = JSON.parse(msg.payloadString);
      var flag = true;
      for (var i = 0; i < vm.adsbArr.length; i++) {
        if (vm.adsbArr[i].id == info.id) {
          vm.$set(vm.adsbArr, i, info);
          flag = false;
        }
      }
      if (flag) {
        vm.adsbArr.push(info);
      }
    }
  });
  //去除底部logo
  viewer._cesiumWidget._creditContainer.style.display = "none";
  //取消双击追踪目标事件
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
  //追踪目标与取消
  //viewer.trackedEntity = undefined;
}
