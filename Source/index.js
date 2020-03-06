
// vue对象
const vm = new Vue({
  el: '#main',
  data: {
    //控制按钮切换
    controlButton: 0,
    //旋转速度
    rotateSpeed: 0.01,
    //初始角度
    rotateAngle: 0,
    //角度变化速率
    rotateAngleRate: 0.1,
    // Rotate Timer Event
    rotateTimer: new Cesium.Event(),
    // 雷达信息
    radarArr: [],
    // 雷达下标
    radarIndex: 0,
    // 光电信息
    gdInfo: '',
    // 电子侦查信息
    ereconArr: [],
    // 电子侦查下标
    ereconIndex: 0,
    // 协议破解信息
    crackerArr: [],
    // 协议破解下标
    crackerIndex: 0,
    // ADS-B信息
    adsbArr: [],
    // ADS-B下标
    adsbIndex: 0,
    // 目标集合
    targetArr: [],
    // 告警数量
    WarnNum: {
      blowNum:0,
      disposeNum:0,
      warnNum:0,
      positionNum:0,
    },
    // 光电自动跟踪
    gdAuto: false,
    //告警列表显示flag
    alertFlag: false,
    //预案信息
    PlanArr: {},
    PlanArrPreset: [
      {
        id:'1',
        log:[
          '处置001自动模式',
          '08:01发现目标001，进入5km禁区，一级告警，高度300m，速度20km/s',
          '大疆无人机',
          '证据已经保留(点击查看)',
          '08:01自动执行',
          '预案，执行定向干扰打击(自动)，点击查看预案文档',
          '08:05处置完毕，拦截失败',
        ]
      },
      {
        id:'2',
        log:[
          '处置002自动模式',
          '08:03发现目标002，进入5km禁区，一级告警，高度500m，速度23km/s',
          '未知飞行物',
          '证据已经保留(点击查看)',
          '08:06自动执行',
          '预案，执行定向干扰打击(自动)，点击查看预案文档',
          '08:09处置完毕，拦截失败',
        ]
      }
    ],
  },
  methods: {
    rotate() {
      const center = Cesium.Cartesian3.fromDegrees(...POSITION_CENTER);//camera视野的中心点坐标
      const heading = Cesium.Math.toRadians(vm.rotateAngle);
      const pitch = Cesium.Math.toRadians(-20.0);
      const range = 4000.0;
      viewer.camera.lookAt(center, new Cesium.HeadingPitchRange(heading, pitch, range));
      vm.rotateAngle += vm.rotateAngleRate;
      //scene.camera.rotate(Cesium.Cartesian3.fromDegrees(...POSITION_CENTER.slice(0, 2), 5000), -1 * vm.rotateSpeed);
    },
    mapReset() {
      viewer.trackedEntity = undefined;
      vm.rotateTimer.removeEventListener(vm.rotate);

      scene.camera.flyTo({
        destination: new Cesium.Cartesian3.fromDegrees(...POSITION_CENTER.slice(0, 2), 5000),
        orientation: {
          heading : 6.283185307179586,
          pitch : Cesium.Math.toRadians(-90),
          roll : 0
        }
      });
    },
    rotateStart() {
      viewer.trackedEntity = undefined;

      if (!vm.rotateTimer.removeEventListener(vm.rotate)) { // If we are not rotating
       /*  await scene.camera.flyTo({
          destination: new Cesium.Cartesian3.fromDegrees(108.89854530935382, 19.4268, 1430),
          orientation: {
            heading : 0.0,
            pitch : -0.3496550394737836,
            roll : 0
          },
        }); */
        scene.camera.flyToBoundingSphere(
          new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(...POSITION_CENTER)),
          {
            offset: new Cesium.HeadingPitchRange(
              Cesium.Math.toRadians(vm.rotateAngle),
              Cesium.Math.toRadians(-20.0),
              4000.0),
            complete: () => {
              vm.rotateTimer.addEventListener(vm.rotate);
            },
          },
        );
      } else {
        vm.rotateTimer.addEventListener(vm.rotate);
      }
    },
    rotateEnd() {
      // vm.rotateAngle = 0;
      vm.rotateTimer.removeEventListener(vm.rotate);
      viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY)
    },
    changeLog(id) {
      vm.PlanArrPreset.filter((i) => i.id === id).forEach((entity) => {
        vm.PlanArr = entity;
      });
    },
    alertWarn() {
      vm.alertFlag = !vm.alertFlag;
    },
    closeWarn() {
      vm.alertFlag = false;
    },
    radarIndexJian() {
      if (vm.radarIndex > 0) {
        vm.radarIndex--;
      }
    },
    radarIndexJia() {
      if (vm.radarIndex < vm.radarArr.length - 1) {
        vm.radarIndex++;
      }
    },
    ereconIndexJian() {
      if (vm.ereconIndex > 0) {
        vm.ereconIndex--;
      }
    },
    ereconIndexJia() {
      if (vm.ereconIndex < vm.ereconArr.length - 1) {
        vm.ereconIndex++;
      }
    },
    crackerIndexJian() {
      if (vm.crackerIndex > 0) {
        vm.crackerIndex--;
      }
    },
    crackerIndexJia() {
      if (vm.crackerIndex < vm.crackerArr.length - 1) {
        vm.crackerIndex++;
      }
    },
    adsbIndexJian() {
      if (vm.adsbIndex > 0) {
        vm.adsbIndex--;
      }
    },
    adsbIndexJia() {
      if (vm.adsbIndex < vm.adsbArr.length - 1) {
        vm.adsbIndex++;
      }
    },
  },
  watch: {

  },
});

