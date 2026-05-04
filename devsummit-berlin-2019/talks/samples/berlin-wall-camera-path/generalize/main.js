require([
  "esri/WebScene",
  "esri/views/SceneView",
  "esri/geometry/geometryEngine",
  "esri/core/watchUtils",
  "esri/layers/GraphicsLayer",
  "esri/Graphic",
], function(
  WebScene,
  SceneView,
  geometryEngine,
  watchUtils,
  GraphicsLayer,
  Graphic,
) {

  var map = new WebScene({
    portalItem: {
      id: "4fba26457a3f4a149b899308520ce700"
    }
  });

  var view = new SceneView({
    qualityProfile: "medium",
    container: "viewDiv",
    map,
  });

  var pinSymbol = {
    type: "point-3d",
    symbolLayers: [{
      type: "icon",
      size: 8,
      resource: { primitive: "circle" },
      material: { color: "dodgerblue" }
    }],
    verticalOffset: {
      minWorldLength: 800,
      screenLength: 100,
      maxWorldLength: 1500
    },
    callout: {
      type: "line",
      size: .1,
      color: [50, 50, 50],
      border: {
        width: 0,
        color: [50, 50, 50]
      }
    }
  };

  var movingPin = new Graphic({
    symbol: pinSymbol,
  });

  function waitForUpdates() {
    return watchUtils.whenNotOnce(view, "updating");
  }

  function applySlide(name, props = {}) {
    var slide = view.map.presentation.slides.find(s => s.title.text === name);
    return waitForUpdates().then(() => slide.applyTo(view, props));
  }

  var graphicsLayer = new GraphicsLayer();

  var wallGeometryPromise;
  var camera = {"position":{"spatialReference":{"latestWkid":3857,"wkid":102100},"x":1438907.211361001,"y":6874438.184318392,"z":8610.004744450562},"heading":93.10542349391606,"tilt":58.06561973227666};

  function drawWall(drawPins) {
    wallGeometryPromise
      .then(wall => {

        view.map.add(graphicsLayer);

        if (drawPins) {
          wall.paths.flat().map(vertex => {
            var nearestCoordinate = geometryEngine.nearestCoordinate(wall, {
              type: "point",
              spatialReference: wall.spatialReference,
              x: vertex[0],
              y: vertex[1],
            });
            graphicsLayer.add({
              geometry: nearestCoordinate.coordinate,
              symbol: pinSymbol,
            });
          });
        }

        var polylineGraphic = new Graphic({
          geometry: wall,
          symbol: {
            type: "simple-line",
            color: [226, 119, 40],
            width: 4
          }
        });

        graphicsLayer.add(polylineGraphic);

      }).catch(console.error);
  }

  view.when()
    .then(() => applySlide("Intro", {animate: false}))
    .then(() => {
      var layer = view.map.allLayers.find(l => l.title === "West Berlin");
      var query = layer.createQuery();
      query.returnGeometry = true;
      query.where = "";
      wallGeometryPromise = layer.queryFeatures(query)
        .then(response => {
          console.log("Response", response);
          return response;
        })
        // .then(response => response.features.filter(f => ![2, 31, 32, 60, 74, 75].includes(f.attributes["OBJECTID"])))
        .then(response => geometryEngine.union(response.features.map(f => f.geometry)))
        .then(wall => geometryEngine.generalize(wall, 2500))
        .then(generalizedWall => {
          // Instead of using the generalized wall, we hard code the vertices here
          movingPin.geometry = {
            type: "point",
            x: 1457971.4239,
            y: 6874363.8268,
            spatialReference: generalizedWall.spatialReference,
          };
          return {
            type: "polyline",
            spatialReference: generalizedWall.spatialReference,
            paths: [[
              [1457971.4239,6874363.8268],
              [1461765.7008,6870430.5725],
              [1472169.1601,6876576.2288],
              [1481890.6088,6872605.3013],
              [1485363.9578,6874841.5976],
              [1493710.6727,6868324.955],
              [1493776.9365,6874591.7722],
              [1498755.4091,6876616.6069],
              [1500555.3532,6872026.6458],
              [1504382.3979,6873011.1753],
              [1498180.7526,6890554.831],
              [1489344.2255,6892320.6715],
              [1492078.038,6898395.2872],
              [1485861.073,6907527.582],
              [1487892.8805,6914223.7294],
              [1480843.9735,6914347.1674],
              [1478621.2887,6920500.4766],
              [1469734.93554688,6909099.3359375],
              [1465495.898,6909135.3201],
              [1464120.3009,6904082.6053],
              [1460945.5184,6898153.3494],
              [1465931.8881,6892734.7359],
              [1459456.6813,6885643.8657],
              [1458170.1397,6877576.2295],
              [1455530.3634,6877439.0968]
            ]]
          };

          // return generalizeWall;
        })
        .catch(console.error);

      return wallGeometryPromise;
    })
    .then(() => waitForUpdates())
    .then(() => applySlide("Berlin - initial view"))
    .then(() => waitForUpdates())
    .then(() => {
      var slideTitle = window.parent.Reveal.getCurrentSlide().getAttribute("data-title");
      if (slideTitle === "update-camera") {
        drawWall(false);
        graphicsLayer.add(movingPin);
      }
    }).catch(console.error);

  var points = [];
  view.on("click", event => {
    wallGeometryPromise
      .then(wall => geometryEngine.nearestVertex(wall, event.mapPoint))
      .then(result => {
        points.push([result.coordinate.x, result.coordinate.y]);
        console.log(JSON.stringify(points));
      });
  });

  window.parent.document.getElementById("generalizeWallPoints").addEventListener("click", () => {
    drawWall(true);
  });

  window.parent.document.getElementById("animateWall").addEventListener("click", () => {
    waitForUpdates()
      .then(() => wallGeometryPromise)
      .then(wall => animateLine(wall))
      .catch(console.error);
  });


  function distance(pointA, pointB) {
    const a = pointA[0] - pointB[0];
    const b = pointA[1] - pointB[1];
    return Math.sqrt(a * a + b * b);
  }

  function heading(pointA, pointB) {
    const atan2 = Math.atan2(pointB[1] - pointA[1], pointB[0] - pointA[0]);
    return (
      90 - atan2 * 180 / Math.PI
    );
  }

  function animateLine(geometry) {
    const AREA_ANIMATION_DURATION = 45000;
    const path = geometry.paths[0];
    const start = path[0];
    const waypoints = path.slice(1);
    waypoints.push(start);

    const durations = [];
    let totalLength = 0;

    waypoints.forEach((point, index) => {
      const length = distance(point, path[index]);
      durations.push(length);
      totalLength += length;
    });

    durations.forEach((duration, index) => {
      durations[index] = duration * AREA_ANIMATION_DURATION / totalLength;
    });

    const paths = [start];

    const movingPoint = {
      type: "point",
      spatialReference: geometry.spatialReference,
      x: start[0],
      y: start[1]
    };

    const initialDistance = distance(start, [
      view.camera.position.x,
      view.camera.position.y
    ]);

    function completeAnimation() {
      paths.push([movingPoint.x, movingPoint.y]);
    }

    let index = 0;
    let startTime = null;
    let previousPoint = null;
    function step(timestamp) {

      if (durations.length <= index) {
        console.log("Completed animation");
        return;
      }

      if (!startTime) {
        startTime = timestamp;
        previousPoint = [movingPoint.x, movingPoint.y];
      }

      var progress = timestamp - startTime;

      const sp = Math.min(1.0, progress / durations[index]);
      movingPoint.x = previousPoint[0] + (waypoints[index][0] - previousPoint[0]) * sp;
      movingPoint.y = previousPoint[1] + (waypoints[index][1] - previousPoint[1]) * sp;

      movingPin.geometry = movingPoint;

      if (paths.length) {
        // createGraphic(paths.concat([[movingPoint.x, movingPoint.y]]));

        // Update camera
        const camera = view.camera.clone();

        // Position
        const currentDistance = distance(
          [movingPoint.x, movingPoint.y],
          [view.camera.position.x, view.camera.position.y]
        );
        const dX = movingPoint.x - camera.position.x;
        const dY = movingPoint.y - camera.position.y;

        camera.position.x =
          camera.position.x +
          dX * (currentDistance - initialDistance) / initialDistance;
        camera.position.y =
          camera.position.y +
          dY * (currentDistance - initialDistance) / initialDistance;
        // camera.position.z = camera.position.z + (elevation - previousElevation);

        // Heading
        camera.heading = heading(
          [view.camera.position.x, view.camera.position.y],
          [movingPoint.x, movingPoint.y]
        );
        view.camera = camera;

        // previousElevation = elevation;
      }

      if (progress >= durations[index]) {
        completeAnimation();
        startTime = timestamp + (durations[index] - progress);
        previousPoint = [movingPoint.x, movingPoint.y];
        index++;
      }

      window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);

    // waypoints.forEach((point, index) => {
    //   timeline = timeline.add({
    //     targets: movingPoint,
    //     x: point[0],
    //     y: point[1],
    //     duration: durations[index],
    //     easing: "linear",
    //     complete: () => {
    //       paths.push([movingPoint.x, movingPoint.y]);
    //     }
    //   });
    // });
  }

});
