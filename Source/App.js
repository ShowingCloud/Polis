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
  mainViewer.timeline.zoomTo(mainViewer.clock.startTime, mainViewer.clock.stopTime); // set visible range


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

  $('.cesium-widget-credits').hide();
  $('#radarChart .cesium-viewer-navigationContainer').hide();

  const radarHandler = new Cesium.ScreenSpaceEventHandler(radarScene.canvas);
  radarHandler.setInputAction(async (e) => {
    const pickedObject = radarScene.pick(e.position);
    console.log(pickedObject);
    if (drone && Cesium.defined(pickedObject) && pickedObject.id === drone) {
      await mainViewer.flyTo(drone);
      mainViewer.trackedEntity = drone;
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);


  const greenCircle = mainViewer.entities.add({
    name: 'Green circle within 2000 km',
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

  const yellowCircle = mainViewer.entities.add({
    name: 'Yellow circle within 1000 km',
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

  const redCircle = mainViewer.entities.add({
    name: 'Red circle within 500 km',
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

  greenCircle.show = false;
  yellowCircle.show = false;
  redCircle.show = false;

  $('#defenceArea').click(() => {
    if ($('#defenceArea').attr('aria-pressed') === 'false') { /* Before toggled */
      greenCircle.show = true;
      yellowCircle.show = true;
      redCircle.show = true;
    } else {
      greenCircle.show = false;
      yellowCircle.show = false;
      redCircle.show = false;
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


  const positions = new Cesium.SampledPositionProperty();

  positions.setInterpolationOptions({
    interpolationDegree: 5,
    interpolationAlgorithm: Cesium.LinearApproximation, // Cesium.LagrangePolynomialApproximation,
  });

  positions.backwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
  positions.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;

  positions.addSample(start, Cesium.Cartesian3.fromDegrees(...POSITION_CENTER_REACTOR));


  const drone = mainViewer.entities.add({
    name: 'Drone',
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
    position: positions,
    orientation: new Cesium.VelocityOrientationProperty(positions),
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
        Cesium.Cartographic.fromCartesian(positions.getValue(time)),
      ).surfaceDistance.toFixed(2)} m`, false),
    },
  });

  radarViewer.entities.add(drone);


  $('#freeMode').click(() => {
    mainScene.camera.flyTo(homeCameraView);
    mainViewer.trackedEntity = undefined;
  });

  $('#droneMode').click(async () => {
    await mainViewer.flyTo(drone);
    mainViewer.trackedEntity = drone;
  });


  const indicator = mainViewer.entities.add({
    name: 'Indicator from Infrared to Drone',
    polyline: {
      positions: new Cesium.CallbackProperty((time) => [
        Cesium.Cartesian3.fromDegrees(...POSITION_ROOF_PLANT),
        positions.getValue(time),
      ], false),
      width: 1,
      material: Cesium.Color.RED,
    },
  });


  const handler = new Cesium.ScreenSpaceEventHandler(mainScene.canvas);
  handler.setInputAction((e) => {
    try {
      const now = Cesium.JulianDate.now();
      // const previousPosition = positions.getValue(now);
      // positions.addSample(now.clone(), previousPosition);

      const {
        longitude, latitude, height, ...others
      } = Cesium.Cartographic.fromCartesian(mainScene.pickPosition(e.position));
      const [lon, lat] = [longitude, latitude].map((n) => Cesium.Math.toDegrees(n));
      const hei = height < 0 ? 0 : height;
      const newPosition = Cesium.Cartesian3.fromDegrees(lon, lat, hei);
      const newTime = Cesium.JulianDate.addSeconds(
        now, 5, new Cesium.JulianDate(),
      );

      mainViewer.clock.stopTime = newTime;
      positions.addSample(newTime, newPosition);

      console.log(new Cesium.Camera(mainScene));
      console.log([lon, lat, hei]);
    } catch (error) {
      console.log(error);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};
