var onload = async () => {
  const viewer = new Cesium.Viewer('cesiumContainer', {
    imageryProvider: await Cesium.createTileMapServiceImageryProvider({
      url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'),
    }),

    baseLayerPicker: false,
    geocoder: false,
    homeButton: true,
    scene3DOnly: true,
    selectionIndicator: false,
    timeline: true,
  });


  const { scene } = viewer;
  scene.screenSpaceCameraController.enableIndoorColliDetection = true;
  viewer.customInfobox = $('#bubble')[0];

  scene.globe.depthTestAgainstTerrain = true;
  scene.globe.enableLighting = true;


  const layer = await scene.addS3MTilesLayerByScp('s3mdata/Config.scp', {
    name: 'plant',
  });

  layer.clearMemoryImmediately = false;
  layer.selectEnabled = false;
  layer.style3D.bottomAltitude = 60;
  layer.refresh();


  const homeCameraView = {
    destination: Cesium.Cartesian3.fromDegrees(...POSITION_CAMERA),
    orientation: Cesium.HeadingPitchRoll.fromDegrees(7.1077496389876024807, -31.987223091598949054, 0.025883251314954971306),
  };
  scene.camera.setView(homeCameraView);

  // Add some camera flight animation options
  homeCameraView.duration = 2.0;
  homeCameraView.maximumHeight = 2000;
  homeCameraView.pitchAdjustHeight = 2000;
  homeCameraView.endTransform = Cesium.Matrix4.IDENTITY;
  // Override the default home button
  viewer.homeButton.viewModel.command.beforeExecute.addEventListener((e) => {
    e.cancel = true;
    scene.camera.flyTo(homeCameraView);
  });


  const start = Cesium.JulianDate.now();
  const stop = Cesium.JulianDate.addSeconds(start, 3600, new Cesium.JulianDate());
  viewer.clock.startTime = start.clone();
  viewer.clock.stopTime = stop.clone();
  viewer.clock.currentTime = start.clone();
  // viewer.clock.clockRange = Cesium.ClockRange.CLAMPED
  viewer.clock.shouldAnimate = true; // default
  viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER; // tick computation mode
  viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // loop at the end
  viewer.timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime); // set visible range


  $('#loadingbar').remove();
  $('#menu').show();


  const greenCircle = viewer.entities.add({
    name: 'Green circle within 2000 km',
    position: Cesium.Cartesian3.fromDegrees(...POSITION_CENTER_REACTOR),
    ellipse: {
      semiMinorAxis: 2000.0,
      semiMajorAxis: 2000.0,
      height: 70.0,
      material: Cesium.Color.LAWNGREEN.withAlpha(0.5),
      outline: true,
    },
  });

  const yellowCircle = viewer.entities.add({
    name: 'Yellow circle within 1000 km',
    position: Cesium.Cartesian3.fromDegrees(...POSITION_CENTER_REACTOR),
    ellipse: {
      semiMinorAxis: 1000.0,
      semiMajorAxis: 1000.0,
      height: 70.0,
      material: Cesium.Color.YELLOW.withAlpha(0.5),
      outline: true,
    },
  });

  const redCircle = viewer.entities.add({
    name: 'Red circle within 500 km',
    position: Cesium.Cartesian3.fromDegrees(...POSITION_CENTER_REACTOR),
    ellipse: {
      semiMinorAxis: 500.0,
      semiMajorAxis: 500.0,
      height: 70.0,
      material: Cesium.Color.RED.withAlpha(0.5),
      outline: true,
    },
  });

  greenCircle.show = yellowCircle.show = redCircle.show = false;

  $('#defenceArea').click(() => {
    if ($('#defenceArea').attr('aria-pressed') === 'false') { /* Before toggled */
      greenCircle.show = yellowCircle.show = redCircle.show = true;
    } else {
      greenCircle.show = yellowCircle.show = redCircle.show = false;
    }
  });


  const viewshed3D = [];
  [0, 1].forEach((i) => {
    viewshed3D[i] = new Cesium.ViewShed3D(scene);
    viewshed3D[i].hiddenAreaColor = Cesium.Color.GRAY.withAlpha(0.5);
    viewshed3D[i].horizontalFov = 179;
    viewshed3D[i].pitch = 0;
    viewshed3D[i].verticalFov = 90;
    viewshed3D[i].viewPosition = POSITION_ROOF_PLANT;
    viewshed3D[i].visibleAreaColor = Cesium.Color.LAWNGREEN.withAlpha(0.5);
  });
  viewshed3D[0].direction = 0;
  viewshed3D[1].direction = 180;

  $('#radarArea').click(() => {
    if ($('#radarArea').attr('aria-pressed') === 'false') { /* Before toggled */
      [0, 1].forEach((i) => {
        viewshed3D[i].distance = 1000;
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
    interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
  });

  positions.backwardExtrapolationType = Cesium.ExtrapolationType.HOLD;
  positions.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD;

  positions.addSample(start, Cesium.Cartesian3.fromDegrees(...POSITION_CENTER_REACTOR));


  const drone = viewer.entities.add({
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
      text: new Cesium.CallbackProperty((time) => `${new Cesium.EllipsoidGeodesic(
        Cesium.Cartographic.fromDegrees(...POSITION_ROOF_PLANT),
        Cesium.Cartographic.fromCartesian(positions.getValue(time)),
      ).surfaceDistance} m`, false),
    },
  });


  $('#freeMode').click(() => {
    viewer.trackedEntity = undefined;
    scene.camera.flyTo(homeCameraView);
  });

  $('#droneMode').click(() => {
    viewer.trackedEntity = drone;
  });


  const indicator = viewer.entities.add({
    name: 'Indicator from Infrared to Drone',
    polyline: {
      positions: new Cesium.CallbackProperty((time) => [Cesium.Cartesian3.fromDegrees(...POSITION_ROOF_PLANT),
        positions.getValue(time),
      ], false),
      width: 1,
      material: Cesium.Color.RED,
    },
  });


  const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

  handler.setInputAction((e) => {
    try {
      const now = Cesium.JulianDate.now();
      // const previousPosition = positions.getValue(now);
      // positions.addSample(Cesium.JulianDate.addSeconds(now, -5, new Cesium.JulianDate()), previousPosition)
      // positions.addSample(now, previousPosition)

      const {
        longitude, latitude, height, ...others
      } = Cesium.Cartographic.fromCartesian(scene.pickPosition(e.position));
      const [lon, lat] = [longitude, latitude].map((n) => Cesium.Math.toDegrees(n));
      const hei = height < 0 ? 0 : height;
      const newPosition = Cesium.Cartesian3.fromDegrees(lon, lat, hei);

      positions.addSample(Cesium.JulianDate.addSeconds(now, 5, new Cesium.JulianDate()), newPosition);
      // positions.addSample(Cesium.JulianDate.addSeconds(now, 5.1, new Cesium.JulianDate()), newPosition)

      console.log([lon, lat, hei]);
    } catch (error) {
      console.log(error);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
};
