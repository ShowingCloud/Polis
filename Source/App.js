const documentReady = async () => {
  const mainViewer = new Cesium.Viewer('cesiumContainer', {
    imageryProvider: await Cesium.createTileMapServiceImageryProvider({
      url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'),
    }),

    baseLayerPicker: false,
    geocoder: false,
    homeButton: true,
    infobox: false,
    scene3DOnly: true,
    selectionIndicator: false,
    timeline: true,
  });


  const mainScene = mainViewer.scene;
  mainScene.screenSpaceCameraController.enableIndoorColliDetection = true;

  mainScene.globe.depthTestAgainstTerrain = true;
  mainScene.globe.enableLighting = true;


  const layer = await mainScene.addS3MTilesLayerByScp('s3mdata/Config.scp', {
    name: 'plant',
  });

  layer.clearMemoryImmediately = false;
  layer.selectEnabled = false;
  layer.style3D.bottomAltitude = 60;
  layer.refresh();


  const homeCameraView = {
    destination: Cesium.Cartesian3.fromDegrees(...POSITION_CAMERA),
    orientation: Cesium.HeadingPitchRoll.fromDegrees(0.0, -90.0, 0.0),
  };
  mainScene.camera.setView(homeCameraView);

  // Add some camera flight animation options
  homeCameraView.duration = 2.0;
  homeCameraView.maximumHeight = 2000;
  homeCameraView.pitchAdjustHeight = 2000;
  homeCameraView.endTransform = Cesium.Matrix4.IDENTITY;
  // Override the default home button
  mainViewer.homeButton.viewModel.command.beforeExecute.addEventListener((e) => {
    e.cancel = true;
    mainScene.camera.flyTo(homeCameraView);
  });


  const start = Cesium.JulianDate.now();
  const stop = Cesium.JulianDate.addSeconds(start, 3600, new Cesium.JulianDate());
  mainViewer.clock.startTime = start.clone();
  mainViewer.clock.stopTime = stop.clone();
  mainViewer.clock.currentTime = start.clone();
  mainViewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
  mainViewer.clock.shouldAnimate = true; // default
  mainViewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER; // tick computation mode
  mainViewer.timeline.zoomTo(mainViewer.clock.startTime,
    mainViewer.clock.stopTime); // set visible range


  $('#loadingbar').remove();
  $('#menu').show();
  $('#radarChart').show();


  const radarViewer = new Cesium.Viewer('radarChart', {
    infoBox: false,
    sceneMode: Cesium.SceneMode.SCENE2D,
  });

  radarViewer.scene.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(...POSITION_CAMERA.slice(0, 2), 15000),
    orientation: Cesium.HeadingPitchRoll.fromDegrees(0.0, 0.0, 0.0),
  });

  const radarScene = radarViewer.scene;
  radarScene.screenSpaceCameraController.enableInputs = false;

  radarViewer.clock.startTime = start.clone();
  radarViewer.clock.stopTime = stop.clone();
  radarViewer.clock.currentTime = start.clone();
  radarViewer.clock.clockRange = Cesium.ClockRange.CLAMPED;
  radarViewer.clock.shouldAnimate = true; // default
  radarViewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER; // tick computation mode

  $('.cesium-widget-credits').hide();
  $('#radarChart .cesium-viewer-navigationContainer').hide();


  const mainGreenCircle = mainViewer.entities.add({
    name: 'Green circle within 5000 km',
    position: Cesium.Cartesian3.fromDegrees(...POSITION_CENTER_REACTOR),
    ellipse: {
      fill: false,
      height: 70.0,
      outline: true,
      outlineColor: Cesium.Color.LAWNGREEN,
      outlineWidth: 100.0,
      semiMajorAxis: 5000.0,
      semiMinorAxis: 5000.0,
    },
  });

  const radarGreenCircle = radarViewer.entities.add({
    name: 'Radar white circle within 5000 km',
    position: Cesium.Cartesian3.fromDegrees(...POSITION_CENTER_REACTOR),
    ellipse: {
      fill: false,
      height: 70.0,
      outline: true,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 100.0,
      semiMajorAxis: 5000.0,
      semiMinorAxis: 5000.0,
    },
  });

  const mainYellowCircle = mainViewer.entities.add({
    name: 'Yellow circle within 3000 km',
    position: Cesium.Cartesian3.fromDegrees(...POSITION_CENTER_REACTOR),
    ellipse: {
      fill: false,
      height: 70.0,
      outline: true,
      outlineColor: Cesium.Color.YELLOW,
      outlineWidth: 100.0,
      semiMajorAxis: 3000.0,
      semiMinorAxis: 3000.0,
    },
  });

  const radarYellowCircle = radarViewer.entities.add({
    name: 'Radar white circle within 3000 km',
    position: Cesium.Cartesian3.fromDegrees(...POSITION_CENTER_REACTOR),
    ellipse: {
      fill: false,
      height: 70.0,
      outline: true,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 100.0,
      semiMajorAxis: 3000.0,
      semiMinorAxis: 3000.0,
    },
  });

  const mainRedCircle = mainViewer.entities.add({
    name: 'Red circle within 1000 km',
    position: Cesium.Cartesian3.fromDegrees(...POSITION_CENTER_REACTOR),
    ellipse: {
      fill: false,
      height: 70.0,
      outline: true,
      outlineColor: Cesium.Color.RED,
      outlineWidth: 100.0,
      semiMajorAxis: 1000.0,
      semiMinorAxis: 1000.0,
    },
  });

  const radarRedCircle = radarViewer.entities.add({
    name: 'Radar white circle within 1000 km',
    position: Cesium.Cartesian3.fromDegrees(...POSITION_CENTER_REACTOR),
    ellipse: {
      fill: false,
      height: 70.0,
      outline: true,
      outlineColor: Cesium.Color.WHITE,
      outlineWidth: 100.0,
      semiMajorAxis: 1000.0,
      semiMinorAxis: 1000.0,
    },
  });

  mainGreenCircle.show = false;
  mainYellowCircle.show = false;
  mainRedCircle.show = false;

  $('#defenceArea').click(() => {
    if ($('#defenceArea').attr('aria-pressed') === 'false') { /* Before toggled */
      mainGreenCircle.show = true;
      mainYellowCircle.show = true;
      mainRedCircle.show = true;
    } else {
      mainGreenCircle.show = false;
      mainYellowCircle.show = false;
      mainRedCircle.show = false;
    }
  });


  const viewshed3D = [];
  [0, 1].forEach((i) => {
    viewshed3D[i] = new Cesium.ViewShed3D(mainScene);
    viewshed3D[i].hiddenAreaColor = Cesium.Color.GRAY.withAlpha(0.5);
    viewshed3D[i].horizontalFov = 179;
    viewshed3D[i].pitch = 30;
    viewshed3D[i].verticalFov = 120;
    viewshed3D[i].viewPosition = POSITION_ROOF_PLANT;
    viewshed3D[i].visibleAreaColor = Cesium.Color.LAWNGREEN.withAlpha(0.5);
  });
  viewshed3D[0].direction = 0;
  viewshed3D[1].direction = 180;

  $('#radarArea').click(() => {
    if ($('#radarArea').attr('aria-pressed') === 'false') { /* Before toggled */
      [0, 1].forEach((i) => {
        viewshed3D[i].distance = 2000;
        viewshed3D[i].build();
      });
    } else {
      [0, 1].forEach((i) => {
        viewshed3D[i].distance = 0.1;
        viewshed3D[i].build();
      });
    }
  });


  const positions = [];
  const drone = [];
  [0, 1, 2, 3].forEach((i) => {
    positions[i] = new Cesium.SampledPositionProperty();

    positions[i].setInterpolationOptions({
      interpolationDegree: 2,
      interpolationAlgorithm: Cesium.LinearApproximation, // Cesium.HermitePolynomialApproximation,
    });

    positions[i].backwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
    positions[i].forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;

    positions[i].addSample(start, Cesium.Cartesian3.fromDegrees(...POSITION_CENTER_REACTOR));


    drone[i] = mainViewer.entities.add({
      name: `Drone ${i}`,
      availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
          start,
          stop,
        }),
      ]),
      model: {
        uri: 'Models/CesiumDrone.gltf',
        minimumPixelSize: 16,
      },
      position: positions[i],
      orientation: new Cesium.VelocityOrientationProperty(positions[i]),
      path: {
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.1,
          color: Cesium.Color.YELLOW,
        }),
        trailTime: 60,
        width: 10,
      },
      label: {
        fillColor: Cesium.Color.WHITE,
        font: '15px Helvetica',
        outlineColor: Cesium.Color.RED,
        pixelOffset: new Cesium.Cartesian2(0.0, -20),
        showBackground: true,
        text: new Cesium.CallbackProperty((time) => `${new Cesium.EllipsoidGeodesic(
          Cesium.Cartographic.fromDegrees(...POSITION_ROOF_PLANT),
          Cesium.Cartographic.fromCartesian(positions[i].getValue(time)),
        ).surfaceDistance.toFixed(2)} m`, false),
      },
    });

    radarViewer.entities.add(drone[i]);


    mainViewer.entities.add({
      name: 'Indicator from Infrared to Drone',
      polyline: {
        positions: new Cesium.CallbackProperty((time) => [
          Cesium.Cartesian3.fromDegrees(...POSITION_ROOF_PLANT),
          positions[i].getValue(time),
        ], false),
        width: 1,
        material: Cesium.Color.RED,
      },
    });
  });


  $('#freeMode').click(() => {
    mainScene.camera.flyTo(homeCameraView);
    mainViewer.trackedEntity = undefined;
  });

  $('#droneMode').click(async () => {
    await mainViewer.flyTo(drone[0]);
    mainViewer.trackedEntity = drone[0];
  });


  const mqttClient = mqtt.connect('mqtt://www.51kongkong.com:61623', {
    username: 'admin',
    password: 'password',
  });

  mqttClient.on('connect', () => {
    mqttClient.subscribe('/CC/MsgForAntiUAV/Radar/+', (err) => {
      if (err) alert(`Error: ${err}`);
    });
  });

  mqttClient.on('message', (topic, message) => {
    if (topic === 'CC/MsgForAntiUAV/Radar/1'
      || topic === 'CC/MsgForAntiUAV/Radar/2') {
      const now = Cesium.JulianDate.now();

      const { TargetId, X, Y, Z, ...others } = JSON.parse(message);
      const newPosition = Cesium.Cartesian3.fromDegrees(X, Y, Z);
      const newTime = Cesium.JulianDate.addSeconds(
        now, 1, new Cesium.JulianDate(),
      );

      if (Cesium.JulianDate.compare(mainViewer.clock.stopTime, newTime) < 0) {
        mainViewer.clock.stopTime = newTime;
        radarViewer.clock.stopTime = newTime;
      }
      positions[TargetId].addSample(newTime, newPosition);
    }
  });

  const radarHandler = new Cesium.ScreenSpaceEventHandler(radarScene.canvas);
  radarHandler.setInputAction(async (e) => {
    const pickedObject = radarScene.pick(e.position);
    if (Cesium.defined(pickedObject)) {
      await mainViewer.flyTo(pickedObject.id);
      mainViewer.trackedEntity = pickedObject.id;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};
