const viewer = new Cesium.Viewer('cesiumContainer', {
    baseLayerPicker: false,
    geocoder: false,
    scene3DOnly: true,
    selectionIndicator: false
});

viewer.terrainProvider = Cesium.createWorldTerrain({
    requestWaterMask : true, // required for water effects
    requestVertexNormals : true // required for terrain lighting
});


const scene = viewer.scene
scene.screenSpaceCameraController.enableIndoorColliDetection = true
viewer.customInfobox = $("#bubble")[0]

// Enable depth testing so things behind the terrain disappear.
scene.globe.depthTestAgainstTerrain = true;

scene.globe.enableLighting = true;


const layer = await scene.addS3MTilesLayerByScp('./Config.scp', {
    name: 'plant',
})

layer.clearMemoryImmediately = false
layer.selectEnabled = false
layer.style3D.bottomAltitude = 60
layer.refresh()


const homeCameraView = {
    destination: Cesium.Cartesian3.fromDegrees(...POSITION_CAMERA),
    orientation: new Cesium.HeadingPitchRoll.fromDegrees(7.1077496389876024807, -31.987223091598949054, 0.025883251314954971306)
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


const start = Cesium.JulianDate.now()
const stop = Cesium.JulianDate.addSeconds(start, 3600, new Cesium.JulianDate())
viewer.clock.startTime = start.clone()
viewer.clock.stopTime = stop.clone()
viewer.clock.currentTime = start.clone()
//viewer.clock.clockRange = Cesium.ClockRange.CLAMPED
viewer.clock.shouldAnimate = true; // default
viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK_MULTIPLIER; // tick computation mode
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // loop at the end
viewer.timeline.zoomTo(viewer.clock.startTime, viewer.clock.stopTime); // set visible range


$("#loadingbar").remove()
$("#toolbar").show()


const greenCircle = viewer.entities.add({
    name: "Green circle within 2000 km",
    position: Cesium.Cartesian3.fromDegrees(...POSITION_CENTER_REACTOR),
    ellipse: {
        semiMinorAxis: 2000.0,
        semiMajorAxis: 2000.0,
        height: 70.0,
        material: Cesium.Color.LAWNGREEN.withAlpha(0.5),
        outline: true
    }
})

const yellowCircle = viewer.entities.add({
    name: "Yellow circle within 1000 km",
    position: Cesium.Cartesian3.fromDegrees(...POSITION_CENTER_REACTOR),
    ellipse: {
        semiMinorAxis: 1000.0,
        semiMajorAxis: 1000.0,
        height: 70.0,
        material: Cesium.Color.YELLOW.withAlpha(0.5),
        outline: true
    }
})

const redCircle = viewer.entities.add({
    name: "Red circle within 500 km",
    position: Cesium.Cartesian3.fromDegrees(...POSITION_CENTER_REACTOR),
    ellipse: {
        semiMinorAxis: 500.0,
        semiMajorAxis: 500.0,
        height: 70.0,
        material: Cesium.Color.RED.withAlpha(0.5),
        outline: true
    }
})

greenCircle.show = yellowCircle.show = redCircle.show = false

$("#defenceArea").click(() => {
    if ($("#defenceArea").attr('aria-pressed') == "false") { /* Before toggled */
        greenCircle.show = yellowCircle.show = redCircle.show = true
    } else {
        greenCircle.show = yellowCircle.show = redCircle.show = false
    }
})


const viewshed3D = new Cesium.ViewShed3D(scene)
viewshed3D.direction = 0
viewshed3D.hiddenAreaColor = Cesium.Color.GRAY.withAlpha(0.5)
viewshed3D.horizontalFov = 179
viewshed3D.pitch = 0
viewshed3D.verticalFov = 90
viewshed3D.viewPosition = POSITION_ROOF_PLANT
viewshed3D.visibleAreaColor = Cesium.Color.LAWNGREEN.withAlpha(0.5)

$("#radarArea").click(() => {
    if ($("#radarArea").attr('aria-pressed') == "false") { /* Before toggled */
        viewshed3D.distance = 1000
    } else if (viewshed3D) {
        viewshed3D.distance = 0.1
    }

    viewshed3D.build()
})


const positions = new Cesium.SampledPositionProperty()

positions.setInterpolationOptions({
    interpolationDegree: 5,
    interpolationAlgorithm: Cesium.LagrangePolynomialApproximation
})

positions.backwardExtrapolationType = Cesium.ExtrapolationType.HOLD
positions.forwardExtrapolationType = Cesium.ExtrapolationType.HOLD

positions.addSample(start, Cesium.Cartesian3.fromDegrees(...POSITION_CENTER_REACTOR))


const drone = viewer.entities.add({
    name: "Drone",
    availability: new Cesium.TimeIntervalCollection([
        new Cesium.TimeInterval({
            start: start,
            stop: stop
        })
    ]),
    model: {
        uri: './CesiumDrone.gltf',
        minimumPixelSize: 16
    },
    position: positions,
    orientation: new Cesium.VelocityOrientationProperty(positions),
    path: {
        resolution: 1,
        material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.1,
            color: Cesium.Color.YELLOW
        }),
        trailTime: 60,
        width: 10
    },
    label: {
        text: new Cesium.CallbackProperty((time) =>
            new Cesium.EllipsoidGeodesic(
                Cesium.Cartographic.fromDegrees(...POSITION_ROOF_PLANT),
                Cesium.Cartographic.fromCartesian(positions.getValue(time))
            ).surfaceDistance + ' m', false)
    }
})


const freeModeElement = $('#freeMode');
const droneModeElement = $('#droneMode');

const setViewMode = () => {
    if (droneModeElement.checked) {
        viewer.trackedEntity = drone;
    } else {
        viewer.trackedEntity = undefined;
        scene.camera.flyTo(homeCameraView);
    }
}

freeModeElement.addEventListener('change', setViewMode);
droneModeElement.addEventListener('change', setViewMode);

viewer.trackedEntityChanged.addEventListener(() => {
    if (viewer.trackedEntity === drone) {
        freeModeElement.checked = false;
        droneModeElement.checked = true;
    }
});


const indicator = viewer.entities.add({
    name: "Indicator from Infrared to Drone",
    polyline: {
        positions: new Cesium.CallbackProperty((time) =>
            [Cesium.Cartesian3.fromDegrees(...POSITION_ROOF_PLANT),
                positions.getValue(time)
            ], false),
        width: 1,
        material: Cesium.Color.RED
    },
})


const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas)

handler.setInputAction((e) => {
    try {
        now = Cesium.JulianDate.now()
        previousPosition = positions.getValue(now)
        //positions.addSample(Cesium.JulianDate.addSeconds(now, -5, new Cesium.JulianDate()), previousPosition)
        //positions.addSample(now, previousPosition)

        const {longitude, latitude, height, ...others} = Cesium.Cartographic.fromCartesian(scene.pickPosition(e.position))
        const [lon, lat] = [longitude, latitude].map(n => Cesium.Math.toDegrees(n))
        const hei = height < 0 ? 0 : height
        const newPosition = Cesium.Cartesian3.fromDegrees(lon, lat, hei)

        positions.addSample(Cesium.JulianDate.addSeconds(now, 5, new Cesium.JulianDate()), newPosition)
        //positions.addSample(Cesium.JulianDate.addSeconds(now, 5.1, new Cesium.JulianDate()), newPosition)

        console.log([lon, lat, hei])
    } catch (error) {
        console.log(error)
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK)