// 地图相关
let viewer;
let scene;
// 飞机坐标自定义延时
const delay = 1.0;

// 初始值
let GimbalAzimuth = 0; // 方位角
let GimbalPitchAngle = 0; // 俯仰角
let GimbalDistance = 4000; // 距离
let GimbalAzimuthDvalue = Cesium.Math.toRadians(1); // 方位差
let GimbalPitchAngleDvalue = Cesium.Math.toRadians(1); // 俯仰差
let GimbalDistanceDvalue = 100; // 距离差
let DistanceAddTime;//距离增加定时器
let DistanceSubTime;//距离减少定时器
let GimbalRate = 400//变化速率，ms
let IntervalTime = new Map();

function GimbalSendMsg(direction, step){
	const msg = {
		  direction:direction,
		  step:step
	}
	sendMsg("/CC/MsgForAntiUAV/GuangDianCtrl/0", JSON.stringify(msg), 0, false);
}

function GimbalControl(SetOrCancle,type,model,Dvalue){
	if(SetOrCancle){
		IntervalTime.set(type,setInterval(function(){
			GimbalSendMsg(model,Dvalue);
		},GimbalRate));
	}else{
		clearInterval(IntervalTime.get(type));
		IntervalTime.delete(type);
	}
}

function GimbalReset() {
  /* GimbalAzimuth = 0;
  GimbalPitchAngle = 0;
  GimbalDistance = 4000; */
  GimbalSendMsg(0,0);
}

function DistanceAdd() {
  GimbalDistance += GimbalDistanceDvalue;
}
function DistanceAddStart() {
  DistanceAddTime = setInterval(function(){
	  GimbalDistance += GimbalDistanceDvalue;
  },GimbalRate)
}
function DistanceAddEnd() {
  clearInterval(DistanceAddTime)
}

function DistanceSub() {
  GimbalDistance -= GimbalDistanceDvalue;
}
function DistanceSubStart() {
  DistanceSubTime = setInterval(function(){
	  GimbalDistance -= GimbalDistanceDvalue;
  },GimbalRate)
}
function DistanceSubEnd() {
  clearInterval(DistanceSubTime)
}

