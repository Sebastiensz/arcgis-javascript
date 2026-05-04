require([
  "esri/layers/FeatureLayer",
  "esri/WebScene",
  "esri/views/SceneView",
  "esri/core/promiseUtils",
  "esri/Graphic",
  "esri/core/watchUtils",
  "./../support/widgets.js",
  "dojo/domReady!"
], function (
  FeatureLayer,
  WebScene, SceneView, promiseUtils, Graphic, watchUtils,
  widgetsSupport,
) {

  const magValues = {
    min: {
      value: 4,
      size: 1,
      color: [255, 221, 48]
    },
    max: {
      value: 7,
      size: 8,
      color: [255, 58, 48]
    }
  }

  const renderer = {
    type: "simple",
    symbol: {
      type: "point-3d",
      symbolLayers: [{
        type: "icon",
        resource: { primitive: "circle" }
      }]
    },
    visualVariables: [
      {
        type: "size",
        field: "mag",
        stops: [{
          value: magValues.min.value,
          size: magValues.min.size+"px"
        }, {
          value: magValues.max.value,
          size: magValues.max.size+"px"
        }]
      },
      {
        type: "color",
        field: "mag",
        stops: [{
          value: magValues.min.value,
          color: magValues.min.color,
        }, {
          value: magValues.max.value,
          color: magValues.max.color
        }]
      }
    ]
  };

  const template = {
    title: "Earthquake at {longitude}, {latitude}",
    content: [{
      type: "fields",
      fieldInfos: [{
        fieldName: "dateTime",
        label: "Date/Time",
        visible: true
      }, {
        fieldName: "mag",
        label: "Magnitude",
        visible: true,
      }, {
        fieldName: "depth",
        label: "Depth",
        visible: true
      }]
    }]
  };

  const earthquakesLayer = new FeatureLayer({
    url: "https://services2.arcgis.com/cFEFS0EWrhfDeVw9/ArcGIS/rest/services/World_Earthquakes/FeatureServer/0/",
    outFields: ["dateTime", "mag", "depth", "latitude", "longitude"],
    definitionExpression: "dateTime > timestamp '2017-01-01 00:00:00' AND dateTime < timestamp '2018-01-01 00:00:00'",
    elevationInfo: {
      mode: "absolute-height",
      featureExpressionInfo: {
        expression: "$feature.depth * 2"
      },
      unit: "kilometers"
    },
    popupTemplate: template,
    screenSizePerspectiveEnabled: false
  });

  const scene = new WebScene({
    portalItem: {
      id: "f5941614c9934b4a9346e732fb1af400"
    }
  });

  const view = new SceneView({
    map: scene,
    container: "viewDiv",
    constraints: {
      collision: {
        enabled: true
      }
    },
    // padding: {
    //   bottom: 100
    // },
    highlightOptions: {
      color: "white",
      fillOpacity: 0
    },
    // ui: {
    //   components: []
    // }
  });
  widgetsSupport.createFullscreen(view);
  view.environment.lighting.starsEnabled = false;
  window.view = view;
  let highlight = null;

  function addEarthquakes(renderer) {
    // scene.load().then(function() {
      if (renderer) {
        earthquakesLayer.renderer = renderer;
      }
      scene.add(earthquakesLayer);
    // });
  }

  function showStats() {
    document.getElementById("dashboard").style.display = "inherit";
  }

  function enableQueries() {
    view.whenLayerView(earthquakesLayer)
    .then(function (lyrView) {
      watchUtils.whenFalseOnce(lyrView, "updating", function () {
        view.on("pointer-move", function (event) {
          event.stopPropagation();
          queryStatsOnClick(lyrView, event)
            .catch(function (error) {
              if (error.name !== "AbortError") {
                console.error(error);
              }
            });
        });
      });
    });
  }

  var slideTitle = window.parent.Reveal &&
    window.parent.Reveal.getCurrentSlide().getAttribute("data-title");
  if (slideTitle === "earthquakes-intro") {
    addEarthquakes(renderer);
  } else if (slideTitle === "earthquakes-renderer") {
    addEarthquakes();
  } else if (slideTitle === "earthquakes-highlight") {
    addEarthquakes(renderer);
  } else if (slideTitle === "earthquakes-stats") {
    addEarthquakes(renderer);
    enableQueries();
  } else if (!window.parent.Reveal) {
    addEarthquakes(renderer);
    showStats();
    enableQueries();
  }

  var addFeatureLayer = window.parent.document.getElementById("addFeatureLayer");
  if (addFeatureLayer) {
    addFeatureLayer.addEventListener("click", () => {
      earthquakesLayer.elevationInfo = {
        mode: "on-the-ground",
      };
      addEarthquakes();
    });
  }

  var addElevationInfo = window.parent.document.getElementById("addElevationInfo");
  if (addElevationInfo) {
    addElevationInfo.addEventListener("click", () => {
      earthquakesLayer.elevationInfo = {
        mode: "absolute-height",
        featureExpressionInfo: {
          expression: "$feature.depth * 2"
        },
        unit: "kilometers"
      };
    });
  }

  var addRenderer = window.parent.document.getElementById("addRenderer");
  if (addRenderer) {
    addRenderer.addEventListener("click", () => {
      earthquakesLayer.renderer = renderer;
    });
  }

  var addHighlights = window.parent.document.getElementById("addHighlights");
  if (addHighlights) {
    addHighlights.addEventListener("click", () => {
      enableQueries();
    });
  }

  var addHighlights = window.parent.document.getElementById("addStats");
  if (addHighlights) {
    addHighlights.addEventListener("click", () => {
      showStats();
    });
  }

  const queryStatsOnClick = promiseUtils.debounce(function (
    layerView,
    event
  ) {
    if (view.toMap(event)) {
      const query = layerView.createQuery();
      query.geometry = view.toMap(event);
      query.distance = 500;
      query.units = "kilometers";
      query.returnGeometry = false;
      query.returnQueryGeometry = true;

      return layerView.queryFeatures(query).then(function (results) {


        const magValues = results.features.map(e => e.attributes.mag);
        if (magValues.length > 0) {
          document.getElementById("dashboard-count").innerHTML = results.features.length;
          document.getElementById("dashboard-max").innerHTML = Math.max(...magValues).toFixed(1);
          document.getElementById("dashboard-avg").innerHTML = (magValues.reduce((a,b) => a + b, 0) / magValues.length).toFixed(1);
          const bins = [];
          for (let i = 0; i < 10; i++) {
            bins.push(0);
          }
          magValues.forEach(value => {
            bins[Math.floor(value)]++;
          });
          histogram.data.datasets[0].data = bins;
          histogram.update();
          scatterchart.data.datasets[0].data = results.features.map(e => { return { x: e.attributes.mag, y: -e.attributes.depth } });
          scatterchart.update();
        } else {
          document.getElementById("dashboard-count").innerHTML = 0;
          document.getElementById("dashboard-max").innerHTML = "-";
          document.getElementById("dashboard-avg").innerHTML = "-";
          const bins = [];
          for (let i = 0; i < 10; i++) {
            bins.push(0);
          }
          histogram.data.datasets[0].data = bins;
          histogram.update();
          scatterchart.data.datasets[0].data = [];
          scatterchart.update();
        }

        view.graphics.removeAll();
        // Remove current highlights.
        if (highlight) {
          highlight.remove();
          highlight = null;
        }

        // Add search circle to map.
        view.graphics.add(new Graphic({
          geometry: results.queryGeometry,
          symbol: {
            type: "simple-fill",
            color: null,
            outline: {
              color: [255, 255, 255, 0.8],
              width: 2
            }
          }
        }));
        // Highlight selected quakes on map.
        highlight = layerView.highlight(results.features);
      })
        .catch(console.error);
    }

  });

  function createScatterChart() {
    const scatterCanvas = document.getElementById("dashboard-scatterchart");
    scatterchart = new Chart(scatterCanvas.getContext("2d"), {
      type: 'bubble',
        data: {
        datasets: [{
          data: []
        }]
      },
      options: {
        animation: {
          duration: 0
        },
        legend: {
          display: false
        },
        aspectRatio: 1,
        title: {
          display: true,
          text: "Depth/Magnitude scatterplot",
          fontColor: "white",
          fontFamily: "'Avenir Next W00','Helvetica Neue',Helvetica,Arial,sans-serif",
          fontSize: 16
        },
        elements: {
          point: {
            radius: function (context) {
              const value = context.dataset.data[context.dataIndex].x;
              const minValue = magValues.min.value;
              const minSize = magValues.min.size;
              const maxValue = magValues.max.value;
              const maxSize = magValues.max.size;
              if (value < minValue) return minSize;
              if (value > maxValue) return maxSize;
              return minSize + (value - minValue) * (maxSize - minSize) / (maxValue - minValue);
            },
            backgroundColor: function (context) {
              const value = context.dataset.data[context.dataIndex].x;
              if (value < magValues.min.value) {
                return "rgb(" + magValues.min.color.join() + ")"
              }
              if (value > magValues.max.value) {
                return "rgb(" + magValues.max.color.join() + ")"
              }
              const dif = magValues.max.value - magValues.min.value;
              const color = _interpolateColor(magValues.min.color, magValues.max.color, (value - dif) / dif);
              return "rgb(" + color.join() + ")";
            }
          }
        },
        scales: {
          xAxes: [{
            type: 'linear',
            position: 'top',
            gridLines: {
              color: "#fff"
            },

            ticks: {
              suggestedMin: 2,
              suggestedMax: 9,
              fontColor: "white",
              fontFamily: "'Avenir Next W00','Helvetica Neue',Helvetica,Arial,sans-serif",
              fontSize: 14
            }
          }],
          yAxes: [{
            type: 'linear',
            ticks: {
              max: 0,
              gridLines: {
                display: false
              },
              fontColor: "white",
              fontFamily: "'Avenir Next W00','Helvetica Neue',Helvetica,Arial,sans-serif",
              fontSize: 14
            }
          }]
        }
      }
    });
  }

  function getHistogramLabels() {
    const labels = [];
    for (let i = 0; i < 10; i++) {
      labels.push(i.toString() + "-" + (i+1).toString());
    }
    return labels;
  }

  function createMagnitudeHistogram() {
    const histoCanvas = document.getElementById("dashboard-histogram");
    histogram = new Chart(histoCanvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: getHistogramLabels(),
        datasets: [
          {
            label: "Magnitude",
            backgroundColor: generateBackgroundPalette(),
            stack: "Stack 0",
            data: [20, 50, 10, 100, 5, 2, 1, 90, 12, 1]
          }
        ]
      },
      options: {
        responsive: false,
        legend: {
          display: false
        },
        title: {
          display: true,
          text: "Magnitude Histogram",
          fontColor: "white",
          fontFamily: "'Avenir Next W00','Helvetica Neue',Helvetica,Arial,sans-serif",
          fontSize: 16
        },
        scales: {
          xAxes: [
            {
              stacked: true,
              ticks: {
                fontColor: "white",
                fontFamily: "'Avenir Next W00','Helvetica Neue',Helvetica,Arial,sans-serif",
                fontSize: 14
              }
            }
          ],
          yAxes: [
            {
              stacked: true,
              ticks: {
                suggestedMax: 100,
                fontColor: "white",
                fontFamily: "'Avenir Next W00','Helvetica Neue',Helvetica,Arial,sans-serif",
                fontSize: 14
              }
            }
          ],

        }
      }
    });
  }

  createMagnitudeHistogram();
  createScatterChart();

  function _interpolateColor(color1, color2, factor) {
    if (arguments.length < 3) { factor = 0.5; }
    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
      result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
  };

  function generateBackgroundPalette() {
    let colors = ["rgb(255, 221, 48)", "rgb(255, 221, 48)", "rgb(255, 221, 48)"];
    for (let i = 0; i < 4; i++) {
      let color = _interpolateColor([255, 221, 48], [255, 58, 48], i / 4);
      let color_string = "rgb(" + color.join() + ")";
      colors.push(color_string);
    };
    colors.push("rgb(255, 58, 48)", "rgb(255, 58, 48)", "rgb(255, 58, 48)");
    return colors;
  }

});