const documentReady = async (Cesium) => {
  const partOfUrl = '/iserver/services/3D-hn1108/rest/realspace';
  // 加载三维地球场景
  viewer = new Cesium.Viewer('cesiumContainer', {
    infobox: false,
    selectionIndicator: false,
  });
  scene = viewer.scene;
  const widget = viewer.cesiumWidget;

  try {
    // 加载在线天地图
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

    // 加载二维图层
    /* const backgroundLayer = viewer.imageryLayers.addImageryProvider(await new Cesium.SuperMapImageryProvider({
      url: LAYER_IMAGERY_URL,
    })); */

    // 添加S3M图层服务
    /* const layer = await scene.addS3MTilesLayerByScp(
      LAYER_S3M_URL, {
        name: 'Config1',
      },
    );
    layer.style3D.bottomAltitude = 55;
    layer.refresh(); */

    // 设置相机位置、视角，便于观察场景
    scene.camera.flyToBoundingSphere(
      new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(...POSITION_CENTER)),
      {
        offset: new Cesium.HeadingPitchRange(
          Cesium.Math.toRadians(vm.rotateAngle),
          Cesium.Math.toRadians(-20.0),
          1000.0),
        complete: () => {
          //vm.rotateTimer.addEventListener(vm.rotate);
		  vm.mapReset();
        },
      },
    );

    if (!scene.pickPositionSupported) {
      alert('不支持深度纹理,无法拾取位置！');
    }

    // 圆形探测波
    /* viewer.scene.scanEffect.show = true;
    viewer.scene.scanEffect.color  = Cesium.Color.RED;
    viewer.scene.scanEffect.speed  =1000 ;//单位：米/秒
    viewer.scene.scanEffect.period = 1;
    viewer.scene.scanEffect.centerPostion = new Cesium.Cartesian3.fromDegrees(108.90, 19.46, 100.0);//需要使用世界坐标
    viewer.scene.scanEffect.mode =Cesium.ScanEffectMode.CIRCLE;//Cesium.ScanEffectMode.LINE 为线型扫描模式
    console.log(viewer.scene.scanEffect) */
  } catch (e) {
    alert(e);

    if (widget._showRenderLoopErrors) {
      const title = '渲染时发生错误，已停止渲染。';
      widget.showErrorPanel(title, undefined, e);
    }
  }

  $('#loadingbar').remove();
  setInterval(() => {
    vm.rotateTimer.raiseEvent();
  }, 200);


  // 可视域分析,创建雷达扫描
  const viewshed3D = [];
  [0, 1, 2].forEach((i) => {
    viewshed3D[i] = new Cesium.ViewShed3D(scene);
    Object.assign(viewshed3D[i], {
      hiddenAreaColor: Cesium.Color.GRAY.withAlpha(0.5),
      horizontalFov: 130,
      pitch: 45,
      verticalFov: 90,
      viewPosition: [...POSITION_STATION_ONE.slice(0, 2), 30],
      visibleAreaColor: Cesium.Color.LAWNGREEN.withAlpha(0.5),
    });
  });
  viewshed3D[0].direction = 0;
  viewshed3D[1].direction = 120;
  viewshed3D[2].direction = 240;

  $('#radarCoverage').click((e) => {
    if ($(e.currentTarget).find(':button').attr('aria-pressed') === 'false') { /* Before toggled */
      viewshed3D.forEach((entity) => {
        entity.distance = 5000;
        entity.build();
      });
    } else {
      viewshed3D.forEach((entity) => {
        entity.distance = 0.1;
        entity.build();
      });
    }
  });


  const radarViewer = new Cesium.Viewer('radarChart', {
    infoBox: false,
    sceneMode: Cesium.SceneMode.SCENE2D,
  });

  radarViewer.scene.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(...POSITION_CENTER.slice(0, 2), 15000),
    orientation: Cesium.HeadingPitchRoll.fromDegrees(0.0, 0.0, 0.0),
  });

  const radarScene = radarViewer.scene;
  radarScene.screenSpaceCameraController.enableInputs = false;

  radarViewer.imageryLayers.addImageryProvider(new Cesium.SingleTileImageryProvider({
    url: 'Source/Images/leidatu.jpg',
    rectangle: Cesium.Rectangle.fromDegrees(...POSITION_RADAR_RANGE),
  }));

  radarViewer.clock = viewer.clock;

  radarViewer._cesiumWidget._creditContainer.style.display = 'none';
  $('#radarChart .cesium-viewer-navigationContainer').hide();

  const radarHandler = new Cesium.ScreenSpaceEventHandler(radarScene.canvas);
  radarHandler.setInputAction(async (e) => {
    const pickedObject = radarScene.pick(e.position);
    if (Cesium.defined(pickedObject)) {
      vm.rotateTimer.removeEventListener(vm.rotate);
      await viewer.flyTo(pickedObject.id, {
        offset: new Cesium.HeadingPitchRange(0.0, -0.5, 100.0),
      });
      viewer.trackedEntity = pickedObject.id;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);


  $('#ereconButton').click((e) => {
    if ($(e.currentTarget).find(':button').attr('aria-pressed') === 'false') { /* Before toggled */
      vm.ereconArr.forEach((entity) => {
        entity.polygon.show = true;
      });
    } else {
      vm.ereconArr.forEach((entity) => {
        entity.polygon.show = false;
      });
    }
  });

  $('#protocolCrackingButton').click((e) => {
    if ($(e.currentTarget).find(':button').attr('aria-pressed') === 'false') { /* Before toggled */
      vm.crackerArr.forEach((entity) => {
        entity.polygon.show = true;
      });
    } else {
      vm.crackerArr.forEach((entity) => {
        entity.polygon.show = false;
      });
    }
  });

  // 站1
  const water1 = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(...POSITION_STATION_ONE),
    billboard: { // 图标
      image: 'Source/Images/水滴.png',
      width: 16,
      height: 16,
    },
  });
  // 站2
  const water2 = viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(...POSITION_STATION_TWO),
    billboard: { // 图标
      image: 'Source/Images/水滴.png',
      width: 16,
      height: 16,
    },
  });


  // 画圆
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(...POSITION_CENTER),
    name: 'Red ellipse on surface within 1000 km with outline',
    ellipse: {
      fill: false,
      height: 30,
      material: Cesium.Color.RED.withAlpha(0.1),
      outline: true,
      outlineColor: Cesium.Color.RED,
      outlineWidth: 10,
      semiMajorAxis: 1000.0,
      semiMinorAxis: 1000.0,
    },
  });
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(...POSITION_CENTER),
    name: 'YELLOW ellipse on surface within 3000 km with outline',
    ellipse: {
      fill: false,
      height: 30,
      material: Cesium.Color.YELLOW.withAlpha(0.1),
      outline: true,
      outlineColor: Cesium.Color.YELLOW,
      outlineWidth: 10,
      semiMajorAxis: 3000.0,
      semiMinorAxis: 3000.0,
    },
  });
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(...POSITION_CENTER),
    name: 'GREEN ellipse on surface within 5000 km with outline',
    ellipse: {
      fill: false,
      height: 30,
      material: Cesium.Color.GREEN.withAlpha(0.1),
      outline: true,
      outlineColor: Cesium.Color.GREEN,
      outlineWidth: 10,
      semiMajorAxis: 5000.0,
      semiMinorAxis: 5000.0,
    },
  });


  // 当前时间为起始时间,终止时间为1小时
  const start = Cesium.JulianDate.now();
  let stop = Cesium.JulianDate.addSeconds(start, 3600, new Cesium.JulianDate());
  // 校准时钟
  viewer.clock.startTime = start.clone();
  viewer.clock.stopTime = stop.clone();
  viewer.clock.currentTime = start.clone();
  // 映射时间轴(没开)
  // viewer.clock.clockRange = Cesium.ClockRange.CLAMPED
  viewer.clock.shouldAnimate = true; // default
  viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER; // tick computation mode
  // 到达终止时间时循环
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // loop at the end

  // mqtt消息单次接收到的坐标点
  let position2;
  // 所有map的key为无人机编号
  // 无人机坐标点集合,用来判断是否有新无人机进入
  const airPositionArr = new Map();
  // 无人机带时间坐标集合
  const positionsArr = new Map();
  // 无人机实体类集合
  const airArr = new Map();
  // 指向2km内无人机红线集合
  const gzxArr = new Map();
  // 指向3km内无人机黄线集合
  const gzxArr2 = new Map();
  // 指向4km内无人机绿线集合
  const gzxArr3 = new Map();
  // 指向4km内无人机绿线集合
  const gzxArr4 = new Map();


  // 光电线测试
  const gdx = viewer.entities.add({
    polyline: {
      // 时间回调获取位置
      positions: new Cesium.CallbackProperty(((time, result) => {
        const { ellipsoid } = viewer.scene.globe;
        const center = Cesium.Cartesian3.fromDegrees(...POSITION_STATION_ONE);
        const transform = Cesium.Transforms.eastNorthUpToFixedFrame(center);
        // 目标坐标位置
        const x = Math.cos(GimbalPitchAngle) * GimbalDistance * Math.sin(GimbalAzimuth);
        const y = Math.cos(GimbalPitchAngle) * GimbalDistance * Math.cos(GimbalAzimuth);
        const z = Math.sin(GimbalPitchAngle) * GimbalDistance;
        const p = new Cesium.Cartesian3(x, y, z);
        const sourpos = Cesium.Matrix4.multiplyByPoint(transform, p, new Cesium.Cartesian3());
        const cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos);
        const lon1 = Cesium.Math.toDegrees(cartographic1.longitude);
        const lat1 = Cesium.Math.toDegrees(cartographic1.latitude);
        const height1 = cartographic1.height;
		
        /* if(qflag){
      console.log("lon:"+lon1);
      console.log("lat:"+lat1);
      console.log("height:"+height1);

      console.log("fw:"+fw);
      console.log("fy:"+fy);
      console.log("s:"+s);
      qflag = false;
    } */
        // 源坐标位置
        const tarpos = Cesium.Cartesian3.fromDegrees(...POSITION_STATION_ONE);
        const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tarpos);
        const lon2 = Cesium.Math.toDegrees(cartographic.longitude);
        const lat2 = Cesium.Math.toDegrees(cartographic.latitude);
        const height2 = cartographic.height;

        return Cesium.Cartesian3.fromDegreesArrayHeights([lon1, lat1, height1, lon2, lat2, height2], Cesium.Ellipsoid
          .WGS84, result);
      }), false), // 此处false表示isConstant为false,表示场景更新的每一帧中都获取该属性的数值，从而来更新三维场景中的物体
      width: 5,
      material: new Cesium.PolylineGlowMaterialProperty({
        glowPower: 0.3,
        color: Cesium.Color.BLUE.withAlpha(0.9),
      }),
    },
  });
  
  function S4() {
  	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }
  
  function NewGuid() {
  	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  }


  connect(MQTT_HOST, MQTT_PORT, MQTT_USER, MQTT_PASS, "clientTest" + NewGuid(), (isConnected) => {
    if (isConnected) {
      // 无人机坐标点消息
      subscribe('/CC/MsgForAntiUAV/RadarTarget/#', 0);
      // 雷达信息消息
      subscribe('/CC/MsgForAntiUAV/RadarDevice/#', 0);
      // 光电信息
      subscribe('/CC/MsgForAntiUAV/GuangDianDevice/#', 0);
      // 光电目标离开信息
      subscribe('/CC/MsgForAntiUAV/GuangDianTargetOut/#', 0);
      // 光电控制云台信息
      subscribe('/CC/MsgForAntiUAV/GuangDianTarget/#', 0);
      // 电子侦查信息
      subscribe('/CC/MsgForAntiUAV/DianZhenTarget/#', 0);
      // 电子侦查信息目标离开
      subscribe('/CC/MsgForAntiUAV/DianZhenTargetOut/#', 0);
      // 协议破解信息
      subscribe('/CC/MsgForAntiUAV/ProtocolCrackTarget/#', 0);
      // 协议破解信息目标离开
      subscribe('/CC/MsgForAntiUAV/ProtocolCrackTargetOut/#', 0);
      // ADS-B信息
      subscribe('/CC/MsgForAntiUAV/ADSBTarget/#', 0);
      // ADS-B目标离开
      subscribe('/CC/MsgForAntiUAV/ADSBTargetOut/#', 0);
      // 雷达通知无人机离开
      subscribe('/CC/MsgForAntiUAV/RadarTargetOut/#', 0);
      // 告警数量
      subscribe('/CC/MsgForAntiUAV/Warning/#', 0);
      //光电工作模式
      subscribe('/CC/MsgForAntiUAV/GuangDianWorkingMode/#', 0);
	  //融合目标信息
	  subscribe('/CC/MsgForAntiUAV/TargetIntersect/#', 0);
    }
  }, async (msg) => {
    console.log(msg);
    // 接收到飞机位置信息
    if (/.*\/RadarTarget\/.*/.test(msg.topic)) {
      // 目标信息
      const airPosition = JSON.parse(msg.payloadString);
      const entities = vm.targetArr.filter((i) => i.id === airPosition.id);
      if (entities.length) {
        entities.forEach((entity, i) => {
          vm.$set(entities, i, airPosition);
        });
      } else {
        vm.targetArr.push(airPosition);
      }

      position2 = Cesium.Cartesian3.fromDegrees(+airPosition.lon, +airPosition.lat, +airPosition.hei);

      // 新目标则创建新的实体类
      if (!airPositionArr.has(airPosition.id)) {
        positionsArr.set(airPosition.id, new Cesium.SampledPositionProperty());
        // 设置插值算法为线性插值
        positionsArr.get(airPosition.id).setInterpolationOptions({
          // 获取检索值时要执行的内插度
          interpolationDegree: 5,
          interpolationAlgorithm: Cesium.LinearApproximation, // Cesium.LagrangePolynomialApproximation,
        });
        // 插值超出样本数据范围时，将使用第一个或最后一个值。
        positionsArr.get(airPosition.id).backwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
        positionsArr.get(airPosition.id).forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;

        // 无人机初始位置为第一个坐标点
        positionsArr.get(airPosition.id).addSample(Cesium.JulianDate.addSeconds(Cesium.JulianDate.now(), delay, new Cesium
          .JulianDate()), position2);
        // 添加无人机
        const sourEntity = new Cesium.Entity({
          name: 'Drone',
          availability: new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({
              start,
              stop,
            }),
          ]),
          // 飞机上标签
          label: {
            fillColor: Cesium.Color.WHITE,
            font: '15px Helvetica',
            outlineColor: Cesium.Color.RED,
            pixelOffset: new Cesium.Cartesian2(0.0, -20),
            showBackground: true,
            text: `编号：${airPosition.id}`,

          },
          model: {
            uri: 'Source/Models/CesiumDrone.gltf',
            minimumPixelSize: 16,
          },
          orientation: new Cesium.VelocityOrientationProperty(positionsArr.get(airPosition.id)),
          // 飞行路径
          path: {
            leadTime: 0,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.1,
              color: Cesium.Color.PINK,
            }),
            resolution: 1,
            width: 1,
          },
          position: positionsArr.get(airPosition.id),
          viewFrom: new Cesium.Cartesian3(0.0, -100.0 * Math.cos(0.5), 100.0 * Math.sin(0.5)), // 跟踪飞机的时候视角偏移量
        });

        setTimeout(() => {
          viewer.entities.add(sourEntity);
          radarViewer.entities.add(sourEntity);
          airArr.set(airPosition.id, sourEntity);
        }, delay * 1000);


        // 闪烁
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

        // 中心点
        const tarPosition = Cesium.Cartesian3.fromDegrees(...POSITION_CENTER);
        // 站1
        const tarPosition2 = Cesium.Cartesian3.fromDegrees(...POSITION_STATION_ONE);
        // 站2
        const tarPosition3 = Cesium.Cartesian3.fromDegrees(...POSITION_STATION_TWO);

        // 添加2km红色射线
        gzxArr.set(airPosition.id, viewer.entities.add({
          polyline: {
            // 时间回调获取位置
            positions: new Cesium.CallbackProperty(((time, result) => {
              // 目标坐标位置
              const sourpos = sourEntity.position.getValue(time);
              const cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos);
              const lon1 = Cesium.Math.toDegrees(cartographic1.longitude);
              const lat1 = Cesium.Math.toDegrees(cartographic1.latitude);
              const height1 = cartographic1.height;
              // 源坐标位置
              const tarpos = tarPosition3;
              const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tarpos);
              const lon2 = Cesium.Math.toDegrees(cartographic.longitude);
              const lat2 = Cesium.Math.toDegrees(cartographic.latitude);
              const height2 = cartographic.height;

              // console.log(sourpos);
              // console.log(tarPosition);
              // console.log(Math.sqrt(Math.pow((sourpos.x-tarPosition.x),2)+Math.pow((sourpos.y-tarPosition.y),2)+Math.pow((sourpos.z-tarPosition.z),2)))

              return Cesium.Cartesian3.fromDegreesArrayHeights([lon1, lat1, height1, lon2, lat2, height2], Cesium.Ellipsoid
                .WGS84, result);
            }), false), // 此处false表示isConstant为false,表示场景更新的每一帧中都获取该属性的数值，从而来更新三维场景中的物体
            width: 5,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.3,
              color: Cesium.Color.RED.withAlpha(0.9),
            }),
          },
        }));
        // 添加4km黄色射线
        gzxArr2.set(airPosition.id, viewer.entities.add({
          polyline: {
            // 时间回调获取位置
            positions: new Cesium.CallbackProperty(((time, result) => {
              // 目标坐标位置
              const sourpos = sourEntity.position.getValue(time);
              const cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos);
              const lon1 = Cesium.Math.toDegrees(cartographic1.longitude);
              const lat1 = Cesium.Math.toDegrees(cartographic1.latitude);
              const height1 = cartographic1.height;
              // 源坐标位置
              const tarpos = tarPosition2;
              const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tarpos);
              const lon2 = Cesium.Math.toDegrees(cartographic.longitude);
              const lat2 = Cesium.Math.toDegrees(cartographic.latitude);
              const height2 = cartographic.height;

              return Cesium.Cartesian3.fromDegreesArrayHeights([lon1, lat1, height1, lon2, lat2, height2], Cesium.Ellipsoid
                .WGS84, result);
            }), false), // 此处false表示isConstant为false,表示场景更新的每一帧中都获取该属性的数值，从而来更新三维场景中的物体
            width: 5,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.3,
              color: Cesium.Color.YELLOW.withAlpha(0.9),
            }),
          },
        }));
        // 添加6km绿色射线
        gzxArr3.set(airPosition.id, viewer.entities.add({
          polyline: {
            // 时间回调获取位置
            positions: new Cesium.CallbackProperty(((time, result) => {
              // 目标坐标位置
              const sourpos = sourEntity.position.getValue(time);
              const cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos);
              const lon1 = Cesium.Math.toDegrees(cartographic1.longitude);
              const lat1 = Cesium.Math.toDegrees(cartographic1.latitude);
              const height1 = cartographic1.height;
              // 源坐标位置
              const tarpos = tarPosition2;
              const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tarpos);
              const lon2 = Cesium.Math.toDegrees(cartographic.longitude);
              const lat2 = Cesium.Math.toDegrees(cartographic.latitude);
              const height2 = cartographic.height;

              return Cesium.Cartesian3.fromDegreesArrayHeights([lon1, lat1, height1, lon2, lat2, height2], Cesium.Ellipsoid
                .WGS84, result);
            }), false), // 此处false表示isConstant为false,表示场景更新的每一帧中都获取该属性的数值，从而来更新三维场景中的物体
            width: 5,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.3,
              color: Cesium.Color.GREEN.withAlpha(0.9),
            }),
          },
        }));
        // 添加6km绿色射线
        gzxArr4.set(airPosition.id, viewer.entities.add({
          polyline: {
            // 时间回调获取位置
            positions: new Cesium.CallbackProperty(((time, result) => {
              // 目标坐标位置
              const sourpos = sourEntity.position.getValue(time);
              const cartographic1 = Cesium.Ellipsoid.WGS84.cartesianToCartographic(sourpos);
              const lon1 = Cesium.Math.toDegrees(cartographic1.longitude);
              const lat1 = Cesium.Math.toDegrees(cartographic1.latitude);
              const height1 = cartographic1.height;
              // 源坐标位置
              const tarpos = tarPosition3;
              const cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(tarpos);
              const lon2 = Cesium.Math.toDegrees(cartographic.longitude);
              const lat2 = Cesium.Math.toDegrees(cartographic.latitude);
              const height2 = cartographic.height;

              return Cesium.Cartesian3.fromDegreesArrayHeights([lon1, lat1, height1, lon2, lat2, height2], Cesium.Ellipsoid
                .WGS84, result);
            }), false), // 此处false表示isConstant为false,表示场景更新的每一帧中都获取该属性的数值，从而来更新三维场景中的物体
            width: 5,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.3,
              color: Cesium.Color.GREEN.withAlpha(0.9),
            }),
          },
        }));

        // 射线初始隐藏
        gzxArr.get(airPosition.id)._show = false;
        gzxArr2.get(airPosition.id)._show = false;
        gzxArr3.get(airPosition.id)._show = false;
      } else {
        // 已有目标则更新坐标
        const now = Cesium.JulianDate.now();
        positionsArr.get(airPosition.id).addSample(Cesium.JulianDate.addSeconds(now, delay, new Cesium.JulianDate()),
          position2);
      }
      airPositionArr.set(airPosition.id, {
        x: airPosition.X,
        y: airPosition.Y,
        z: airPosition.Z,
      });


      // 打印距离信息
      // 中心点坐标
      const sourpos = Cesium.Cartesian3.fromDegrees(...POSITION_CENTER);
      // 飞机坐标
      const tarPosition = position2;
      // msg.label.text = viewer.clock.currentTime.toString();
      const { height } = viewer.scene.globe.ellipsoid.cartesianToCartographic(tarPosition);
      // 中心点距离飞机距离
      const xb = Math.sqrt(Math.pow((sourpos.x - tarPosition.x), 2) + Math.pow((sourpos.y - tarPosition.y), 2) + Math.pow(
        (sourpos.z - tarPosition.z), 2,
      ));
      // console.log(xb);
      const jl = Math.sqrt(Math.pow((xb - height), 2));

      // 时间变化监听函数,动态显示信息
      viewer.clock.onTick.addEventListener((clock) => {

        if(airArr.has(airPosition.id)){
          // 中心点坐标
          const sourpos = Cesium.Cartesian3.fromDegrees(...POSITION_CENTER);
          // 飞机坐标
          const tarPosition = airArr.get(airPosition.id).position.getValue(clock.currentTime);
          // msg.label.text = clock.currentTime.toString();
          const { height } = viewer.scene.globe.ellipsoid.cartesianToCartographic(tarPosition);
          // 中心点距离飞机距离
          const xb = Math.sqrt(Math.pow((sourpos.x - tarPosition.x), 2) + Math.pow((sourpos.y - tarPosition.y), 2) + Math.pow(
            (sourpos.z - tarPosition.z), 2,
          ));
          // console.log(xb);
          const jl = Math.sqrt(Math.pow((xb - height), 2));

          // 根据无人机距离中心点距离判断是否显示射线
          if (jl <= 2000) {
            gzxArr.get(airPosition.id)._show = true;
            gzxArr2.get(airPosition.id)._show = false;
            gzxArr3.get(airPosition.id)._show = false;
            gzxArr4.get(airPosition.id)._show = false;
          } else if (jl <= 4000) {
            gzxArr.get(airPosition.id)._show = false;
            gzxArr2.get(airPosition.id)._show = false;
            gzxArr3.get(airPosition.id)._show = false;
            gzxArr4.get(airPosition.id)._show = false;
          } else if (jl <= 6000) {
            gzxArr.get(airPosition.id)._show = false;
            gzxArr2.get(airPosition.id)._show = false;
            gzxArr3.get(airPosition.id)._show = true;
            gzxArr4.get(airPosition.id)._show = false;
          } else {
            gzxArr.get(airPosition.id)._show = false;
            gzxArr2.get(airPosition.id)._show = false;
            gzxArr3.get(airPosition.id)._show = false;
            gzxArr4.get(airPosition.id)._show = false;
          }

          if (jl <= 5000) {
            $(`#mubiao${airPosition.id}`).show();
          } else {
            $(`#mubiao${airPosition.id}`).hide();
          }
        }

      });
    } else if (/.*\/RadarDevice\/.*/.test(msg.topic)) {
      const radarInfo = JSON.parse(msg.payloadString);
      const entities = vm.radarArr.filter((i) => i.id === radarInfo.id);
      if (entities.length) {
        entities.forEach((entity, i) => {
          // vm.radarArr[i] = radarInfo;
          // 深度监听对象数组
          vm.$set(entities, i, radarInfo);
        });
      } else {
        vm.radarArr.push(radarInfo);
      }
    } else if (/.*\/RadarTargetOut\/.*/.test(msg.topic)) {
      const airId = JSON.parse(msg.payloadString);

      if (airArr.get(airId.id)) {
        setTimeout(() => {
          if (viewer.trackedEntity === airArr.get(airId.id)) {
            viewer.trackedEntity = undefined;
            vm.rotateStart();
          }

          viewer.entities.remove(airArr.get(airId.id));
          radarViewer.entities.remove(airArr.get(airId.id));

          viewer.entities.remove(gzxArr.get(airId.id));
          gzxArr.delete(airId.id);

          viewer.entities.remove(gzxArr2.get(airId.id));
          gzxArr2.delete(airId.id);

          viewer.entities.remove(gzxArr3.get(airId.id));
          gzxArr3.delete(airId.id);

          viewer.entities.remove(gzxArr4.get(airId.id));
          gzxArr4.delete(airId.id);

          airPositionArr.delete(airId.id);
          airArr.delete(airId.id);

          if(airId.id === vm.PlanArr.id){
            vm.PlanArr = '';
          }

          vm.targetArr = vm.targetArr.filter((i) => i.id !== airId);
        }, delay * 1000);
      }
    } else if (/.*\/GuangDianDevice\/.*/.test(msg.topic)) {
      const info = JSON.parse(msg.payloadString);
      // console.log(info)
      vm.gdInfo = info;
    } else if (/.*\/GuangDianTargetOut\/.*/.test(msg.topic)) {
      vm.gdInfo = '';
    } else if (/.*\/GuangDianTarget\/.*/.test(msg.topic)) {
      const info = JSON.parse(msg.payloadString);
      // if(!vm.gdAuto){
      GimbalAzimuth = info.azimuth;
      GimbalPitchAngle = info.overlookAngle;
      GimbalDistance = info.distance;
      // }
    } else if (/.*\/GuangDianWorkingMode\/.*/.test(msg.topic)) {
      const info = JSON.parse(msg.payloadString);
		
      if (info.work_mode === 'Auto') {
        vm.gdAuto = true;
      } else if (info.work_mode === 'Manual') {
        vm.gdAuto = false;
      }
    } else if (/.*\/DianZhenTarget\/.*/.test(msg.topic)) {
      const info = JSON.parse(msg.payloadString);

      const entity = vm.ereconArr.find((i) => i.targetId === info.id);
      if (entity) {
        entity.targetAngle = info.azimuth;
        entity.json = info;
      } else {
        vm.ereconArr.push(viewer.entities.add({
          targetAngle: info.azimuth,
          targetId: info.id,
          json: info,
          polygon: {
            hierarchy: new Cesium.CallbackProperty(() => [
              // The Apex
              ...Cesium.Cartesian3.fromDegreesArrayHeights(POSITION_STATION_ONE),
              // One Base Point
              Cesium.Cartesian3.add(
                Cesium.Matrix4.multiplyByPointAsVector(
                  Cesium.Transforms.eastNorthUpToFixedFrame(
                    Cesium.Cartesian3.fromDegrees(...POSITION_STATION_ONE),
                  ),
                  new Cesium.Cartesian3.fromSpherical(new Cesium.Spherical(
                    Cesium.Math.toRadians(90 - vm.ereconArr.find(
                      (i) => i.targetId === info.id,
                    ).targetAngle + 1.5),
                    Math.PI / 2, 5000.0,
                  )),
                  new Cesium.Cartesian3(),
                ),
                Cesium.Cartesian3.fromDegrees(...POSITION_STATION_ONE),
                new Cesium.Cartesian3(),
              ),
              // Another Base Point
              Cesium.Cartesian3.add(
                Cesium.Matrix4.multiplyByPointAsVector(
                  Cesium.Transforms.eastNorthUpToFixedFrame(
                    Cesium.Cartesian3.fromDegrees(...POSITION_STATION_ONE),
                  ),
                  new Cesium.Cartesian3.fromSpherical(new Cesium.Spherical(
                    Cesium.Math.toRadians(90 - vm.ereconArr.find(
                      (i) => i.targetId === info.id,
                    ).targetAngle - 1.5),
                    Math.PI / 2, 5000.0,
                  )),
                  new Cesium.Cartesian3(),
                ),
                Cesium.Cartesian3.fromDegrees(...POSITION_STATION_ONE),
                new Cesium.Cartesian3(),
              ),
            ], false),
            material: Cesium.Color.MAGENTA.withAlpha(0.2),
            outline: true,
            outlineColor: Cesium.Color.BLACK,
            perPositionHeight: true,
            show: $('#ereconButton :button').attr('aria-pressed') === 'true',
          },
        }));
      }
    } else if (/.*\/DianZhenTargetOut\/.*/.test(msg.topic)) {
      const info = JSON.parse(msg.payloadString);
      vm.ereconArr.filter((i) => i.targetId === info.id).forEach((entity) => {
        viewer.entities.remove(entity);
      });
      vm.ereconArr = vm.ereconArr.filter((i) => i.targetId !== info.id);

      if (vm.ereconIndex > vm.ereconArr.length - 1 && vm.ereconArr.length > 0) {
        vm.ereconIndex = vm.ereconArr.length - 1;
      }
    } else if (/.*\/ProtocolCrackTarget\/.*/.test(msg.topic)) {
      const info = JSON.parse(msg.payloadString);

      const entity = vm.crackerArr.find((i) => i.targetId === info.id);
      if (entity) {
        entity.targetAngle = info.azimuth;
        entity.json = info;
      } else {
        vm.crackerArr.push(viewer.entities.add({
          targetAngle: info.azimuth,
          targetId: info.id,
          json: info,
          polygon: {
            hierarchy: new Cesium.CallbackProperty(() => [
              // The Apex
              ...Cesium.Cartesian3.fromDegreesArrayHeights(POSITION_STATION_TWO),
              // One Base Point
              Cesium.Cartesian3.add(
                Cesium.Matrix4.multiplyByPointAsVector(
                  Cesium.Transforms.eastNorthUpToFixedFrame(
                    Cesium.Cartesian3.fromDegrees(...POSITION_STATION_TWO),
                  ),
                  new Cesium.Cartesian3.fromSpherical(new Cesium.Spherical(
                    Cesium.Math.toRadians(90 - vm.crackerArr.find(
                      (i) => i.targetId === info.id,
                    ).targetAngle + 1.5),
                    Math.PI / 2, 5000.0,
                  )),
                  new Cesium.Cartesian3(),
                ),
                Cesium.Cartesian3.fromDegrees(...POSITION_STATION_TWO),
                new Cesium.Cartesian3(),
              ),
              // Another Base Point
              Cesium.Cartesian3.add(
                Cesium.Matrix4.multiplyByPointAsVector(
                  Cesium.Transforms.eastNorthUpToFixedFrame(
                    Cesium.Cartesian3.fromDegrees(...POSITION_STATION_TWO),
                  ),
                  new Cesium.Cartesian3.fromSpherical(new Cesium.Spherical(
                    Cesium.Math.toRadians(90 - vm.crackerArr.find(
                      (i) => i.targetId === info.id,
                    ).targetAngle - 1.5),
                    Math.PI / 2, 5000.0,
                  )),
                  new Cesium.Cartesian3(),
                ),
                Cesium.Cartesian3.fromDegrees(...POSITION_STATION_TWO),
                new Cesium.Cartesian3(),
              ),
            ], false),
            material: Cesium.Color.CYAN.withAlpha(0.2),
            outline: true,
            outlineColor: Cesium.Color.BLACK,
            perPositionHeight: true,
            show: $('#protocolCrackingButton :button').attr('aria-pressed') === 'true',
          },
        }));
      }
    } else if (/.*\/ProtocolCrackTargetOut\/.*/.test(msg.topic)) {
      const info = JSON.parse(msg.payloadString);
      vm.crackerArr.filter((i) => i.targetId === info.id).forEach((entity) => {
        viewer.entities.remove(entity);
      });
      vm.crackerArr = vm.crackerArr.filter((i) => i.targetId !== info.id);

      if (vm.crackerIndex > vm.crackerArr.length - 1 && vm.crackerArr.length > 0) {
        vm.crackerIndex = vm.crackerArr.length - 1;
      }

      return;
    } else if (/.*\/ADSBTarget\/.*/.test(msg.topic)) {
      const info = JSON.parse(msg.payloadString);
      const entities = vm.adsbArr.filter((i) => i.id === info.id);
      if (entities.length) {
        entities.forEach((entity, i) => {
          vm.$set(entities, i, info);
        });
      } else {
        vm.adsbArr.push(info);
      }
    } else if (/.*\/ADSBTargetOut\/.*/.test(msg.topic)) {
      const info = JSON.parse(msg.payloadString);
      vm.adsbArr = vm.adsbArr.filter((i) => i.id !== info.id);
      return;
    } else if (msg.topic.indexOf('Warning') !== -1) {
      vm.WarnNum = JSON.parse(msg.payloadString);
    } else if (msg.topic.indexOf('TargetIntersect') !== -1) {
      const info = JSON.parse(msg.payloadString);
      if (info.IsIntersect && info.IsRadarTargetIn) {
        airArr.get(info.TargetId).label.text += "\n" + info.DroneDesc;
      } 
    }
  });
  // 去除底部logo
  viewer._cesiumWidget._creditContainer.style.display = 'none';
  // 取消双击追踪目标事件
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
  );
  // 追踪目标与取消
  // viewer.trackedEntity = undefined;

  setInterval(() => {
    stop = Cesium.JulianDate.addSeconds(Cesium.JulianDate.now(),
      3600, new Cesium.JulianDate());

    viewer.clock.stopTime = stop.clone();
    radarViewer.clock.stopTime = stop.clone();

    airArr.forEach((entity) => {
      entity.availability = new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start,
          stop,
        }),
      ]);
    });
  }, 1800000.0);
};

window.onload = documentReady(window.Cesium);
